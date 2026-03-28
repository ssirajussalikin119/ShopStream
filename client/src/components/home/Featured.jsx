import React from "react";
import { ShoppingBag, Star } from "lucide-react";
import Container from "../layout/Container/Container";

const Featured = () => {
  const products = [
    {
      id: 1,
      name: "Wireless Noise Cancelling Headphones",
      brand: "Premium Tech",
      price: "$249.00",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      name: "Wireless Noise Cancelling Headphones",
      brand: "Premium Tech",
      price: "$249.00",
      image:
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      name: "Wireless Noise Cancelling Headphones",
      brand: "Premium Tech",
      price: "$249.00",
      image:
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      name: "Wireless Noise Cancelling Headphones",
      brand: "Premium Tech",
      price: "$249.00",
      image:"https://plus.unsplash.com/premium_photo-1679513691474-73102089c117?q=80&w=2013&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <Container className="mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">
          Trending Now
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-md shadow-sm border border-gray-100 group transition-all hover:shadow-md"
            >
              <div className="aspect-square bg-gray-100 rounded-md mb-4 overflow-hidden relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-2 right-2 flex items-center bg-white/90 px-2 py-1 rounded-md text-[10px] font-bold text-gray-700">
                  <Star
                    size={12}
                    className="text-yellow-400 fill-yellow-400 mr-1"
                  />
                  4.8
                </div>
              </div>

              <p className="text-xs text-blue-600 font-bold uppercase mb-1">
                {product.brand}
              </p>

              <h3 className="font-bold text-gray-900 mb-2 truncate">
                {product.name}
              </h3>

              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-black text-gray-900">
                  {product.price}
                </span>

                <button className="p-2 bg-gray-900 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer">
                  <ShoppingBag size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Featured;