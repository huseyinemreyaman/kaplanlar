package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Static("/static", "../web")

	pages := map[string]string{
		"/":                    "index.html",
		"/projects":            "projects.html",
		"/projects/tubitak":    "project-tubitak.html",
		"/projects/teknofest":  "project-teknofest.html",
		"/projects/lego-spike": "project-lego-spike.html",
		"/projects/lego-vex":   "project-lego-vex.html",
		"/projects/kodlama":    "project-kodlama.html",
		"/members":             "members.html",
		"/events":              "events.html",
		"/support":             "support.html",
		"/contact":             "contact.html",
	}

	for path, file := range pages {
		pageFile := file
		router.GET(path, func(c *gin.Context) {
			c.File("../web/" + pageFile)
		})
	}

	router.GET("/style.css", func(c *gin.Context) {
		c.File("../web/style.css")
	})
	router.GET("/script.js", func(c *gin.Context) {
		c.File("../web/script.js")
	})
	router.GET("/project-detail.css", func(c *gin.Context) {
		c.File("../web/project-detail.css")
	})
	router.GET("/support.css", func(c *gin.Context) {
		c.File("../web/support.css")
	})
	router.GET("/support.js", func(c *gin.Context) {
		c.File("../web/support.js")
	})
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "bkm-tigers",
		})
	})
	notFoundPage, err := os.ReadFile("../web/404.html")
	if err != nil {
		log.Fatal(err)
	}
	router.NoRoute(func(c *gin.Context) {
		c.Data(http.StatusNotFound, "text/html; charset=utf-8", notFoundPage)
	})

	if err := router.Run(":3000"); err != nil {
		log.Fatal(err)
	}
}
