import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

/**
 * CartItem Interface
 * Defines the structure of a single item within the shopping cart.
 * Includes the product details, chosen quantity, and price unit.
 */
interface CartItem {
  product: Product;
  quantity: number;
  unit: 'tray';
}

/**
 * CartContextType Interface
 * Defines the public API provided by the CartContext for managing the cart state.
 */
interface CartContextType {
  cart: CartItem[]; // List of items currently in the cart
  addToCart: (product: Product) => void; // Logic to add a new product or increment existing
  removeFromCart: (productId: number) => void; // Removes a specific variant from the cart
  updateQuantity: (productId: number, delta: number) => void; // Adjusts quantity for a variant
  clearCart: () => void; // Resets the cart to empty
  totalAmount: number; // Sum total of all items in checkout
  getItemPrice: (item: { product: Product }) => number; // Helper to get correct price based on unit
  isCartOpen: boolean; // UI state for the cart drawer
  setIsCartOpen: (isOpen: boolean) => void; // Sets the UI state for the cart drawer
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * CartProvider Component
 * Manages the global shopping cart state, handles storage persistence, and provides context to children.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize cart state from localStorage or default to empty array
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('eggmarket_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  /**
   * Persistence Hook: Updates localStorage whenever the cart content changes.
   * Includes data-minimization logic to prevent localStorage quota errors.
   */
  useEffect(() => {
    try {
      // Minimize data footprint before saving to prevent quota issues
      const cartToSave = cart.map(item => ({
        ...item,
        product: {
          ...item.product,
          // Strip large base64 strings if present
          image_url: item.product.image_url?.startsWith('data:') ? '' : item.product.image_url,
          description: '' // Omit description to save space as it's not needed for cart summary
        }
      }));
      localStorage.setItem('eggmarket_cart', JSON.stringify(cartToSave));
    } catch (e) {
      console.error('Failed to save cart to localStorage (Quota likely exceeded):', e);
      // Fallback: Save an extremely minimal version if the object is still too large
      try {
        const minimalCart = cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unit: item.unit,
          name: item.product.name,
          price: item.product.price_per_tray
        }));
        localStorage.setItem('eggmarket_cart', JSON.stringify(minimalCart));
      } catch (innerError) {
        console.error('Even minimal cart failed to save:', innerError);
      }
    }
  }, [cart]);

  /**
   * Retrieves the dynamic price per unit based on product settings
   */
  const getItemPrice = (item: { product: Product }) => {
    return item.product.price_per_tray;
  };

  /**
   * Adds a product to the cart or increments its quantity if variant (Product ID + Unit) already exists
   */
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => {
          if (item.product.id === product.id) {
            let maxQty = product.stock_tray || 0;
            // Cap at available stock
            return { ...item, quantity: Math.min(item.quantity + 1, maxQty) };
          }
          return item;
        });
      }
      return [...prev, { product, quantity: 1, unit: 'tray' }];
    });
  };

  /**
   * Removes a specific variant from the cart
   */
  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  /**
   * Increments or decrements item quantity while respecting stock boundaries
   */
  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        let maxQty = item.product.stock_tray || 0;
        // Clamp between 1 and max stock
        const newQty = Math.max(1, Math.min(item.quantity + delta, maxQty));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  /**
   * Completely resets the cart to empty
   */
  const clearCart = () => setCart([]);

  /**
   * Derived state: Total checkout price
   */
  const totalAmount = cart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalAmount, 
      getItemPrice,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * useCart Hook
 * Provides a standardized way to access and modify the shopping cart from any component.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
