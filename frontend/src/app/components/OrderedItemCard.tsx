import { OrderedItem } from '../types/item';

interface OrderedItemCardProps {
  item: OrderedItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
}

export default function OrderedItemCard({ item, onRemove, onUpdateQuantity }: OrderedItemCardProps) {
  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? item.quantity + 1 : Math.max(1, item.quantity - 1);
    onUpdateQuantity(item.id, newQuantity);
  };

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex-1">
        <div className="font-medium">{item.name}</div>
        {item.size && <div className="text-sm text-gray-600">Size: {item.size}</div>}
        {item.toppings && item.toppings.length > 0 && (
          <div className="text-sm text-gray-600">
            Toppings: {item.toppings.map(t => `${t.name} (${t.quantity}x)`).join(', ')}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleQuantityChange(false)}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          -
        </button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button 
          onClick={() => handleQuantityChange(true)}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          +
        </button>
      </div>
      
      <div className="ml-4 flex items-center gap-2">
        <span className="font-medium">Rs {item.totalPrice.toFixed(2)}</span>
        <button 
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
