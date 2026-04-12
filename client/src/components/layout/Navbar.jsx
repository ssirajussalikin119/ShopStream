import React, { useState } from "react";
import {
  Heart,
  ShoppingCart,
  Menu,
  Search,
  X,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import Dropdown from "../shared/Dropdown";
import { shopCategories } from "../../data/catalogData";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const canAccessSellerDashboard =
    user?.role === "seller" ||
    user?.accountType === "seller" ||
    user?.accountType === "both";
  const profileLinkPath = canAccessSellerDashboard
    ? "/seller/dashboard"
    : "/profile";

  const handleSearchSubmit = (e, keyword) => {
    e.preventDefault();
    const q = (keyword ?? searchInput).trim();
    if (!q) return;
    setMobileOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    const q = mobileSearch.trim();
    if (!q) return;
    setMobileOpen(false);
    setMobileSearch("");
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 -ml-2 text-gray-600"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
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

            <Link
              to="/deals"
              className="rounded-full bg-red-50 px-3 py-1.5 text-red-600 hover:bg-red-100 transition-colors"
            >
              Deals
            </Link>

            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products"
                  className="w-44 rounded-full border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-sm font-medium text-gray-700 outline-none focus:border-blue-400"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <Link
              to="/favourites"
              className="p-2 hover:bg-gray-100 rounded-full hidden sm:flex"
              aria-label="View favourites"
            >
              <Heart size={22} />
            </Link>

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
              <div className="hidden sm:flex items-center gap-2">
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
              <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                {canAccessSellerDashboard && (
                  <Link
                    to="/seller/dashboard"
                    className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
                  >
                    Seller
                  </Link>
                )}
                <Link
                  to="/orders"
                  className="px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-100 rounded"
                >
                  Orders
                </Link>
                <Link
                  to={profileLinkPath}
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

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      <div
        className={`fixed inset-0 z-[110] lg:hidden transition-all ${mobileOpen ? "visible" : "invisible"}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 left-0 w-72 h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Drawer header */}
          <div className="p-4 border-b flex justify-between items-center">
            <span className="font-black text-blue-600 text-xl">
              SHOP<span className="text-gray-900">STREAM</span>
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile search */}
          <div className="p-4 border-b">
            <form onSubmit={handleMobileSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-full border border-gray-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-3 py-2 rounded-full text-xs font-bold hover:bg-blue-700"
              >
                Go
              </button>
            </form>
          </div>

          {/* Drawer nav */}
          <div className="overflow-y-auto flex-1 p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <details className="group">
                  <summary className="flex justify-between items-center px-3 py-3 rounded-xl font-semibold text-gray-800 hover:bg-blue-50 cursor-pointer list-none">
                    Categories
                    <Menu
                      size={14}
                      className="group-open:rotate-90 transition-transform"
                    />
                  </summary>
                  <div className="mt-1 ml-3 space-y-1">
                    {shopCategories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </details>
              </li>
              <li>
                <Link
                  to="/deals"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  🔥 Deals
                </Link>
              </li>
              <li>
                <Link
                  to="/favourites"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <Heart size={17} /> Favourites
                </Link>
              </li>
              <li>
                <button
                  className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors w-full text-left"
                  onClick={() => {
                    setMobileOpen(false);
                    openCart();
                  }}
                >
                  <ShoppingCart size={17} />
                  Cart{" "}
                  {itemCount > 0 && (
                    <span className="ml-auto bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                      {itemCount}
                    </span>
                  )}
                </button>
              </li>

              <li className="border-t border-gray-100 pt-3 mt-3">
                {!isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <User size={17} /> Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link
                      to={profileLinkPath}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-gray-800 hover:bg-blue-50 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <User size={17} /> {user?.name || "Profile"}
                    </Link>
                    {canAccessSellerDashboard && (
                      <Link
                        to="/seller/dashboard"
                        className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        <LayoutDashboard size={17} /> Seller Dashboard
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-gray-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      📦 Order History
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut size={17} /> Logout
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
