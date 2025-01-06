'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import { OrderedItem } from '../types/item';

interface PrintReceiptProps {
  orderNo: string;
  items: OrderedItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
}

// function to split text into chunks of maximum length
const splitTextIntoChunks = (text: string, maxLength: number): string[] => {
  const chunks: string[] = [];
  let remainingText = text;
  
  while (remainingText.length > 0) {
    const spaceIndex = remainingText.slice(0, maxLength).lastIndexOf(' ');
    
    const breakPoint = spaceIndex > 0 ? spaceIndex : Math.min(maxLength, remainingText.length);
    
    chunks.push(remainingText.slice(0, breakPoint).trim());
    remainingText = remainingText.slice(breakPoint).trim();
  }
  
  return chunks;
};

export default function PrintReceipt({
  orderNo,
  items,
  subtotal,
  tax,
  grandTotal
}: PrintReceiptProps) {
  return (
    <div className="print-receipt w-[302px] p-2 text-sm font-mono">
      <div className="text-center mb-4">
        <div className="relative mx-auto w-24 h-24 mb-2">
          <Image 
            src="/logo.png"
            alt="Pizza Shop Logo"
            fill
            sizes="(max-width: 96px) 100vw"
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <h2 className="font-bold text-lg">PIZZA SHOP</h2>
        <p>123 Pizza Street, Food City</p>
        <p>Tel: (123) 456-7890</p>
        <div className="border-b border-dashed my-2"></div>
      </div>

      <div className="mb-4">
        <p>Order #: {orderNo}</p>
        <p>Date: {new Date().toLocaleString()}</p>
        <div className="border-b border-dashed my-2"></div>
      </div>

      <div className="mb-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-dashed">
              <th className="py-1 w-[50%]">Item</th>
              <th className="py-1 text-center w-[20%]">Qty</th>
              <th className="py-1 text-right w-[30%]">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <Fragment key={index}>
                {splitTextIntoChunks(item.name, 12).map((chunk, chunkIndex) => (
                  <tr key={`${index}-${chunkIndex}`}>
                    <td className="py-1">
                      {chunk}
                    </td>
                    {chunkIndex === 0 ? (
                      <>
                        <td className="py-1 text-center">{item.quantity}</td>
                        <td className="py-1 text-right">Rs {item.totalPrice.toFixed(2)}</td>
                      </>
                    ) : (
                      <>
                        <td></td>
                        <td></td>
                      </>
                    )}
                  </tr>
                ))}
              </Fragment>
            ))}
            <tr className="border-t border-dashed">
              <td colSpan={2} className="py-1 text-right">Subtotal:</td>
              <td className="py-1 text-right">Rs {subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="py-1 text-right">Tax (5%):</td>
              <td className="py-1 text-right">Rs {tax.toFixed(2)}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan={2} className="py-1 text-right">Total:</td>
              <td className="py-1 text-right">Rs {grandTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center mt-4">
        <p>Thank you for your purchase!</p>
        <p>Please visit again</p>
      </div>
    </div>
  );
}