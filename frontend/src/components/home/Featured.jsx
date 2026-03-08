import React from "react";
import { ShoppingBag, Star } from "lucide-react";
import Container from "../layout/Container/Container";

const Featured = () => {
  const products = [1, 2, 3, 4]; // Placeholder for real data

  return (
    <section className="bg-gray-50 py-20">
      <Container className=" mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Trending Now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((item) => (
            <div key={item} className="bg-white p-4 rounded-md shadow-sm border border-gray-100 group transition-all hover:shadow-md">
              <div className="aspect-square bg-gray-100 rounded-md mb-4 overflow-hidden relative">
                 <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-500">
                   <ShoppingBag size={48} />
                 </div>
                 <div className="absolute top-2 right-2 flex items-center bg-white/90 px-2 py-1 rounded-md text-[10px] font-bold text-gray-700">
                   <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" /> 4.8
                 </div>
              </div>
              <p className="text-xs text-blue-600 font-bold uppercase mb-1">Premium Tech</p>
              <h3 className="font-bold text-gray-900 mb-2 truncate">Wireless Noise Cancelling Headphones</h3>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-black text-gray-900">$249.00</span>
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