'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import type { Product } from '@/lib/types/database';

interface CartItem extends Product {
  quantity: number;
  selected: boolean;
}

interface CartState {
  items: CartItem[];
  selectedItems: CartItem[];
  total: number;
  selectedTotal: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'TOGGLE_ITEM'; payload: string }
  | { type: 'TOGGLE_ALL'; payload: boolean }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

const initialState: CartState = {
  items: [],
  selectedItems: [],
  total: 0,
  selectedTotal: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      const newItem = { ...action.payload, quantity: 1, selected: false };
      return {
        ...state,
        items: [...state.items, newItem],
      };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    }

    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case 'TOGGLE_ITEM': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? { ...item, selected: !item.selected }
            : item
        ),
      };
    }

    case 'TOGGLE_ALL': {
      return {
        ...state,
        items: state.items.map((item) => ({ ...item, selected: action.payload })),
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

function calculateTotals(items: CartItem[]): Pick<CartState, 'selectedItems' | 'total' | 'selectedTotal'> {
  const selectedItems = items.filter((item) => item.selected);
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const selectedTotal = selectedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return { selectedItems, total, selectedTotal };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Update totals whenever items change
  useEffect(() => {
    const { selectedItems, total, selectedTotal } = calculateTotals(state.items);
    if (
      selectedItems !== state.selectedItems ||
      total !== state.total ||
      selectedTotal !== state.selectedTotal
    ) {
      Object.assign(state, { selectedItems, total, selectedTotal });
    }
  }, [state, state.items]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const { items } = JSON.parse(savedCart);
      items.forEach((item: CartItem) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
      });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({ items: state.items }));
  }, [state.items]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}