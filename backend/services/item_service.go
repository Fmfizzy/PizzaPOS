package services

import (
	"database/sql"
	"pizza-shop/config"
	"pizza-shop/models"
	"time"
)

type ItemService struct{}

func (s *ItemService) GetAllItems() ([]models.Item, error) {
	var items []models.Item

	rows, err := config.DB.Query(`
        SELECT id, name, category, description, is_available, price, image_path, created_at 
        FROM items
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var item models.Item
		err := rows.Scan(
			&item.ID,
			&item.Name,
			&item.Category,
			&item.Description,
			&item.IsAvailable,
			&item.Price,
			&item.ImagePath,
			&item.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}

func (s *ItemService) GetItemsByCategory(category string) ([]models.Item, error) {
	var items []models.Item

	rows, err := config.DB.Query(`
        SELECT id, name, category, description, is_available, price, image_path, created_at 
        FROM items 
        WHERE category = $1
    `, category)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var item models.Item
		err := rows.Scan(
			&item.ID,
			&item.Name,
			&item.Category,
			&item.Description,
			&item.IsAvailable,
			&item.Price,
			&item.ImagePath,
			&item.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}

func (s *ItemService) CreateItem(input models.CreateItemInput) (*models.Item, error) {
	var item models.Item
	err := config.DB.QueryRow(`
        INSERT INTO items (name, category, description, price, image_path)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, category, description, is_available, price, image_path, created_at
    `, input.Name, input.Category, input.Description, input.Price, input.ImagePath).Scan(
		&item.ID,
		&item.Name,
		&item.Category,
		&item.Description,
		&item.IsAvailable,
		&item.Price,
		&item.ImagePath,
		&item.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (s *ItemService) CreatePizzaPrices(input models.CreatePizzaPrice) (*models.PizzaBasePrice, error) {
	var pizza_price models.PizzaBasePrice
	err := config.DB.QueryRow(`
        INSERT INTO pizza_base_prices (item_id, size, price)
        VALUES ($1, $2, $3)
        RETURNING id, item_id, size, price, created_at
    `, input.ItemID, input.Size, input.Price).Scan(
		&pizza_price.ID,
		&pizza_price.ItemID,
		&pizza_price.Size,
		&pizza_price.Price,
		&pizza_price.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &pizza_price, nil
}

func (s *ItemService) UpdateItem(id int, input models.UpdateItemInput) (*models.Item, error) {
	var item models.Item
	err := config.DB.QueryRow(`
        UPDATE items 
        SET 
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            is_available = COALESCE($3, is_available),
            price = COALESCE($4, price),
            image_path = COALESCE($5, image_path)
        WHERE id = $6
        RETURNING id, name, category, description, is_available, price, image_path, created_at
    `, input.Name, input.Description, input.IsAvailable, input.Price, input.ImagePath, id).Scan(
		&item.ID,
		&item.Name,
		&item.Category,
		&item.Description,
		&item.IsAvailable,
		&item.Price,
		&item.ImagePath,
		&item.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (s *ItemService) DeleteItem(id int) error {
	// Start a transaction
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	// First check if the item exists
	var exists bool
	err = config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM items WHERE id = $1)", id).Scan(&exists)
	if err != nil {
		return err
	}
	if !exists {
		return sql.ErrNoRows
	}

	// Delete from pizza_base_prices first (if any)
	_, err = tx.Exec("DELETE FROM pizza_base_prices WHERE item_id = $1", id)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Then delete the item
	_, err = tx.Exec("DELETE FROM items WHERE id = $1", id)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Commit the transaction
	return tx.Commit()
}

func (s *ItemService) GetPizzasWithPrices() ([]models.PizzaWithPrices, error) {
	var pizzas []models.PizzaWithPrices

	rows, err := config.DB.Query(`
        SELECT i.id, i.name, i.category, i.description, i.is_available, i.image_path, i.created_at,
               pbp.size, pbp.price
        FROM items i
        LEFT JOIN pizza_base_prices pbp ON i.id = pbp.item_id
        WHERE i.category = 'pizza'
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	pizzaMap := make(map[int]*models.PizzaWithPrices)

	for rows.Next() {
		var (
			id          int
			name        string
			category    string
			description string
			isAvailable bool
			imagePath   string
			createdAt   time.Time
			size        string
			price       float64
		)

		err := rows.Scan(&id, &name, &category, &description, &isAvailable, &imagePath, &createdAt, &size, &price)
		if err != nil {
			return nil, err
		}

		if _, exists := pizzaMap[id]; !exists {
			pizzaMap[id] = &models.PizzaWithPrices{
				Item: models.Item{
					ID:          id,
					Name:        name,
					Category:    category,
					Description: description,
					IsAvailable: isAvailable,
					ImagePath:   imagePath,
					CreatedAt:   createdAt,
				},
				Prices: make(map[string]float64),
			}
		}

		pizzaMap[id].Prices[size] = price
	}

	// Convert map to slice
	for _, pizza := range pizzaMap {
		pizzas = append(pizzas, *pizza)
	}

	return pizzas, nil
}

func (s *ItemService) GetToppings() ([]models.Topping, error) {
	var toppings []models.Topping

	rows, err := config.DB.Query(`
        SELECT id, name, price, is_available, created_at 
        FROM toppings
        WHERE is_available = true
        ORDER BY name
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var topping models.Topping
		err := rows.Scan(
			&topping.ID,
			&topping.Name,
			&topping.Price,
			&topping.IsAvailable,
			&topping.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		toppings = append(toppings, topping)
	}

	return toppings, nil
}
