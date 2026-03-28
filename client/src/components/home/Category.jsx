import React from "react";
import Container from "../layout/Container/Container";

const Category = () => {
  const categories = [
    {
      id: 1,
      name: "Electronics",
      image:
        "https://plus.unsplash.com/premium_photo-1683120889995-b6a309252981?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 2,
      name: "Fashion",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 3,
      name: "Home Decor",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 4,
      name: "Gadgets",
      image:
        "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=721&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <section className="bg-white py-20">
      <Container className="mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Shop by Category
            </h2>
            <p className="text-gray-500">Explore our curated collections</p>
          </div>

          <button className="text-blue-600 font-semibold hover:text-blue-700 transition cursor-pointer">
            Browse all →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative h-48 rounded-lg overflow-hidden group cursor-pointer"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition"></div>

              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Category;