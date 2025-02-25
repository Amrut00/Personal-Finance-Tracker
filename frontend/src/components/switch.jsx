import React, { useState, useEffect } from "react";
import { IoMoonOutline } from "react-icons/io5";
import { LuSunMoon } from "react-icons/lu";
import useStore from "../store";

const ThemeSwitch = () => {
  const { theme, setTheme } = useStore((state) => state);
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  useEffect(() => {
    // Apply theme on initial load
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <button onClick={toggleTheme} className="outline-none">
      {isDarkMode ? (
        <LuSunMoon size={26} className="text-gray-500" />
      ) : (
        <IoMoonOutline size={26} className="" />
      )}
    </button>
  );
};

export default ThemeSwitch;
