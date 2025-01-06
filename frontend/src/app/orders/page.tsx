'use client';

import { useState, useEffect } from 'react'
import { PizzaWithPrices, Item, OrderedItem, SelectedTopping } from '../types/item'
import PizzaCard from '../components/PizzaCard'
import OrderedItemCard from '../components/OrderedItemCard'
import ReactDOM from 'react-dom/client'
import PrintReceipt from '../components/PrintReceipt';

export default function Orders() {
  const [orderNo, setOrderNo] = useState<string>('10000')
  const [pizzas, setPizzas] = useState<PizzaWithPrices[]>([])
  const [beverages, setBeverages] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderedItems, setOrderedItems] = useState<OrderedItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'pizza' | 'beverage'>('pizza')

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

  const handleAddToOrder = (pizza: PizzaWithPrices, size: string, toppings: SelectedTopping[]) => {
    const toppingTotal = toppings.reduce((sum, t) => sum + (t.price * t.quantity), 0);
    const unitPrice = pizza.prices[size] + toppingTotal;
    
    const newItem: OrderedItem = {
      id: `${pizza.id}-${size}-${Date.now()}`,
      itemId: pizza.id,
      name: pizza.name,
      size,
      toppings,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice
    };
    
    setOrderedItems(prev => [...prev, newItem]);
  };

  const handleAddBeverageToOrder = (beverage: Item) => {
    if (!beverage.price) return;
    
    const newItem: OrderedItem = {
      id: `${beverage.id}-${Date.now()}`,
      itemId: beverage.id,
      name: beverage.name,
      quantity: 1,
      unitPrice: beverage.price,
      totalPrice: beverage.price
    };
    
    setOrderedItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setOrderedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setOrderedItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity
        };
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = orderedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.05; // 5% tax
    const grandTotal = subtotal + tax;
    return { subtotal, tax, grandTotal };
  };

  const { subtotal, tax, grandTotal } = calculateTotals();

  const handlePlaceOrder = async () => {
    if (orderedItems.length === 0) return;

    try {
        const orderData = {
            order_no: orderNo,
            items: orderedItems.map(item => ({
                item_name: item.name,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                toppings: item.toppings?.map(t => ({
                    topping_id: t.id,
                    quantity: t.quantity
                })) || []
            }))
        };

        const response = await fetch('http://localhost:8080/api/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error('Failed to place order');
        }

        // Clear the order items
        setOrderedItems([]);
        
        // Increment order number
        setOrderNo(prev => String(Number(prev) + 1));

    } catch (err) {
        console.error('Error placing order:', err);
    }
};

  const handlePrintBill = () => {
    // Create a new window for printing
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    // Add necessary styles for the receipt
    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { 
              size: 80mm auto;
              margin: 0;
            }
            body { 
              font-family: monospace;
              padding: 10px;
              margin: 0;
            }
            .print-receipt {
              width: 302px;
            }
            @media print {
              .print-receipt {
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
    `);

    // Render the receipt component
    const receiptElement = document.createElement('div');
    printWindow.document.body.appendChild(receiptElement);
    
    // Use ReactDOM to render the receipt
    const root = ReactDOM.createRoot(receiptElement);
    root.render(
      <PrintReceipt
        orderNo={orderNo}
        items={orderedItems}
        subtotal={subtotal}
        tax={tax}
        grandTotal={grandTotal}
      />
    );

    // Print the window
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for images to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const filteredPizzas = pizzas.filter(pizza => 
    pizza.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBeverages = beverages.filter(beverage => 
    beverage.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold mb-4">Shop Orders</h1>
        
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

        {/* Conditional rendering based on activeTab */}
        {activeTab === 'pizza' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Pizzas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPizzas.map((pizza) => (
                <PizzaCard
                  key={pizza.id}
                  pizza={pizza}
                  onAddToOrder={handleAddToOrder}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'beverage' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Beverages</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBeverages.map((beverage) => (
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
                    onClick={() => handleAddBeverageToOrder(beverage)}
                  >
                    <img src="/shopping-cart.png" alt="Cart" className="w-4 h-4 mr-2" />
                    {beverage.price && (<b>Add Rs {beverage.price.toFixed(2)}</b>)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-1/4 pl-4 border-l">
        <h2 className="text-xl font-semibold mb-4">Order No #{orderNo}</h2>
        <h3 className="text-lg font-semibold mb-2">Ordered Items</h3>
        <div className="mb-4 max-h-[400px] overflow-y-auto">
          {orderedItems.map(item => (
            <OrderedItemCard
              key={item.id}
              item={item}
              onRemove={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Subtotal:</span> Rs {subtotal.toFixed(2)}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Tax (5%):</span> Rs {tax.toFixed(2)}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Grandtotal:</span> Rs {grandTotal.toFixed(2)}
        </div>
        <button 
          className="w-full bg-[#3A4750] text-white py-2 rounded-md hover:bg-[#2e3639] transition-colors mb-2"
          onClick={handlePrintBill}
        >
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