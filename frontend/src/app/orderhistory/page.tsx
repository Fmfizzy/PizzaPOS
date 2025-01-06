'use client';
import { useState } from 'react';
import useInvoices from '@/hooks/useInvoices';
import useInvoiceItems from '@/hooks/useInvoiceItems';
import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';

export default function OrderHistory() {
  const { invoices, loading, error } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { items, loading: itemsLoading } = useInvoiceItems(selectedInvoice?.id ?? null);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{invoice.order_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${invoice.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${invoice.tax_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${invoice.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(invoice.created_at), 'MMM dd, yyyy HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              onClick={() => setSelectedInvoice(invoice)}
              className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between mb-2">
                <span className="font-medium">Order #{invoice.order_no}</span>
                <span className={`px-2 text-xs leading-5 font-semibold rounded-full 
                  ${invoice.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {invoice.status}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total:</span>
                  <span>${invoice.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax:</span>
                  <span>${invoice.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span>{format(new Date(invoice.created_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order Details #{selectedInvoice.order_no}</h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-4">
              {itemsLoading ? (
                <div className="text-center py-4">Loading items...</div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Item</th>
                          <th className="px-4 py-2 text-left">Quantity</th>
                          <th className="px-4 py-2 text-left">Unit Price</th>
                          <th className="px-4 py-2 text-left">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2">{item.item_name}</td>
                            <td className="px-4 py-2">{item.quantity}</td>
                            <td className="px-4 py-2">Rs &nbsp; {(item.unit_price).toFixed(2)}</td>
                            <td className="px-4 py-2">Rs &nbsp; {(item.subtotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-right font-bold">Tax:</td>
                          <td className="px-4 py-2">Rs &nbsp; {(selectedInvoice.tax_amount).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-right font-bold">Total:</td>
                          <td className="px-4 py-2">Rs &nbsp; {(selectedInvoice.total_amount).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="border rounded p-3">
                        <div className="font-medium mb-2">{item.item_name}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Quantity:</span>
                            <span>{item.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Unit Price:</span>
                            <span>Rs &nbsp; {item.unit_price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal:</span>
                            <span>Rs &nbsp; {item.subtotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-4 mt-4 space-y-2">
                      <div className="flex justify-between font-medium">
                        <span>Tax:</span>
                        <span>Rs &nbsp; {selectedInvoice.tax_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>Rs &nbsp; {selectedInvoice.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}