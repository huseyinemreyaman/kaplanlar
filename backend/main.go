package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	router, err := newRouter(os.Getenv("ADMIN_PASSWORD"), os.Getenv("ADMIN_COOKIE_SECURE") != "false")
	if err != nil {
		log.Fatal(err)
	}

	if err := router.Run(":3000"); err != nil {
		log.Fatal(err)
	}
}

func newRouter(adminPassword string, secureAdminCookie bool) (*gin.Engine, error) {
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

	trackedPages := make(map[string]struct{}, len(pages))
	for path := range pages {
		trackedPages[path] = struct{}{}
	}
	analytics := newPageAnalytics(time.Now())
	for path := range trackedPages {
		analytics.totals[path] = 0
	}
	router.Use(analytics.middleware(trackedPages))

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
	router.GET("/admin", func(c *gin.Context) {
		c.Header("Cache-Control", "no-store")
		c.File("../web/admin.html")
	})
	router.GET("/admin.css", func(c *gin.Context) {
		c.File("../web/admin.css")
	})
	router.GET("/admin.js", func(c *gin.Context) {
		c.File("../web/admin.js")
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
	router.GET("/favicon.ico", func(c *gin.Context) {
		c.File("../web/fav.png")
	})
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "bkm-kaplanlar",
		})
	})
	admin := newAdminAuth(adminPassword, secureAdminCookie)
	router.POST("/api/admin/login", admin.loginHandler)
	router.POST("/api/admin/logout", admin.logoutHandler)
	router.GET("/api/admin/stats", admin.requireSession(func(c *gin.Context) {
		c.JSON(http.StatusOK, analytics.statistics(time.Now()))
	}))
	notFoundPage, err := os.ReadFile("../web/404.html")
	if err != nil {
		return nil, err
	}
	router.NoRoute(func(c *gin.Context) {
		c.Data(http.StatusNotFound, "text/html; charset=utf-8", notFoundPage)
	})

	return router, nil
}
