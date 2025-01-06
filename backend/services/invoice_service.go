package services

import (
	"pizza-shop/config"
	"pizza-shop/models"
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
		// Get base price for pizza or regular price for beverage
		var unitPrice float64
		if item.PizzaSize != nil {
			err := tx.QueryRow(`
                SELECT price FROM pizza_base_prices 
                WHERE item_id = $1 AND size = $2
            `, item.ItemID, item.PizzaSize).Scan(&unitPrice)
			if err != nil {
				return nil, err
			}
		} else {
			err := tx.QueryRow(`
                SELECT price FROM items WHERE id = $1
            `, item.ItemID).Scan(&unitPrice)
			if err != nil {
				return nil, err
			}
		}

		// Add topping prices
		var toppingTotal float64 = 0
		for _, topping := range item.Toppings {
			var toppingPrice float64
			err := tx.QueryRow(`
                SELECT price FROM toppings WHERE id = $1
            `, topping.ToppingID).Scan(&toppingPrice)
			if err != nil {
				return nil, err
			}
			toppingTotal += toppingPrice * float64(topping.Quantity)
		}

		totalAmount += (unitPrice + toppingTotal) * float64(item.Quantity)
	}

	taxAmount := totalAmount * 0.13 // 13% tax

	// Create invoice
	var invoice models.Invoice
	err = tx.QueryRow(`
        INSERT INTO invoices (customer_name, total_amount, tax_amount, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING id, customer_name, total_amount, tax_amount, status, created_at
    `, input.CustomerName, totalAmount, taxAmount).Scan(
		&invoice.ID,
		&invoice.CustomerName,
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
		var invoiceItem models.InvoiceItem
		var unitPrice float64
		err = tx.QueryRow(`
            INSERT INTO invoice_items (invoice_id, item_id, pizza_size, quantity, unit_price, subtotal)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, invoice.ID, item.ItemID, item.PizzaSize, item.Quantity, unitPrice,
			unitPrice*float64(item.Quantity)).Scan(&invoiceItem.ID)
		if err != nil {
			return nil, err
		}

		// Create invoice item toppings
		for _, topping := range item.Toppings {
			_, err = tx.Exec(`
                INSERT INTO invoice_item_toppings (invoice_item_id, topping_id, quantity, price)
                VALUES ($1, $2, $3, (SELECT price FROM toppings WHERE id = $2))
            `, invoiceItem.ID, topping.ToppingID, topping.Quantity)
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
        SELECT id, customer_name, total_amount, tax_amount, status, created_at
        FROM invoices WHERE id = $1
    `, id).Scan(
		&invoice.ID,
		&invoice.CustomerName,
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
        SELECT ii.id, ii.item_id, i.name, ii.pizza_size, ii.quantity, ii.unit_price, ii.subtotal
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
			&item.ItemID,
			&item.ItemName,
			&item.PizzaSize,
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
