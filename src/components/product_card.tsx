"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Search, X, Star, ShoppingCart } from "lucide-react";
import AnimatedTextLeftCopy from "./gsap/SplitTextLeftcopy";
import AnimatedTextRightCopy from "./gsap/SplitTextRightcopy";
import gsap from "gsap";
import { useCart } from "@/components/ui/cart/CartContext";
import { toast } from 'react-toastify';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);
}

// Update the type for bakery products
type Product = {
  _id: string;
  name: string;
  description: string;
  ingredients?: string[];
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

// For API response with pagination
type ProductResponse = {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

const ITEMS_PER_PAGE = 6;

export default function ProductCards({
  initialData,
}: {
  initialData: ProductResponse;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [productsData, setProductsData] = useState<ProductResponse>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

const placeholders = [
  "Search for fresh bread...",
  "Find delicious pastries...",
  "Looking for birthday cakes?",
  "Try our special cookies..."
];

const [placeholder, setPlaceholder] = useState("");
const [textIndex, setTextIndex] = useState(0);
const [isDeleting, setIsDeleting] = useState(false);

useEffect(() => {
  const currentText = placeholders[textIndex];
  const typingSpeed = isDeleting ? 20 : 40;

  const timeout = setTimeout(() => {
    if (!isDeleting) {
      // Typing
      setPlaceholder(currentText.substring(0, placeholder.length + 1));

      if (placeholder === currentText) {
        // Pause before deleting
        setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      // Deleting
      setPlaceholder(currentText.substring(0, placeholder.length - 1));

      if (placeholder === "") {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % placeholders.length);
      }
    }
  }, typingSpeed);

  return () => clearTimeout(timeout);
}, [placeholder, isDeleting, textIndex]);

  useGSAP(() => {

    if (typeof window === 'undefined' || loading) return;

    if (sectionRef.current) {
      gsap.fromTo(sectionRef.current,
        {
          opacity: 0,
          y: -200,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 2,
          ease: "elastic.inOut(1,0.5)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 100%", // Starts when top of element is 80% from top of viewport
            toggleActions: "play none none none", // play on enter, none on leave, none on enterBack, none on leaveBack
          }
        }
      );
    }
  });
  // Fetch products with filters and pagination
  const fetchProducts = useCallback(async (page: number, search: string = "") => {
    setLoading(true);

    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", ITEMS_PER_PAGE.toString());

    if (search) {
      params.append("search", search);
    }

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data: ProductResponse = await res.json();
      setProductsData(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        fetchProducts(1, searchQuery);
      } else {
        fetchProducts(1);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, fetchProducts]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page, searchQuery);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    fetchProducts(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const { currentPage, totalPages } = productsData.pagination;
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(-1);
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(-1);
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
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

  // Get categories for quick filter buttons
  const categories = Array.from(
    new Set(initialData.products.map(p => p.category))
  ).slice(0, 5);

  return (
    <main ref={sectionRef} className="min-h-screen px-4 md:px-8 mt-16 py-10 bg-[#f3ecd8] dark:bg-[#4A4036] transition-colors duration-1000">
      <div >
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 text-3xl sm:text-4xl font-bold font-serif justify-center dark:text-[#e5dacc] text-[#482005a4]">
          <AnimatedTextRightCopy text="Bakery" /><AnimatedTextLeftCopy text=" Products 🍞" />
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 px-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={placeholder}
              className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-700 rounded-4xl 
                     bg-white dark:bg-[#1a1f1e] text-gray-900 dark:text-gray-100
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent 
                     transition-all duration-200"
            />

            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Clear search"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>

          {/* Search Stats */}
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? (
                <>
                  Found {productsData.pagination.totalItems} product{productsData.pagination.totalItems !== 1 ? 's' : ''}
                  matching "{searchQuery}"
                </>
              ) : (
                <>
                  Showing {productsData.products.length} of {productsData.pagination.totalItems} products
                </>
              )}
            </p>
          </div>

          {/* Quick Category Filters */}
          {!searchQuery && categories.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mr-2 mt-1">Browse:</p>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSearchQuery(category)}
                  className="text-xs px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 
                         text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/50 
                         transition-colors duration-200 capitalize"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading products...</p>
          </div>
        )}

        {/* No Results Message */}
        {!loading && productsData.products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🥐</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              {searchQuery
                ? `No products found matching "${searchQuery}"`
                : "No products available at the moment"}
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!loading && productsData.products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {productsData.products.map((product) => (
                <div
                  key={product._id}
                  className={cn(
                    "product-card group hover:scale-102 bg-[#f3f1ecf8] dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl",
                    "transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 opacity-90",
                    "flex flex-col h-full" // Added for sticky bottom
                  )}
                >
                  {/* CLICKABLE AREA */}
                  <Link
                    href={`/products/${product._id}`}
                    className="block flex-grow"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                     <img
    src={product.image[0]}
    alt={product.name}
    className="absolute inset-0 w-full h-full object-cover 
               transition-all duration-1000 
               group-hover:opacity-0"
  />

  {/* Second image */}
  <img
    src={product.image[1]}
    alt={product.name}
    className="absolute inset-0 w-full h-full object-cover 
               transition-all duration-1000 
               opacity-0 group-hover:opacity-100 group-hover:scale-105"
  />

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.featured && (
                          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                            Featured
                          </span>
                        )}
                        {product.popular && (
                          <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                            Popular
                          </span>
                        )}
                        {!product.available && (
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-black/70 text-white text-xs font-semibold rounded-full capitalize">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6 pb-4 flex-grow">
                      <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                        {product.category}
                      </span>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {product.name}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </Link>

                  {/* BOTTOM SECTION - Sticky to bottom */}
                  <div className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50">
                    {/* Rating Section */}
                    <div className="px-6 pt-4 pb-3">
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              product.rating && i < Math.floor(product.rating)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300 dark:text-gray-600"
            )}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {product.rating ? product.rating.toFixed(1) : '0.0'}
        {` (${product.reviewCount || 0})`}
      </span>
    </div>
  </div>

                    {/* Price & Add to Cart Section - STICKY BOTTOM */}
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 flex items-center justify-between gap-2">
                      <div className="flex-shrink-0">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white block">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {product.available ? "In stock" : "Out of stock"}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.available}
                        className={cn(
                          "flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0 text-sm",
                          product.available
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg"
                            : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        )}
                      >
                        <ShoppingCart className="h-4 w-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{product.available ? "Add to Cart" : "Sold Out"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Component */}
            {productsData.pagination.totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent className="flex-wrap gap-1">
                  {/* Previous Button */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(productsData.pagination.currentPage - 1)}
                      className={cn(
                        "cursor-pointer",
                        !productsData.pagination.hasPrevPage && "pointer-events-none opacity-50"
                      )}
                      aria-disabled={!productsData.pagination.hasPrevPage}
                    />
                  </PaginationItem>

                  {/* Page Numbers */}
                  {getPageNumbers().map((pageNum, index) => (
                    <PaginationItem key={index} className={pageNum === -1 ? "hidden sm:list-item" : ""}>
                      {pageNum === -1 ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={productsData.pagination.currentPage === pageNum}
                          className="cursor-pointer min-w-9"
                        >
                          {pageNum}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  {/* Next Button */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(productsData.pagination.currentPage + 1)}
                      className={cn(
                        "cursor-pointer",
                        !productsData.pagination.hasNextPage && "pointer-events-none opacity-50"
                      )}
                      aria-disabled={!productsData.pagination.hasNextPage}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            {/* Page Info */}
            {productsData.pagination.totalPages > 1 && (
              <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400 px-2">
                Page {productsData.pagination.currentPage} of {productsData.pagination.totalPages}
                <span className="hidden sm:inline"> • Showing {((productsData.pagination.currentPage - 1) * productsData.pagination.itemsPerPage) + 1}–{Math.min(productsData.pagination.currentPage * productsData.pagination.itemsPerPage, productsData.pagination.totalItems)} of {productsData.pagination.totalItems} products</span>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}