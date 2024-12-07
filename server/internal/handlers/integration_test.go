//go:build integration

package handlers_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"golang.org/x/crypto/bcrypt"

	"novamd/internal/app"
	"novamd/internal/auth"
	"novamd/internal/db"
	"novamd/internal/git"
	"novamd/internal/models"
	"novamd/internal/secrets"
	"novamd/internal/storage"
)

// testHarness encapsulates all the dependencies needed for testing
type testHarness struct {
	Server        *app.Server
	DB            db.TestDatabase
	Storage       storage.Manager
	JWTManager    auth.JWTManager
	SessionSvc    *auth.SessionService
	AdminUser     *models.User
	AdminToken    string
	RegularUser   *models.User
	RegularToken  string
	TempDirectory string
	MockGit       *MockGitClient
}

// setupTestHarness creates a new test environment
func setupTestHarness(t *testing.T) *testHarness {
	t.Helper()

	// Create temporary directory for test files
	tempDir, err := os.MkdirTemp("", "novamd-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp directory: %v", err)
	}

	// Initialize test database
	secretsSvc, err := secrets.NewService("YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY=") // test key
	if err != nil {
		t.Fatalf("Failed to initialize secrets service: %v", err)
	}

	database, err := db.NewTestDB(":memory:", secretsSvc)
	if err != nil {
		t.Fatalf("Failed to initialize test database: %v", err)
	}

	if err := database.Migrate(); err != nil {
		t.Fatalf("Failed to run migrations: %v", err)
	}

	// Create mock git client
	mockGit := NewMockGitClient(false)

	// Create storage with mock git client
	storageOpts := storage.Options{
		NewGitClient: func(url, user, token, path, commitName, commitEmail string) git.Client {
			return mockGit
		},
	}
	storageSvc := storage.NewServiceWithOptions(tempDir, storageOpts)

	// Initialize JWT service
	jwtSvc, err := auth.NewJWTService(auth.JWTConfig{
		SigningKey:         "test-key",
		AccessTokenExpiry:  15 * time.Minute,
		RefreshTokenExpiry: 24 * time.Hour,
	})
	if err != nil {
		t.Fatalf("Failed to initialize JWT service: %v", err)
	}

	// Initialize session service
	sessionSvc := auth.NewSessionService(database, jwtSvc)

	// Create test config
	testConfig := &app.Config{
		DBPath:        ":memory:",
		WorkDir:       tempDir,
		StaticPath:    "../testdata",
		Port:          "8081",
		AdminEmail:    "admin@test.com",
		AdminPassword: "admin123",
		EncryptionKey: "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY=",
		IsDevelopment: true,
	}

	// Create server options
	serverOpts := &app.Options{
		Config:         testConfig,
		Database:       database,
		Storage:        storageSvc,
		JWTManager:     jwtSvc,
		SessionService: sessionSvc,
	}

	// Create server
	srv := app.NewServer(serverOpts)

	h := &testHarness{
		Server:        srv,
		DB:            database,
		Storage:       storageSvc,
		JWTManager:    jwtSvc,
		SessionSvc:    sessionSvc,
		TempDirectory: tempDir,
		MockGit:       mockGit,
	}

	// Create test users
	adminUser, adminToken := h.createTestUser(t, "admin@test.com", "admin123", models.RoleAdmin)
	regularUser, regularToken := h.createTestUser(t, "user@test.com", "user123", models.RoleEditor)

	h.AdminUser = adminUser
	h.AdminToken = adminToken
	h.RegularUser = regularUser
	h.RegularToken = regularToken

	return h
}

// teardownTestHarness cleans up the test environment
func (h *testHarness) teardown(t *testing.T) {
	t.Helper()

	if err := h.DB.Close(); err != nil {
		t.Errorf("Failed to close database: %v", err)
	}

	if err := os.RemoveAll(h.TempDirectory); err != nil {
		t.Errorf("Failed to remove temp directory: %v", err)
	}
}

// createTestUser creates a test user and returns the user and access token
func (h *testHarness) createTestUser(t *testing.T, email, password string, role models.UserRole) (*models.User, string) {
	t.Helper()

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	user := &models.User{
		Email:        email,
		DisplayName:  "Test User",
		PasswordHash: string(hashedPassword),
		Role:         role,
	}

	user, err = h.DB.CreateUser(user)
	if err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}

	// Initialize the default workspace directory in storage
	err = h.Storage.InitializeUserWorkspace(user.ID, user.LastWorkspaceID)
	if err != nil {
		t.Fatalf("Failed to initialize user workspace: %v", err)
	}

	session, accessToken, err := h.SessionSvc.CreateSession(user.ID, string(user.Role))
	if err != nil {
		t.Fatalf("Failed to create session: %v", err)
	}

	if session == nil || accessToken == "" {
		t.Fatal("Failed to get valid session or token")
	}

	return user, accessToken
}

// makeRequest is a helper function to make HTTP requests in tests
func (h *testHarness) makeRequest(t *testing.T, method, path string, body interface{}, token string, headers map[string]string) *httptest.ResponseRecorder {
	t.Helper()

	var reqBody []byte
	var err error

	if body != nil {
		reqBody, err = json.Marshal(body)
		if err != nil {
			t.Fatalf("Failed to marshal request body: %v", err)
		}
	}

	req := httptest.NewRequest(method, path, bytes.NewBuffer(reqBody))
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	req.Header.Set("Content-Type", "application/json")

	// Add any additional headers
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	rr := httptest.NewRecorder()
	h.Server.Router().ServeHTTP(rr, req)

	return rr
}

// makeRequestRaw is a helper function to make HTTP requests with raw body content
func (h *testHarness) makeRequestRaw(t *testing.T, method, path string, body io.Reader, token string, headers map[string]string) *httptest.ResponseRecorder {
	t.Helper()

	req := httptest.NewRequest(method, path, body)
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	// Add any additional headers
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	rr := httptest.NewRecorder()
	h.Server.Router().ServeHTTP(rr, req)

	return rr
}
