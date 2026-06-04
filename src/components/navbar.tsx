"use client";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./themeswitch";
import { ShoppingCart, User, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "./ui/cart/CartContext";
import CartSidebar from "./ui/cart/CartSidebar";
import { useSession, signOut } from "next-auth/react"; // Import NextAuth hooks

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Use NextAuth session hook
  const { data: session, status } = useSession();
  const { totalItems, openCart } = useCart();

  // Simplify auth state
  const isLoggedIn = status === "authenticated";
  const userData = session?.user;

  // Remove old useEffect and checkAuthStatus function entirely
  // NextAuth handles session state automatically

  const handleLogout = async () => {
    try {
      // Use NextAuth signOut instead of custom API
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });
      
      // Close mobile menu if open
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Show loading state for auth check
  if (status === "loading") {
    return (
      <nav className="flex fixed transition-colors duration-1000 top-0 left-0 text-white dark:text-[#c3aa88] w-full opacity-95 z-50 justify-between items-center p-4 bg-[#c3a579] dark:bg-[#1c1c1c] shadow-lg">
        <span className="absolute left-0 right-0 h-px bottom-1.5 bg-white dark:bg-[#c3aa88]" />
        <div className="w-full flex justify-center">
          <div className="animate-pulse bg-white/20 h-8 w-32 rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="flex fixed transition-colors duration-1000 top-0 left-0 text-white dark:text-[#c3aa88] w-full opacity-95 z-50 justify-between items-center px-3 sm:px-4 py-3 bg-[#c3a579] dark:bg-[#1c1c1c] shadow-lg">
        <span className="absolute left-0 right-0 h-px bottom-1.5 bg-white dark:bg-[#c3aa88]" />
        
        {/* Logo */}
        <Link href="/" className="flex items-center z-50">
          <Image
            src="https://res.cloudinary.com/diasvvkil/image/upload/v1769179214/logo-light-transparent_pwjilr.png"
            alt="BreadVerse"
            width={160}
            height={40}
            className="block dark:hidden w-28 sm:w-40"
            priority
          />
          <Image
            src="https://res.cloudinary.com/diasvvkil/image/upload/v1769179214/logo-dark-transparent_lylkxv.png"
            alt="BreadVerse"
            width={160}
            height={40}
            className="hidden dark:block w-28 sm:w-40"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          {/* Show Admin Panel only for admin users */}
          {isLoggedIn && userData?.role === "admin" && (
            <Link 
              className="hover:text-black dark:hover:text-[#91b5b5] transition-colors flex items-center gap-1" 
              href="/admin-panel" 
              scroll={true}
            >
              Admin Panel
            </Link>
          )}
          <Link className="hover:text-black dark:hover:text-[#91b5b5] transition-colors" href="/products" scroll={true}>Products</Link>
          <Link className="hover:text-black dark:hover:text-[#91b5b5] transition-colors" href="/gift-box" scroll={true}>Gift Box</Link>
          {isLoggedIn && (
            <Link 
              className="hover:text-black dark:hover:text-[#91b5b5] transition-colors flex items-center gap-1" 
              href="/favourites" 
              scroll={true}
            >
             Favourites
            </Link>
          )}
          <Link className="hover:text-black dark:hover:text-[#91b5b5] transition-colors" href="/location" scroll={true}>Location/Contact</Link>
          <Link className="hover:text-black dark:hover:text-[#91b5b5] transition-colors" href="/about" scroll={true}>About</Link>
          
          {/* Icons Section */}
          <div className="flex items-center gap-4 ml-4">
            {/* Cart Icon with Badge */}
            <button 
              onClick={openCart}
              className="relative group"
              aria-label="Open cart"
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-white dark:text-[#c3aa88] group-hover:text-black dark:group-hover:text-[#91b5b5] transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Cart ({totalItems})
              </span>
            </button>

            {/* Profile Icon - Only show if logged in */}
            {isLoggedIn && userData && (
              <Link 
                href={`/profiles/${userData.id}`} 
                className="group relative"
                title={`Profile: ${userData.name || userData.email}`}
              >
                <User className="h-6 w-6 text-white dark:text-[#c3aa88] group-hover:text-black dark:group-hover:text-[#91b5b5] transition-colors" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {userData.name || userData.email?.split('@')[0]}
                </span>
              </Link>
            )}

            {/* Login/Logout Button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="py-[3px] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-700 dark:bg-[#c3aa88] bg-white text-[#c3a579] dark:text-black rounded-4xl w-24 font-semibold text-center flex items-center justify-center gap-1.5"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <Link 
                href="/login" 
                className="py-[3px] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-700 dark:bg-[#c3aa88] bg-white text-[#c3a579] rounded-4xl w-16 font-semibold text-center dark:text-black"
              >
                Login
              </Link>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-4">
          {/* Cart Icon (Mobile) */}
          <button 
            onClick={openCart}
            className="relative"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>

          {/* Profile Icon (Mobile) - Only show if logged in */}
          {isLoggedIn && userData && (
            <Link 
              href={`/profiles/${userData.id}`} 
              className="relative"
              title={`Profile: ${userData.name || userData.email}`}
            >
              <User className="h-6 w-6" />
            </Link>
          )}

          {/* Theme Toggle (Mobile) */}
          <ThemeToggle />

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="hover:text-black dark:hover:text-[#91b5b5] text-white dark:text-[#c3aa88] focus:outline-none z-50 hover:scale-105 transition-all duration-700"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Mobile Menu Sidebar */}
        <div className={`fixed right-0 opacity-90 top-0 h-full w-[min(256px,85vw)] bg-[#c3a579] dark:bg-[#1c1c1c] shadow-2xl transform transition-transform duration-700 z-40 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full pt-20 px-6">
            {/* User Info if logged in */}
            {isLoggedIn && userData && (
              <div className="mb-6 pb-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{userData.name || "User"}</p>
                    <p className="text-xs text-white/70">{userData.email}</p>
                    {userData.role === "admin" && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-4">
              {/* Show Admin Panel only for admin users */}
              {isLoggedIn && userData?.role === "admin" && (
                <Link 
                  href="/admin-panel" 
                  className="flex items-center gap-2 text-white dark:text-[#c3aa88] hover:text-black dark:hover:text-[#91b5b5] transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              
              <Link 
                href="/products" 
                className="text-white dark:text-[#c3aa88] hover:text-black dark:hover:text-[#91b5b5] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/gift-box" 
                className="text-white dark:text-[#c3aa88] hover:text-black dark:hover:text-[#91b5b5] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Gift Box
              </Link>
              <Link 
                href="/location" 
                className="text-white dark:text-[#c3aa88] hover:text-black dark:hover:text-[#91b5b5] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Location/Contact
              </Link>
              <Link 
                href="/about" 
                className="text-white dark:text-[#c3aa88] hover:text-black dark:hover:text-[#91b5b5] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              {/* Favourites link - Only show if logged in */}
              {isLoggedIn && (
                <Link 
                  href="/favourites" 
                  className="text-white dark:text-[#c3aa88] hover:text-black dark:hover:text-[#91b5b5] transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Favourites
                </Link>
              )}
              
              {/* Profile link - Only show if logged in */}
              {isLoggedIn && userData && (
                <Link 
                  href={`/profiles/${userData.id}`} 
                  className="text-white dark:text-[#c3aa88] hover:text-black dark:hover:text-[#91b5b5] transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              )}

              {/* Login/Logout Button in Mobile Menu */}
              <div className="mt-4 pt-4 border-t border-white/20">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                ) : (
                  <Link 
                    href="/login" 
                    className="block w-full py-2 px-4 bg-white dark:bg-[#c3aa88] text-[#c3a579] dark:text-black hover:bg-gray-100 dark:hover:bg-white rounded-lg font-medium text-center transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Click outside to close */}
        <div 
          className="h-full w-full"
          onClick={() => setIsMenuOpen(false)}
        />
      </div>

      {/* Cart Sidebar */}
      <CartSidebar />
    </>
  );
}