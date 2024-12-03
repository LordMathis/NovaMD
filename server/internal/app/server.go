package app

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// Server represents the HTTP server and its dependencies
type Server struct {
	router  *chi.Mux
	options *Options
}

// NewServer creates a new server instance with the given options
func NewServer(options *Options) *Server {
	return &Server{
		router:  setupRouter(*options),
		options: options,
	}
}

// Start configures and starts the HTTP server
func (s *Server) Start() error {
	// Start server
	addr := ":" + s.options.Config.Port
	log.Printf("Server starting on port %s", s.options.Config.Port)
	return http.ListenAndServe(addr, s.router)
}

// Close handles graceful shutdown of server dependencies
func (s *Server) Close() error {
	return s.options.Database.Close()
}

// Router returns the chi router for testing
func (s *Server) Router() chi.Router {
	return s.router
}