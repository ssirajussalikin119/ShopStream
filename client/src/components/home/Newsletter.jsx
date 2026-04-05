import React, { useState } from "react";
import Container from "../layout/Container/Container";
import { newsletterAPI } from "../../utils/api";
import { CheckCircle } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await newsletterAPI.subscribe(email.trim());
      setMessage(res.message || "Successfully subscribed!");
      setStatus("success");
      setEmail("");
    } catch (err) {
      setMessage(err?.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <section className="bg-blue-600 py-20">
      <Container className="px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center text-white">
          <p className="uppercase tracking-[0.2em] text-sm font-semibold mb-3 text-blue-100">
            Stay Updated
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Subscribe to get special offers and product updates
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Be the first to know about trending products, exclusive discounts, and new arrivals at ShopStream.
          </p>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-3 bg-white/20 rounded-xl px-6 py-4">
              <CheckCircle size={22} className="text-green-300" />
              <p className="font-semibold text-white">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full sm:w-[380px] px-5 py-4 rounded-lg bg-white text-gray-900 outline-none"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-gray-900 hover:bg-black disabled:opacity-60 text-white px-8 py-4 rounded-lg font-semibold transition cursor-pointer"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-3 text-red-200 text-sm">{message}</p>
          )}
        </div>
      </Container>
    </section>
  );
};

export default Newsletter;
