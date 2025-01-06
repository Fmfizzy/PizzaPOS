package main

import (
	"pizza-shop/config"
	"pizza-shop/controllers"

	"github.com/gin-gonic/gin"
)

func main() {
	config.InitDB()

	r := gin.Default()

	// Enable CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Create controllers
	itemController := controllers.NewItemController()
	invoiceController := controllers.NewInvoiceController()

	// Item routes
	r.GET("/api/items", itemController.GetAllItems)
	r.GET("/api/items/:category", itemController.GetItemsByCategory)
	r.POST("/api/items", itemController.CreateItem)
	r.PUT("/api/items/:id", itemController.UpdateItem)
	r.DELETE("/api/items/:id", itemController.DeleteItem)

	// Pizza prices
	r.GET("/api/pizzas-with-prices", itemController.GetPizzasWithPrices)
	r.POST("/api/pizzaprice", itemController.CreatePizzaPrices)

	// Toppings
	r.GET("/api/toppings", itemController.GetToppings)

	// Invoice routes
	r.POST("/api/invoices", invoiceController.CreateInvoice)
	r.GET("/api/invoices/:id", invoiceController.GetInvoice)

	r.Run(":8080")
}
