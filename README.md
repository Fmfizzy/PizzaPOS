# PizzaPOS - Pizza Point of Sale System

A full-stack point of sale system for pizza restaurants built with Next.js, Go, and PostgreSQL.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- Go (v1.16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Fmfizzy/PizzaPOS.git
cd PizzaPOS
```

2. Frontend Setup:
```bash
cd frontend
npm install
```

3. Backend Setup:
```bash
cd backend
go mod download
```

4. Database Setup:
- Create a PostgreSQL database you may use the following to generate the tables.

-- Enum for pizza sizes
CREATE TYPE pizza_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE item_category AS ENUM ('pizza', 'beverage');

-- Toppings table
CREATE TABLE toppings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main items table (for pizzas and beverages)
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category item_category NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT true,
    price DECIMAL(10,2),  
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Base pizza prices table
CREATE TABLE pizza_base_prices (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id),  -- Reference to the pizza in items table
    size pizza_size NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Invoices table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(20),
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice items table
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    item_name VARCHAR(100)
);

-- Junction table for pizza toppings in an invoice
CREATE TABLE invoice_item_toppings (
    id SERIAL PRIMARY KEY,
    invoice_item_id INTEGER REFERENCES invoice_items(id),
    topping_id INTEGER REFERENCES toppings(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL
);

- Afterwards Populate the toppings table

-- Insert toppings
INSERT INTO toppings (name, price) VALUES
    ('Extra Cheese', 540.00),
    ('BBQ Chicken', 820.00),
    ('Pepperoni', 720.00),
    ('Mushrooms', 420.00),
    ('Onions', 220.00),
    ('Bell Peppers', 320.00),
    ('Olives', 380.00);


- Update the database connection settings in your backend configuration 
  (backend/config/config.go)


## Running the Application

1. Start the PostgreSQL database service

2. Start the Backend Server:
```bash
cd backend
go run main.go
```
The backend server will start on `http://localhost:8080`

3. Start the Frontend Development Server:
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Start managing orders, inventory, and sales

## Project Structure

```
PizzaPOS/
├── frontend/     # Next.js frontend application
├── backend/      # Go backend server
```
