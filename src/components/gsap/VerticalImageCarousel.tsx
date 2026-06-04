"use client";

import React, { useEffect, useState } from "react";
import { InfiniteMovingCardsVertical } from "@/components/ui/infinite-moving-cards";

interface ImageItem {
  _id: string;
  url: string[]; // Changed to array to support multiple images
  name?: string;
  description?: string;
}

interface VerticalImageCarouselProps {
  shuffleSeed?: number; // Different number for different shuffling
  startOffset?: number; // NEW: Offset percentage (0-100)
  direction?: string;
}

export function VerticalImageCarousel({ shuffleSeed = 0, startOffset = 0, direction = "down" }: VerticalImageCarouselProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/recommendations?limit=8'); // Get 8 images
        
        if (!res.ok) throw new Error('Failed to fetch images');
        
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
          const transformedImages = data.data.map((item: any) => ({
            _id: item._id || item.id,
            // Handle both single string and array of URLs
            url: Array.isArray(item.url) ? item.url : 
                 item.url ? [item.url] : 
                 item.image ? [item.image] :
                 item.src ? [item.src] : [''],
            name: item.name || item.title,
            description: item.Description || item.description || item.caption || ''
          }));
          
          // Ensure all items have at least one URL
          const validImages = transformedImages.filter((item: ImageItem) => 
            item.url && item.url.length > 0 && item.url[0]
          );
          
          // Shuffle images differently based on seed
          const shuffled = shuffleArray(validImages, shuffleSeed);
          setImages(shuffled.slice(0, 6)); // Take first 6 after shuffling
        } else {
          // Shuffle fallback images differently for each column
          const fallbackImages = getFallbackImages();
          const shuffled = shuffleArray(fallbackImages, shuffleSeed);
          setImages(shuffled.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        const fallbackImages = getFallbackImages();
        const shuffled = shuffleArray(fallbackImages, shuffleSeed);
        setImages(shuffled.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [shuffleSeed]);

  // Simple deterministic shuffle based on seed
  const shuffleArray = (array: ImageItem[], seed: number): ImageItem[] => {
    const shuffled = [...array];
    let m = shuffled.length;
    let t, i;
    
    // Simple pseudo-random based on seed
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    
    while (m) {
      i = Math.floor(random() * m--);
      t = shuffled[m];
      shuffled[m] = shuffled[i];
      shuffled[i] = t;
    }
    
    return shuffled;
  };

  // Update fallback images to include multiple URLs
  const getFallbackImages = (): ImageItem[] => [
    { 
      _id: "1", 
      url: [
        "https://res.cloudinary.com/diasvvkil/image/upload/v1768747065/483878699_963108292683259_911278886353750256_n_ux9bvd.jpg",
        "https://res.cloudinary.com/diasvvkil/image/upload/v1768747065/483882265_963108079349947_8495836989446742927_n_lhaklh.jpg"
      ], 
      name: "Artisan Bread", 
      description: "Freshly baked daily" 
    },
    { 
      _id: "2", 
      url: [
        "https://res.cloudinary.com/diasvvkil/image/upload/v1768747065/483882265_963108079349947_8495836989446742927_n_lhaklh.jpg",
        "https://res.cloudinary.com/diasvvkil/image/upload/v1769246969/2_df6jw9.png"
      ], 
      name: "Delicious Pastries", 
      description: "Handcrafted with love" 
    },
    { 
      _id: "3", 
      url: [
        "https://res.cloudinary.com/diasvvkil/image/upload/v1769246969/2_df6jw9.png",
        "https://res.cloudinary.com/diasvvkil/image/upload/v1768747065/483878699_963108292683259_911278886353750256_n_ux9bvd.jpg"
      ], 
      name: "Our Bakery", 
      description: "Where magic happens" 
    },
    { 
      _id: "4", 
      url: [
        "https://res.cloudinary.com/diasvvkil/image/upload/v1768747065/483878699_963108292683259_911278886353750256_n_ux9bvd.jpg",
        "https://res.cloudinary.com/diasvvkil/image/upload/v1768747065/483882265_963108079349947_8495836989446742927_n_lhaklh.jpg"
      ], 
      name: "Special Treats", 
      description: "Perfect for any occasion" 
    },
    { 
      _id: "5", 
      url: [
        "https://res.cloudinary.com/diasvvkil/image/upload/v1768747065/483882265_963108079349947_8495836989446742927_n_lhaklh.jpg",
        "https://res.cloudinary.com/diasvvkil/image/upload/v1769246969/2_df6jw9.png"
      ], 
      name: "Sweet Delights", 
      description: "Made from scratch" 
    },
    { 
      _id: "6", 
      url: [
        "https://res.cloudinary.com/diasvvkil/image/upload/v1769246969/2_df6jw9.png",
        "https://res.cloudinary.com/diasvvkil/image/upload/v1768747065/483878699_963108292683259_911278886353750256_n_ux9bvd.jpg"
      ], 
      name: "Morning Fresh", 
      description: "Baked at sunrise" 
    },
  ];

  if (loading) {
    return (
      <div className="h-[300px] sm:h-[420px] md:h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <InfiniteMovingCardsVertical
        items={images}
        direction={direction}
        speed="slow"
        pauseOnHover={true}
        startOffset={startOffset}
      />
    </div>
  );
}