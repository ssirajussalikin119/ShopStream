import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Heart, Search, Star } from "lucide-react";
import Container from "../components/layout/Container/Container";
import { productAPI } from "../utils/api";
import AddToCartButton from "../components/cart/AddToCartButton";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);

const SearchPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";

  const [products, setProducts] = useState([]);
  const [favourites, setFavourites] = useState(() => {
    const saved = localStorage.getItem("favourites");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
  setLoading(true);

  try {
    const response = await productAPI.getByCategory({});
    if (!isMounted) return;

    setProducts(response.products || []);
    setError("");
  } catch (apiError) {
    if (!isMounted) return;

    setError(apiError?.message || "Unable to load products.");
  } finally {
    if (isMounted) {
      setLoading(false);
    }
  }
};

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.description,
        product.brand,
        product.subcategory,
        product.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [products, query]);

  const toggleFavourite = (product) => {
    let updated;

    const exists = favourites.some((item) => item._id === product._id);

    if (exists) {
      updated = favourites.filter((item) => item._id !== product._id);
    } else {
      updated = [...favourites, product];
    }

    setFavourites(updated);
    localStorage.setItem("favourites", JSON.stringify(updated));
    window.dispatchEvent(new Event("favouritesUpdated"));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="mx-auto px-4 sm:px-6">
        <div className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Search results for</p>
              <h1 className="text-3xl font-black text-gray-900">
                "{query || "No keyword"}"
              </h1>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse bg-gray-200" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-5 w-4/5 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && !error && !query.trim() ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">
              Enter a search keyword
            </h3>
            <p className="mt-2 text-gray-500">
              Use the navbar search box to find products.
            </p>
          </div>
        ) : null}

        {!loading && !error && query.trim() && filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">
              No products found for "{query}"
            </h3>
            <p className="mt-2 text-gray-500">
              Try another product name, brand, or category keyword.
            </p>
          </div>
        ) : null}

        {!loading && !error && filteredProducts.length > 0 ? (
          <>
            <p className="mb-4 text-sm font-medium text-gray-500">
              {filteredProducts.length} products found
            </p>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />

                    <button
                      onClick={() => toggleFavourite(product)}
                      className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-sm hover:bg-red-50"
                      aria-label="Toggle favourite"
                    >
                      <Heart
                        size={18}
                        className={
                          favourites.some((item) => item._id === product._id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }
                      />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                        {product.brand}
                      </p>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                        {product.subcategory}
                      </span>
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="mb-4 text-sm leading-6 text-gray-500">
                      {product.description}
                    </p>

                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                      <Star
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span className="font-semibold text-gray-900">
                        {product.rating?.toFixed(1) || "0.0"}
                      </span>
                      <span>({product.reviewCount || 0} reviews)</span>
                    </div>

                    <div className="mb-5 flex items-end gap-3">
                      <span className="text-2xl font-black text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span
                        className={`text-sm font-semibold ${
                          product.inStock ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {product.inStock
                          ? `${product.stockCount} in stock`
                          : "Out of stock"}
                      </span>
                      <AddToCartButton
                        productId={product._id}
                        disabled={!product.inStock}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </Container>
    </main>
  );
};

export default SearchPage;