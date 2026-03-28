import React, { useState, useEffect } from "react";
import axios from "axios";
import Container from "../layout/Container/Container";

const Category = () => {
  // State to store categories fetched from backend
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from backend API when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/categories",
        );
        // Extract categories array safely from API payload
        if (response.data.success) {
          const payload = response.data.data;
          const categoryList = Array.isArray(payload)
            ? payload
            : payload?.data || [];
          setCategories(categoryList);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Keep empty array on error, user sees loading state
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array = run once on mount

  // Show loading state while fetching
  if (isLoading) {
    return (
      <section className="bg-white py-20">
        <Container className="mx-auto px-4 sm:px-6">
          <div className="text-center text-gray-500">Loading categories...</div>
        </Container>
      </section>
    );
  }

  // Show message if no categories found
  if (categories.length === 0) {
    return (
      <section className="bg-white py-20">
        <Container className="mx-auto px-4 sm:px-6">
          <div className="text-center text-gray-500">
            No categories available
          </div>
        </Container>
      </section>
    );
  }

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
              key={category._id}
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
