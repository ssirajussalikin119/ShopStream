import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingCart, ArrowLeft, CheckCircle, Truck, Shield, RefreshCw, Package } from "lucide-react";
import Container from "../components/layout/Container/Container";
import { productAPI } from "../utils/api";
import { useCart } from "../context/CartContext";
import AddToCartButton from "../components/cart/AddToCartButton";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(price || 0);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInCart } = useCart();
  const [data, setData] = useState({ product: null, related: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFav, setIsFav] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productAPI.getById(id)
      .then((d) => { if (mounted) { setData(d); setError(""); } })
      .catch((e) => { if (mounted) setError(e?.message || "Product not found"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (data.product) {
      const saved = JSON.parse(localStorage.getItem("favourites") || "[]");
      setIsFav(saved.includes(data.product._id));
    }
  }, [data.product]);

  const toggleFav = () => {
    const saved = JSON.parse(localStorage.getItem("favourites") || "[]");
    let updated;
    if (isFav) updated = saved.filter((x) => x !== data.product._id);
    else updated = [...saved, data.product._id];
    localStorage.setItem("favourites", JSON.stringify(updated));
    setIsFav(!isFav);
    window.dispatchEvent(new Event("favouritesUpdated"));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <Container>
          <div className="grid md:grid-cols-2 gap-10 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </Container>
      </main>
    );
  }

  if (error || !data.product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || "Product not found"}</p>
          <button onClick={() => navigate(-1)} className="text-blue-600 underline">Go back</button>
        </div>
      </main>
    );
  }

  const { product, related } = data;
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <Container>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.categorySlug}`} className="hover:text-blue-600">{product.categoryName}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {discount && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full">
                -{discount}% OFF
              </span>
            )}
            <button
              onClick={toggleFav}
              className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-md hover:scale-110 transition"
              aria-label="Toggle favourite"
            >
              <Heart size={20} className={isFav ? "fill-red-500 text-red-500" : "text-gray-400"} />
            </button>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{product.brand}</p>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16} className={s <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"} />
              ))}
              <span className="text-sm font-semibold text-gray-700">{product.rating?.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-gray-900">{formatPrice(product.price)}</span>
              {product.compareAtPrice > product.price && (
                <span className="text-xl text-gray-400 line-through mb-1">{formatPrice(product.compareAtPrice)}</span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <><CheckCircle size={16} className="text-green-500" /><span className="text-sm text-green-600 font-semibold">{product.stockCount} in stock</span></>
              ) : (
                <span className="text-sm text-red-600 font-semibold">Out of stock</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-7">{product.description}</p>

            {/* SKU / Category */}
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 border-t pt-4">
              <span>SKU: <span className="font-mono text-gray-700">{product.sku}</span></span>
              <span>Category: <span className="font-semibold text-gray-700">{product.subcategory}</span></span>
            </div>

            {/* Quantity + Cart */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-gray-100 text-gray-600 font-bold"
                >−</button>
                <span className="px-4 py-2 font-bold text-gray-900 min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                  className="px-3 py-2 hover:bg-gray-100 text-gray-600 font-bold"
                >+</button>
              </div>
              <div className="flex-1">
                <AddToCartButton productId={product._id} disabled={!product.inStock} quantity={quantity} fullWidth />
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-4 border-t pt-4">
              {[
                { icon: <Truck size={18} />, label: "Free Shipping" },
                { icon: <Shield size={18} />, label: "Secure Payment" },
                { icon: <RefreshCw size={18} />, label: "Easy Returns" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-xs text-gray-500 text-center">
                  <span className="text-blue-600">{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <Link
                  key={p._id}
                  to={`/product/${p._id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden group"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold text-blue-600 uppercase">{p.brand}</p>
                    <h3 className="font-bold text-gray-900 mt-1 truncate">{p.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-black text-gray-900">{formatPrice(p.price)}</span>
                      {p.compareAtPrice > p.price && (
                        <span className="text-xs text-gray-400 line-through">{formatPrice(p.compareAtPrice)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
};

export default ProductDetail;
