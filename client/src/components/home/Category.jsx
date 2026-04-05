import React from "react";
import { Link } from "react-router-dom";
import Container from "../layout/Container/Container";
import { shopCategories } from "../../data/catalogData";

const Category = () => {
  return (
    <section className="bg-white py-20">
      <Container className="mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
            <p className="text-gray-500">Explore our curated collections</p>
          </div>
          <Link to="/deals" className="text-blue-600 font-semibold hover:text-blue-700 transition">
            View Deals →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shopCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="relative h-56 rounded-2xl overflow-hidden group cursor-pointer border border-gray-100 shadow-sm"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/75 transition" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-white text-2xl font-bold mb-2">{category.name}</h3>
                <p className="text-sm text-white/85 leading-5 max-w-[24ch]">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Category;
