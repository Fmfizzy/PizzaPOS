import { useState, useEffect } from 'react';
import { InvoiceItem } from '@/types/invoice';

export default function useInvoiceItems(invoiceId: number | null) {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) return;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/invoices/${invoiceId}/items`);
        if (!response.ok) throw new Error('Failed to fetch invoice items');
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [invoiceId]);

  return { items, loading, error };
}
