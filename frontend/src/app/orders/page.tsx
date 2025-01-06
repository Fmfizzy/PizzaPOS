'use client';

import { useState, useEffect } from 'react'
import { PizzaWithPrices, Item } from '../types/item'
import PizzaCard from '../components/PizzaCard'

export default function Orders() {
  const [pizzas, setPizzas] = useState<PizzaWithPrices[]>([])
  const [beverages, setBeverages] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/api/pizzas-with-prices'),
      fetch('http://localhost:8080/api/items/beverage')
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
    <div className="bg-white rounded-lg shadow p-6">
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
              <h3 className="font-semibold">{beverage.name}</h3>
              {beverage.price && (
                <p className="text-gray-700">${beverage.price.toFixed(2)}</p>
              )}
              <button
                className="w-full mt-2 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                onClick={() => console.log(`Adding ${beverage.name} to order`)}
              >
                Add to Order
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}