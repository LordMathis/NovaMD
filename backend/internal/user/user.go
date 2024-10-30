package user

import (
	"database/sql"
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"

	"novamd/internal/db"
	"novamd/internal/filesystem"
	"novamd/internal/models"
)

type UserService struct {
	DB *db.DB
	FS *filesystem.FileSystem
}

func NewUserService(database *db.DB, fs *filesystem.FileSystem) *UserService {
	return &UserService{
		DB: database,
		FS: fs,
	}
}

func (s *UserService) SetupAdminUser(adminEmail, adminPassword string) (*models.User, error) {
	// Check if admin user exists
	adminUser, err := s.DB.GetUserByEmail(adminEmail)
	if adminUser != nil {
		return adminUser, nil // Admin user already exists
	} else if err != sql.ErrNoRows {
		return nil, err
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create admin user
	adminUser = &models.User{
		Email:        adminEmail,
		DisplayName:  "Admin",
		PasswordHash: string(hashedPassword),
		Role:         models.RoleAdmin,
	}

	err = s.DB.CreateUser(adminUser)
	if err != nil {
		return nil, fmt.Errorf("failed to create admin user: %w", err)
	}

	// Initialize workspace directory
	err = s.FS.InitializeUserWorkspace(adminUser.ID, adminUser.LastWorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize admin workspace: %w", err)
	}

	log.Printf("Created admin user with ID: %d and default workspace with ID: %d", adminUser.ID, adminUser.LastWorkspaceID)

	return adminUser, nil
}

func (s *UserService) CreateUser(user *models.User) error {
	err := s.DB.CreateUser(user)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	err = s.FS.InitializeUserWorkspace(user.ID, user.LastWorkspaceID)
	if err != nil {
		return fmt.Errorf("failed to initialize user workspace: %w", err)
	}

	return nil
}

func (s *UserService) GetUserByID(id int) (*models.User, error) {
	return s.DB.GetUserByID(id)
}

func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	return s.DB.GetUserByEmail(email)
}

func (s *UserService) UpdateUser(user *models.User) error {
	return s.DB.UpdateUser(user)
}

func (s *UserService) DeleteUser(id int) error {
	// First, get the user to check if they exist
	user, err := s.DB.GetUserByID(id)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Get user's workspaces
	workspaces, err := s.DB.GetWorkspacesByUserID(id)
	if err != nil {
		return fmt.Errorf("failed to get user's workspaces: %w", err)
	}

	// Delete workspace directories
	for _, workspace := range workspaces {
		err = s.FS.DeleteUserWorkspace(user.ID, workspace.ID)
		if err != nil {
			return fmt.Errorf("failed to delete workspace files: %w", err)
		}
	}

	// Delete user from database (this will cascade delete workspaces)
	return s.DB.DeleteUser(id)
}
