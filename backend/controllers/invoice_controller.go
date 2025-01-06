package controllers

import (
	"net/http"
	"pizza-shop/models"
	"pizza-shop/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type InvoiceController struct {
	invoiceService services.InvoiceService
}

func NewInvoiceController() *InvoiceController {
	return &InvoiceController{
		invoiceService: services.InvoiceService{},
	}
}

func (c *InvoiceController) CreateInvoice(ctx *gin.Context) {
	var input models.CreateInvoiceInput
	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	invoice, err := c.invoiceService.CreateInvoice(input)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, invoice)
}

func (c *InvoiceController) GetInvoice(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
		return
	}

	invoice, err := c.invoiceService.GetInvoice(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, invoice)
}
