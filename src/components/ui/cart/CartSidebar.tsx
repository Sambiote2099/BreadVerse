'use client';

import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useCart } from './CartContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Add this import

export default function CartSidebar() {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    isOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity,
    clearCart 
  } = useCart();

  const pathname = usePathname(); // Get current path

  // Close cart when route changes
  useEffect(() => {
    closeCart();
  }, [pathname]);

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      toast.info('Item removed from cart');
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: number, itemName: string) => {
    removeFromCart(itemId);
    toast.info(`${itemName} removed from cart`);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-700 z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className={`fixed opacity-90 right-0 top-0 h-screen w-full md:w-1/2 bg-[#f3ecd8] dark:bg-[#1c1c1c] shadow-2xl transform transition-transform duration-700 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-[13px] border-b border-[#c3aa88] dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-[#c3a579] dark:text-[#c3aa88]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Your Cart ({totalItems})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[50vh]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">Your cart is empty</p>
              <p className="text-gray-400 dark:text-gray-600 text-sm mt-2">
                Add some delicious breads to get started!
              </p>
              <Link href={'/check-out'}>
              <button className='mt-4 bg-[#c3a579] dark:hover:text-[#c3a579] hover:text-black dark:hover:bg-black text-white dark:bg-white hover:bg-gray-200  rounded-4xl dark:text-black duration-700 transition-colors'>
              
              <h1 className='px-2 py-1 text-sm'>head to checkout</h1>
           
              </button>
                 </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={`cart-item-${item.id}`} 
                  className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                > 
                  <div className="relative w-60 h-30"> 
                   <Link href={item.category === "Gift Box" ? `/gift-box/${item.id}` : `/products/${item.id}`}>
                      <Image
                        src={item.image}
                        alt="Product"
                        fill
                        className="object-cover rounded-2xl"
                      />
                    </Link>
                    </div>
                  
                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {item.name} ~ ({item.category})
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          key={`decrease-${item.id}`} 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span key={`quantity-${item.id}`} className="w-8 text-center font-medium"> 
                          {item.quantity}
                        </span>
                        <button
                          key={`increase-${item.id}`} 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div key="cart-footer" className="border-t border-gray-200 dark:border-gray-700 p-6"> {/* Add key */}
            {/* Summary */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className={totalPrice > 50 ? 'text-green-600' : ''}>
                  {totalPrice > 50 ? 'Free' : '$5.00'}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                <span>
                  ${(totalPrice > 50 ? totalPrice : totalPrice + 5).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {totalPrice < 50 && (
                  <>Add ${(50 - totalPrice).toFixed(2)} more for free shipping!</>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href={'/check-out'}>
              <button
                key="checkout-button"
                onClick={closeCart}
                disabled={isCheckingOut}
                className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  isCheckingOut
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#c3a579] hover:bg-[#6db392] dark:bg-[#c3aa88] text-white'
                }`}
              >
                {isCheckingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>Proceed to Checkout</>
                )}
              </button>
              </Link>
              
              <button
                key="clear-cart-button"
                onClick={clearCart}
                className="w-full py-2 mt-2 rounded-lg font-semibold border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 duration-700 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}