import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Container from "../layout/Container/Container";

const images = [
  "https://woovina.com/images/2020/07/25/best-ecommerce-website-templates.jpg?auto=format&fit=crop&w=800&q=80",
  "https://img.freepik.com/premium-photo/ecommerce-website-banner-design_1281315-5350.jpg?auto=format&fit=crop&w=800&q=80",
  "https://cdn.motocms.com/src/1736x1160/66500/66564-original-1200.jpg?auto=format&fit=crop&w=800&q=80",
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gradient-to-r from-blue-100 to-white relative overflow-hidden">
      <Container className="mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-8">
        {/* Text Content */}
        <div className="md:w-1/2 flex flex-col gap-6 z-10 relative">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Shop Smarter with <span className="text-blue-600">ShopStream</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Discover electronics, home appliances, software tools, and handmade
            local crafts. Secure checkout, fast delivery, and smart
            recommendations tailored for you.
          </p>
          <div className="flex gap-4">
            {/* Fixed: was a dead <button>, now navigates to /category/electronics */}
            <Link
              to="/category/electronics"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Shop Now
            </Link>
            {/* Fixed: was a dead <button>, now navigates to /deals */}
            <Link
              to="/deals"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              View Deals
            </Link>
          </div>
        </div>

        {/* Carousel Image */}
        <div className="md:w-1/2 relative h-80 md:h-96">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Hero ${index + 1}`}
              className={`w-full h-full object-cover rounded-lg shadow-lg absolute top-0 left-0 transition-opacity duration-1000 ${
                index === current ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            />
          ))}
          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? "bg-white scale-125" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
