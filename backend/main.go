package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Static("/static", "../web")
	router.GET("/", func(c *gin.Context) {
		c.File("../web/index.html")
	})
	router.GET("/style.css", func(c *gin.Context) {
		c.File("../web/style.css")
	})
	router.GET("/script.js", func(c *gin.Context) {
		c.File("../web/script.js")
	})
	
	router.GET("/contact.html", func(c *gin.Context) {
		c.File("../web/contact.html")
	})
	
	router.GET("/contact.css", func(c *gin.Context) {
		c.File("../web/contact.css")
	})
	router.GET("/contact.js", func(c *gin.Context) {
		c.File("../web/contact.js")
	})
	router.GET("/index.html", func(c *gin.Context) {
		c.File("../web/index.html")
	})
	router.GET("/logo.png", func(c *gin.Context) {
		c.File("../web/fav.png")
	})
	
	router.NoRoute(func(c *gin.Context) {
		c.File("../web/404.html")
		c.Status(http.StatusNotFound)
	})
	router.Run(":8080")
}
