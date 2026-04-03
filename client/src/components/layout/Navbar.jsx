import React, { useState } from "react";
import { Heart, ShoppingCart, Menu, Search, X } from "lucide-react";
import Dropdown from "../shared/Dropdown";
import { shopCategories } from "../../data/catalogData";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount, openCart } = useCart();

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-[100]">
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
          <Link
            to="/"
            className="text-2xl font-black text-blue-600 tracking-tight shrink-0"
          >
            SHOP<span className="text-gray-900">STREAM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-800">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>

            <Dropdown
              label="Categories"
              triggerClassName="py-3 text-sm font-semibold"
              menuClassName="left-1/2 min-w-[240px] -translate-x-1/2"
            >
              <div className="flex flex-col gap-1">
                {shopCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </Dropdown>

            <a
              href="#"
              className="rounded-full bg-red-50 px-3 py-1.5 text-red-600 hover:bg-red-100 transition-colors"
            >
              Deals
            </a>
            <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
              <Search size={16} />
              Search
            </button>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button className="p-2 hover:bg-gray-100 rounded-full hidden sm:flex">
              <Heart size={22} />
            </button>

            {/* Cart button */}
            <button
              onClick={openCart}
              className="p-2 hover:bg-gray-100 rounded-full relative transition-colors"
              aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 leading-none shadow-sm">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

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
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/profile"
                  className="px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-100 rounded"
                >
                  {user?.name || user?.email?.split("@")[0] || "Profile"}
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
                <Link
                  to="/"
                  className="block font-medium text-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <details className="group">
                  <summary className="flex justify-between items-center font-medium text-lg cursor-pointer list-none">
                    Categories
                    <Menu
                      size={16}
                      className="group-open:rotate-90 transition-transform"
                    />
                  </summary>
                  <div className="mt-3 space-y-4">
                    {shopCategories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        className="block rounded-xl border border-gray-100 p-3"
                        onClick={() => setMobileOpen(false)}
                      >
                        <p className="font-semibold text-gray-900">
                          {category.name}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {category.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </details>
              </li>
              <li>
                <a href="#" className="block font-medium text-lg text-red-600">
                  Deals
                </a>
              </li>
              <li>
                <button
                  className="flex items-center gap-2 font-medium text-lg"
                  onClick={() => {
                    setMobileOpen(false);
                    openCart();
                  }}
                >
                  <ShoppingCart size={18} />
                  Cart {itemCount > 0 && `(${itemCount})`}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
