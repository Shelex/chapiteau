package main

import (
	"chapiteau/config"
	"chapiteau/internal/routes"
	"chapiteau/pkg/database"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	config, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := database.InitDB(config.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	r := gin.Default()
	routes.SetupRoutes(r, db, config)

	r.Run(fmt.Sprintf("%s:%s", config.AppHost, config.AppPort))
}
