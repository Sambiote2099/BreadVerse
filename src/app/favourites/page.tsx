"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Star, ArrowLeft } from "lucide-react";
import { useCart } from "@/components/ui/cart/CartContext";
import { toast } from 'react-toastify';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSession } from "next-auth/react";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type FavoriteItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string[];
  available: boolean;
  rating?: number;
  reviewCount?: number;
  itemType?: 'product' | 'gift_box'; // Added itemType
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
const isLoggedIn = status === 'authenticated';
  const { addToCart } = useCart();
   const productCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset refs when favorites change
  useEffect(() => {
    productCardsRef.current = productCardsRef.current.slice(0, favorites.length);
  }, [favorites]);

  useGSAP(() => {
  gsap.killTweensOf(productCardsRef.current);
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());

  if (productCardsRef.current.length > 0 && containerRef.current) {
    console.log("Animating", productCardsRef.current.length, "cards");
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 100%",
        
    
        toggleActions: "play none none none",
        // markers: true,
      }
    });

    productCardsRef.current.forEach((card, index) => {
      if (card) {
        tl.fromTo(card,
          {
            opacity: 0,
            y: 50,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all", // This clears GSAP styles after animation
          },
        );
      }
    });
  }

  return () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };
}, { dependencies: [favorites], scope: containerRef });

  useEffect(() => {
  const fetchFavorites = async () => {
    if (status === 'authenticated') {
      console.log('User authenticated, fetching favourites...');
      try {
        const favRes = await fetch('/api/favourites', {
          credentials: 'include'
        });
        
        if (favRes.ok) {
          const favData = await favRes.json();
          const favouritesArray = favData.favourites || favData.favorites || [];
          setFavorites(favouritesArray);
        }
      } catch (error) {
        console.error('Error fetching favourites:', error);
      } finally {
        setLoading(false);
      }
    } else if (status === 'unauthenticated') {
      // User not logged in
      setLoading(false);
    }
  };

  fetchFavorites();
}, [status]); // Run when auth status changes

  const handleRemoveFavorite = async (itemId: string, itemType: string = 'product') => {
    try {
      // Use the new API endpoint with itemId and itemType
      const response = await fetch(`/api/favourites?itemId=${itemId}&itemType=${itemType}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setFavorites(favorites.filter(fav => fav._id !== itemId));
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to remove favourite');
      }
    } catch (error) {
      console.error('Error removing favourite:', error);
      toast.error('Failed to remove favourite');
    }
  };

  const handleAddToCart = (item: FavoriteItem) => {
    if (!item.available) {
      toast.error(`${item.name} is out of stock`);
      return;
    }

    const cartItem = {
      id: item._id,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: 1,
      image: item.image[0],
      description: item.description,
    };

    addToCart(cartItem);
    toast.success(`${item.name} added to cart!`);
  };

  // Helper function to get correct link based on item type
  const getItemLink = (item: FavoriteItem) => {
    if (item.itemType === 'gift_box') {
      return `/gift-box/${item._id}`; // Adjust this path based on your routes
    }
    return `/products/${item._id}`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#f3ecd8] dark:bg-[#4A4036] pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#f3ecd8] dark:bg-[#4A4036] pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please Login
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You need to be logged in to view your favourites.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3ecd8] dark:bg-[#4A4036] pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-amber-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Favourites
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No favourites yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Save products you love by clicking the heart icon.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((item,index) => (
              <div
                key={item._id}
                 ref={(el) => {
                  if (el && !productCardsRef.current.includes(el)) {
                    productCardsRef.current[index] = el;
                  }
                }}
                className="group bg-white dark:bg-gray-900 hover:scale-102 transition-all duration-300 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-xl"
              >
                {/* Item Image with Hover Effect */}
                <Link href={getItemLink(item)} className="block">
                  <div className="relative h-48 overflow-hidden">
                    {/* Main Image */}
                    <img
                      src={item.image[0]}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                    />
                    
                    {/* Hover Image (only if there's a second image) */}
                    {item.image.length > 1 && (
                      <img
                        src={item.image[1]}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100"
                      />
                    )}
                    
                    {/* Type Badge */}
                    {item.itemType && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded-full capitalize">
                          {item.itemType.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveFavorite(item._id, item.itemType || 'product');
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-red-50 hover:dark:bg-red-900/30 transition-colors"
                      title="Remove from favourites"
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </button>
                  </div>
                </Link>

                {/* Item Info */}
                <div className="p-4">
                  <Link href={getItemLink(item)}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 hover:text-amber-600">
                      {item.name}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  {/* Rating - Only show for products with ratings */}
                  {item.rating !== undefined && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(item.rating || 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {item.rating?.toFixed(1) || '0.0'} ({item.reviewCount || 0})
                      </span>
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ${item.price.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.available}
                        className={`p-2 rounded-lg font-medium transition-all ${
                          item.available
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : "bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                        }`}
                        title={item.available ? "Add to cart" : "Out of stock"}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.available
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}>
                      {item.available ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}