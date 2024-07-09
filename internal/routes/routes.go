package routes

import (
	"chapiteau/config"
	"chapiteau/internal/auth"
	"chapiteau/internal/handlers"
	"chapiteau/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB, cfg config.Config) {
	config, _ := config.LoadConfig()
	repo := repository.NewRepository(db)
	handlers := handlers.NewHandlers(repo, config)

	api := r.Group("/api")

	api.POST("/register", handlers.Auth.Register)
	api.POST("/login", handlers.Auth.Login)
	api.GET("/health", healthCheck)

	protected := r.Group("/api")
	protected.Use(auth.AuthMiddleware(config.JWTSecret, repo.ApiKey.IsValid))

	project := protected.Group("project")
	project.POST("/", handlers.Project.CreateProject)
	project.PATCH("/:id", handlers.Project.UpdateProject)
	project.GET("/list", handlers.Project.GetProjects)
	project.GET("/:id/list/users", handlers.Project.GetProjectUsers)
	project.DELETE("/:id", handlers.Project.DeleteProject)
	project.POST("/:id/invite", handlers.Project.InviteUser)
	project.POST("/:id/owner", handlers.Project.SetProjectOwner)
	project.DELETE("/:id/owner/:userId", handlers.Project.RemoveProjectOwner)

	project.POST("/:id/file", handlers.Run.UploadFile)
	project.POST("/:id/report", handlers.Run.UploadReport)
	project.GET("/:id/runs", handlers.Run.GetRuns)
	project.PATCH("/:id/run/:runId", handlers.Run.UpdateRun)
	project.DELETE("/run/:runId", handlers.Run.DeleteRun)
	project.GET("/:id/runs/file/:fileId", handlers.Run.GetFileRuns)
	project.GET("/:id/runs/test/:testId", handlers.Run.GetTestRuns)

	apiKey := protected.Group("token")
	apiKey.POST("/", handlers.ApiKey.CreateToken)
	apiKey.GET("/", handlers.ApiKey.GetTokens)
	apiKey.DELETE("/:id", handlers.ApiKey.DeleteToken)

	reports := protected.Group("reports")
	reports.Use(auth.ProjectAccessMiddleware(repo.Project.AvailableForUser))
	reports.StaticFS("/", http.Dir("./reports"))
}

func healthCheck(c *gin.Context) {
	c.Status(http.StatusOK)
}
