export interface Item {
    id: number;
    name: string;
    category: string;
    description: string;
    is_available: boolean;
    price: number | null;
    created_at: string;
}

export interface PizzaWithPrices extends Omit<Item, 'price'> {
    prices: {
        [key: string]: number;  // 'small' | 'medium' | 'large'
    };
}

export interface Topping {
    id: number;
    name: string;
    price: number;
    is_available: boolean;
    created_at: string;
}

export interface SelectedTopping extends Topping {
    quantity: number;
}