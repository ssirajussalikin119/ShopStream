import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShoppingBag, Star } from "lucide-react";
import Container from "../layout/Container/Container";

const Featured = () => {
  // State to store featured products fetched from backend
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured products from backend API when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/products?featured=true&limit=8",
        );
        // Extract products array safely from API payload
        if (response.data.success) {
          const payload = response.data.data;
          const productList = Array.isArray(payload)
            ? payload
            : payload?.data || [];
          setProducts(productList);
        }
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
        // Keep empty array on error, user sees loading state
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array = run once on mount

  // Show loading state while fetching
  if (isLoading) {
    return (
      <section className="bg-gray-50 py-20">
        <Container className="mx-auto px-4 sm:px-6">
          <div className="text-center text-gray-500">Loading products...</div>
        </Container>
      </section>
    );
  }

  // Show message if no products found
  if (products.length === 0) {
    return (
      <section className="bg-gray-50 py-20">
        <Container className="mx-auto px-4 sm:px-6">
          <div className="text-center text-gray-500">No products available</div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-20">
      <Container className="mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Trending Now</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product._id}
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
                  {product.rating || "4.8"}
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
                  $
                  {typeof product.price === "number"
                    ? product.price.toFixed(2)
                    : product.price}
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
