import React from "react";
import Container from "../layout/Container/Container";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white pt-16 pb-8">
      <Container className="px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <h2 className="text-2xl font-extrabold mb-4">
              <span className="text-blue-500">SHOP</span>STREAM
            </h2>
            <p className="text-gray-400 leading-7">
              Shop smarter with electronics, fashion, home decor, and trending
              gadgets — all in one place.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-white cursor-pointer transition">Home</li>
              <li className="hover:text-white cursor-pointer transition">Shop</li>
              <li className="hover:text-white cursor-pointer transition">Deals</li>
              <li className="hover:text-white cursor-pointer transition">Contact</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-white cursor-pointer transition">Electronics</li>
              <li className="hover:text-white cursor-pointer transition">Fashion</li>
              <li className="hover:text-white cursor-pointer transition">Home Decor</li>
              <li className="hover:text-white cursor-pointer transition">Gadgets</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Support</h3>
            <ul className="space-y-3 text-gray-400">
              <li>Email: support@shopstream.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Mon - Sat: 9:00 AM - 6:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
          © 2026 ShopStream. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;