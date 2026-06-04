"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import React from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { ArrowRight, Star, Heart, Clock, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/ui/cart/CartContext";
import { Meteors } from "@/components/ui/meteors";
import { VerticalImageCarousel } from "@/components/gsap/VerticalImageCarousel";
import AnimatedTextUp from "../components/gsap/SplitTextUp";
import AnimatedTextRight from "@/components/gsap/SplitTextRight";
import AnimatedTextLeft from "@/components/gsap/SplitTextLeft";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin);
}

// Types
type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string[];
  available: boolean;
  featured?: boolean;
  popular?: boolean;
  rating?: number;
  reviewCount?: number;
};

// ------------------------------------------------------------------
// Product Card Component (memoized)
// ------------------------------------------------------------------
// Product Card Component (memoized)
const ProductCard = React.memo(({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) => {
  const [quantity] = useState(1);

  return (
    <div
      className={cn(
        "product-card hover:scale-102 group bg-[#f3f1ecf8] dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl",
        "transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800",
        "flex flex-col h-full w-full min-w-0"
      )}
    >
      <Link href={`/products/${product._id}`} className="block flex-grow" draggable="false">
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={product.image[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-opacity duration-1000 group-hover:opacity-0"
            draggable="false"
          />
          <Image
            src={product.image[1] || product.image[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-opacity duration-1000 opacity-0 group-hover:opacity-100"
            draggable="false"
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
          </div>
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-black/70 text-white text-xs font-semibold rounded-full capitalize">
              {product.category}
            </span>
          </div>
        </div>

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

      <div className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50">
        {/* Rating */}
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
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"> {/* Added whitespace-nowrap */}
              {product.rating ? product.rating.toFixed(1) : "0.0"} ({product.reviewCount || 0})
            </span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="px-6 pb-6 pt-3 flex items-center justify-between">
          <div className="flex-shrink-0"> {/* Added flex-shrink-0 */}
            <span className="text-2xl font-bold text-gray-900 dark:text-white block">
              ${product.price.toFixed(2)}
            </span>
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full inline-block", // Added inline-block
                product.available
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              )}
            >
              {product.available ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.available}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0",
              "flex-shrink-0", // Added flex-shrink-0 to prevent button from shrinking
              product.available
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg"
                : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="whitespace-nowrap">{product.available ? "Add to Cart" : "Sold Out"}</span> {/* Added whitespace-nowrap */}
          </button>
        </div>
      </div>
    </div>
  );
});
ProductCard.displayName = "ProductCard";

// ------------------------------------------------------------------
// Hero Section (with isolated interval)
// ------------------------------------------------------------------
const HeroSection = ({ introComplete }: { introComplete: boolean }) => {
  const heroImages = useMemo(
    () => [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff",
      "https://plus.unsplash.com/premium_photo-1723795346819-dfe9e51d2dec?q=80&w=1463&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907",
      "https://images.unsplash.com/photo-1426869884541-df7117556757?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1480869457432-3b1bc0910091?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1698937047780-f953fbe13215?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Set a random starting index only on the client to avoid SSR hydration mismatch
    setCurrentIndex(Math.floor(Math.random() * heroImages.length));
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="relative w-screen mt-16 h-[320px] sm:h-[420px] md:h-[510px] overflow-hidden">
      {heroImages.map((img, index) => (
        <Image
          key={img}
          src={img}
          alt="Bakery Hero"
          fill
          priority={index === 0}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-1000",
            index === currentIndex ? "opacity-90" : "opacity-0"
          )}
        />
      ))}

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center transition-opacity duration-1000",
          introComplete ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="container mx-auto px-4 sm:px-8 text-white">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 font-serif text-amber-200 select-none">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <AnimatedTextLeft text="MADE" introComplete={introComplete} />
                <AnimatedTextUp text="BY" introComplete={introComplete} />
                <AnimatedTextRight text="HAND," introComplete={introComplete} />
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <AnimatedTextRight text="FROM " introComplete={introComplete} />
                <AnimatedTextLeft text=" SCRATCH," introComplete={introComplete} />
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <AnimatedTextLeft text="WITH" introComplete={introComplete} />
                <AnimatedTextUp text="LOVE," introComplete={introComplete} />
              </div>
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-amber-100 select-none animate-fade-in-up">
              Their experience plays a role in the way they work. Bakers use flavours of sunlight.
            </p>
            <Link href="/products" scroll={true}>
              <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 float-animation">
                Baked Goods
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Featured Products Section (with Swiper)
// ------------------------------------------------------------------
// Featured Products Section (with Swiper)
const FeaturedProductsSection = ({
  products,
  loading,
  error,
}: {
  products: Product[];
  loading: boolean;
  error: string | null;
}) => {
  const { addToCart } = useCart();
  const productCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      if (!product.available) return;
      addToCart({
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: 1,
        image: product.image[0],
        description: product.description,
      });
      toast.success(`${product.name} added to cart!`);
    },
    [addToCart]
  );

  // GSAP animations for cards (only if not loading)
  useGSAP(
    () => {
      if (loading || products.length === 0) return;
      const validRefs = productCardsRef.current.filter(Boolean);
      if (validRefs.length === 0) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: validRefs[0],
          start: "top 90%",
          end: "top 40%",
          scrub: 2,
        },
      });

      validRefs.forEach((card, index) => {
        if (card) {
          tl.fromTo(
            card,
            { opacity: 0, x: 100, scale: 0.9 },
            { opacity: 1, x: 0, scale: 1, duration: 1.8, ease: "power4.in" },
            index * 0.4
          );
        }
      });

      return () => {
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    },
    { dependencies: [products, loading] }
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🥖</div>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{error}</p>
      </div>
    );
  }

  if (products.length === 0) return null;

  // Use Swiper only if more than 4 products, otherwise grid
  if (products.length > 4) {
    return (
      <div className="relative">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={12}
          slidesPerView={1}
          breakpoints={{
            640: { 
              slidesPerView: 2,
              spaceBetween: 16
            },
            768: { 
              slidesPerView: 3,
              spaceBetween: 20
            },
            1024: { 
              slidesPerView: 4,
              spaceBetween: 24
            },
          }}
          autoplay={{ delay: 3000, disableOnInteraction: true, pauseOnMouseEnter: true }}
          speed={1500}
          loop={true}
          className="pb-12"
          style={{
            // Ensure consistent slide widths
            width: '100%',
            margin: '0 auto',
          }}
        >
          {products.map((product, index) => (
            <SwiperSlide key={product._id} style={{ height: 'auto' }}>
              <div
                ref={(el) => {
                  productCardsRef.current[index] = el;
                }}
                className="h-full"
              >
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#f3ecd8] dark:from-[#4A4036] to-transparent z-10"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#f3ecd8] dark:from-[#4A4036] to-transparent z-10"></div>
      </div>
    );
  }

  // Grid fallback
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
      {products.map((product, index) => (
        <div
          key={product._id}
          ref={(el) => {
            productCardsRef.current[index] = el;
          }}
          className="h-full"
        >
          <ProductCard product={product} onAddToCart={handleAddToCart} />
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------
// Main Home Component
// ------------------------------------------------------------------
export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [introComplete, setIntroComplete] = useState(false);

  // Refs for GSAP
  const introRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionTitleRef = useRef<HTMLHeadingElement>(null);
  const sectionSubtitleRef = useRef<HTMLParagraphElement>(null);
  const LinksRef = useRef<HTMLDivElement>(null);
  const FreshlyBakedRef = useRef<HTMLDivElement>(null);
  const ArtisanRef = useRef<HTMLDivElement>(null);
  const ctaTitleRef = useRef<HTMLHeadingElement>(null);
  const ctaTextRef = useRef<HTMLParagraphElement>(null);
  const ctaButtonRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const GalleryRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<ScrollTrigger.Observer | null>(null);
  const hasPlayedRef = useRef(false);

  // Intro transition logic
  const playIntroTransition = useCallback(() => {
    if (!introRef.current || !heroRef.current || hasPlayedRef.current) return;
    hasPlayedRef.current = true;

    gsap.set(window, { scrollTo: heroRef.current!.offsetTop });
    gsap.set(introRef.current, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });
    gsap.set(heroRef.current, { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" });

    gsap
      .timeline({
        onComplete: () => {
          setIntroComplete(true);
          document.body.classList.remove("no-scroll");
        },
      })
      .to(introRef.current, {
        ease: "power1.inOut",
        duration: 4,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      })
      .fromTo(
        heroRef.current,
        { y: 1000, clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
        { duration: 2.8, y: 0, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "power1.out" },
        0
      )
      .fromTo(
        sectionTitleRef.current,
        { y: 1000, clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
        { duration: 4.5, y: 0, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "power1.out" },
        0
      );
  }, []);

  // Lock scroll and observe first interaction
  useEffect(() => {
    document.body.classList.add("no-scroll");

    observerRef.current = ScrollTrigger.observe({
      target: window,
      type: "wheel,touch",
      tolerance: 10,
      preventDefault: true,
      onDown: () => !hasPlayedRef.current && playIntroTransition(),
      onUp: () => {},
    });

    return () => {
      observerRef.current?.kill();
      document.body.classList.remove("no-scroll");
      gsap.killTweensOf([introRef.current, heroRef.current, sectionTitleRef.current]);
      hasPlayedRef.current = false;
    };
  }, [playIntroTransition]);

  // Remove no-scroll when intro completes
  useEffect(() => {
    if (introComplete) {
      document.body.classList.remove("no-scroll");
    }
  }, [introComplete]);

  // Fetch products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products?limit=12");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        if (data.products.length === 0) {
          setFeaturedProducts([]);
        } else {
          // Shuffle and take 7
          const shuffled = [...data.products].sort(() => Math.random() - 0.5).slice(0, 7);
          setFeaturedProducts(shuffled);
        }
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  // GSAP scroll animations (excluding product cards which are handled in FeaturedProductsSection)
  useGSAP(
    () => {
      if (loading) return;

      // Hero parallax
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { scale: 1 },
          {
            scale: 1.1,
            scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
          }
        );
      }

      // Section title
      if (sectionTitleRef.current) {
        gsap.fromTo(
          sectionTitleRef.current,
          { opacity: 0, y: -20, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 4,
            scrollTrigger: { trigger: sectionTitleRef.current, start: "top 100%", end: "top 50%", scrub: true },
          }
        );
      }

      // Subtitle
      if (sectionSubtitleRef.current) {
        gsap.fromTo(
          sectionSubtitleRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.3,
            scrollTrigger: { trigger: sectionSubtitleRef.current, start: "top 90%", end: "top 50%", scrub: true },
          }
        );
      }

      // Freshly Baked section
      if (FreshlyBakedRef.current) {
        gsap.fromTo(
          FreshlyBakedRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.3,
            scrollTrigger: { trigger: FreshlyBakedRef.current, start: "top 90%", end: "bottom 40%", scrub: true },
          }
        );
      }

      // Artisan section
      if (ArtisanRef.current) {
        gsap.fromTo(
          ArtisanRef.current,
          { opacity: 0, y: 0, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 4,
            scrollTrigger: { trigger: ArtisanRef.current, start: "top 90%", end: "bottom 40%", scrub: true },
          }
        );
      }

      // Gallery
      if (GalleryRef.current) {
        gsap.fromTo(
          GalleryRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 2,
            delay: 0.8,
            ease: "elastic.out",
            scrollTrigger: { trigger: GalleryRef.current, start: "top 85%", end: "bottom 40%", scrub: true },
          }
        );
      }

      // Link button
      if (LinksRef.current) {
        gsap.fromTo(
          LinksRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            stagger: 0.8,
            scrollTrigger: { trigger: LinksRef.current, start: "top 100%", end: "top 75%", scrub: true },
          }
        );
      }

      // CTA title, text, button
      if (ctaTitleRef.current) {
        gsap.fromTo(
          ctaTitleRef.current,
          { opacity: 0, y: 30, x: -40 },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 1.8,
            scrollTrigger: { trigger: ctaTitleRef.current, start: "top 90%", end: "top 60%", scrub: true },
          }
        );
      }
      if (ctaTextRef.current) {
        gsap.fromTo(
          ctaTextRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1.6,
            delay: 0.2,
            scrollTrigger: { trigger: ctaTextRef.current, start: "top 90%", end: "top 60%", scrub: true },
          }
        );
      }
      if (ctaButtonRef.current) {
        gsap.fromTo(
          ctaButtonRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 2,
            delay: 0.8,
            scrollTrigger: { trigger: ctaButtonRef.current, start: "top 90%", end: "top 60%", scrub: true },
          }
        );
      }

      // Features items
      if (featuresRef.current) {
        const features = featuresRef.current.querySelectorAll(".feature-item");
        features.forEach((feature, index) => {
          gsap.fromTo(
            feature,
            { opacity: 0, y: -50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: index * 0.15,
              scrollTrigger: { trigger: feature, start: "top 80%", end: "bottom 75%", scrub: true },
            }
          );
        });
      }

      return () => {
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    },
    { dependencies: [loading] }
  );

  // Hero images for intro
  const heroImages = useMemo(
    () => [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff",
      "https://plus.unsplash.com/premium_photo-1723795346819-dfe9e51d2dec?q=80&w=1463&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907",
      "https://images.unsplash.com/photo-1426869884541-df7117556757?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1480869457432-3b1bc0910091?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1698937047780-f953fbe13215?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    []
  );
  const [introImageIndex, setIntroImageIndex] = useState(0);

  useEffect(() => {
    // Set a random starting index only on the client to avoid SSR hydration mismatch
    setIntroImageIndex(Math.floor(Math.random() * heroImages.length));
    const interval = setInterval(() => {
      setIntroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="bg-[#f3ecd8] dark:bg-[#4A4036] mt-16">
      <main>
        {/* Intro Overlay */}
        <div
          ref={introRef}
          className="w-screen fixed z-50 h-screen bg-[#f3ecd8] dark:bg-[#4A4036] text-black flex items-center justify-center"
        >
          <div className="absolute inset-0 h-screen w-screen z-20">
            {heroImages.map((img, index) => (
              <Image
                key={img}
                src={img}
                alt="Bakery Hero"
                fill
                priority={index === 0}
                sizes="100vw"
                className={cn(
                  "object-cover transition-opacity duration-1000",
                  index === introImageIndex ? "opacity-90" : "opacity-0"
                )}
              />
            ))}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          <div className="text-center z-30 max-w-2xl px-4 sm:px-8">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold text-amber-200 mb-4 animate-fade-in-down">
              Welcome to Our Bakery
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-amber-500"></div>
              <p className="text-lg sm:text-xl md:text-2xl text-amber-300 italic font-light">
                Where every loaf tells a story
              </p>
              <div className="h-px w-16 bg-amber-500"></div>
            </div>
            <p className="text-base sm:text-lg text-amber-100 mb-8 max-w-md mx-auto leading-relaxed">
              Step into a world of warm ovens, artisan craftsmanship, and the sweet aroma of freshly baked delights.
            </p>
            <div className="flex flex-col items-center gap-2 animate-fade-in-up">
              <p className="text-sm text-amber-300 uppercase tracking-wider">
                <span className="hidden md:inline">Scroll to begin</span>
                <span className="inline md:hidden">Slide up to begin</span>
              </p>
              <div className="flex flex-col items-center text-amber-400">
                {/* Desktop: arrows point down. Mobile: flipped to point up */}
                <span className="text-3xl animate-arrow-1 inline-block md:rotate-0 rotate-180">⌄</span>
                <span className="text-3xl -mt-4 animate-arrow-2 inline-block md:rotate-0 rotate-180">⌄</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div ref={heroRef}>
          <HeroSection introComplete={introComplete} />
        </div>

        {/* Featured Products */}
        <section className="py-10 sm:py-16 px-4 sm:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2
                ref={sectionTitleRef}
                className="text-3xl sm:text-4xl font-bold dark:text-amber-100 text-gray-900 mb-4 font-serif transition-colors duration-1000"
              >
                YOUR DAILY DOSE OF DELIGHT
              </h2>
              <p
                ref={sectionSubtitleRef}
                className="text-gray-600 dark:text-amber-200 text-base sm:text-lg max-w-2xl mx-auto transition-colors duration-1000"
              >
                Freshly baked goods made with passion and precision
              </p>
            </div>

            <FeaturedProductsSection products={featuredProducts} loading={loading} error={error} />

            <div ref={LinksRef} className="text-center mt-14">
              <Link href="/products" scroll={true}>
                <button className="inline-flex items-center gap-2 text-gray-900 dark:text-white font-semibold text-lg border-b-2 border-amber-500 pb-1 hover:text-amber-600 transition-colors float-animation">
                  View All Products
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Tradition Section */}
        <section className="py-12 sm:py-16 sm:py-20 px-4 sm:px-8 bg-linear-to-r from-amber-900/20 to-amber-800/10">
          <div className="container mx-auto text-center">
            <h2
              ref={ctaTitleRef}
              className="text-3xl sm:text-4xl md:text-5xl font-bold dark:text-slate-100 text-gray-900 mb-6 font-serif"
            >
              ENJOY TRADITION
            </h2>
            <p
              ref={ctaTextRef}
              className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-10"
            >
              Experience the art of baking with our master bakers. From traditional recipes to modern creations.
            </p>
            <div ref={ctaButtonRef} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" scroll={true}>
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl float-animation">
                  ORDER NOW
                </button>
              </Link>
              <button className="border-2 border-gray-900 dark:border-white hover:border-amber-500 text-gray-900 dark:text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 hover:scale-105 float-animation">
                VISIT US
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="py-10 sm:py-16 px-4 sm:px-8">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div className="text-center p-6 feature-item">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Made with Love</h3>
                <p className="text-gray-600 dark:text-gray-300">Every product is crafted with care.</p>
              </div>
              <div className="text-center p-6 feature-item">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Fresh Daily</h3>
                <p className="text-gray-600 dark:text-gray-300">Baked fresh each morning.</p>
              </div>
              <div className="text-center p-6 feature-item">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Artisan Quality</h3>
                <p className="text-gray-600 dark:text-gray-300">Traditional techniques meet innovation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Freshly Baked Section */}
        <section
          ref={ArtisanRef}
          className="py-10 sm:py-16 px-4 sm:px-8 flex flex-col lg:flex-row items-center gap-8 bg-gradient-to-b from-amber-300/20 to-transparent dark:from-amber-600/10 dark:to-transparent"
        >
          <div className="lg:w-1/2 text-center lg:text-left">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-semibold pb-4">Freshly Baked</h3>
            <p className="text-lg sm:text-xl font-light max-w-xl">
              Fresh from the oven and made with care, our breads and pastries are baked daily using time-honored recipes and the finest ingredients. Every bite delivers warmth, flavor, and the comforting taste of something made just for you.
            </p>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <Image
              src="https://res.cloudinary.com/diasvvkil/image/upload/v1768747065/483882265_963108079349947_8495836989446742927_n_lhaklh.jpg"
              alt="Freshly Baked"
              width={700}
              height={1000}
              className="rounded-4xl -rotate-2 hover:scale-105 transition-transform duration-700 hover:rotate-2 w-full max-w-md lg:max-w-full"
              priority
            />
          </div>
        </section>

        {/* Artisan Section */}
        <section
          ref={FreshlyBakedRef}
          className="py-10 sm:py-16 px-4 sm:px-8 flex flex-col lg:flex-row-reverse items-center gap-8 bg-gradient-to-t from-amber-300/20 to-transparent dark:from-amber-600/10 dark:to-transparent"
        >
          <div className="lg:w-1/2 text-center lg:text-right">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-semibold pb-4">Artisan & Premium</h3>
            <p className="text-lg sm:text-xl font-light max-w-xl ml-auto">
              Each morning, our kitchen comes alive with the aroma of freshly baked bread, crafted by hand using premium ingredients and slow fermentation. The result is a perfect balance of texture, flavor, and freshness you can taste.
            </p>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <Image
              src="https://res.cloudinary.com/diasvvkil/image/upload/v1769246969/2_df6jw9.png"
              alt="Artisan Bread"
              width={700}
              height={1000}
              className="rounded-4xl rotate-2 hover:scale-105 transition-transform duration-700 hover:-rotate-2 w-full max-w-md lg:max-w-full"
              priority
            />
          </div>
        </section>

        {/* Gallery Section */}
        <section ref={GalleryRef} className="relative w-full py-8 mt-2 px-4 sm:px-8 via-slate-400/20 bg-gradient-to-b from-amber-300/20 to-transparent dark:from-amber-600/10 dark:to-transparent">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold dark:text-amber-100 text-amber-800 font-serif">
              Our Bakery Gallery
            </h2>
            <p className="text-gray-600 text-base sm:text-lg dark:text-amber-200 max-w-xl mx-auto">
              Watch our delicious creations float by
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <VerticalImageCarousel shuffleSeed={1} startOffset={0} />
            <VerticalImageCarousel shuffleSeed={42} startOffset={4} />
            <VerticalImageCarousel shuffleSeed={99} startOffset={7} />
          </div>
        </section>

        {/* Store Hours */}
        <section className="py-10 sm:py-16 px-4 sm:px-8 bg-[#f3ecd8] dark:bg-[#4a4036]">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="w-full lg:w-1/2">
                <div className="relative h-[260px] sm:h-[380px] lg:h-[580px] w-full overflow-hidden rounded-3xl shadow-2xl hover:scale-102 transition-transform duration-700">
                  <Image
                    src="https://images.unsplash.com/photo-1567395401530-d99add784641?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Our Bakery Storefront"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-amber-900 dark:text-amber-100 mb-4 sm:mb-6 font-serif">
                  Come Visit Us
                </h2>
                <p className="text-gray-700 dark:text-amber-200 text-base sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
                  Step into our warm, inviting bakery where the aroma of freshly baked goods welcomes you.
                </p>
                <div className="relative hover:scale-102 transition-all duration-700 overflow-hidden bg-white dark:bg-[#6d6152] p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-[520px] mx-auto lg:mx-0">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Store Hours</h3>
                  <div className="space-y-4">
                    {[
                      { day: "Monday - Friday", hours: "7:00 AM - 8:00 PM" },
                      { day: "Saturday", hours: "8:00 AM - 9:00 PM" },
                      { day: "Sunday", hours: "8:00 AM - 6:00 PM" },
                    ].map((schedule, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-3 px-4 border-b border-amber-100 dark:border-amber-800/30 last:border-0"
                      >
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{schedule.day}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-lg">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-amber-100 dark:border-amber-800/30">
                    <p className="text-gray-600 dark:text-amber-300 italic">✨ Fresh batches baked hourly throughout the day!</p>
                  </div>
                  <Meteors number={16} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global styles for animations */}
      <style jsx>{`
        @keyframes arrow-bounce {
          0% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(8px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.3; }
        }
        .animate-arrow-1 { animation: arrow-bounce 1.8s infinite; }
        .animate-arrow-2 { animation: arrow-bounce 1.8s infinite; animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}