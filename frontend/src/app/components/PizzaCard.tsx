'use client';
import { useState } from 'react';
import { PizzaWithPrices, SelectedTopping } from '../types/item';
import CustomizeModal from './CustomizeModal';

interface PizzaCardProps {
    pizza: PizzaWithPrices;
    onAddToOrder?: (pizza: PizzaWithPrices, size: string, toppings: SelectedTopping[]) => void;
}

export default function PizzaCard({ pizza, onAddToOrder }: PizzaCardProps) {
    const [selectedSize, setSelectedSize] = useState<string>('large');
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [selectedToppings, setSelectedToppings] = useState<SelectedTopping[]>([]);

    const sizeOptions = ['small', 'medium', 'large'];

    const calculateTotalPrice = () => {
        const basePrice = pizza.prices[selectedSize] || 0;
        const toppingsPrice = selectedToppings.reduce(
            (total, topping) => total + (topping.price * topping.quantity),
            0
        );
        return basePrice + toppingsPrice;
    };

    return (
        <div className="border rounded-lg overflow-hidden flex flex-col h-[500px]">
            {/* Image container taking 60% of the card height */}
            <div className="h-[60%] relative">
                <img
                    src="/api/placeholder/400/300"
                    alt={pizza.name}
                    className="w-full h-full object-cover"
                />
            </div>
            
            {/* Content container for the remaining 40% */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-lg">{pizza.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{pizza.description}</p>
                
                <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold">
                            ${calculateTotalPrice().toFixed(2)}
                        </div>
                        <div className="flex gap-1">
                            {sizeOptions.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-2 py-1 text-sm rounded-md ${
                                        selectedSize === size
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                    {size.charAt(0).toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {selectedToppings.length > 0 && (
                        <div className="text-sm text-gray-600">
                            Toppings: {selectedToppings.map(t => 
                                `${t.name} (${t.quantity}x)`
                            ).join(', ')}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsCustomizing(true)}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Customize
                        </button>
                        <button
                            onClick={() => onAddToOrder?.(pizza, selectedSize, selectedToppings)}
                            className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                        >
                            Add to Order
                        </button>
                    </div>
                </div>
            </div>

            <CustomizeModal
                isOpen={isCustomizing}
                onClose={() => setIsCustomizing(false)}
                onSave={setSelectedToppings}
                currentToppings={selectedToppings}
            />
        </div>
    );
}