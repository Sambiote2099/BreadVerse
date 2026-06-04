// app/about/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {  
  Heart, 
  Users, 
  Clock, 
  Leaf, 
  Shield, 
  Star, 
  ArrowRight,
  Quote
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const ArtisanRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const FreshlyBakedRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  // Our team
  const teamMembers = [
    {
      name: "Kakarot",
      role: "Head Baker & Founder",
      image: "https://res.cloudinary.com/diasvvkil/image/upload/v1768547926/Sam_czrazg.jpg",
      bio: "4th generation baker with 20+ years experience",
      specialty: "Sourdough & Artisan Breads"
    },
    {
      name: "Ryan Gosling",
      role: "Pastry Chef",
      image: "https://res.cloudinary.com/diasvvkil/image/upload/v1768747065/482030857_963108369349918_1164061268749725204_n_hxtwha.jpg",
      bio: "French-trained patissier",
      specialty: "Viennoiserie & Desserts"
    },
    {
      name: "Walter White",
      role: "Head of Operations",
      image: "https://res.cloudinary.com/diasvvkil/image/upload/v1768747065/483878699_963108292683259_911278886353750256_n_ux9bvd.jpg",
      bio: "Ensures everything runs smoothly",
      specialty: "Customer Experience"
    },
    {
      name: "Bababoi",
      role: "Head Barista",
      image: "https://res.cloudinary.com/diasvvkil/image/upload/v1768746672/96e3d273687b01867b4e632d0aecceb8_oy4zer.jpg",
      bio: "Coffee artisan and flavor expert",
      specialty: "Specialty Coffee Blends"
    }
  ];

  // Our values
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Made with Love",
      description: "Every loaf, pastry, and treat is crafted with genuine care and passion."
    },
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "Sustainable Sourcing",
      description: "We partner with local farmers who practice sustainable agriculture."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Time-Honored Techniques",
      description: "Traditional methods combined with modern innovation."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Quality Guarantee",
      description: "We never compromise on ingredients or craftsmanship."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community First",
      description: "Giving back to the community that supports us."
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Continuous Excellence",
      description: "Always striving to be better than yesterday."
    }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "The best sourdough I've ever had! Perfect crust and airy crumb every time.",
      author: "Sarah M.",
      role: "Regular Customer for 3 years"
    },
    {
      quote: "Their morning pastries make my commute worth it. Fresh, buttery perfection.",
      author: "James K.",
      role: "Daily Visitor"
    },
    {
      quote: "As a former Parisian, I can honestly say their croissants rival any in France.",
      author: "Isabelle R.",
      role: "Food Critic"
    }
  ];

  // GSAP Animations
  useGSAP(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {

      // Hero section animation
      gsap.fromTo(heroRef.current,
        { opacity: 0, y: -1000 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 100%",
            toggleActions: "play none none none"
          }
        }
      );

      // Values animation
      gsap.fromTo(valuesRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          clearProps:"all",
          scrollTrigger: {
            trigger: valuesRef.current,
            start: "top 80%",
            end: "top 50%",
            toggleActions: "play none none none",
            scrub: true
          }
        }
      );

      // Team animation
      gsap.fromTo(teamRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: teamRef.current,
            start: "top 80%",
            end: "top 40%",
            toggleActions: "play none none none",
            scrub: true
          }
        }
      );

      gsap.fromTo(reviewRef.current,
        { opacity: 0, scale: 0.9, x: 1000 },
        {
          opacity: 1,
          scale: 1,
          x:0,
          duration: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: reviewRef.current,
            start: "top 80%",
            end: "top 40%",
            toggleActions: "play none none none",
            scrub: true
          }
        }
      );

      // CTA animation
      if (FreshlyBakedRef.current) {
        gsap.fromTo(FreshlyBakedRef.current,
          {
            opacity: 0,
            y: 30
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.3, // Staggered after title
            ease: "power2.out",
            scrollTrigger: {
              trigger: FreshlyBakedRef.current,
              start: "top 60%",
              end: "bottom 40%",
              toggleActions: "play none none none",
            scrub: true
            }
          }
        );
      }

      if (ArtisanRef.current) {
        gsap.fromTo(ArtisanRef.current,
          {
            opacity: 0,
            y: 0,
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ArtisanRef.current,
              start: "top 60%", // Starts when top of element is 80% from top of viewport
              end: "bottom 40%",
              toggleActions: "play none none none",
            scrub: true
            }
          }
        );
      }

    });
  }, []);

  return (
    <div className="min-h-screen mt-16 bg-[#f3ecd8] dark:bg-[#4A4036] transition-colors duration-1000">
      {/* Hero Section */}
      <div ref={heroRef} className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1587241321921-91a834d6d191?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Bakery interior"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white font-serif">
              Our Story of Bread & Butter
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              From a family recipe to a community staple, we've been kneading happiness into every loaf since 2022.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2">
                  Explore Our Products
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <Link href="/location">
                <button className="border-2  border-white hover:border-amber-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105">
                  Visit Us
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      
      
             <section 
  ref={FreshlyBakedRef} 
  className="py-16 px-4 md:pr-8 flex flex-col md:flex-row items-center bg-gradient-to-t from-amber-300/20 to-transparent dark:from-amber-600/10 dark:to-transparent"
>
  {/* Fixed image container */}
  <div className="relative w-full md:w-[45%] max-w-[600px] h-[400px] md:h-[500px] lg:h-[600px] shrink-0 mb-8 md:mb-0 md:mr-8 lg:mr-12">
    <Image
      src="https://res.cloudinary.com/diasvvkil/image/upload/w_600,h_600,c_fill,g_auto,q_auto,f_auto/v1769851215/nii-shu-_GRf1LSaWks-unsplash_gbilek.jpg"
      alt="Bakery Hero"
      fill
      className="rounded-4xl object-cover hover:scale-102 transition-transform duration-700"
      priority
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 600px"
      quality={85}
    />
  </div>
  
  {/* Content section */}
  <div className="w-full md:w-[55%] max-w-2xl">
    <h3 className="text-4xl md:text-5xl lg:text-6xl font-semibold pb-6 text-center md:text-right">
      How It All Began
    </h3>
    <p className="text-lg md:text-xl lg:text-2xl font-light text-gray-700 dark:text-gray-300 text-center md:text-right leading-relaxed md:leading-loose">
      Our journey began in a small kitchen with a simple idea: bake honest bread that people would love. 
      What started as early mornings, borrowed tools, and a single oven slowly turned into something bigger. 
      Friends and neighbors became our first customers, and their smiles told us we were onto something special. 
      Today, we still bake with the same care and passion that started it all.
    </p>
  </div>
</section>

                <section 
  ref={ArtisanRef} 
  className="py-10 px-4 md:pl-8 flex flex-col md:flex-row items-center bg-gradient-to-b from-amber-300/20 to-transparent dark:from-amber-600/10 dark:to-transparent"
>
  {/* Content section - comes first in DOM for mobile, stays on left for desktop */}
  <div className="w-full md:w-[55%] max-w-2xl mb-8 md:mb-0 md:mr-8 lg:mr-12">
    <h3 className="text-4xl md:text-5xl lg:text-6xl font-semibold pb-6 text-center md:text-left">
      How It's Going
    </h3>
    <p className="text-lg md:text-xl lg:text-2xl font-light text-gray-700 dark:text-gray-300 text-center md:text-left leading-relaxed md:leading-loose">
      Thanks to the support of our customers and community, our small beginning has grown into a place we're proud of. 
      Each day, our ovens are filled, our shelves turn over quickly, and our passion for baking continues to grow. 
      We're grateful for every customer who has been part of this journey.
    </p>
  </div>
  
  {/* Fixed image container on the right */}
  <div className="relative w-full md:w-[45%] max-w-[600px] h-[400px] md:h-[500px] lg:h-[600px] shrink-0">
    <Image
      src="https://res.cloudinary.com/diasvvkil/image/upload/v1769873184/maite-paternain-SEb14_nBjc4-unsplash_x52bv4.jpg"
      alt="Bakery display"
      fill
      className="rounded-4xl object-cover hover:scale-102 transition-transform duration-700"
      priority
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 600px"
      quality={85}
    />
  </div>
</section>

      {/* Our Values */}
      <div ref={valuesRef} className="py-16 px-4 bg-[#f3ecd8] dark:bg-[#4A4036]">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              What We Believe In
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our values are the secret ingredients in everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div 
                key={index}
                className="value-item hover:-rotate-2 bg-amber-100 dark:bg-[#5a4f3d] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6 text-amber-600">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div ref={teamRef} className="py-16 px-4 bg-amber-50 dark:bg-[#5a4f3d]">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Meet the Bakers
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The talented hands and hearts behind every delicious creation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className="team-member bg-amber-100 dark:bg-[#4A4036] rounded-2xl overflow-hidden shadow-lg group hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-amber-600 dark:text-amber-400 font-semibold mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {member.bio}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span>Specialty: {member.specialty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div ref={reviewRef} className="py-16 px-4 bg-[#f3ecd8] dark:bg-[#4A4036]">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The true measure of our success is the smiles we create.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-amber-100 dark:bg-[#5a4f3d] rounded-2xl p-8 shadow-lg relative"
              >
                <Quote className="absolute top-4 right-4 h-8 w-8 text-amber-500/30" />
                <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-6">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}