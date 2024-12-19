package context

import (
	"net/http"
	"novamd/internal/db"

	"github.com/go-chi/chi/v5"
)

// WithUserContextMiddleware extracts user information from JWT claims
// and adds it to the request context
func WithUserContextMiddleware(next http.Handler) http.Handler {
	log := getLogger()
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, err := GetUserFromContext(r.Context())
		if err != nil {
			log.Error("failed to get user from context",
				"error", err,
				"path", r.URL.Path)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		hctx := &HandlerContext{
			UserID:   claims.UserID,
			UserRole: claims.Role,
		}

		r = WithHandlerContext(r, hctx)
		next.ServeHTTP(w, r)
	})
}

// WithWorkspaceContextMiddleware adds workspace information to the request context
func WithWorkspaceContextMiddleware(db db.WorkspaceReader) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		log := getLogger()
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx, ok := GetRequestContext(w, r)
			if !ok {
				return
			}

			workspaceName := chi.URLParam(r, "workspaceName")
			workspace, err := db.GetWorkspaceByName(ctx.UserID, workspaceName)
			if err != nil {
				log.Error("failed to get workspace",
					"error", err,
					"userID", ctx.UserID,
					"workspace", workspaceName,
					"path", r.URL.Path)
				http.Error(w, "Failed to get workspace", http.StatusNotFound)
				return
			}

			ctx.Workspace = workspace
			r = WithHandlerContext(r, ctx)
			next.ServeHTTP(w, r)
		})
	}
}
