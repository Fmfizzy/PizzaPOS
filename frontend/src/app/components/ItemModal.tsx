'use client';
import { useState, useEffect } from 'react';
import { Item } from '../types/item';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: any) => void;
  editItem?: Item | null;
}

interface ItemFormData {
  name: string;
  category: 'pizza' | 'beverage';
  description: string;
  price: string;
  image_path: string;
  is_available: boolean;
  pizzaPrices: {
    small: string;
    medium: string;
    large: string;
  };
}

export default function ItemModal({ isOpen, onClose, onSubmit, editItem }: ItemModalProps) {
  const [itemData, setItemData] = useState<ItemFormData>({
    name: '',
    category: 'pizza',
    description: '',
    price: '',
    image_path: '',
    is_available: true,
    pizzaPrices: {
      small: '',
      medium: '',
      large: ''
    }
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setItemData({
      name: '',
      category: 'pizza',
      description: '',
      price: '',
      image_path: '',
      is_available: true,
      pizzaPrices: {
        small: '',
        medium: '',
        large: ''
      }
    });
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    } else if (editItem) {
      // Set item data without pizza prices
      setItemData({
        name: editItem.name || '',
        category: editItem.category as 'pizza' | 'beverage',
        description: editItem.description || '',
        price: editItem.price?.toString() || '',
        image_path: editItem.image_path || '',
        is_available: editItem.is_available ?? true,
        pizzaPrices: {
          small: '',
          medium: '',
          large: ''
        }
      });

      // If it's a pizza, fetch its prices
      if (editItem.category === 'pizza') {
        fetchPizzaPrices(editItem.id);
      }
    }
  }, [isOpen, editItem]);

  const fetchPizzaPrices = async (itemId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/pizzas-with-prices/${itemId}`);
      if (!response.ok) throw new Error('Failed to fetch pizza prices');
      
      const data = await response.json();
      setItemData(prev => ({
        ...prev,
        pizzaPrices: {
          small: data.prices?.small?.toString() || '',
          medium: data.prices?.medium?.toString() || '',
          large: data.prices?.large?.toString() || ''
        }
      }));
    } catch (err) {
      console.error('Error fetching pizza prices:', err);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!itemData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (itemData.category === 'beverage' && !itemData.price) {
      newErrors.price = 'Price is required for beverages';
    }

    if (itemData.category === 'pizza') {
      if (!itemData.pizzaPrices.small) newErrors.small = 'Small price is required';
      if (!itemData.pizzaPrices.medium) newErrors.medium = 'Medium price is required';
      if (!itemData.pizzaPrices.large) newErrors.large = 'Large price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Create a clean submission object
      const submitData = {
        name: itemData.name.trim(),
        category: itemData.category,
        description: itemData.description,
        image_path: itemData.image_path,
        is_available: true,
        price: itemData.category === 'beverage' ? itemData.price : null,
        pizzaPrices: itemData.category === 'pizza' ? itemData.pizzaPrices : undefined
      };

      console.log('Submitting data:', submitData); // Debug log
      onSubmit(submitData);
      resetForm();
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
      setItemData((prev: ItemFormData) => ({ ...prev, image_path: data.filepath }));
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">{editItem ? 'Edit Item' : 'Add New Item'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={itemData.name}
              onChange={(e) => setItemData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          {!editItem && (
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={itemData.category}
                onChange={(e) => setItemData(prev => ({ ...prev, category: e.target.value as 'pizza' | 'beverage' }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="pizza">Pizza</option>
                <option value="beverage">Beverage</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={itemData.description}
              onChange={(e) => setItemData((prev: ItemFormData) => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded-md"
            />
          </div>
          {itemData.category === 'beverage' ? (
            <div>
              <label className="block text-sm font-medium mb-1">Price *</label>
              <input
                type="number"
                value={itemData.price}
                onChange={(e) => setItemData(prev => ({ ...prev, price: e.target.value }))}
                className={`w-full p-2 border rounded-md ${errors.price ? 'border-red-500' : ''}`}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium">Pizza Prices *</h4>
              <div className="grid grid-cols-3 gap-4">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <div key={size}>
                    <label className="block text-sm font-medium mb-1 capitalize">{size}</label>
                    <input
                      type="number"
                      value={itemData.pizzaPrices[size]}
                      onChange={(e) => setItemData(prev => ({
                        ...prev,
                        pizzaPrices: { ...prev.pizzaPrices, [size]: e.target.value }
                      }))}
                      className={`w-full p-2 border rounded-md ${errors[size] ? 'border-red-500' : ''}`}
                    />
                    {errors[size] && <p className="text-red-500 text-sm mt-1">{errors[size]}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-4 justify-end">
          <button
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[#27B500] text-white rounded-md hover:bg-[#219400]"
            onClick={handleSubmit}
          >
            {editItem ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

