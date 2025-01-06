package services

import (
	"pizza-shop/config"
	"pizza-shop/models"
	"strconv"
)

type InvoiceService struct{}

func (s *InvoiceService) CreateInvoice(input models.CreateInvoiceInput) (*models.Invoice, error) {
	tx, err := config.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Calculate total amount and tax
	var totalAmount float64 = 0
	for _, item := range input.Items {
		itemTotal := item.UnitPrice * float64(item.Quantity)
		totalAmount += itemTotal
	}

	taxAmount := totalAmount * 0.05 // 5% tax

	// Create invoice
	var invoice models.Invoice
	err = tx.QueryRow(`
        INSERT INTO invoices (order_no, total_amount, tax_amount, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING id, order_no, total_amount, tax_amount, status, created_at
    `, input.OrderNo, totalAmount, taxAmount).Scan(
		&invoice.ID,
		&invoice.OrderNo,
		&invoice.TotalAmount,
		&invoice.TaxAmount,
		&invoice.Status,
		&invoice.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Create invoice items
	for _, item := range input.Items {
		var invoiceItemID int
		err = tx.QueryRow(`
            INSERT INTO invoice_items (invoice_id, item_name, quantity, unit_price, subtotal)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, invoice.ID, item.ItemName, item.Quantity, item.UnitPrice,
			item.UnitPrice*float64(item.Quantity)).Scan(&invoiceItemID)
		if err != nil {
			return nil, err
		}

		// Insert toppings if any
		for _, topping := range item.Toppings {
			_, err = tx.Exec(`
                INSERT INTO invoice_item_toppings (invoice_item_id, topping_id, quantity, price)
                VALUES ($1, $2, $3, (SELECT price FROM toppings WHERE id = $2))
            `, invoiceItemID, topping.ToppingID, topping.Quantity)
			if err != nil {
				return nil, err
			}
		}
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return &invoice, nil
}

func (s *InvoiceService) GetInvoice(id int) (*models.Invoice, error) {
	var invoice models.Invoice
	err := config.DB.QueryRow(`
        SELECT id, order_no, total_amount, tax_amount, status, created_at
        FROM invoices WHERE id = $1
    `, id).Scan(
		&invoice.ID,
		&invoice.OrderNo,
		&invoice.TotalAmount,
		&invoice.TaxAmount,
		&invoice.Status,
		&invoice.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Get invoice items
	rows, err := config.DB.Query(`
        SELECT ii.id, ii.ItemName, i.name, ii.quantity, ii.unit_price, ii.subtotal
        FROM invoice_items ii
        JOIN items i ON i.id = ii.item_id
        WHERE ii.invoice_id = $1
    `, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var item models.InvoiceItem
		err := rows.Scan(
			&item.ID,
			&item.ItemName,
			&item.Quantity,
			&item.UnitPrice,
			&item.Subtotal,
		)
		if err != nil {
			return nil, err
		}

		// Get toppings for each item
		toppingRows, err := config.DB.Query(`
            SELECT iit.id, iit.topping_id, t.name, iit.quantity, iit.price
            FROM invoice_item_toppings iit
            JOIN toppings t ON t.id = iit.topping_id
            WHERE iit.invoice_item_id = $1
        `, item.ID)
		if err != nil {
			return nil, err
		}
		defer toppingRows.Close()

		for toppingRows.Next() {
			var topping models.InvoiceItemTopping
			err := toppingRows.Scan(
				&topping.ID,
				&topping.ToppingID,
				&topping.Name,
				&topping.Quantity,
				&topping.Price,
			)
			if err != nil {
				return nil, err
			}
			item.Toppings = append(item.Toppings, topping)
		}

		invoice.Items = append(invoice.Items, item)
	}

	return &invoice, nil
}

func (s *InvoiceService) GetLatestOrderNo() (string, error) {
	var lastOrderNo string
	err := config.DB.QueryRow(`
		SELECT COALESCE(MAX(order_no), '9999') 
		FROM invoices
	`).Scan(&lastOrderNo)

	if err != nil {
		return "", err
	}

	if lastOrderNo == "9999" {
		return "10000", nil
	}

	// Convert to integer, increment, and format back to string
	orderNum, _ := strconv.Atoi(lastOrderNo)
	return strconv.Itoa(orderNum + 1), nil
}
