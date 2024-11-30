//go:build integration

package handlers_test

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"novamd/internal/handlers"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestStaticHandler_Integration(t *testing.T) {
	// Create temporary directory for test static files
	tempDir, err := os.MkdirTemp("", "novamd-static-test-*")
	require.NoError(t, err)
	defer os.RemoveAll(tempDir)

	// Create test files
	files := map[string][]byte{
		"index.html":          []byte("<html><body>Index</body></html>"),
		"assets/style.css":    []byte("body { color: blue; }"),
		"assets/style.css.gz": []byte("gzipped css content"),
		"assets/script.js":    []byte("console.log('test');"),
		"assets/script.js.gz": []byte("gzipped js content"),
		"subdir/page.html":    []byte("<html><body>Page</body></html>"),
		"subdir/page.html.gz": []byte("gzipped html content"),
	}

	for path, content := range files {
		fullPath := filepath.Join(tempDir, path)
		err := os.MkdirAll(filepath.Dir(fullPath), 0755)
		require.NoError(t, err)
		err = os.WriteFile(fullPath, content, 0644)
		require.NoError(t, err)
	}

	// Create static handler
	handler := handlers.NewStaticHandler(tempDir)

	tests := []struct {
		name            string
		path            string
		acceptEncoding  string
		wantStatus      int
		wantBody        []byte
		wantType        string
		wantEncoding    string
		wantCacheHeader string
	}{
		{
			name:       "serve index.html",
			path:       "/",
			wantStatus: http.StatusOK,
			wantBody:   []byte("<html><body>Index</body></html>"),
			wantType:   "text/html; charset=utf-8",
		},
		{
			name:            "serve CSS with gzip support",
			path:            "/assets/style.css",
			acceptEncoding:  "gzip",
			wantStatus:      http.StatusOK,
			wantBody:        []byte("gzipped css content"),
			wantType:        "text/css",
			wantEncoding:    "gzip",
			wantCacheHeader: "public, max-age=31536000",
		},
		{
			name:            "serve JS with gzip support",
			path:            "/assets/script.js",
			acceptEncoding:  "gzip",
			wantStatus:      http.StatusOK,
			wantBody:        []byte("gzipped js content"),
			wantType:        "application/javascript",
			wantEncoding:    "gzip",
			wantCacheHeader: "public, max-age=31536000",
		},
		{
			name:            "serve CSS without gzip",
			path:            "/assets/style.css",
			wantStatus:      http.StatusOK,
			wantBody:        []byte("body { color: blue; }"),
			wantType:        "text/css; charset=utf-8",
			wantCacheHeader: "public, max-age=31536000",
		},
		{
			name:       "SPA routing - nonexistent path",
			path:       "/nonexistent",
			wantStatus: http.StatusOK,
			wantBody:   []byte("<html><body>Index</body></html>"),
			wantType:   "text/html; charset=utf-8",
		},
		{
			name:       "SPA routing - deep path",
			path:       "/some/deep/path",
			wantStatus: http.StatusOK,
			wantBody:   []byte("<html><body>Index</body></html>"),
			wantType:   "text/html; charset=utf-8",
		},
		{
			name:       "block directory traversal",
			path:       "/../../../etc/passwd",
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "nonexistent file in assets",
			path:       "/assets/nonexistent.js",
			wantStatus: http.StatusOK, // Should serve index.html
			wantBody:   []byte("<html><body>Index</body></html>"),
			wantType:   "text/html; charset=utf-8",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", tc.path, nil)
			if tc.acceptEncoding != "" {
				req.Header.Set("Accept-Encoding", tc.acceptEncoding)
			}

			w := httptest.NewRecorder()
			handler.ServeHTTP(w, req)

			assert.Equal(t, tc.wantStatus, w.Code)

			if tc.wantStatus == http.StatusOK {
				assert.Equal(t, tc.wantBody, w.Body.Bytes())
				assert.Equal(t, tc.wantType, w.Header().Get("Content-Type"))

				if tc.wantEncoding != "" {
					assert.Equal(t, tc.wantEncoding, w.Header().Get("Content-Encoding"))
				}

				if tc.wantCacheHeader != "" {
					assert.Equal(t, tc.wantCacheHeader, w.Header().Get("Cache-Control"))
				}
			}
		})
	}
}
