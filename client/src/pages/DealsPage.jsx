import React, { useEffect, useState } from "react";
import { Tag, Clock, Zap, Copy, CheckCheck, ShoppingBag } from "lucide-react";
import Container from "../components/layout/Container/Container";
import { offerAPI } from "../utils/api";
import { Link } from "react-router-dom";

const DealsPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    offerAPI.getOffers()
      .then((data) => setOffers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2500);
  };

  const formatDiscount = (offer) =>
    offer.discountType === "percentage"
      ? `${offer.discountValue}% OFF`
      : `$${offer.discountValue} OFF`;

  const getBadgeColor = (badge) => {
    const map = {
      "FLASH": "bg-orange-500",
      "NEW USER": "bg-green-600",
      "LIMITED": "bg-red-600",
      "DEV": "bg-purple-600",
      "DIGITAL": "bg-blue-600",
      "SAVE": "bg-teal-600",
      "DEAL": "bg-gray-700",
    };
    return map[badge] || "bg-blue-600";
  };

  const featured = offers.filter((o) => o.featured);
  const rest = offers.filter((o) => !o.featured);

  const OfferCard = ({ offer }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
      {offer.image && (
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className={`absolute top-3 left-3 ${getBadgeColor(offer.badge)} text-white text-xs font-black px-3 py-1 rounded-full`}>
            {offer.badge}
          </span>
          <span className="absolute bottom-3 right-3 bg-white text-gray-900 text-lg font-black px-3 py-1 rounded-lg shadow">
            {formatDiscount(offer)}
          </span>
        </div>
      )}
      <div className="p-5">
        <h3 className="font-black text-gray-900 text-lg mb-1">{offer.title}</h3>
        <p className="text-gray-500 text-sm mb-3 leading-5">{offer.description}</p>

        {offer.minOrderAmount > 0 && (
          <p className="text-xs text-amber-600 font-semibold mb-3 flex items-center gap-1">
            <ShoppingBag size={12} /> Min. order: ${offer.minOrderAmount}
          </p>
        )}

        {offer.expiresAt && (
          <p className="text-xs text-red-500 font-semibold mb-3 flex items-center gap-1">
            <Clock size={12} /> Expires: {new Date(offer.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}

        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-2 flex items-center gap-2">
            <Tag size={14} className="text-blue-600" />
            <span className="font-mono font-bold text-gray-900 tracking-widest text-sm">{offer.code}</span>
          </div>
          <button
            onClick={() => copyCode(offer.code)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            {copiedCode === offer.code ? <><CheckCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>

        {offer.categorySlug && (
          <Link
            to={`/category/${offer.categorySlug}`}
            className="block mt-3 text-center text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            Shop {offer.categorySlug.replace("-", " ")} →
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-16">
        <Container>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <span className="bg-white/20 rounded-full px-4 py-1.5 text-sm font-bold flex items-center gap-2">
                <Zap size={14} className="fill-yellow-300 text-yellow-300" /> Limited Time Offers
              </span>
            </div>
            <h1 className="text-5xl font-black mb-4">Today's Best Deals</h1>
            <p className="text-blue-100 text-lg max-w-xl mx-auto">
              Copy a promo code and paste it at checkout to save instantly. New deals added every week.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-14">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Zap size={22} className="text-yellow-500 fill-yellow-400" /> Featured Deals
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featured.map((o) => <OfferCard key={o._id} offer={o} />)}
                </div>
              </section>
            )}

            {rest.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-gray-900 mb-6">More Offers</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((o) => <OfferCard key={o._id} offer={o} />)}
                </div>
              </section>
            )}

            {offers.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <Tag size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-bold">No active deals right now</p>
                <p className="text-sm mt-2">Check back soon — new offers are added weekly!</p>
              </div>
            )}
          </>
        )}

        {/* How it works */}
        <div className="mt-16 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 className="text-xl font-black text-gray-900 mb-6 text-center">How to Use a Promo Code</h3>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { step: "1", icon: <Tag size={28} />, title: "Find a Deal", desc: "Browse the offers above and find one that fits your order." },
              { step: "2", icon: <Copy size={28} />, title: "Copy the Code", desc: "Click the Copy button to save the promo code to your clipboard." },
              { step: "3", icon: <ShoppingBag size={28} />, title: "Apply at Checkout", desc: "Go to cart, enter your code in the promo field, and save instantly." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <div className="bg-blue-50 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center">
                  {icon}
                </div>
                <h4 className="font-bold text-gray-900">{title}</h4>
                <p className="text-sm text-gray-500 leading-6">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
};

export default DealsPage;
