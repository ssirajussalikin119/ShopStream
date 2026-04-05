import React from "react";
import { Link } from "react-router-dom";
import Container from "../layout/Container/Container";
import { shopCategories } from "../../data/catalogData";

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
              Shop smarter with electronics, ebooks, software tools, and accessories — all in one place.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/category/electronics" className="hover:text-white transition">Shop</Link></li>
              <li><Link to="/deals" className="hover:text-white transition">Deals</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link to="/favourites" className="hover:text-white transition">Favourites</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-3 text-gray-400">
              {shopCategories.map((c) => (
                <li key={c.id}>
                  <Link to={`/category/${c.slug}`} className="hover:text-white transition">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Support</h3>
            <ul className="space-y-3 text-gray-400">
              <li>Email: support@shopstream.com</li>
              <li>Phone: +1 (800) 555-0199</li>
              <li>Mon–Sat: 9:00 AM – 6:00 PM</li>
            </ul>
            <div className="mt-4">
              <Link to="/contact" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-gray-500 text-sm">
          <span>© 2026 ShopStream. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/deals" className="hover:text-white transition">Deals</Link>
            <Link to="/contact" className="hover:text-white transition">Support</Link>
            <Link to="/register" className="hover:text-white transition">Sign Up</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
