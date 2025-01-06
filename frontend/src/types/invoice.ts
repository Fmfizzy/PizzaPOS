export interface Invoice {
  id: number;
  order_no: string;
  total_amount: number;
  tax_amount: number;
  status: string;
  created_at: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface InvoiceItemTopping {
  id: number;
  topping_id: number;
  name: string;
  quantity: number;
  price: number;
}
