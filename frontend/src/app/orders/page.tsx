'use client';

import { useState, useEffect } from 'react'
import { PizzaWithPrices, Item, OrderedItem, SelectedTopping } from '../types/item'
import PizzaCard from '../components/PizzaCard'
import OrderedItemCard from '../components/OrderedItemCard'

export default function Orders() {
  const [orderNo, setOrderNo] = useState<string>('10000')
  const [pizzas, setPizzas] = useState<PizzaWithPrices[]>([])
  const [beverages, setBeverages] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderedItems, setOrderedItems] = useState<OrderedItem[]>([])

  const fetchLatestOrderNo = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/invoices/latest-order-no')
      if (!response.ok) {
        throw new Error('Failed to fetch order number')
      }
      const data = await response.json()
      setOrderNo(data.order_no)
    } catch (err) {
      console.error('Error fetching order number:', err)
    }
  }

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/api/pizzas-with-prices'),
      fetch('http://localhost:8080/api/items/beverage'),
      fetchLatestOrderNo()
    ])
      .then(async ([pizzaRes, beverageRes]) => {
        if (!pizzaRes.ok || !beverageRes.ok) {
          throw new Error('Failed to fetch items')
        }
        const pizzaData = await pizzaRes.json()
        const beverageData = await beverageRes.json()
        setPizzas(pizzaData)
        setBeverages(beverageData)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'An error occurred')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleAddToOrder = (pizza: PizzaWithPrices, size: string, toppings: SelectedTopping[]) => {
    const toppingTotal = toppings.reduce((sum, t) => sum + (t.price * t.quantity), 0);
    const unitPrice = pizza.prices[size] + toppingTotal;
    
    const newItem: OrderedItem = {
      id: `${pizza.id}-${size}-${Date.now()}`,
      itemId: pizza.id,
      name: pizza.name,
      size,
      toppings,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice
    };
    
    setOrderedItems(prev => [...prev, newItem]);
  };

  const handleAddBeverageToOrder = (beverage: Item) => {
    if (!beverage.price) return;
    
    const newItem: OrderedItem = {
      id: `${beverage.id}-${Date.now()}`,
      itemId: beverage.id,
      name: beverage.name,
      quantity: 1,
      unitPrice: beverage.price,
      totalPrice: beverage.price
    };
    
    setOrderedItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setOrderedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setOrderedItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity
        };
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = orderedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.05; // 5% tax
    const grandTotal = subtotal + tax;
    return { subtotal, tax, grandTotal };
  };

  const { subtotal, tax, grandTotal } = calculateTotals();

  const handlePlaceOrder = async () => {
    if (orderedItems.length === 0) return;

    try {
      const orderData = {
        order_no: orderNo,
        items: orderedItems.map(item => ({
          item_id: item.itemId,
          pizza_size: item.size || null,
          quantity: item.quantity,
          toppings: item.toppings?.map(t => ({
            topping_id: t.id,
            quantity: t.quantity
          })) || []
        }))
      };

      const response = await fetch('http://localhost:8080/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      // Clear the order items
      setOrderedItems([]);
      
      // Increment order number
      setOrderNo(prev => String(Number(prev) + 1));

    } catch (err) {
      console.error('Error placing order:', err);
      // You might want to show an error message to the user here
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 flex">
      <div className="w-3/4 pr-4">
        <h1 className="text-2xl font-bold mb-6">Shop Orders</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pizzas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pizzas.map((pizza) => (
              <PizzaCard
                key={pizza.id}
                pizza={pizza}
                onAddToOrder={handleAddToOrder}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Beverages</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {beverages.map((beverage) => (
              <div
                key={beverage.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="h-[60%] relative mb-4">
                  <img
                    src={beverage.image_path 
                      ? `http://localhost:8080/${beverage.image_path}`
                      : '/default-beverage.jpg'}
                    alt={beverage.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold">{beverage.name}</h3>
                <button
                  className="w-full mt-2 bg-[#00ADB5] text-white py-2 rounded-md hover:bg-[#007F85] transition-colors flex items-center justify-center"
                  onClick={() => handleAddBeverageToOrder(beverage)}
                >
                  <img src="/shopping-cart.png" alt="Cart" className="w-4 h-4 mr-2" />
                  {beverage.price && (<b>Add Rs {beverage.price.toFixed(2)}</b>)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-1/4 pl-4 border-l">
        <h2 className="text-xl font-semibold mb-4">Order No #{orderNo}</h2>
        <h3 className="text-lg font-semibold mb-2">Ordered Items</h3>
        <div className="mb-4 max-h-[400px] overflow-y-auto">
          {orderedItems.map(item => (
            <OrderedItemCard
              key={item.id}
              item={item}
              onRemove={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Subtotal:</span> Rs {subtotal.toFixed(2)}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Tax (5%):</span> Rs {tax.toFixed(2)}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Grandtotal:</span> Rs {grandTotal.toFixed(2)}
        </div>
        <button className="w-full bg-[#3A4750] text-white py-2 rounded-md hover:bg-[#2e3639] transition-colors mb-2">
          Print Bill
        </button>
        <button 
          className="w-full bg-[#27B500] text-white py-2 rounded-md hover:bg-[#2b7517] transition-colors"
          onClick={handlePlaceOrder}
        >
          Place Order
        </button>
      </div>
    </div>
  )
}