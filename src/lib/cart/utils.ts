interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  description?: string;
}
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
}

// Cart storage key
const CART_STORAGE_KEY = 'breadverse_cart';

// Get cart from localStorage (for logged-out users only)
export const getCartFromStorage = (): CartState => {
  if (typeof window === 'undefined') {
    return { items: [], totalItems: 0, totalPrice: 0, isOpen: false };
  }
  
  // Check if user is logged in (has token cookie)
  const hasToken = document.cookie.includes('token');
  if (hasToken) {
    // Logged in users should use server cart
    return { items: [], totalItems: 0, totalPrice: 0, isOpen: false };
  }
  
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { items: [], totalItems: 0, totalPrice: 0, isOpen: false };
    }
  }
  return { items: [], totalItems: 0, totalPrice: 0, isOpen: false };
};

// Save cart to localStorage (for logged-out users only)
export const saveCartToStorage = (cart: CartState) => {
  if (typeof window === 'undefined') return;
  
  // Check if user is logged in
  const hasToken = document.cookie.includes('token');
  if (!hasToken) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
};

// Calculate totals
export const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalItems, totalPrice };
};

// Add item to cart
export const addToCart = (cart: CartState, item: CartItem, quantity: number = 1): CartState => {
  const existingItemIndex = cart.items.findIndex(cartItem => cartItem.id === item.id);
  
  let newItems: CartItem[];
  
  if (existingItemIndex >= 0) {
    newItems = [...cart.items];
    newItems[existingItemIndex] = {
      ...newItems[existingItemIndex],
      quantity: newItems[existingItemIndex].quantity + quantity,
    };
  } else {
    newItems = [...cart.items, { ...item, quantity }];
  }
  
  const { totalItems, totalPrice } = calculateTotals(newItems);
  
  return {
    items: newItems,
    totalItems,
    totalPrice,
    isOpen: cart.isOpen,
  };
};

// Remove item from cart
export const removeFromCart = (cart: CartState, itemId: string): CartState => {
  const newItems = cart.items.filter(item => item.id !== itemId);
  const { totalItems, totalPrice } = calculateTotals(newItems);
  
  return {
    items: newItems,
    totalItems,
    totalPrice,
    isOpen: cart.isOpen,
  };
};

// Update item quantity
export const updateQuantity = (cart: CartState, itemId: string, quantity: number): CartState => {
  if (quantity <= 0) {
    return removeFromCart(cart, itemId);
  }
  
  const newItems = cart.items.map(item => 
    item.id === itemId ? { ...item, quantity } : item
  );
  
  const { totalItems, totalPrice } = calculateTotals(newItems);
  
  return {
    items: newItems,
    totalItems,
    totalPrice,
    isOpen: cart.isOpen,
  };
};

// Clear cart
export const clearCart = (): CartState => {
  return { items: [], totalItems: 0, totalPrice: 0, isOpen: false };
};