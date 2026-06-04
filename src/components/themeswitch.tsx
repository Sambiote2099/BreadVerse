"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Track if component is mounted to prevent hydration issues
  useEffect(() => setMounted(true), []);

  // Determine darkMode
  const darkMode = mounted && theme === "dark";

  // Toggle handler
  const toggleDarkMode = () => setTheme(darkMode ? "light" : "dark");

  return (
    <button
      onClick={toggleDarkMode}
      className=" relative w-[100px] scale-85 h-8 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors duration-500 focus:outline-none flex items-center justify-center"
    >
      <span
        className={`absolute z-10 text-[14px] font-medium transition-all duration-500 ${
          darkMode ? "text-white right-10 mt-[2px]" : "text-gray-800 right-[7px] mt-[2px]"
        }`}
      >
        {darkMode ? "🌙 Dark" : "Light ☀️"}
      </span>
      <div className="relative w-[100px] h-9 bg-slate-200 dark:bg-gray-700 rounded-full">
        <div
          className={`absolute top-0.5 mt-[5px] left-0.5 w-5 h-5 rounded-full shadow-md dark:bg-white dark:ring-2 dark:ring-black bg-yellow-100 ring-2 ring-amber-200 transform transition-transform duration-500 ${
            darkMode ? "translate-x-[68px]" : "translate-x-[6px]"
          }`}
        />
      </div>
    </button>
  );
}
