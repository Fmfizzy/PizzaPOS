package models

import (
	"time"
)

type Item struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	IsAvailable bool      `json:"is_available"`
	Price       *float64  `json:"price,omitempty"`
	ImagePath   string    `json:"image_path"`
	CreatedAt   time.Time `json:"created_at"`
}

type PizzaBasePrice struct {
	ID        int       `json:"id"`
	ItemID    int       `json:"item_id"`
	Size      string    `json:"size"`
	Price     float64   `json:"price"`
	CreatedAt time.Time `json:"created_at"`
}

type Topping struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Price       float64   `json:"price"`
	IsAvailable bool      `json:"is_available"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateItemInput struct {
	Name        string   `json:"name" binding:"required"`
	Category    string   `json:"category" binding:"required"`
	Description string   `json:"description"`
	Price       *float64 `json:"price"`
	ImagePath   string   `json:"image_path"`
}

type UpdateItemInput struct {
	Name        *string  `json:"name"`
	Description *string  `json:"description"`
	IsAvailable *bool    `json:"is_available"`
	Price       *float64 `json:"price"`
	ImagePath   string   `json:"image_path"`
}

type CreatePizzaPrice struct {
	ItemID int     `json:"item_id"`
	Size   string  `json:"size"`
	Price  float64 `json:"price"`
}

type Invoice struct {
	ID          int           `json:"id"`
	OrderNo     string        `json:"order_no"`
	TotalAmount float64       `json:"total_amount"`
	TaxAmount   float64       `json:"tax_amount"`
	Status      string        `json:"status"`
	CreatedAt   time.Time     `json:"created_at"`
	Items       []InvoiceItem `json:"items,omitempty"`
}

type InvoiceItem struct {
	ID        int                  `json:"id"`
	InvoiceID int                  `json:"invoice_id"`
	ItemName  string               `json:"item_name"`
	Quantity  int                  `json:"quantity"`
	UnitPrice float64              `json:"unit_price"`
	Subtotal  float64              `json:"subtotal"`
	Toppings  []InvoiceItemTopping `json:"toppings,omitempty"`
}

type InvoiceItemTopping struct {
	ID        int     `json:"id"`
	ToppingID int     `json:"topping_id"`
	Name      string  `json:"name"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
}

type CreateInvoiceInput struct {
	OrderNo string                   `json:"order_no" binding:"required"`
	Items   []CreateInvoiceItemInput `json:"items" binding:"required"`
}

type CreateInvoiceItemInput struct {
	ItemName  string                      `json:"item_name" binding:"required"`
	Quantity  int                         `json:"quantity" binding:"required"`
	UnitPrice float64                     `json:"unit_price" binding:"required"`
	Toppings  []CreateInvoiceToppingInput `json:"toppings"`
}

type CreateInvoiceToppingInput struct {
	ToppingID int `json:"topping_id" binding:"required"`
	Quantity  int `json:"quantity" binding:"required"`
}

type PizzaWithPrices struct {
	Item
	Prices map[string]float64 `json:"prices"` // Will store prices for each size
}
