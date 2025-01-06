'use client';
import { useState, useEffect } from 'react';
import { Item } from '../types/item';

export default function ManageItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/items');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Items</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div 
            key={item.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-gray-600">{item.description}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Category: {item.category}
              </span>
              {item.price && (
                <span className="font-medium">
                  ${item.price.toFixed(2)}
                </span>
              )}
            </div>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                item.is_available 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}