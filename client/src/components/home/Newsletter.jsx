import React from "react";
import Container from "../layout/Container/Container";

const Newsletter = () => {
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
            Be the first to know about trending products, exclusive discounts,
            and new arrivals at ShopStream.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:w-[380px] px-5 py-4 rounded-lg bg-white text-gray-900 outline-none"
            />
            <button className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-lg font-semibold transition cursor-pointer">
              Subscribe
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Newsletter;