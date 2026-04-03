import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Container from "../layout/Container/Container";
import { productAPI } from "../../utils/api";
import AddToCartButton from "../cart/AddToCartButton";

const Featured = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadFeaturedProducts = async () => {
      try {
        const featuredProducts = await productAPI.getFeatured();
        if (!isMounted) return;
        setProducts(featuredProducts);
        setError("");
      } catch (apiError) {
        if (!isMounted) return;
        setError(apiError?.message || "Unable to load featured products.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadFeaturedProducts();
    return () => { isMounted = false; };
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(price);

  return (
    <section className="bg-gray-50 py-20">
      <Container className="mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Trending Now</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white p-4 rounded-md shadow-sm border border-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-md mb-4" />
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-4/5 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {!loading && !error && products.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-white px-4 py-6 text-sm text-gray-600">
            No featured products are available yet.
          </div>
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white p-4 rounded-md shadow-sm border border-gray-100 group transition-all hover:shadow-md"
              >
                <div className="aspect-square bg-gray-100 rounded-md mb-4 overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 flex items-center bg-white/90 px-2 py-1 rounded-md text-[10px] font-bold text-gray-700">
                    <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                    {product.rating?.toFixed(1) || "4.8"}
                  </div>
                </div>

                <p className="text-xs text-blue-600 font-bold uppercase mb-1">{product.brand}</p>
                <h3 className="font-bold text-gray-900 mb-2 truncate">{product.name}</h3>

                <div className="flex justify-between items-center mt-4 gap-2">
                  <div>
                    <span className="text-xl font-black text-gray-900">{formatPrice(product.price)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="block text-xs text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                    )}
                  </div>
                  <AddToCartButton productId={product._id} disabled={!product.inStock} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
};

export default Featured;
