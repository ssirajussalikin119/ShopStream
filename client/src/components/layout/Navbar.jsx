import React, { useState } from "react";
import { Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  // TODO: Replace with cart context when cart feature is implemented
  const cartCount = 0;

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
          <Link
            to="/"
            className="text-2xl font-black text-blue-600 tracking-tight shrink-0"
          >
            SHOP<span className="text-gray-900">STREAM</span>
          </Link>

          {/* Center Nav (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 ml-8">
            <Link
              to="/"
              className="text-sm font-semibold hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <a
              href="#"
              className="text-sm font-semibold hover:text-blue-600 transition-colors"
            >
              Categories
            </a>
            <a
              href="#"
              className="text-sm font-semibold hover:text-blue-600 transition-colors"
            >
              Deals
            </a>
            <Link
              to="/contact"
              className="text-sm font-semibold hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1 sm:gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full hidden sm:flex">
              <Heart size={22} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-bold px-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Section - Conditional rendering */}
            <div className="flex items-center gap-2 sm:gap-3">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-full transition"
                    title={user?.email}
                  >
                    <User size={22} />
                    <span className="hidden sm:inline text-sm font-medium">
                      {user?.name || user?.email?.split("@")[0] || "Profile"}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
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
                  onClick={() => setMobileOpen(false)}
                  className="block font-medium text-lg hover:text-blue-600 transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="block font-medium text-lg hover:text-blue-600 transition"
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block font-medium text-lg hover:text-blue-600 transition"
                >
                  Deals
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block font-medium text-lg hover:text-blue-600 transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
