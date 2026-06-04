"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Star, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import { useCart } from "@/components/ui/cart/CartContext";
import { toast } from 'react-toastify';
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

type Product = {
  _id: string;
  name: string;
  description: string;
  contains?: string[];
  process?: string[];
  price: number;
  category: string;
  image: string[];
  available: boolean;
  featured?: boolean;
  popular?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
};

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);
}

export default function GiftDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const ProductDetailsRef = useRef<HTMLDivElement>(null);
  const MoreSectionRef = useRef<HTMLDivElement>(null);
  const productCardsRef = useRef<HTMLDivElement[]>([]);
  const isDraggingRef = useRef(false);
  const { addToCart } = useCart();
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

 useEffect(() => {
    const fetchUserRating = async () => {
      if (isLoggedIn && params.id) {
        try {
          const ratingRes = await fetch(`/api/ratings2?productId=${params.id}`, {
            credentials: 'include'
          });
          if (ratingRes.ok) {
            const ratingData = await ratingRes.json();
            setUserRating(ratingData.userRating);
          }
        } catch (error) {
          console.error('Error fetching user rating:', error);
        }
      }
    };
    
    if (isLoggedIn && params.id) {
      fetchUserRating();
      checkIfFavorited();
    } else {
      setUserRating(null);
      setIsFavorite(false);
    }
  }, [isLoggedIn, params.id]);
const handleFavorite = async () => {
  if (!isLoggedIn) {
    toast.error('Please login to save favorites');
    return;
  }

  const action = isFavorite ? 'remove' : 'add';
  
  try {
    const response = await fetch('/api/favourites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        itemId: params.id, 
        itemType: 'gift_box', // Different type
        action 
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setIsFavorite(data.isFavorite);
      toast.success(data.message);
    } else {
      toast.error(data.error || 'Failed to update favorite');
    }
  } catch (error) {
    console.error('Error updating favorite:', error);
    toast.error('Failed to update favorite');
  }
};

// Update checkIfFavorited for gift boxes:
const checkIfFavorited = async () => {
  if (!isLoggedIn || !params.id) {
    setIsFavorite(false);
    return;
  }

  try {
    const res = await fetch(`/api/favourites/check?itemId=${params.id}&itemType=gift_box`, {
      credentials: 'include'
    });
    
    if (res.ok) {
      const data = await res.json();
      setIsFavorite(data.isFavorite);
    } else {
      setIsFavorite(false);
    }
  } catch (error) {
    console.error('Error checking favorite:', error);
    setIsFavorite(false);
  }
};

const handleRateProduct = async (rating: number) => {
  if (!isLoggedIn) {
    toast.error('Please login to rate products');
    return;
  }

  try {
    const response = await fetch('/api/ratings2', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        productId: params.id, 
        rating 
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setUserRating(rating);
      
      // Update product rating in local state
      if (product) {
        setProduct({
          ...product,
          rating: data.averageRating,
          reviewCount: data.totalRatings
        });
      }
      
      toast.success(data.message);
    } else {
      toast.error(data.error || 'Failed to submit rating');
    }
  } catch (error) {
    console.error('Error rating product:', error);
    toast.error('Failed to submit rating');
  }
};

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        const res = await fetch('/api/gifts?limit=10'); // Fetch more to have enough to filter
        if (res.ok) {
          const data = await res.json();
          // Filter out current product and get random ones
          const otherProducts = data.products.filter((p: Product) => p._id !== params.id);

          // Fisher-Yates shuffle algorithm
          const shuffleArray = (array: any[]) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
          };

          const shuffled = shuffleArray(otherProducts).slice(0, 4); // Take 4 random products

          setRandomProducts(shuffled);
        }
      } catch (error) {
        console.error("Error fetching random products:", error);
      }
    };

    if (params.id) {
      fetchRandomProducts();
    }
  }, [params.id]); // Run when product ID changes

  useGSAP(() => {

    if (typeof window === 'undefined') return;

    if (ProductDetailsRef.current) {
      gsap.fromTo(ProductDetailsRef.current,
        {
          opacity: 0,
          y: 200,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: ProductDetailsRef.current,
            start: "top 100%",
            toggleActions: "play none none none",
          }
        }
      );
    }

    if (MoreSectionRef.current) {
      gsap.fromTo(MoreSectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 2,
          delay: 0.8,
          ease: "elastic.out",
          scrollTrigger: {
            trigger: MoreSectionRef.current, // Different trigger
            start: "top 85%",
            end: "bottom 40%",
            toggleActions: "play none none none",
            scrub: true,
          }
        }
      );
    }

    if (productCardsRef.current.length > 0) {
      // Create a timeline with ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: productCardsRef.current[0], // Use first card as trigger
          start: "top 90%",
          end: "top 60%",
          scrub: true,
        }
      });

      // Add staggered animations to the timeline
      productCardsRef.current.forEach((card, index) => {
        if (card) {
          tl.fromTo(
            card,
            {
              opacity: 0,
              y: 100 * (index % 2 === 0 ? 1 : -1), // Alternate direction for visual interest
              scale: 0.9,
              // Slight rotation variation
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotation: 0,
              duration: 0.8,
              ease: "power2.out",
            },
            index * 2 // Stagger delay: each card starts 0.1s after the previous
          );
        }
      });
    }
  }, { dependencies: [loading, product, status] });

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
  try {
    const res = await fetch(`/api/gifts/${params.id}`);
    const data = await res.json();
    setProduct(data);

    // Check favorite status if logged in
    if (isLoggedIn) {
      checkIfFavorited();
    }
  } catch (error) {
    console.error("Error fetching product:", error);
  } finally {
    setLoading(false);
  }
};

  const handleAddToCart = () => {
    if (!product?.available) return;

    const cartItem = {
      id: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: quantity,
      image: product.image[0], // Use first image
      description: product.description,
    };

    addToCart(cartItem);

    // Optional: Show toast notification
    toast.success(`${product.name} added to cart!`);
  };

  const handleAddRandomToCart = (randomProduct: Product) => {
    if (!randomProduct?.available) return;

    const cartItem = {
      id: randomProduct._id,
      name: randomProduct.name,
      category: randomProduct.category,
      price: randomProduct.price,
      quantity: 1,
      image: randomProduct.image[0],
      description: randomProduct.description,
    };

    addToCart(cartItem);

    toast.success(`${randomProduct.name} added to cart!`);
  };

  const nextImage = () => {
    if (product && product.image) {
      setSelectedImageIndex((prev) =>
        prev === product.image.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.image) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? product.image.length - 1 : prev - 1
      );
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🥖</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-16 bg-[#f3ecd8] dark:bg-[#4A4036] transition-colors duration-1000">
      <div ref={ProductDetailsRef} className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-amber-600">Home</Link> /
          <Link href="/gift-box" className="hover:text-amber-600 ml-2">Gift Box</Link> /
          <span className="ml-2 text-gray-900 dark:text-white">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-4">
              <img
                src={product.image[selectedImageIndex]}
                alt={product.name}
                className="w-full h-64 sm:h-80 md:h-96 object-cover"
              />

              {/* Navigation Arrows */}
              {product.image.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.image.length > 1 && (
              <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1">
                {product.image.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 h-16 sm:h-24 w-16 sm:w-24 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                      ? 'border-amber-500'
                      : 'border-transparent hover:border-gray-300'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-4 flex-wrap">
              <div>
                <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">
                  {product.category}
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                  {product.name}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
  onClick={handleFavorite}
  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-700"
  title={isLoggedIn ? (isFavorite ? "Remove from favorites" : "Add to favorites") : "Login to save favorites"}
>
  <Heart className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
</button>
                {/* User rating section */}
  <div className="flex items-center gap-1 dark:from-[#7a5230] dark:to-[#0a1631] bg-amber-100 bg-linear-to-l to-blue-50 px-2 scale-90 rounded-4xl">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {userRating ? 'Your Rating:' : 'Rate this Gift-Box:'}
    </span>
    
    {isLoggedIn ? (
      <div className="flex items-center">
        {/* Rating stars */}
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRateProduct(star)}
              className="p-1 hover:scale-110 transition-transform"
              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star className={`h-5 w-5 ${
                star <= (userRating || 0)
                  ? 'fill-cyan-500 text-cyan-500 transition-colors duration-700 dark:fill-violet-600 dark:text-violet-600'
                  : 'dark:text-gray-300 text-gray-600'
              }`} />
            </button>
          ))}
        </div>
      </div>
    ) : (
      <button
        onClick={() => {
          toast.info('Please login to rate this product');
        }}
        className="text-sm dark:text-emerald-500 transition-all duration-700 dark:hover:text-teal-500 text-cyan-600 hover:text-cyan-800 hover:underline px-2 py-1 rounded"
      >
        <Link href={'/login'}>Login to rate</Link>
      </button>
    )}
  </div>
              </div>
            </div>

            {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                 {product.rating ? product.rating.toFixed(1) : '0.0'}
        {` (${product.reviewCount || 0} review${product.reviewCount !== 1 ? 's' : ''})`}
                </span>
              </div>
        

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>
            {/* Contains Section */}
            {product.contains && product.contains.length > 0 && (
              <div className="mb-2">
                <h3 className="text-lg font-semibold mb-3">Contains</h3>
                <div className="flex flex-wrap gap-2">
                  {product.contains.map((contain: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium"
                    >
                      {contain}
                    </span>
                  ))}
                </div>
              </div>
            )}


            {/* Add to Cart Section */}
            <div className="border-t pt-8">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-600 hover:text-amber-600"
                  >
                    −
                  </button>
                  <span className="px-6 py-3 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-gray-600 hover:text-amber-600"
                  >
                    +
                  </button>
                </div>

                {/* Stock Status */}
                <div className="text-sm">
                  {product.available ? (
                    <span className="text-green-600">✓ In Stock</span>
                  ) : (
                    <span className="text-red-600">✗ Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.available}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all ${product.available
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.available ? 'Add to Cart' : 'Sold Out'}
                </button>
              </div>

              {/* Total Price */}
              <div className="mt-6 text-lg font-semibold">
                Total: <span className="text-2xl text-amber-600">${(product.price * quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* You Might Also Like Section */}
      {randomProducts.length > 0 && !loading && (
        <section ref={MoreSectionRef} className="container mx-auto px-4 pb-8 mt-16 pt-8 border-t dark:border-gray-200 border-gray-800">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-center dark:text-[#e5dacc] text-[#482005a4] mb-8">
            You Might Also Like
          </h2>

          {/* Horizontal Scroll Container */}
          <div className="relative">
            {/* Scroll Container */}
            <div
              id="random-products-scroll-container"
              className="flex overflow-x-auto pb-6 scrollbar-hide select-none snap-x snap-mandatory"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
              }}
            >
              {randomProducts.map((randomProduct, index) => (
                <div
                  key={`random-${randomProduct._id}`}
                  ref={(el) => {
                    if (el) {
                      productCardsRef.current[index] = el;
                    }
                  }}
                  className={cn(
                    "product-card group bg-[#f3f1ecf8] dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl",
                    "transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800",
                    "flex flex-col h-full flex-shrink-0 w-72 md:w-80 mx-3 snap-start",
                    "cursor-grab active:cursor-grabbing mt-0 hover:mt-2" // Add cursor states
                  )}
                  onMouseDown={(e) => {
                    const card = e.currentTarget;
                    const container = card.parentElement;
                    if (!container) return;

                    const startX = e.pageX;
                    const startScrollLeft = container.scrollLeft;

                    let isDragging = false;
                    isDraggingRef.current = false;

                    const onMouseMove = (moveEvent: MouseEvent) => {
                      const moveX = Math.abs(moveEvent.pageX - startX);

                      if (!isDragging && moveX > 5) {
                        isDragging = true;
                        isDraggingRef.current = true;
                        card.style.cursor = 'grabbing';
                      }

                      if (isDragging) {
                        moveEvent.preventDefault();
                        const deltaX = moveEvent.pageX - startX;
                        container.scrollLeft = startScrollLeft - deltaX;
                      }
                    };

                    const onMouseUp = () => {
                      card.style.cursor = 'grab';
                      document.removeEventListener('mousemove', onMouseMove);
                      document.removeEventListener('mouseup', onMouseUp);

                      // reset AFTER click event finishes
                      setTimeout(() => {
                        isDraggingRef.current = false;
                      }, 0);
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                  }}

                  onTouchStart={(e) => {
                    const card = e.currentTarget;
                    const container = card.parentElement;
                    if (!container) return;

                    const startX = e.touches[0].pageX;
                    const startScrollLeft = container.scrollLeft;

                    let isDragging = false;
                    isDraggingRef.current = false;

                    const onTouchMove = (moveEvent: TouchEvent) => {
                      const moveX = Math.abs(moveEvent.touches[0].pageX - startX);

                      if (!isDragging && moveX > 5) {
                        isDragging = true;
                        isDraggingRef.current = true;
                      }

                      if (isDragging) {
                        const deltaX = moveEvent.touches[0].pageX - startX;
                        container.scrollLeft = startScrollLeft - deltaX;
                      }
                    };

                    const onTouchEnd = () => {
                      document.removeEventListener('touchmove', onTouchMove);
                      document.removeEventListener('touchend', onTouchEnd);

                      setTimeout(() => {
                        isDraggingRef.current = false;
                      }, 0);
                    };

                    document.addEventListener('touchmove', onTouchMove);
                    document.addEventListener('touchend', onTouchEnd);
                  }}

                >
                  <Link
                    href={`/gift-box/${randomProduct._id}`}
                    className="block flex-grow"
                    draggable={false}
                    onClick={(e) => {
                      if (isDraggingRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  >
                    {/* Product Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
    src={randomProduct.image[0]}
    alt={randomProduct.name}
    className="absolute inset-0 w-full h-full object-cover 
               transition-all duration-1000 
               group-hover:opacity-0"
               draggable='false'
  />

  {/* Second image */}
  <img
    src={randomProduct.image[1]}
    alt={randomProduct.name}
    className="absolute inset-0 w-full h-full object-cover 
               transition-all duration-1000 
               opacity-0 group-hover:opacity-100 group-hover:scale-105"
               draggable='false'
  />

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded-full capitalize">
                          {randomProduct.category}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {randomProduct.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {randomProduct.description}
                      </p>
                       {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(randomProduct.rating || 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {randomProduct.rating?.toFixed(1) || '0.0'} ({randomProduct.reviewCount || 0})
                    </span>
                  </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          ${randomProduct.price.toFixed(2)}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          randomProduct.available
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        )}>
                          {randomProduct.available ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Add to Cart Button */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddRandomToCart(randomProduct);
                      }}
                      disabled={!randomProduct.available}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300",
                        randomProduct.available
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {randomProduct.available ? "Add to Cart" : "Sold Out"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Gradient fade edges - only show when scrollable */}
            {randomProducts.length > 3 && (
              <>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#f3ecd8] dark:from-[#4A4036] to-transparent z-10"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#f3ecd8] dark:from-[#4A4036] to-transparent z-10"></div>
              </>
            )}

            {/* Scroll indicator dots */}
            {randomProducts.length > 0 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: Math.ceil(randomProducts.length / 2) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const container = document.getElementById('random-products-scroll-container');
                      if (container) {
                        container.scrollTo({
                          left: i * (340 * 2), // Adjusted for card width + margin
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 hover:bg-amber-500 dark:hover:bg-amber-500 transition-colors"
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}