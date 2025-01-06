package controllers

import (
	"database/sql"
	"net/http"
	"pizza-shop/models"
	"pizza-shop/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ItemController struct {
	itemService services.ItemService
}

func NewItemController() *ItemController {
	return &ItemController{
		itemService: services.ItemService{},
	}
}

func (c *ItemController) GetAllItems(ctx *gin.Context) {
	items, err := c.itemService.GetAllItems()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, items)
}

func (c *ItemController) GetItemsByCategory(ctx *gin.Context) {
	category := ctx.Param("category")
	items, err := c.itemService.GetItemsByCategory(category)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, items)
}

func (c *ItemController) CreateItem(ctx *gin.Context) {
	var input models.CreateItemInput
	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item, err := c.itemService.CreateItem(input)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, item)
}

func (c *ItemController) CreatePizzaPrices(ctx *gin.Context) {
	var input models.CreatePizzaPrice
	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pizza_price, err := c.itemService.CreatePizzaPrices(input)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, pizza_price)
}

func (c *ItemController) UpdateItem(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	var input models.UpdateItemInput
	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item, err := c.itemService.UpdateItem(id, input)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, item)
}

func (c *ItemController) DeleteItem(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	err = c.itemService.DeleteItem(id)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Item deleted successfully"})
}

func (c *ItemController) GetPizzasWithPrices(ctx *gin.Context) {
	pizzas, err := c.itemService.GetPizzasWithPrices()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, pizzas)
}

func (c *ItemController) GetToppings(ctx *gin.Context) {
	toppings, err := c.itemService.GetToppings()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, toppings)
}
