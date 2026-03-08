import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const Dropdown = ({
  label,
  children,
  triggerClassName = "",
  menuClassName = "w-64", // Default width
  variant = "hover",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (variant === "click") {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [variant]);

  const handlers =
    variant === "hover"
      ? {
          onMouseEnter: () => setIsOpen(true),
          onMouseLeave: () => setIsOpen(false),
        }
      : { onClick: () => setIsOpen(!isOpen) };

  return (
    <div className="relative inline-block" ref={dropdownRef} {...handlers}>
      {/* Trigger */}
      <div
        className={`flex items-center gap-1 cursor-pointer select-none transition-colors hover:text-blue-600 ${triggerClassName}`}
      >
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown Menu Container */}
      <div
        className={`
          absolute z-50 mt-1 p-2 bg-white border border-gray-200 shadow-md rounded-md transition-all duration-200
          ${isOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-2 invisible"}
          ${menuClassName}
        `}
      >
        <div className="flex flex-col gap-1">{children}</div>
      </div>
    </div>
  );
};

export default Dropdown;
