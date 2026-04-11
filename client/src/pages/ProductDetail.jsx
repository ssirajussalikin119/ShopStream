import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star, Heart, ShoppingCart, ArrowLeft, CheckCircle, Truck,
  Shield, RefreshCw, Package, ChevronLeft, ChevronRight,
  Share2, Tag, Award, MessageSquare, Send, Loader2, ZoomIn
} from "lucide-react";
import Container from "../components/layout/Container/Container";
import { productAPI } from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import AddToCartButton from "../components/cart/AddToCartButton";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(price || 0);

const StarRating = ({ value = 0, max = 5, size = 16, interactive = false, onChange }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }, (_, i) => i + 1).map((s) => (
      <Star
        key={s}
        size={size}
        onClick={() => interactive && onChange && onChange(s)}
        className={`transition-colors ${interactive ? "cursor-pointer hover:scale-110" : ""} ${
          s <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"
        }`}
      />
    ))}
  </div>
);

/* ── Loading Skeleton ─────────────────────────────────── */
const Skeleton = () => (
  <main className="min-h-screen bg-gray-50 py-10">
    <Container>
      <div className="grid md:grid-cols-2 gap-10 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-pulse">
        <div className="space-y-3">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="flex gap-2">
            {[0,1,2,3].map(i => <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
        <div className="space-y-5">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-12 bg-gray-200 rounded w-full mt-4" />
        </div>
      </div>
    </Container>
  </main>
);

/* ── Review Card ──────────────────────────────────────── */
const ReviewCard = ({ review }) => (
  <div className="border border-gray-100 rounded-2xl p-5 bg-white hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {review.userName?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{review.userName}</p>
          <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
        </div>
      </div>
      <StarRating value={review.rating} size={13} />
    </div>
    {review.comment && <p className="mt-3 text-gray-600 text-sm leading-relaxed">{review.comment}</p>}
  </div>
);

/* ── Rating Distribution Bar ──────────────────────────── */
const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-6 text-right text-gray-500 font-medium">{star}</span>
      <Star size={11} className="fill-yellow-400 text-yellow-400 flex-shrink-0" />
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-gray-400 text-xs">{count}</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════ */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [data, setData] = useState({ product: null, related: [] });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFav, setIsFav] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("description"); // description | specs | reviews
  const [zoom, setZoom] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");

  // Fetch product
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setActiveImg(0);
    productAPI.getById(id)
      .then((d) => { if (mounted) { setData(d); setError(""); } })
      .catch((e) => { if (mounted) setError(e?.message || "Product not found"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  // Sync favourites
  useEffect(() => {
    if (data.product) {
      const saved = JSON.parse(localStorage.getItem("favourites") || "[]");
      setIsFav(saved.includes(data.product._id));
    }
  }, [data.product]);

  // Fetch reviews when tab opens
  useEffect(() => {
    if (activeTab === "reviews" && data.product) {
      setReviewsLoading(true);
      productAPI.getReviews(data.product._id)
        .then((r) => setReviews(r || []))
        .catch(() => setReviews([]))
        .finally(() => setReviewsLoading(false));
    }
  }, [activeTab, data.product]);

  const toggleFav = () => {
    const saved = JSON.parse(localStorage.getItem("favourites") || "[]");
    let updated;
    if (isFav) updated = saved.filter((x) => x !== data.product._id);
    else updated = [...saved, data.product._id];
    localStorage.setItem("favourites", JSON.stringify(updated));
    setIsFav(!isFav);
    window.dispatchEvent(new Event("favouritesUpdated"));
  };

  const handleShareCopy = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) { setReviewError("Please log in to leave a review."); return; }
    if (!reviewComment.trim()) { setReviewError("Please write a comment."); return; }
    setReviewSubmitting(true);
    setReviewError("");
    try {
      const newReview = await productAPI.addReview(data.product._id, { rating: reviewRating, comment: reviewComment });
      setReviews((prev) => [newReview, ...prev]);
      setReviewComment("");
      setReviewRating(5);
      setReviewSuccess("Review submitted successfully!");
      setTimeout(() => setReviewSuccess(""), 4000);
    } catch (e) {
      setReviewError(e?.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <Skeleton />;

  if (error || !data.product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-red-400" />
          </div>
          <p className="text-red-600 text-lg font-semibold mb-2">{error || "Product not found"}</p>
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm">← Go back</button>
        </div>
      </main>
    );
  }

  const { product, related } = data;
  const allImages = product.images?.length ? product.images : [product.image];
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  // Rating distribution from embedded reviews
  const embeddedReviews = product.reviews || [];
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: embeddedReviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  const tabs = [
    { key: "description", label: "Description" },
    { key: "specs", label: "Specifications" },
    { key: "reviews", label: `Reviews (${product.reviewCount || 0})` },
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <Container>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link to={`/category/${product.categorySlug}`} className="hover:text-blue-600 transition-colors">{product.categoryName}</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
        </div>

        {/* ── Main Card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mb-6">
          <div className="grid md:grid-cols-2 gap-10">

            {/* ── Image Gallery ─────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              {/* Main Image */}
              <div
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group cursor-zoom-in"
                onClick={() => setZoom(true)}
              >
                <img
                  src={allImages[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {discount && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow">
                    -{discount}% OFF
                  </span>
                )}
                {product.isFeatured && (
                  <span className="absolute top-4 left-4 mt-0 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1.5 rounded-full shadow"
                    style={{ top: discount ? "3rem" : "1rem" }}>
                    ★ Featured
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFav(); }}
                  className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform"
                  aria-label="Toggle favourite"
                >
                  <Heart size={18} className={isFav ? "fill-red-500 text-red-500" : "text-gray-400"} />
                </button>
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={16} className="text-gray-600" />
                </div>
                {/* Arrow nav */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + allImages.length) % allImages.length); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white transition"
                    ><ChevronLeft size={18} /></button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % allImages.length); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white transition"
                    ><ChevronRight size={18} /></button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        activeImg === i ? "border-blue-500 scale-105 shadow-md" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ───────────────────────────────────── */}
            <div className="flex flex-col gap-5">
              {/* Brand & share */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  <Award size={12} />{product.brand}
                </span>
                <button
                  onClick={handleShareCopy}
                  title="Copy link"
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                ><Share2 size={16} /></button>
              </div>

              {/* Name */}
              <h1 className="text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>

              {/* Rating row */}
              <div className="flex items-center gap-3">
                <StarRating value={product.rating} />
                <span className="text-sm font-bold text-gray-800">{product.rating?.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className="text-sm text-blue-600 hover:underline"
                >Write a review</button>
              </div>

              {/* Price */}
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-gray-900">{formatPrice(product.price)}</span>
                {product.compareAtPrice > product.price && (
                  <span className="text-xl text-gray-400 line-through mb-1">{formatPrice(product.compareAtPrice)}</span>
                )}
                {discount && (
                  <span className="mb-1 text-sm font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                    Save {formatPrice(product.compareAtPrice - product.price)}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2">
                {product.inStock ? (
                  <>
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm text-green-700 font-semibold">In Stock</span>
                    {product.stockCount > 0 && product.stockCount <= 10 && (
                      <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                        Only {product.stockCount} left!
                      </span>
                    )}
                    {product.stockCount > 10 && (
                      <span className="text-xs text-gray-400">{product.stockCount} units available</span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-red-600 font-semibold bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
                )}
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-gray-400" />
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              )}

              {/* SKU / Category */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                <span>SKU: <span className="font-mono font-semibold text-gray-700">{product.sku}</span></span>
                <span>Category: <span className="font-semibold text-gray-700">{product.subcategory}</span></span>
              </div>

              {/* Quantity + Cart */}
              <div className="flex items-stretch gap-3">
                <div className="flex items-center border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 hover:bg-gray-100 text-gray-600 font-black text-lg transition"
                  >−</button>
                  <span className="px-4 py-3 font-black text-gray-900 min-w-[44px] text-center text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockCount || 99, q + 1))}
                    className="px-4 py-3 hover:bg-gray-100 text-gray-600 font-black text-lg transition"
                  >+</button>
                </div>
                <div className="flex-1">
                  <AddToCartButton productId={product._id} disabled={!product.inStock} quantity={quantity} fullWidth size="lg" />
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
                {[
                  { icon: <Truck size={20} className="text-blue-600" />, label: "Free Shipping", sub: "On orders over $50" },
                  { icon: <Shield size={20} className="text-green-600" />, label: "Secure Payment", sub: "256-bit encryption" },
                  { icon: <RefreshCw size={20} className="text-orange-500" />, label: "Easy Returns", sub: "30-day policy" },
                ].map(({ icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-center p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors">
                    {icon}
                    <span className="text-xs font-bold text-gray-700">{label}</span>
                    <span className="text-xs text-gray-400">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Section ───────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
          {/* Tab Nav */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Description Tab */}
            {activeTab === "description" && (
              <div className="max-w-2xl space-y-6">
                <p className="text-gray-600 leading-8 text-base">{product.description || "No description available."}</p>
                {product.features?.length > 0 && (
                  <div>
                    <h3 className="font-black text-gray-900 text-lg mb-4">Key Features</h3>
                    <ul className="space-y-3">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle size={17} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === "specs" && (
              <div className="max-w-xl">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, val], i) => (
                        <tr key={key} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="py-3 px-4 font-semibold text-gray-700 rounded-l-lg w-2/5 capitalize">{key}</td>
                          <td className="py-3 px-4 text-gray-600 rounded-r-lg">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <Package size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No specifications available for this product.</p>
                  </div>
                )}
                {/* Always show base info */}
                <table className="w-full text-sm mt-4">
                  <tbody>
                    {[
                      ["Brand", product.brand],
                      ["SKU", product.sku],
                      ["Category", product.categoryName],
                      ["Subcategory", product.subcategory],
                    ].map(([key, val], i) => (
                      <tr key={key} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="py-3 px-4 font-semibold text-gray-700 rounded-l-lg w-2/5">{key}</td>
                        <td className="py-3 px-4 text-gray-600 rounded-r-lg font-mono">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-8 max-w-2xl">
                {/* Summary */}
                <div className="flex gap-8 items-center flex-wrap">
                  <div className="text-center">
                    <p className="text-6xl font-black text-gray-900">{product.rating?.toFixed(1) || "0.0"}</p>
                    <StarRating value={product.rating} size={18} />
                    <p className="text-sm text-gray-400 mt-1">{product.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 min-w-[200px] space-y-2">
                    {ratingDist.map(({ star, count }) => (
                      <RatingBar key={star} star={star} count={count} total={embeddedReviews.length} />
                    ))}
                  </div>
                </div>

                {/* Write a review */}
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <MessageSquare size={18} className="text-blue-600" /> Write a Review
                  </h3>
                  {!isAuthenticated && (
                    <p className="text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-xl">
                      Please <Link to="/login" className="font-bold underline">log in</Link> to leave a review.
                    </p>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Your Rating</p>
                    <StarRating value={reviewRating} size={24} interactive onChange={setReviewRating} />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={3}
                    disabled={!isAuthenticated || reviewSubmitting}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {reviewError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{reviewError}</p>}
                  {reviewSuccess && <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">✓ {reviewSuccess}</p>}
                  <button
                    onClick={handleReviewSubmit}
                    disabled={!isAuthenticated || reviewSubmitting || !reviewComment.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reviewSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>

                {/* Reviews list */}
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={28} className="animate-spin text-blue-500" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((r, i) => <ReviewCard key={r._id || i} review={r} />)}
                  </div>
                ) : embeddedReviews.length > 0 ? (
                  <div className="space-y-4">
                    {embeddedReviews.map((r, i) => <ReviewCard key={r._id || i} review={r} />)}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <MessageSquare size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No reviews yet — be the first!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ───────────────────────────────────── */}
        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">You May Also Like</h2>
              <Link to={`/category/${product.categorySlug}`} className="text-sm text-blue-600 hover:underline font-semibold">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => {
                const relDiscount = p.compareAtPrice && p.compareAtPrice > p.price
                  ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : null;
                return (
                  <Link
                    key={p._id}
                    to={`/product/${p._id}`}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {relDiscount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                          -{relDiscount}%
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">{p.brand}</p>
                      <h3 className="font-bold text-gray-900 mt-1 text-sm leading-snug line-clamp-2">{p.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <StarRating value={p.rating} size={11} />
                        <span className="text-xs text-gray-400">({p.reviewCount})</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-black text-gray-900 text-sm">{formatPrice(p.price)}</span>
                        {p.compareAtPrice > p.price && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(p.compareAtPrice)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </Container>

      {/* ── Image Lightbox ─────────────────────────────────────── */}
      {zoom && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setZoom(false)}
        >
          <button
            onClick={() => setZoom(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-4xl font-light"
          >×</button>
          <img
            src={allImages[activeImg]}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {allImages.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${activeImg === i ? "bg-white scale-125" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default ProductDetail;
