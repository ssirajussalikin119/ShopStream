import React, { useState } from "react";
import { Search, Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import Dropdown from "../shared/Dropdown"; // Using the reusable dropdown
import { megaMenu } from "../../data/menuData";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-[100]">
      {/* --- UPPER NAVBAR (All Devices) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 -ml-2 text-gray-600"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={26} />
          </button>

          {/* Logo */}
          <div className="text-2xl font-black text-blue-600 tracking-tight shrink-0">
            SHOP<span className="text-gray-900">STREAM</span>
          </div>

          {/* Search Bar (Hidden on Mobile, visible on Tablet/Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1 sm:gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full hidden sm:flex">
              <Heart size={22} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <ShoppingCart size={22} />
              <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-bold px-1 rounded-full">
                3
              </span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <User size={22} />
              {!isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-full"
                  >
                    <User size={22} />
                    <span className="hidden sm:inline text-sm font-medium">
                      {user?.email?.split("@")[0] || "Profile"}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded"
                  >
                    Logout
                  </button>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Only visible on smallest screens) */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-100 rounded-lg py-2 pl-9 pr-4 text-sm outline-none"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
          </div>
        </div>
      </div>

      {/* --- LOWER NAVBAR (Desktop Only) --- */}
      <nav className="hidden lg:flex border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          <a
            href="#"
            className="py-3 text-sm font-semibold hover:text-blue-600 transition-colors"
          >
            Home
          </a>

          {megaMenu.map((menu, idx) => (
            <Dropdown
              key={idx}
              label={menu.label}
              triggerClassName="py-3 text-sm font-semibold"
              menuClassName="min-w-[200px] left-0"
            >
              {menu.subcategories.map((sub, i) => (
                <div key={i} className="group/item">
                  <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {sub.label}
                  </p>
                  {sub.items.map((item, j) => (
                    <a
                      key={j}
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              ))}
            </Dropdown>
          ))}

          <a
            href="#"
            className="py-3 text-sm font-semibold hover:text-blue-600"
          >
            Deals
          </a>
          <a
            href="#"
            className="py-3 text-sm font-semibold hover:text-blue-600"
          >
            Sell
          </a>
        </div>
      </nav>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <div
        className={`fixed inset-0 z-[110] lg:hidden transition-all ${mobileOpen ? "visible" : "invisible"}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer Content */}
        <div
          className={`absolute top-0 left-0 w-72 h-full bg-white shadow-2xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <span className="font-bold text-lg">Menu</span>
            <button onClick={() => setMobileOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-70px)] p-4">
            <ul className="space-y-4">
              <li>
                <a href="#" className="block font-medium text-lg">
                  Home
                </a>
              </li>
              {megaMenu.map((menu, idx) => (
                <li key={idx}>
                  <details className="group">
                    <summary className="flex justify-between items-center font-medium text-lg cursor-pointer list-none">
                      {menu.label}
                      <Menu
                        size={16}
                        className="group-open:rotate-90 transition-transform"
                      />
                    </summary>
                    <div className="pl-4 mt-2 space-y-2 border-l-2 border-gray-100">
                      {menu.subcategories.map((sub, i) => (
                        <div key={i} className="py-1">
                          <p className="text-sm font-bold text-blue-600">
                            {sub.label}
                          </p>
                          {sub.items.map((item, k) => (
                            <a
                              key={k}
                              href="#"
                              className="block text-gray-500 py-1 text-sm"
                            >
                              {item}
                            </a>
                          ))}
                        </div>
                      ))}
                    </div>
                  </details>
                </li>
              ))}
              <li>
                <a href="#" className="block font-medium text-lg">
                  Deals
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
