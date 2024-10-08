package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"novamd/internal/api"
	"novamd/internal/db"
	"novamd/internal/filesystem"
)

func main() {
	// Initialize database
	dbPath := os.Getenv("NOVAMD_DB_PATH")
	if dbPath == "" {
		dbPath = "./sqlite.db"
	}
	database, err := db.Init(dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if err := database.Close(); err != nil {
			log.Printf("Error closing database: %v", err)
		}
	}()

	// Workdir
	workdir := os.Getenv("NOVAMD_WORKDIR")
	if workdir == "" {
		workdir = "./data"
	}

	settings, err := database.GetSettings(1) // Assuming user ID 1 for now
	if err != nil {
		log.Print("Settings not found, using default settings")
	}
	fs := filesystem.New(workdir, &settings)

	if settings.Settings.GitEnabled {
		if err := fs.InitializeGitRepo(); err != nil {
			log.Fatal(err)
		}
	}

	// Set up router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Set up API routes
	r.Route("/api/v1", func(r chi.Router) {
		api.SetupRoutes(r, database, fs)
	})

	// Set up static file server with path validation
	staticPath := os.Getenv("NOVAMD_STATIC_PATH")
	if staticPath == "" {
		staticPath = "../frontend/dist"
	}
	fileServer := http.FileServer(http.Dir(staticPath))
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		requestedPath := r.URL.Path
		validatedPath, err := filesystem.ValidatePath(staticPath, requestedPath)
		if err != nil {
			http.Error(w, "Invalid path", http.StatusBadRequest)
			return
		}

		_, err = os.Stat(validatedPath)
		if os.IsNotExist(err) {
			http.ServeFile(w, r, filepath.Join(staticPath, "index.html"))
			return
		}
		http.StripPrefix("/", fileServer).ServeHTTP(w, r)
	})

	// Start server
	port := os.Getenv("NOVAMD_PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}