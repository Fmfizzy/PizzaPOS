'use client';
import { useState } from 'react';
import { PizzaWithPrices, SelectedTopping } from '../types/item';
import CustomizeModal from './CustomizeModal';

interface PizzaCardProps {
    pizza: PizzaWithPrices;
    onAddToOrder: (pizza: PizzaWithPrices, size: string, toppings: SelectedTopping[]) => void;
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
        <div className="border rounded-lg overflow-hidden flex flex-col hover:shadow-lg">
            <div className="h-[60%] relative">
                <img
                    src={pizza.image_path
                        ? `http://localhost:8080/${pizza.image_path}`
                        : '/default-pizza.jpg'}
                    alt={pizza.name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-lg">{pizza.name}</h3>

                <div className="flex justify-between items-center mt-auto">
                    <button
                        onClick={() => setIsCustomizing(true)}
                        className="mr-2 bg-[#3A4750] text-white py-2 px-4 rounded-md hover:bg-[#43525c] transition-colors"
                    >
                        Customize
                    </button>
                    <div className="flex justify-between items-center rounded-lg border border-white flex-1 ml-4">
                        <div className="flex">
                            {sizeOptions.map((size, index) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-[12px] py-[7px] text-lg text-white ${selectedSize === size
                                        ? 'bg-[#00ADB5]'
                                        : 'bg-[#3A4750] hover:bg-[#43525c] '
                                        } ${index === 0
                                            ? 'rounded-l-lg'
                                            : index === sizeOptions.length - 1
                                                ? 'rounded-r-lg'
                                                : ''
                                        }`}
                                >
                                    {size.charAt(0).toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {selectedToppings.length > 0 && (
                    <div className="text-sm text-gray-600 mt-2">
                        Toppings: {selectedToppings.map(t =>
                            `${t.name} (${t.quantity}x)`
                        ).join(', ')}
                    </div>
                )}

                <button
                    onClick={() => onAddToOrder(pizza, selectedSize, selectedToppings)}
                    className="mt-4 bg-[#00ADB5] text-white py-2 rounded-md hover:bg-[#007F85] transition-colors flex items-center justify-center"
                >
                    <img src="/shopping-cart.png" alt="Cart" className="w-4 h-4 mr-2" />
                    <b>Add Rs {calculateTotalPrice().toFixed(2)}</b>
                </button>
            </div>

            <CustomizeModal
                isOpen={isCustomizing}
                onClose={() => setIsCustomizing(false)}
                onSave={setSelectedToppings}
                currentToppings={selectedToppings}
                pizza={pizza}  // Make sure this prop is being passed
            />
        </div>
    );
}