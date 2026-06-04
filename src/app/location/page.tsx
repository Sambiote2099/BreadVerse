// app/location/page.tsx
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Navigation, Phone, Mail, Clock } from "lucide-react";
import Image from 'next/image';
import gsap from "gsap";
import L from "leaflet";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import dynamic from 'next/dynamic';

// Dynamically import map with no SSR
const LocationMap = dynamic(() => import('@/components/LocationMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[300px] sm:h-[380px] lg:h-[420px] w-full flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
    )
});


if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);
}

// Fix for Leaflet default icons in Next.js

interface Location {
    name: string;
    address: string;
    coordinates: [number, number];
    phone: string;
    email: string;
    hours: string;
    description: string;
}

export default function LocationPage() {
    const [isClient, setIsClient] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<number>(0);
    const LocationRef = useRef<HTMLDivElement>(null);
    const Location2Ref = useRef<HTMLDivElement>(null);
    const Location3Ref = useRef<HTMLDivElement>(null);
  
    useGSAP(() => {
  
      if (typeof window === 'undefined') return;
  
      if (LocationRef.current) {
          gsap.fromTo(LocationRef.current,
            {
              opacity: 0,
              x: -800,
              scale: 0.95,
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 2,
              ease: "power4.inOut",
              clearProps:"opacity",
              scrollTrigger: {
                trigger: LocationRef.current,
                start: "top 100%",
                toggleActions: "play none none none",
              }
            }
          );
        }

        if (Location2Ref.current) {
          gsap.fromTo(Location2Ref.current,
            {
              opacity: 0,
              x: 600,
              scale: 0.95,
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 3.5,
              ease: "power4.inOut",
              scrollTrigger: {
                trigger: Location2Ref.current,
                start: "top 100%",
                toggleActions: "play none none none",
              }
            }
          );
        }

        if (Location3Ref.current) {
          gsap.fromTo(Location3Ref.current,
            {
              opacity: 0,
              y: 800,
              scale: 0.95,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 3,
              ease: "power4.inOut",
              clearProps:"all",
              scrollTrigger: {
                trigger: Location3Ref.current,
                start: "top 120%",
                toggleActions: "play none none none",
              }
            }
          );
        }
      },{dependencies: [isClient]});

    // Our bakery locations
    const locations: Location[] = [
        {
            name: "Downtown Bakery",
            address: "123 Main Street, New York, NY 10001",
            coordinates: [40.7128, -74.0060], // NYC coordinates
            phone: "(555) 123-4567",
            email: "downtown@breadverse.com",
            hours: "Mon-Fri: 6AM-8PM, Sat-Sun: 7AM-9PM",
            description: "Our flagship store in the heart of downtown. Featuring our full menu and coffee bar."
        },
        {
            name: "Artisan Lofts",
            address: "456 Artisan Avenue, Brooklyn, NY 11201",
            coordinates: [40.6782, -73.9442], // Brooklyn coordinates
            phone: "(555) 987-6543",
            email: "brooklyn@breadverse.com",
            hours: "Mon-Sun: 7AM-10PM",
            description: "Specializing in sourdough and artisan breads. Come watch our bakers at work!"
        },
        {
            name: "Riverside Patisserie",
            address: "789 Riverside Drive, Queens, NY 11101",
            coordinates: [40.7282, -73.7949], // Queens coordinates
            phone: "(555) 456-7890",
            email: "queens@breadverse.com",
            hours: "Mon-Fri: 5AM-9PM, Sat-Sun: 6AM-10PM",
            description: "Our pastry-focused location with waterfront views and outdoor seating."
        },
        {
            name: "Burbank Lavelle",
            address: "789 Lavelle street, Bastions, PS 13002",
            coordinates: [10.7282, -13.7949], // Queens coordinates
            phone: "(555) 456-7890",
            email: "queens@breadverse.com",
            hours: "Mon-Fri: 5AM-9PM, Sat-Sun: 6AM-10PM",
            description: "Our pastry-focused location with waterfront views and outdoor seating."
        }
    ];

    const uniqueLocations = locations.filter((loc, index, self) => 
        index === self.findIndex((l) => l.name === loc.name && l.address === loc.address)
    );
    // Set isClient to true when component mounts (client-side only)
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Handle location selection
    const handleLocationSelect = (index: number) => {
        setSelectedLocation(index);
    };

    // Don't render map on server
    if (!isClient) {
        return (
            <div className="min-h-screen bg-[#f3ecd8] dark:bg-[#4A4036]">

                <div className="pt-24 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
            </div>
        );
    }

    return (
        <main>
            <div className="absolute inset-0 h-full w-screen z-0">
                <Image
                    src="https://res.cloudinary.com/diasvvkil/image/upload/v1769853540/3_boiuy1.jpg"
                    alt="Bakery background"
                    fill
                    priority
                    className="object-cover blur-[2px]"
                />
                <div className="absolute inset-0 bg-black/10"></div>
            </div>
            <div className="mt-16 transition-colors duration-1000">
                <div className="container mx-auto px-4 mb-16">
                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

                        {/* Map — order-1 on mobile, col-start-2 row-1 on desktop */}
                        <div className="order-1 lg:col-span-2 lg:col-start-2 lg:row-start-1">
                            <div ref={Location2Ref} className="bg-white mt-6 lg:mt-8 dark:bg-[#5a4f3d] rounded-2xl shadow-xl overflow-hidden">
                                <div className="h-[300px] sm:h-[380px] lg:h-[420px] w-full">
                                    <LocationMap
                                        locations={uniqueLocations}
                                        selectedLocation={selectedLocation}
                                        setSelectedLocation={setSelectedLocation}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Selector — order-2 on mobile, col-start-1 spanning both rows on desktop */}
                        <div className="order-2 lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:row-span-2">
                            <div ref={LocationRef} className="bg-[#f3ecd8] dark:bg-[#5a4f3d] opacity-90 rounded-2xl shadow-xl p-5 sm:p-6 lg:sticky lg:top-24 mt-0 lg:mt-8">
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
                                    Our Locations
                                </h2>

                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                                    {locations.map((location, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleLocationSelect(index)}
                                            className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 ${selectedLocation === index
                                                    ? 'bg-amber-100 dark:bg-gray-800 border-2 border-slate-500'
                                                    : 'bg-white dark:bg-[#50340698] hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">
                                                {location.name}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
                                                {location.address}
                                            </p>
                                            <div className="flex items-center mt-1 sm:mt-2 text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                                                <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                                <span className="truncate">{location.coordinates[0].toFixed(4)}, {location.coordinates[1].toFixed(4)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Contact Info */}
                                <div className="mt-6 pt-5 border-t border-gray-500 dark:border-gray-50">
                                    <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-gray-900 dark:text-white">
                                        Contact Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                            <Phone className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">General: (555) 000-777</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                            <Mail className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                            <span className="text-sm sm:text-base break-all">hello@breadverse.com</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">Most locations: 6AM - 10PM Daily</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Selected Location Details — order-3 on mobile, col-start-2 row-2 on desktop */}
                        <div className="order-3 lg:col-span-2 lg:col-start-2 lg:row-start-2">
                            <div ref={Location3Ref} className="bg-[#f3ecd8] dark:bg-[#5a4f3d] opacity-95 hover:scale-102 transition-transform duration-700 rounded-2xl shadow-xl relative p-6 sm:p-8 z-0">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                            {locations[selectedLocation].name}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {locations[selectedLocation].address}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105">
                                            Get Directions
                                        </button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                                    {/* Left Column */}
                                    <div>
                                        <div className="mb-6">
                                            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                                                About This Location
                                            </h3>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {locations[selectedLocation].description}
                                            </p>
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                                                Hours of Operation
                                            </h3>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {locations[selectedLocation].hours}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div>
                                        <div className="mb-6">
                                            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                                                Contact Details
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Phone className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                                                        <p className="text-gray-600 dark:text-gray-400">{locations[selectedLocation].phone}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Mail className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">Email</p>
                                                        <p className="text-gray-600 dark:text-gray-400 break-all">{locations[selectedLocation].email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                                                Facilities
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm">
                                                    Outdoor Seating
                                                </span>
                                                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm">
                                                    Free WiFi
                                                </span>
                                                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm">
                                                    Parking Available
                                                </span>
                                                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm">
                                                    Wheelchair Accessible
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}