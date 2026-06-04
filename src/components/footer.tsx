"use client";
import React from 'react';

const Footer: React.FC = () => {
    return (
    <footer className="dark:bg-[#f3ecd8] bg-[#0e100f] relative text-gray-300 text-sm pt-10 pb-6 dark:text-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto mb-14 px-4 space-y-8 relative">

        {/* 🍞 Social Media Icons */}
        <div className="flex justify-center gap-5 text-[#c3aa88] text-lg dark:text-black">
          <a href="#" aria-label="Facebook" className="hover:bg-blue-600 hover:text-black dark:hover:text-white p-2 rounded-full transition">
            <i className="fa-brands fa-facebook-f"></i>
          </a>
          <a href="#" aria-label="Instagram" className="hover:bg-purple-500 hover:text-black dark:hover:text-white p-2 rounded-full transition">
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a href="#" aria-label="Pinterest" className="hover:bg-red-500 hover:text-black dark:hover:text-white p-2 rounded-full transition">
            <i className="fa-brands fa-pinterest-p"></i>
          </a>
          <a href="#" aria-label="X / Twitter" className="hover:text-black hover:bg-white dark:hover:bg-black dark:hover:text-white p-2 rounded-full transition">
            <i className="fa-brands fa-x"></i>
          </a>
          <a href="#" aria-label="YouTube" className="hover:bg-red-600 hover:text-black dark:hover:text-white p-2 rounded-full transition">
            <i className="fa-brands fa-youtube"></i>
          </a>
        </div>

        {/* 🥖 Quick Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-center font-medium">
          {[
            'Our Story', 'Locations', 'Fresh Bread', 'Pastries', 'Gift Boxes',
            'Catering', 'Wholesale', 'Recipes', 'Careers', 'Contact Us'
          ].map((text) => (
            <a
              key={text}
              href="#"
              className="hover:text-[#c3aa88] dark:hover:text-[#b3956d] transition-colors duration-300"
            >
              {text}
            </a>
          ))}
          <a
            href="#"
            className="text-[#c3aa88] font-semibold hover:text-[#b3956d] dark:text-[#c3aa88] dark:hover:text-[#b3956d] transition-colors duration-300"
          >
            Nutritional Information
          </a>
        </div>

        {/* 📱 Order & App */}
        <div className="text-center">
          <p className="font-bold mb-4 text-[#c3aa88] dark:text-black">Order Fresh Bread</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="bg-[#c3aa88] hover:bg-[#b3956d] text-black px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2">
              <i className="fa-solid fa-mobile-screen-button"></i>
              Order Online
            </a>
            <a href="#" className="bg-black hover:bg-gray-800 text-[#c3aa88] px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 border border-[#c3aa88]">
              <i className="fa-solid fa-phone"></i>
              Call to Order
            </a>
          </div>
        </div>

        {/* 🧑‍🍳 Bakery Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="font-bold dark:text-black text-[#c3aa88] mb-2">Our Breads</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['Sourdough', 'Baguettes', 'Whole Wheat', 'Rye', 'Ciabatta', 'Brioche', 'Focaccia'].map((item) => (
                <a key={item} href="#" className="hover:text-[#c3aa88] dark:hover:text-[#b3956d] transition-colors duration-300">{item}</a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold dark:text-black text-[#c3aa88] mb-2">Pastries & Desserts</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['Croissants', 'Danish', 'Muffins', 'Cookies', 'Cakes', 'Tarts', 'Macarons'].map((item) => (
                <a key={item} href="#" className="hover:text-[#c3aa88] dark:hover:text-[#b3956d] transition-colors duration-300">{item}</a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold dark:text-black text-[#c3aa88] mb-2">Bakery Services</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['Custom Cakes', 'Bread Subscriptions', 'Corporate Gifts', 'Wedding Orders', 'Catering', 'Baking Classes'].map((item) => (
                <a key={item} href="#" className="hover:text-[#c3aa88] dark:hover:text-[#b3956d] transition-colors duration-300">{item}</a>
              ))}
            </div>
          </div>
        </div>

        {/* 🏪 Store Info */}
        <div className="text-center text-xs text-gray-500 border-t border-[#c3aa88] dark:border-black pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="font-medium text-[#c3aa88] dark:text-black mb-1">Main Bakery</p>
              <p>123 Bread Street, Bakerstown</p>
              <p>Open: 6AM - 8PM Daily</p>
            </div>
            <div>
              <p className="font-medium text-[#c3aa88] dark:text-black mb-1">Contact</p>
              <p>(555) BREAD-NOW</p>
              <p>hello@breadverse.com</p>
            </div>
            <div>
              <p className="font-medium text-[#c3aa88] dark:text-black mb-1">Certifications</p>
              <p>Organic Certified</p>
              <p>Artisan Bakers Guild Member</p>
            </div>
          </div>
          <p>
            All our breads are baked fresh daily using traditional methods and locally sourced ingredients.
          </p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} <a href="#" className="underline text-[#c3aa88] hover:text-[#b3956d] dark:text-gray-700 dark:hover:text-[#b3956d] transition-colors duration-300">BreadVerse Bakery</a>. Fresh bread since 2024.
          </p>
          <p className="mt-2 text-[10px]">
            *Contains wheat, dairy, eggs, nuts. May contain other allergens. Please inform staff of allergies.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;