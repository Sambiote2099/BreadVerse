'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCartFromStorage, saveCartToStorage, addToCart as addToCartUtil, removeFromCart as removeFromCartUtil, updateQuantity as updateQuantityUtil, clearCart as clearCartUtil } from '@/lib/cart/utils';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

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

interface CartContextType extends CartState {
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemQuantity: (itemId: string) => number;
  isSyncing: boolean;
  syncCartWithServer: () => Promise<void>;
  addToCartWithToast: (item: CartItem, quantity?: number) => Promise<void>;
  isLoggedIn: boolean;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(() => getCartFromStorage());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  
  // Use NextAuth session
  const { data: session, status } = useSession();
  
  // Determine auth states
  const isLoading = status === 'loading';
  const isLoggedIn = status === 'authenticated';

  // ========== DEFINE ALL FUNCTIONS HERE ==========

  const toggleCart = () => {
    setCart(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const openCart = () => {
    setCart(prev => ({ ...prev, isOpen: true }));
  };

  const closeCart = () => {
    setCart(prev => ({ ...prev, isOpen: false }));
  };

  const getItemQuantity = (itemId: string) => {
    const item = cart.items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  // Fetch cart from server
  const fetchServerCart = async () => {
    if (!isLoggedIn) return;
    
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const serverCart = await res.json();
        setCart({
          items: serverCart.items.map((item: any) => ({
            ...item,
            id: item.id
          })),
          totalItems: serverCart.totalItems,
          totalPrice: serverCart.totalPrice,
          isOpen: cart.isOpen
        });
      }
    } catch (error) {
      console.error('❌ Error fetching server cart:', error);
    }
  };

  // Add item to cart
  const addToCart = async (item: CartItem, quantity: number = 1) => {
  // Use the item's quantity if provided, otherwise use the quantity parameter
  const actualQuantity = item.quantity || quantity;
  
  if (isLoggedIn) {
    // Add to server
    try {
      setIsSyncing(true);
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          item: {
            id: item.id.toString(),
            name: item.name,
            category: item.category,
            price: item.price,
            image: item.image,
            description: item.description
          }, 
          quantity: actualQuantity  // Use actualQuantity here
        }),
      });
      
      // Update local state with server response
      await fetchServerCart();
    
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsSyncing(false);
    }
  } else {
    // Add to local storage - use actualQuantity
    setCart(prev => addToCartUtil(prev, item, actualQuantity));
  }
};

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    if (isLoggedIn) {
      try {
        setIsSyncing(true);
        await fetch('/api/cart', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'removeItem', itemId: itemId.toString() }),
        });
        
        await fetchServerCart();
      } catch (error) {
        console.error('Error removing from cart:', error);
        toast.error('Failed to remove item');
      } finally {
        setIsSyncing(false);
      }
    } else {
      setCart(prev => removeFromCartUtil(prev, itemId));
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (isLoggedIn) {
      try {
        setIsSyncing(true);
        await fetch('/api/cart', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'updateQuantity', 
            itemId: itemId.toString(), 
            quantity 
          }),
        });
        
        await fetchServerCart();
      } catch (error) {
        console.error('Error updating quantity:', error);
        toast.error('Failed to update quantity');
      } finally {
        setIsSyncing(false);
      }
    } else {
      setCart(prev => updateQuantityUtil(prev, itemId, quantity));
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (isLoggedIn) {
      try {
        setIsSyncing(true);
        await fetch('/api/cart', {
          method: 'DELETE',
        });
        toast.info("Cart Cleared!");
        setCart(clearCartUtil());
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Failed to clear cart');
      } finally {
        setIsSyncing(false);
      }
    } else {
      toast.info("Cart Cleared!");
      setCart(clearCartUtil());
    }
  };

  const addToCartWithToast = async (item: CartItem, quantity: number = 1) => {
  const actualQuantity = item.quantity || quantity;
  await addToCart(item, actualQuantity);
  toast.success(`${item.name} added to cart!`);
};

  const syncCartWithServer = async () => {
    if (isLoggedIn) {
      await fetchServerCart();
    }
  };

  // ========== USE EFFECTS ==========

  // Initialize cart based on auth status
  useEffect(() => {
    const initializeCart = async () => {
      if (status === 'loading') return; // Wait for auth check
      
      if (isLoggedIn) {
        // Fetch server cart for logged in users
        setIsLoadingCart(true);
        try {
          await fetchServerCart();
        } finally {
          setIsLoadingCart(false);
        }
      } else {
        // Use localStorage for guest users
        setCart(getCartFromStorage());
      }
    };
    
    initializeCart();
  }, [status, isLoggedIn]);
  
  // Sync with localStorage when cart changes (for guest users)
  useEffect(() => {
    if (!isLoggedIn) {
      saveCartToStorage(cart);
    }
  }, [cart, isLoggedIn]);

  // Sync local cart to server when user logs in
  useEffect(() => {
    const syncLocalCartToServer = async () => {
      if (isLoggedIn) {
        try {
          setIsSyncing(true);
          const localCart = getCartFromStorage();
          
          if (localCart.items.length > 0) {
            console.log('🔄 Syncing local cart to server...');
            
            // Send each item to server
            for (const item of localCart.items) {
              await fetch('/api/cart', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  item: {
                    id: item.id.toString(),
                    name: item.name,
                    category: item.category,
                    price: item.price,
                    image: item.image,
                    description: item.description
                  }, 
                  quantity: item.quantity 
                }),
              });
            }
            
            // Clear local storage after sync
            saveCartToStorage({ items: [], totalItems: 0, totalPrice: 0, isOpen: false });
            
            // Fetch updated server cart
            await fetchServerCart();
            toast.success('Cart synced to your account!');
          } else {
            // No local items, just fetch server cart
            await fetchServerCart();
          }
        } catch (error) {
          console.error('❌ Error syncing cart:', error);
          toast.error('Failed to sync cart');
        } finally {
          setIsSyncing(false);
        }
      }
    };

    // Only sync when user logs in
    if (status === 'authenticated') {
      syncLocalCartToServer();
    }
  }, [status]);

  // ========== RETURN PROVIDER ==========

  return (
    <CartContext.Provider
      value={{
        // Cart state
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        isOpen: cart.isOpen,
        
        // Cart actions
        toggleCart,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        addToCartWithToast,
        syncCartWithServer,
        
        // Status flags
        isSyncing,
        isLoggedIn,
        isLoading: isLoading || isLoadingCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}