import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
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

  useEffect(() => {
    const saved = localStorage.getItem("favourites");
    const ids = saved ? JSON.parse(saved) : [];
    setFavouriteIds(ids);

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    productAPI.getByIds(ids)
      .then((list) => setProducts(list))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const removeFavourite = (id) => {
    const updated = favouriteIds.filter((x) => x !== id);
    setFavouriteIds(updated);
    setProducts((prev) => prev.filter((p) => p._id !== id));
    localStorage.setItem("favourites", JSON.stringify(updated));
    window.dispatchEvent(new Event("favouritesUpdated"));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container>
        <h2 className="text-3xl font-bold mb-6">Your Favourites ❤️</h2>

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Heart size={56} className="mx-auto mb-4 text-gray-200" />
            <p className="text-xl font-bold text-gray-900 mb-2">No favourites yet</p>
            <p className="text-gray-500 mb-6">Browse products and tap the heart icon to save them here.</p>
            <Link to="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                <div className="relative">
                  <Link to={`/product/${product._id}`}>
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition" />
                  </Link>
                  <button
                    onClick={() => removeFavourite(product._id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:scale-110 transition"
                  >
                    <Heart className="text-red-500 fill-red-500" size={18} />
                  </button>
                  {product.compareAtPrice > product.price && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <p className="text-xs font-bold text-blue-600 uppercase">{product.brand}</p>
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-bold text-gray-900 hover:text-blue-600 transition mt-0.5">{product.name}</h3>
                  </Link>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div>
                    <span className="font-bold text-lg text-gray-900">{formatPrice(product.price)}</span>
                    {product.compareAtPrice > product.price && (
                      <span className="block text-xs text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                    )}
                  </div>
                  <AddToCartButton productId={product._id} disabled={!product.inStock} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
};

export default FavouritesPage;
