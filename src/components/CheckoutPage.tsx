
'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from './ui/cart/CartContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ArrowLeft, CreditCard, Truck, Shield, Lock, Package,X, Home, CheckCircle, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function CheckoutPage() {

    const [orderSuccess, setOrderSuccess] = useState(false);
const [orderDetails, setOrderDetails] = useState<any>(null);
const [showOrderHistory, setShowOrderHistory] = useState(false);
const [localOrders, setLocalOrders] = useState<any[]>([]); // Renamed from displayOrders
const sectionRef = useRef<HTMLDivElement>(null);
const [dbOrders, setDbOrders] = useState<any[]>([]);
const [displayOrders, setDisplayOrders] = useState<any[]>([]);
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('creditCard');
const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const userData = session?.user;
const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSelectedPaymentMethod(e.target.value);
};
  useGSAP(() => {
  
      if (typeof window === 'undefined') return;
  
      if (sectionRef.current) {
        gsap.fromTo(sectionRef.current,
          {
            opacity: 0,
            scale: 0.95,
          },
          {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: "power2.in",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 100%", // Starts when top of element is 80% from top of viewport
              toggleActions: "play none none none", // play on enter, none on leave, none on enterBack, none on leaveBack
            }
          }
        );
      }
    });

useEffect(() => {
    // No need for manual auth check - useSession handles it
    if (isLoggedIn && userData) {
      fetchOrdersFromDB();
      setDisplayOrders([]);
    } else {
      loadOrdersFromLocalStorage();
    }
  }, [isLoggedIn, userData]); 

const fetchOrdersFromDB = async () => {
    if (!isLoggedIn) return;
    
    try {
      const res = await fetch('/api/orders', {
        credentials: 'include' // This sends cookies for NextAuth
      });
      if (res.ok) {
        const data = await res.json();
        setDbOrders(data.orders || []);
        setDisplayOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders from DB:', error);
    }
  };


const loadOrdersFromLocalStorage = () => {
  const savedOrders = localStorage.getItem('breadverse_orders');
  if (savedOrders) {
    try {
      const parsedOrders = JSON.parse(savedOrders);
      setLocalOrders(parsedOrders);
      setDisplayOrders(parsedOrders); // Set display orders to local orders
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
      setDisplayOrders([]);
    }
  } else {
    setDisplayOrders([]);
  }
};

    const { items, totalPrice, clearCart } = useCart();
    const router = useRouter();

    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        saveInfo: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Helper functions for formatting
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\D/g, '');
        const limited = v.slice(0, 16);
        const parts = [];
        for (let i = 0; i < limited.length; i += 4) {
            parts.push(limited.substring(i, i + 4));
        }
        return parts.join(' ');
    };

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\D/g, '');
        const limited = v.slice(0, 4);
        if (limited.length >= 2) {
            return `${limited.substring(0, 2)}/${limited.substring(2)}`;
        }
        return limited;
    };

    const validateForm = () => {
  const newErrors: Record<string, string> = {};

  // Personal Information Validation
  if (!formData.firstName.trim()) {
    newErrors.firstName = 'First name is required';
  } else if (formData.firstName.trim().length > 16) {
    newErrors.firstName = 'First name cannot exceed 16 characters';
  }

  if (!formData.lastName.trim()) {
    newErrors.lastName = 'Last name is required';
  } else if (formData.lastName.trim().length > 16) {
    newErrors.lastName = 'Last name cannot exceed 16 characters';
  }

  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Email is invalid';
  }

  if (!formData.phone.trim()) {
    newErrors.phone = 'Phone number is required';
  } else {
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      newErrors.phone = 'Phone number must be 11 digits';
    }
  }

  if (!formData.address.trim()) newErrors.address = 'Address is required';
  if (!formData.city.trim()) newErrors.city = 'City is required';
  if (!formData.state.trim()) newErrors.state = 'State is required';

  if (!formData.zipCode.trim()) {
    newErrors.zipCode = 'Zip code is required';
  } else {
    const zipDigits = formData.zipCode.replace(/\D/g, '');
    if (zipDigits.length !== 4) {
      newErrors.zipCode = 'Zip code must be 4 digits';
    }
  }

  // Payment Information Validation - Only if NOT Cash on Delivery
  if (selectedPaymentMethod !== 'cashOnDelivery') {
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else {
      const cardDigits = formData.cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cardDigits)) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
    }

    if (!formData.cardName.trim()) newErrors.cardName = 'Name on card is required';

    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Format must be MM/YY';
    } else {
      const [month, year] = formData.expiryDate.split('/').map(Number);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Month must be between 01 and 12';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

    // Generic handler for simple inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handler for First Name
    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.slice(0, 16);
        setFormData(prev => ({ ...prev, firstName: value }));
        if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
    };

    // Handler for Last Name
    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.slice(0, 16);
        setFormData(prev => ({ ...prev, lastName: value }));
        if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
    };

    // Handler for Phone Number (numbers only, max 11)
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
        setFormData(prev => ({ ...prev, phone: value }));
        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
    };

    // Handler for ZIP Code (numbers only, max 5)
    const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        setFormData(prev => ({ ...prev, zipCode: value }));
        if (errors.zipCode) setErrors(prev => ({ ...prev, zipCode: '' }));
    };

    // Handler for Card Number (format as 1234 5678 9012 3456)
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);

        // Format with spaces every 4 digits
        const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');

        setFormData(prev => ({ ...prev, cardNumber: formatted.trim() }));
        if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: '' }));
    };

    // Handler for Expiry Date (format as MM/YY)
    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);

        // Format as MM/YY
        let formatted = value;
        if (value.length >= 2) {
            formatted = value.slice(0, 2) + '/' + value.slice(2);
        }

        setFormData(prev => ({ ...prev, expiryDate: formatted }));
        if (errors.expiryDate) setErrors(prev => ({ ...prev, expiryDate: '' }));
    };

    // Handler for CVV (numbers only, max 4)
    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        setFormData(prev => ({ ...prev, cvv: value }));
        if (errors.cvv) setErrors(prev => ({ ...prev, cvv: '' }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      router.push('/products');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Use logged-in user's email if available, otherwise use form email
      const customerEmail = isLoggedIn && userData?.email 
        ? userData.email 
        : formData.email;
      
      // Get selected payment method
      const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
      const paymentMethod = paymentMethodElement?.value || "credit_card";
      
      // Prepare order data
      const orderData = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: customerEmail,
        customer_phone: formData.phone,
        shipping_address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country,
        },
        items: items.map(item => ({
          product_id: item.id, // Make sure this is string ID
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
        })),
        payment_method: paymentMethod,
        shipping_cost: shippingCost,
        tax: 0,
        notes: formData.saveInfo ? "Payment info saved for future" : "",
        card_last4: selectedPaymentMethod === 'creditCard' ? formData.cardNumber.replace(/\s/g, '').slice(-4) : "",
      };
      
      // Call the API to create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ADD THIS - sends cookies for authentication
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success("Order Made Successfully!")
      // Save order to localStorage (for guest users only)
      const orderToSave = {
        ...data.order,
        order_number: data.order_number,
        local_timestamp: new Date().toISOString(),
        id: data.order._id || Date.now().toString()
      };
      
      if (isLoggedIn) {
        // If logged in, fetch fresh orders from DB
        fetchOrdersFromDB();
      } else {
        // If not logged in, update local orders
        const updatedOrders = [orderToSave, ...localOrders];
        setLocalOrders(updatedOrders);
        setDisplayOrders(updatedOrders);
        localStorage.setItem('breadverse_orders', JSON.stringify(updatedOrders));
      }
      
      // Clear cart
      clearCart();
      
      // Show success modal
      setOrderDetails({
        ...orderToSave,
        order_number: data.order_number
      });
      setOrderSuccess(true);
      
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

    const shippingCost = totalPrice > 50 ? 0 : 5;
    const finalTotal = totalPrice + shippingCost;

    return (
        <div ref={sectionRef} className="min-h-screen mt-16 bg-[#f3ecd8] dark:bg-[#1c1c1c] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Cart
                    </button>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Complete your order with secure payment
                            </p>
                        </div>
                        {/* Order History button — mobile only, always visible at top */}
                        <button
                            onClick={() => setShowOrderHistory(true)}
                            className=" flex-shrink-0 py-2 px-3 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm shadow"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            Orders ({displayOrders.length})
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Information */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-500" />
                                    Personal Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleFirstNameChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent`}
                                            placeholder="John"
                                            maxLength={16}
                                        />
                                        {errors.firstName && (
                                            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleLastNameChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent`}
                                            placeholder="Doe"
                                            maxLength={16}
                                        />
                                        {errors.lastName && (
                                            <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent`}
                                            placeholder="john@example.com"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent`}
                                            placeholder="12345678901"
                                            maxLength={11}
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">Enter 11 digits without spaces</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-blue-500" />
                                    Shipping Address
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent`}
                                            placeholder="123 Main St"
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent`}
                                                placeholder="New York"
                                            />
                                            {errors.city && (
                                                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                State *
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-lg border ${errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent`}
                                                placeholder="NY"
                                            />
                                            {errors.state && (
                                                <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                ZIP Code *
                                            </label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleZipCodeChange}
                                                className={`w-full px-4 py-3 rounded-lg border ${errors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent`}
                                                placeholder="10001"
                                                maxLength={5}
                                            />
                                            {errors.zipCode && (
                                                <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Country
                                        </label>
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent"
                                        >
                                            <option>United States</option>
                                            <option>Canada</option>
                                            <option>United Kingdom</option>
                                            <option>Australia</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            {selectedPaymentMethod !== 'cashOnDelivery' && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-purple-500" />
                                    Payment Information
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Card Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleCardNumberChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent`}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                        />
                                        {errors.cardNumber && (
                                            <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Name on Card *
                                        </label>
                                        <input
                                            type="text"
                                            name="cardName"
                                            value={formData.cardName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${errors.cardName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent`}
                                            placeholder="John Doe"
                                        />
                                        {errors.cardName && (
                                            <p className="mt-1 text-sm text-red-500">{errors.cardName}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Expiry Date (MM/YY) *
                                            </label>
                                            <input
                                                type="text"
                                                name="expiryDate"
                                                value={formData.expiryDate}
                                                onChange={handleExpiryDateChange}
                                                className={`w-full px-4 py-3 rounded-lg border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent`}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                            />
                                            {errors.expiryDate && (
                                                <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                CVV *
                                            </label>
                                            <input
                                                type="password"
                                                name="cvv"
                                                value={formData.cvv}
                                                onChange={handleCvvChange}
                                                className={`w-full px-4 py-3 rounded-lg border ${errors.cvv ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c3a579] focus:border-transparent`}
                                                placeholder="123"
                                                maxLength={4}
                                                inputMode="numeric"
                                            />
                                            {errors.cvv && (
                                                <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <input
                                            type="checkbox"
                                            id="saveInfo"
                                            name="saveInfo"
                                            checked={formData.saveInfo}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-[#c3a579] rounded focus:ring-[#c3a579] border-gray-300"
                                        />
                                        <label htmlFor="saveInfo" className="text-sm text-gray-600 dark:text-gray-400">
                                            Save payment information for next time
                                        </label>
                                    </div>
                                </div>
                            </div>
                            )}
                            {selectedPaymentMethod === 'cashOnDelivery' && (
  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">Cash on Delivery Selected</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          You'll pay when you receive your order. No payment information needed now.
        </p>
      </div>
    </div>
  </div>
)}

                            {/* Security Notice */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                                            Secure Payment
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                            Your payment information is encrypted and secure. We never store your CVV.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isProcessing || items.length === 0}
                                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${isProcessing || items.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#c3a579] to-[#b3956d] hover:from-[#b3956d] hover:to-[#a5855d] dark:from-[#c3aa88] dark:to-[#b3997a] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                    } text-white`}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-5 w-5" />
                                        Pay ${finalTotal.toFixed(2)} Securely / Place Order
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    Order Summary
                                </h2>

                                {/* Items List */}
                                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="relative w-24 h-16 rounded-lg overflow-hidden">
                                                <Link href={item.category === "Gift Box" ? `/gift-box/${item.id}` : `/products/${item.id}`}>
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                </Link>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                </p>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Subtotal</span>
                                        <span>${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Shipping</span>
                                        <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                                            {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                                        </span>
                                    </div>
                                    {shippingCost > 0 && totalPrice < 50 && (
                                        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                                            Add ${(50 - totalPrice).toFixed(2)} more for free shipping!
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <span>Total</span>
                                        <span>${finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Guarantees */}
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Free Shipping</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">On orders over $50</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">30-Day Returns</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Easy return policy</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Secure Payment</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">256-bit SSL encryption</p>
                                        </div>
                                    </div>
                                    {/* Payment Method */}

                                    <h2 className="text-xl font-bold text-gray-900 gap-4 ml-1.5 dark:text-white mb-6 flex items-center pt-4 border-[#c3a579] dark:border-gray-600 border-t">
                                        <CreditCard className="h-7 w-7 text-amber-500" />
                                        Payment Method
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                            <input
                                                type="radio"
                                                id="creditCard"
                                                name="paymentMethod"
                                                value="creditCard"
                                                 checked={selectedPaymentMethod === 'creditCard'}
                                                  onChange={handlePaymentMethodChange}
                                                className="h-4 w-4 text-[#c3a579] focus:ring-[#c3a579] border-gray-300"
                                            />
                                            <label htmlFor="creditCard" className="flex-1 cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">Credit/Debit Card</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Pay with your card</p>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row gap-2">
                                                        <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">VISA</span>
                                                        </div>
                                                        <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">MC</span>
                                                        </div>
                                                        <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">AMEX</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                            <input
                                                type="radio"
                                                id="paypal"
                                                name="paymentMethod"
                                                value="paypal"
                                                 checked={selectedPaymentMethod === 'paypal'}
                                                  onChange={handlePaymentMethodChange}
                                                className="h-4 w-4 text-[#c3a579] focus:ring-[#c3a579] border-gray-300"
                                            />
                                            <label htmlFor="paypal" className="flex-1 cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">PayPal</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Pay with your PayPal account</p>
                                                    </div>
                                                    <div className="w-12 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">PayPal</span>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                            <input
                                                type="radio"
                                                id="applePay"
                                                name="paymentMethod"
                                                value="applePay"
                                                checked={selectedPaymentMethod === 'applePay'}
                                                onChange={handlePaymentMethodChange}
                                                className="h-4 w-4 text-[#c3a579] focus:ring-[#c3a579] border-gray-300"
                                            />
                                            <label htmlFor="applePay" className="flex-1 cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">Apple Pay</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Pay with Apple Pay</p>
                                                    </div>
                                                    <div className="w-12 h-8 bg-black dark:bg-gray-800 rounded flex items-center justify-center">
                                                        <span className="text-sm font-bold text-white">Pay</span>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                            <input
                                                type="radio"
                                                id="cashOnDelivery"
                                                name="paymentMethod"
                                                value="cashOnDelivery"
                                                checked={selectedPaymentMethod === 'cashOnDelivery'}
                                                onChange={handlePaymentMethodChange}
                                                className="h-4 w-4 text-[#c3a579] focus:ring-[#c3a579] border-gray-300"
                                                defaultChecked
                                            />
                                            <label htmlFor="cashOnDelivery" className="flex-1 cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">Cash on Delivery</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Pay when you receive your order</p>
                                                    </div>
                                                    <div className="w-12 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                                                        <span className="text-sm font-bold text-green-600 dark:text-green-400">COD</span>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Floating Success Modal */}
{orderSuccess && orderDetails && (
  <div className="fixed inset-0 z-50 flex justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-fadeIn">
      {/* Modal Header */}
      <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Confirmed! 🎉</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Thank you for your purchase</p>
          </div>
        </div>
        
        {/* Close button */}
        <button
          onClick={() => {
            setOrderSuccess(false);
          setIsProcessing(false);
        }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Modal Content */}
      <div className="p-6 overflow-y-auto max-h-[60vh]">
        {/* Order Number */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-700">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">ORDER NUMBER</p>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">{orderDetails.order_number}</p>
        </div>

        {/* Order Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${orderDetails.payment?.total?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400 capitalize">
                {orderDetails.status || 'pending'}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-2">
  <h4 className="font-medium text-gray-900 dark:text-white">Customer Information</h4>
  <div className="text-sm text-gray-600 dark:text-gray-400">
    <p>{orderDetails.customer?.name}</p>
    <p>{orderDetails.customer?.email}</p>
    <p>{orderDetails.customer?.phone}</p>
    {/* Show login status */}
    {isLoggedIn && (
      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded text-xs">
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Verified Account
      </div>
    )}
  </div>
</div>

          {/* Shipping Info */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Shipping Address</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>{orderDetails.shipping_address?.street}</p>
              <p>
                {orderDetails.shipping_address?.city}, {orderDetails.shipping_address?.state} {orderDetails.shipping_address?.zip_code}
              </p>
              <p>{orderDetails.shipping_address?.country}</p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Items ({orderDetails.items?.length || 0})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {orderDetails.items?.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-600 overflow-hidden">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setOrderSuccess(false);
              router.push('/products');
            }}
            className="flex-1 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Continue Shopping
          </button>
          
        </div>
      </div>
    </div>
  </div>
)}

{/* Order History Modal */}
{/* Order History Modal - ENHANCED VERSION */}
{showOrderHistory && (
  <div className="fixed inset-0 z-50 flex justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full md:max-h-[112vh] max-h-[132vh] overflow-hidden">
      {/* Modal Header */}
      <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order History</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {displayOrders.length} order{displayOrders.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={() => setShowOrderHistory(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Order History Content */}
      <div className="md:p-6 p-2 overflow-y-auto max-h-[70vh]">
        {displayOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Your order history will appear here after you make a purchase
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayOrders.map((order, index) => (
              <div
                key={order.id || order._id || index}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{order.order_number}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          order.status === 'processing' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {order.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(order.created_at || order.local_timestamp).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ${order.payment?.total?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer & Shipping Info */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Customer</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer?.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Shipping Address</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.shipping_address?.street}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip_code}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.shipping_address?.country}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products List - DETAILED VERSION */}
                <div className="p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                    Products ({order.items?.length || 0})
                  </h5>
                  
                  <div className="space-y-3">
                    {order.items?.map((item: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        {/* Product Image */}
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image || '/placeholder-image.jpg'}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.jpg';
                            }}
                          />
                          {/* Category Badge */}
                          {item.category && (
                            <div className="absolute top-1 right-1">
                              <span className="px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded-full capitalize">
                                {item.category}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h6 className="font-medium text-gray-900 dark:text-white truncate">
                                {item.name}
                              </h6>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Product ID: {item.product_id || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-gray-900 dark:text-white">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                ${item.price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                          
                          {/* Additional Info */}
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <ShoppingCart className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Qty: {item.quantity}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ${item.price.toFixed(2)} each
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer - Price Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-900 dark:text-white">
                        ${order.payment?.amount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="text-gray-900 dark:text-white">
                        ${order.payment?.shipping_cost?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax</span>
                      <span className="text-gray-900 dark:text-white">
                        ${order.payment?.tax?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-300 dark:border-gray-600">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-gray-900 dark:text-white">
                        ${order.payment?.total?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    
                    {/* Payment Method */}
                    <div className="pt-2 border-t border-gray-300 dark:border-gray-600 mt-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {order.payment?.method?.replace('_', ' ') || 'Credit Card'}
                          </p>
                        </div>
                        {order.payment?.card_last4 && (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              •••• {order.payment.card_last4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowOrderHistory(false)}
            className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
          <button
  onClick={() => {
    if (displayOrders.length > 0) {
      if (confirm('Are you sure you want to clear all order history? This action cannot be undone.')) {
        if (isLoggedIn) {
          // For logged-in users, we can't clear database orders from frontend
          toast.info('Database orders cannot be cleared from here. Contact support.');
        } else {
          setLocalOrders([]);
          setDisplayOrders([]); // Clear display orders too
          localStorage.removeItem('breadverse_orders');
          toast.success('Order history cleared successfully');
        }
      }
    }
  }}
  disabled={displayOrders.length === 0}
  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
    displayOrders.length === 0
      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
      : 'bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/30 text-red-700 dark:text-red-400'
  }`}
>
  <Trash2 className="h-4 w-4" />
  Clear All History
</button>
        </div>
        
        {/* Stats */}
        {displayOrders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayOrders.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${displayOrders.reduce((sum, order) => sum + (order.payment?.total || 0), 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {displayOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Items</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {displayOrders.filter(o => o.status === 'delivered').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Delivered</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
        </div>
    );
}
