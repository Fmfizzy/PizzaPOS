// components/CustomizeModal.tsx
import { useState, useEffect } from 'react';
import { Topping, SelectedTopping, PizzaWithPrices } from '../types/item';

interface CustomizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selectedToppings: SelectedTopping[]) => void;
    currentToppings?: SelectedTopping[];
    pizza?: PizzaWithPrices;  // Make pizza optional
}

export default function CustomizeModal({ 
    isOpen, 
    onClose, 
    onSave,
    currentToppings = [],
    pizza
}: CustomizeModalProps) {
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [selectedToppings, setSelectedToppings] = useState<SelectedTopping[]>(currentToppings);

    useEffect(() => {
        if (isOpen) {
            fetch('http://localhost:8080/api/toppings')
                .then(res => res.json())
                .then(data => setToppings(data))
                .catch(err => console.error('Error fetching toppings:', err));
        }
    }, [isOpen]);

    const handleAdd = (topping: Topping) => {
        const existing = selectedToppings.find(t => t.id === topping.id);
        if (existing) {
            setSelectedToppings(selectedToppings.map(t => 
                t.id === topping.id 
                    ? { ...t, quantity: t.quantity + 1 }
                    : t
            ));
        } else {
            setSelectedToppings([...selectedToppings, { ...topping, quantity: 1 }]);
        }
    };

    const handleRemove = (toppingId: number) => {
        setSelectedToppings(selectedToppings.filter(t => t.id !== toppingId));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto relative">
                {/* Close button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex gap-6">
                    {/* Left column with image */}
                    <div className="w-1/4">
                        <img
                            src={pizza?.image_path 
                                ? `http://localhost:8080/${pizza.image_path}`
                                : '/default-pizza.jpg'}
                            alt={pizza?.name || 'Pizza'}
                            className="w-full rounded-lg"
                        />
                    </div>

                    {/* Right column with content */}
                    <div className="w-3/4">
                        <h2 className="text-xl font-bold mb-2">Customize Pizza</h2>
                        <h3 className="text-lg font-semibold mb-1">{pizza?.name || 'Custom Pizza'}</h3>
                        <p className="text-gray-600 mb-4">{pizza?.description || ''}</p>
                        
                        <div className="space-y-4">
                            {toppings.map(topping => {
                                const selected = selectedToppings.find(t => t.id === topping.id);
                                return (
                                    <div key={topping.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{topping.name}</p>
                                            <p className="text-sm text-gray-600">
                                                Rs {topping.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {selected ? (
                                                <>
                                                    <span className="px-2">{selected.quantity}x</span>
                                                    <button
                                                        onClick={() => handleRemove(topping.id)}
                                                        className="bg-[#3A4750] text-white px-3 py-1 rounded hover:bg-[#2e3639]"
                                                    >
                                                        Remove
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleAdd(topping)}
                                                    className="bg-[#00ADB5] text-white px-3 py-1 rounded hover:bg-[#007F85]"
                                                >
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onSave(selectedToppings);
                                    onClose();
                                }}
                                className="px-4 py-2 bg-[#27B500] text-white rounded hover:bg-[#2b7517]"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}