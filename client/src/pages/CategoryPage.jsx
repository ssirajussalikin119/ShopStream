import React, { useEffect, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { ChevronDown, SlidersHorizontal, Star, Heart, X } from "lucide-react";
import Container from "../components/layout/Container/Container";
import { shopCategories } from "../data/catalogData";
import { productAPI } from "../utils/api";
import AddToCartButton from "../components/cart/AddToCartButton";
import SaveForLaterButton from "../components/wishlist/SaveForLaterButton";
import PaymentModal from "../components/PaymentModal";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
];

const PRICE_OPTIONS = [
  { value: "all", label: "All prices" },
  { value: "under200", label: "Under $200" },
  { value: "between200and500", label: "$200 – $500" },
  { value: "between500and1000", label: "$500 – $1,000" },
  { value: "above1000", label: "$1,000 & above" },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);

const CategoryPage = () => {
  const { slug } = useParams();
  const category = shopCategories.find((item) => item.slug === slug);

  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    brands: [],
    subcategories: [],
    priceRange: { minPrice: 0, maxPrice: 0 },
  });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    product: null,
  });

  // Favourites state
  const [favourites, setFavourites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favourites") || "[]");
    } catch {
      return [];
    }
  });

  const toggleFavourite = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = favourites.includes(id)
      ? favourites.filter((x) => x !== id)
      : [...favourites, id];
    setFavourites(updated);
    localStorage.setItem("favourites", JSON.stringify(updated));
    window.dispatchEvent(new Event("favouritesUpdated"));
  };

  useEffect(() => {
    setSelectedBrands([]);
    setSelectedSubcategories([]);
    setSelectedPriceRange("all");
    setSortBy("featured");
  }, [slug]);

  useEffect(() => {
    if (!category) return;
    let isMounted = true;
    const pricePresetMap = {
      all: {},
      under200: { minPrice: 0, maxPrice: 200 },
      between200and500: { minPrice: 200, maxPrice: 500 },
      between500and1000: { minPrice: 500, maxPrice: 1000 },
      above1000: { minPrice: 1000 },
    };
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await productAPI.getByCategory({
          category: slug,
          sort: sortBy,
          ...(selectedBrands.length > 0
            ? { brand: selectedBrands.join(",") }
            : {}),
          ...(selectedSubcategories.length > 0
            ? { subcategory: selectedSubcategories.join(",") }
            : {}),
          ...pricePresetMap[selectedPriceRange],
        });
        if (!isMounted) return;
        setProducts(response.products || []);
        setFilters(
          response.filters || {
            brands: [],
            subcategories: [],
            priceRange: { minPrice: 0, maxPrice: 0 },
          },
        );
        setError("");
      } catch (apiError) {
        if (!isMounted) return;
        setError(apiError?.message || "Unable to load category products.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [
    category,
    selectedBrands,
    selectedPriceRange,
    selectedSubcategories,
    slug,
    sortBy,
  ]);

  if (!category) return <Navigate to="/" replace />;

  const toggleSelection = (value, selectedValues, setSelectedValues) => {
    setSelectedValues(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value],
    );
  };

  const activeFilterCount =
    selectedBrands.length +
    selectedSubcategories.length +
    (selectedPriceRange !== "all" ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            onClick={() => {
              setSelectedBrands([]);
              setSelectedSubcategories([]);
              setSelectedPriceRange("all");
              setSortBy("featured");
            }}
          >
            Reset all
          </button>
        )}
      </div>

      {/* Price */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-700">
          Price
        </h3>
        <div className="space-y-2.5">
          {PRICE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer group"
            >
              <input
                type="radio"
                name="price-range"
                checked={selectedPriceRange === option.value}
                onChange={() => setSelectedPriceRange(option.value)}
                className="accent-blue-600"
              />
              <span className="group-hover:text-blue-600 transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Range: {formatPrice(filters.priceRange.minPrice || 0)} –{" "}
          {formatPrice(filters.priceRange.maxPrice || 0)}
        </p>
      </div>

      {/* Brands */}
      {filters.brands.length > 0 && (
        <div className="border-t border-gray-100 pt-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-700">
            Brand
          </h3>
          <div className="space-y-2.5">
            {filters.brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() =>
                    toggleSelection(brand, selectedBrands, setSelectedBrands)
                  }
                  className="accent-blue-600"
                />
                <span className="group-hover:text-blue-600 transition-colors">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Subcategories */}
      {filters.subcategories.length > 0 && (
        <div className="border-t border-gray-100 pt-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-700">
            Product Type
          </h3>
          <div className="space-y-2.5">
            {filters.subcategories.map((subcategory) => (
              <label
                key={subcategory}
                className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedSubcategories.includes(subcategory)}
                  onChange={() =>
                    toggleSelection(
                      subcategory,
                      selectedSubcategories,
                      setSelectedSubcategories,
                    )
                  }
                  className="accent-blue-600"
                />
                <span className="group-hover:text-blue-600 transition-colors">
                  {subcategory}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <Container className="mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-semibold">{category.name}</span>
        </div>

        {/* Category banner */}
        <div className="relative rounded-3xl overflow-hidden mb-8 h-40 sm:h-52">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                {category.name}
              </h1>
              <p className="text-white/80 text-sm mt-1 max-w-xs">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* ── Desktop Sidebar ─────────────────────────── */}
          <aside className="hidden lg:block h-fit rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <FilterPanel />
          </aside>

          {/* ── Main content ────────────────────────────── */}
          <div>
            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  <SlidersHorizontal size={15} />
                  Filters{" "}
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {loading
                      ? "Loading..."
                      : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
                  </p>
                  <h2 className="text-xl font-black text-gray-900">
                    {category.name}
                  </h2>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 self-start sm:self-center">
                Sort by
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none rounded-full border border-gray-200 bg-gray-50 py-2 pl-4 pr-10 text-sm outline-none focus:border-blue-400"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </label>
            </div>

            {error && (
              <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 mb-6">
                {error}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
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
            )}

            {/* Empty state */}
            {!loading && !error && products.length === 0 && (
              <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
                <SlidersHorizontal
                  size={40}
                  className="mx-auto mb-4 text-gray-200"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No products match these filters
                </h3>
                <p className="text-gray-500 mb-5">
                  Try changing the brand, price range, or product type.
                </p>
                <button
                  onClick={() => {
                    setSelectedBrands([]);
                    setSelectedSubcategories([]);
                    setSelectedPriceRange("all");
                  }}
                  className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Product grid */}
            {!loading && !error && products.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const discount =
                    product.compareAtPrice &&
                    product.compareAtPrice > product.price
                      ? Math.round(
                          ((product.compareAtPrice - product.price) /
                            product.compareAtPrice) *
                            100,
                        )
                      : null;
                  return (
                    // ✅ FIXED: entire card is a Link to product detail
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg block group"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {discount && (
                          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                            -{discount}% OFF
                          </span>
                        )}
                        {/* Favourite button — stops propagation so it doesn't navigate */}
                        <button
                          onClick={(e) => toggleFavourite(e, product._id)}
                          className="absolute right-3 top-3 bg-white p-2 rounded-full shadow hover:scale-110 transition-transform"
                          aria-label="Toggle favourite"
                        >
                          <Heart
                            size={16}
                            className={
                              favourites.includes(product._id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400"
                            }
                          />
                        </button>
                      </div>

                      <div className="p-5">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                            {product.brand}
                          </p>
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                            {product.subcategory}
                          </span>
                        </div>

                        <h3 className="mb-2 text-base font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>

                        <p className="mb-3 text-sm leading-6 text-gray-500 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="mb-3 flex items-center gap-1.5 text-sm">
                          <Star
                            size={14}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          <span className="font-semibold text-gray-900">
                            {product.rating?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-gray-400">
                            ({product.reviewCount || 0})
                          </span>
                        </div>

                        <div className="mb-4 flex items-end gap-2">
                          <span className="text-2xl font-black text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice > product.price && (
                            <span className="text-sm font-medium text-gray-400 line-through mb-0.5">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>

                        <div
                          className="flex items-center justify-between gap-3"
                          onClick={(e) => e.preventDefault()} // stop link navigation for action buttons
                        >
                          <span
                            className={`text-sm font-semibold ${product.inStock ? "text-green-600" : "text-red-500"}`}
                          >
                            {product.inStock
                              ? `${product.stockCount} in stock`
                              : "Out of stock"}
                          </span>
                          <div className="flex items-center gap-2">
                            <SaveForLaterButton productId={product._id} />
                            <AddToCartButton
                              productId={product._id}
                              disabled={!product.inStock}
                            />
                            <button
                              onClick={() =>
                                setPaymentModal({ open: true, product })
                              }
                              className="inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 px-4 py-2 text-sm gap-1.5 bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </Container>

      {/* ── Mobile filter drawer ─────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition"
            >
              Show {products.length} Results
            </button>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={paymentModal.open}
        product={paymentModal.product}
        onClose={() => setPaymentModal({ open: false, product: null })}
      />
    </main>
  );
};

export default CategoryPage;
