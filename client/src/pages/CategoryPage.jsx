import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import Container from "../components/layout/Container/Container";
import { shopCategories } from "../data/catalogData";
import { productAPI } from "../utils/api";
import AddToCartButton from "../components/cart/AddToCartButton";

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
  { value: "between200and500", label: "$200 - $500" },
  { value: "between500and1000", label: "$500 - $1,000" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedBrands([]);
    setSelectedSubcategories([]);
    setSelectedPriceRange("all");
    setSortBy("featured");
    setSearchQuery("");
  }, [slug]);

  useEffect(() => {
    if (!category) {
      return undefined;
    }

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

        if (!isMounted) {
          return;
        }

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
        if (!isMounted) {
          return;
        }

        setError(apiError?.message || "Unable to load category products.");
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
  }, [
    category,
    selectedBrands,
    selectedPriceRange,
    selectedSubcategories,
    slug,
    sortBy,
  ]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.description,
        product.brand,
        product.subcategory,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [products, searchQuery]);

  if (!category) {
    return <Navigate to="/" replace />;
  }

  const toggleSelection = (value, selectedValues, setSelectedValues) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((item) => item !== value));
      return;
    }

    setSelectedValues([...selectedValues, value]);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="mx-auto px-4 sm:px-6">
        <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>
              <button
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                onClick={() => {
                  setSelectedBrands([]);
                  setSelectedSubcategories([]);
                  setSelectedPriceRange("all");
                  setSortBy("featured");
                  setSearchQuery("");
                }}
              >
                Reset
              </button>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-900">
                Price
              </h3>
              <div className="space-y-3">
                {PRICE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <input
                      type="radio"
                      name="price-range"
                      checked={selectedPriceRange === option.value}
                      onChange={() => setSelectedPriceRange(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Available range: {formatPrice(filters.priceRange.minPrice || 0)}{" "}
                - {formatPrice(filters.priceRange.maxPrice || 0)}
              </p>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-900">
                Brands
              </h3>
              <div className="space-y-3">
                {filters.brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() =>
                        toggleSelection(brand, selectedBrands, setSelectedBrands)
                      }
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-900">
                Product Type
              </h3>
              <div className="space-y-3">
                {filters.subcategories.map((subcategory) => (
                  <label
                    key={subcategory}
                    className="flex items-center gap-3 text-sm text-gray-700"
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
                    />
                    <span>{subcategory}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {loading
                      ? "Loading products..."
                      : `${filteredProducts.length} products found`}
                  </p>
                  <h2 className="text-2xl font-black text-gray-900">
                    {category.name}
                  </h2>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search this category..."
                      className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 outline-none sm:w-[260px]"
                    />
                  </div>

                  <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                    Sort by
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className="appearance-none rounded-full border border-gray-200 bg-gray-50 py-2 pl-4 pr-10 outline-none"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}

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

            {!loading && !error && products.length === 0 ? (
              <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">
                  No products match these filters
                </h3>
                <p className="mt-2 text-gray-500">
                  Try changing the brand, price range, or product type.
                </p>
              </div>
            ) : null}

            {!loading && !error && products.length > 0 && filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">
                  No products found for "{searchQuery}"
                </h3>
                <p className="mt-2 text-gray-500">
                  Try a different keyword in this category.
                </p>
              </div>
            ) : null}

            {!loading && !error && filteredProducts.length > 0 ? (
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
                      {product.compareAtPrice &&
                      product.compareAtPrice > product.price ? (
                        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-red-600 shadow-sm">
                          Save {formatPrice(product.compareAtPrice - product.price)}
                        </span>
                      ) : null}
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
                        {product.compareAtPrice ? (
                          <span className="text-sm font-medium text-gray-400 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        ) : null}
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
            ) : null}
          </div>
        </section>
      </Container>
    </main>
  );
};

export default CategoryPage;