'use client';
import { useState, useEffect } from 'react';
import { Item } from '../types/item';
import ItemModal from '../components/ItemModal';

export default function ManageItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pizza' | 'beverage'>('pizza');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'pizza',
    description: '',
    price: '',
    image_path: '',
    pizzaPrices: {
      small: '',
      medium: '',
      large: ''
    }
  });
  const [editItem, setEditItem] = useState<Item | null>(null);

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

  const handleDelete = async (item: Item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
        const response = await fetch(`http://localhost:8080/api/items/${itemToDelete.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete item');
        }
        
        // Only update UI if delete was successful
        setItems(items.filter(item => item.id !== itemToDelete.id));
        setShowDeleteConfirm(false);
        setItemToDelete(null);
    } catch (err) {
        console.error('Error deleting item:', err);
        alert(err instanceof Error ? err.message : 'Failed to delete item');
    }
};

  const handleAddItem = async () => {
    try {
      // First create the item
      const response = await fetch('http://localhost:8080/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newItem,
          price: newItem.category === 'beverage' ? parseFloat(newItem.price) : null
        }),
      });

      if (!response.ok) throw new Error('Failed to add item');

      const addedItem = await response.json();

      // If it's a pizza, add the base prices
      if (newItem.category === 'pizza') {
        const sizePrices = ['small', 'medium', 'large'];
        
        for (const size of sizePrices as Array<keyof typeof newItem.pizzaPrices>) {
          const priceResponse = await fetch('http://localhost:8080/api/pizzaprice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              item_id: addedItem.id,
              size: size,
              price: parseFloat(newItem.pizzaPrices[size])
            }),
          });

          if (!priceResponse.ok) {
            throw new Error(`Failed to add price for ${size}`);
          }
        }
      }

      await fetchItems(); // Refresh the items list
      setShowAddModal(false);
      setNewItem({
        name: '',
        category: 'pizza',
        description: '',
        price: '',
        image_path: '',
        pizzaPrices: { small: '', medium: '', large: '' }
      });
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      setNewItem(prev => ({ ...prev, image_path: data.filepath }));
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  const handleEdit = (item: Item) => {
    setEditItem(item);
    setShowAddModal(true);
  };

  const handleSubmit = async (itemData: any) => {
    try {
      if (editItem) {
        // Handle edit
        const response = await fetch(`http://localhost:8080/api/items/${editItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...itemData,
            price: itemData.category === 'beverage' ? parseFloat(itemData.price) : null
          }),
        });

        if (!response.ok) throw new Error('Failed to update item');

        // If it's a pizza, update the base prices
        if (itemData.category === 'pizza' && itemData.pizzaPrices) {
          const sizes = ['small', 'medium', 'large'];
          
          for (const size of sizes) {
            if (itemData.pizzaPrices[size]) {
              const priceResponse = await fetch(`http://localhost:8080/api/pizzaprice/${editItem.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  size: size,
                  price: parseFloat(itemData.pizzaPrices[size])
                }),
              });

              if (!priceResponse.ok) {
                throw new Error(`Failed to update price for ${size}`);
              }
            }
          }
        }
      } else {
        await handleAddItem();
      }

      await fetchItems();
      setShowAddModal(false);
      setEditItem(null);
    } catch (err) {
      console.error('Error saving item:', err);
      alert(err instanceof Error ? err.message : 'An error occurred while saving the item');
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    item.category.toLowerCase() === activeTab
  );

  if (loading) {
    
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) return <div className="bg-red-50 text-red-500 p-4 rounded-lg">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Items</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#27B500] text-white px-4 py-2 rounded-md hover:bg-[#219400] transition-colors flex items-center"
        >
          <span className="text-2xl mr-1">+</span> Add Item
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
          />
          <button className="px-4 py-2 bg-[#00ADB5] text-white rounded-md hover:bg-[#007F85]">
            Search
          </button>
        </div>
        <div className="flex justify-center gap-4 mb-4">
          <button
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'pizza'
                ? 'bg-[#00ADB5] text-white'
                : 'bg-[#3A4750] hover:bg-[#2e3639] text-white'
            }`}
            onClick={() => setActiveTab('pizza')}
          >
            Pizzas
          </button>
          <button
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'beverage'
                ? 'bg-[#00ADB5] text-white'
                : 'bg-[#3A4750] hover:bg-[#2e3639] text-white'
            }`}
            onClick={() => setActiveTab('beverage')}
          >
            Beverages
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="border rounded-lg overflow-hidden flex flex-col hover:shadow-lg">
            <div className="h-[200px] relative">
              <img
                src={item.image_path
                  ? `http://localhost:8080/${item.image_path}`
                  : item.category === 'pizza' ? '/default-pizza.jpg' : '/default-beverage.jpg'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-4">Category: {item.category}</p>
              
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => handleDelete(item)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <img src="/delete-white.png" alt="Delete" className="w-4 h-4 mr-2" />
                  Delete
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 bg-[#00ADB5] text-white py-2 rounded-md hover:bg-[#007F85] transition-colors"
                >
                  Edit Item
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ItemModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditItem(null);
        }}
        onSubmit={handleSubmit}
        editItem={editItem}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete {itemToDelete?.name}?</p>
            <div className="mt-6 flex gap-4 justify-end">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}