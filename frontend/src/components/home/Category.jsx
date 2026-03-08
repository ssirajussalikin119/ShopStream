import React from "react";
import { ArrowRight } from "lucide-react";
import Container from "../layout/Container/Container";

const Category = () => {
  const categories = ["Electronics", "Fashion", "Home Decor", "Gadgets"];

  return (
    <section className="py-20 mx-auto px-4 sm:px-6">
      <Container className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-500">Explore our curated collections</p>
        </div>
        <a
          href="#"
          className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          Browse all <ArrowRight size={16} />
        </a>
      </Container>

      <Container className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="group relative h-64 bg-gray-100 rounded-md overflow-hidden cursor-pointer transition-transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-all duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-800 group-hover:scale-110 transition-transform duration-300 tracking-tight">
                {cat}
              </span>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
};

export default Category;
