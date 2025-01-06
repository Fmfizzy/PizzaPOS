'use client';

import { useState, useEffect } from 'react'
import { PizzaWithPrices, Item } from '../types/item'
import PizzaCard from '../components/PizzaCard'

export default function Orders() {
  const [orderNo, setOrderNo] = useState<string>('10000')
  const [pizzas, setPizzas] = useState<PizzaWithPrices[]>([])
  const [beverages, setBeverages] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleAddToOrder = (pizza: PizzaWithPrices, size: string) => {
    // This will be implemented when we add order functionality
    console.log(`Adding ${pizza.name} (${size}) to order`)
  }

  const handlePlaceOrder = async () => {
    // Add your order placement logic here
    try {
      // After successful order placement
      setOrderNo(prev => {
        const nextOrderNo = String(Number(prev) + 1)
        return nextOrderNo
      })
    } catch (err) {
      console.error('Error placing order:', err)
    }
  }

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
                  onClick={() => console.log(`Adding ${beverage.name} to order`)}
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
        <div className="mb-4">
          {/* Ordered items will be listed here */}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Subtotal:</span> $0.00
        </div>
        <div className="mb-2">
          <span className="font-semibold">Tax:</span> $0.00
        </div>
        <div className="mb-4">
          <span className="font-semibold">Grandtotal:</span> $0.00
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