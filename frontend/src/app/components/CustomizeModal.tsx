// components/CustomizeModal.tsx
import { useState, useEffect } from 'react';
import { Topping, SelectedTopping } from '../types/item';

interface CustomizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selectedToppings: SelectedTopping[]) => void;
    currentToppings?: SelectedTopping[];
}

export default function CustomizeModal({ 
    isOpen, 
    onClose, 
    onSave,
    currentToppings = []
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
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Customize Pizza</h2>
                
                <div className="space-y-4">
                    {toppings.map(topping => {
                        const selected = selectedToppings.find(t => t.id === topping.id);
                        return (
                            <div key={topping.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{topping.name}</p>
                                    <p className="text-sm text-gray-600">
                                        ${topping.price.toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selected ? (
                                        <>
                                            <span className="px-2">{selected.quantity}x</span>
                                            <button
                                                onClick={() => handleRemove(topping.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded"
                                            >
                                                Remove
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleAdd(topping)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded"
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
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}