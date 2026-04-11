import React, { useEffect, useState } from "react";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container/Container";
import { productAPI } from "../utils/api";
import AddToCartButton from "../components/cart/AddToCartButton";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(price);

const FavouritesPage = () => {
  const [favouriteIds, setFavouriteIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavourites = () => {
    const saved = localStorage.getItem("favourites");
    const ids = saved ? JSON.parse(saved) : [];
    setFavouriteIds(ids);
    if (ids.length === 0) { setLoading(false); return; }
    productAPI.getByIds(ids)
      .then((list) => setProducts(list || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFavourites();
    const onUpdate = () => loadFavourites();
    window.addEventListener("favouritesUpdated", onUpdate);
    return () => window.removeEventListener("favouritesUpdated", onUpdate);
  }, []);

  const removeFavourite = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = favouriteIds.filter((x) => x !== id);
    setFavouriteIds(updated);
    setProducts((prev) => prev.filter((p) => p._id !== id));
    localStorage.setItem("favourites", JSON.stringify(updated));
    window.dispatchEvent(new Event("favouritesUpdated"));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Heart size={20} className="text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Your Favourites</h1>
              {!loading && products.length > 0 && (
                <p className="text-sm text-gray-500">{products.length} saved item{products.length !== 1 ? "s" : ""}</p>
              )}
            </div>
          </div>
          {!loading && products.length > 0 && (
            <Link to="/" className="text-sm text-blue-600 hover:underline font-semibold">
              Keep shopping →
            </Link>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="w-full h-56 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-10 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Heart size={36} className="text-red-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No favourites yet</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              Browse products and tap the ❤️ icon to save them here for later.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              <ShoppingBag size={18} /> Start Shopping
            </Link>
          </div>
        )}

        {/* Product grid */}
        {!loading && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const discount = product.compareAtPrice && product.compareAtPrice > product.price
                ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                : null;
              return (
                // ✅ FIXED: entire card is a Link — clicking anywhere navigates to product detail
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block group"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-56 bg-gray-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {discount && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                        -{discount}% OFF
                      </span>
                    )}
                    {/* Remove from favourites — stops link navigation */}
                    <button
                      onClick={(e) => removeFavourite(e, product._id)}
                      className="absolute top-3 right-3 bg-white p-2.5 rounded-full shadow-md hover:scale-110 transition-transform"
                      aria-label="Remove from favourites"
                    >
                      <Heart className="fill-red-500 text-red-500" size={17} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">{product.brand}</p>
                    <h3 className="font-bold text-gray-900 text-base line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-3">{product.description}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <Star size={13} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-800">{product.rating?.toFixed(1) || "0.0"}</span>
                      <span className="text-xs text-gray-400">({product.reviewCount || 0} reviews)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-2 mb-4">
                      <span className="font-black text-xl text-gray-900">{formatPrice(product.price)}</span>
                      {product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through mb-0.5">{formatPrice(product.compareAtPrice)}</span>
                      )}
                    </div>

                    {/* Cart button — stops link navigation */}
                    <div
                      className="flex items-center gap-3"
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="flex-1">
                        <AddToCartButton productId={product._id} disabled={!product.inStock} size="default" />
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-full ${product.inStock ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {product.inStock ? "In stock" : "Out of stock"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
};

export default FavouritesPage;
