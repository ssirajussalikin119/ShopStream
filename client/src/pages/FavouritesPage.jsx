import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import Container from "../components/layout/Container/Container";
import { productAPI } from "../utils/api";
import AddToCartButton from "../components/cart/AddToCartButton";

const FavouritesPage = () => {
  const [favourites, setFavourites] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
  const saved = localStorage.getItem("favourites");
  const favIds = saved ? JSON.parse(saved) : [];
  setFavourites(favIds);

  // 🔥 FIX: load from all categories instead of API
  const loadProducts = async () => {
    try {
      const res = await productAPI.getByCategory({}); // fallback
      const allProducts = res.products || [];

      const favProducts = allProducts.filter((p) =>
        favIds.includes(p._id)
      );

      setProducts(favProducts);
    } catch (err) {
      console.error(err);
    }
  };

  loadProducts();
}, []);

  const removeFavourite = (id) => {
    const updated = favourites.filter((item) => item !== id);
    setFavourites(updated);
    localStorage.setItem("favourites", JSON.stringify(updated));

    setProducts(products.filter((p) => p._id !== id));

    window.dispatchEvent(new Event("favouritesUpdated"));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container>
        <h2 className="text-3xl font-bold mb-6">Your Favourites ❤️</h2>

        {products.length === 0 ? (
          <p className="text-gray-500">No favourite products yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow p-4"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />

                  <button
                    onClick={() => removeFavourite(product._id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow"
                  >
                    <Heart className="text-red-500 fill-red-500" size={18} />
                  </button>
                </div>

                <h3 className="mt-3 font-bold">{product.name}</h3>
                <p className="text-gray-500 text-sm">
                  {product.description}
                </p>

                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-lg">
                    ${product.price}
                  </span>

                  <AddToCartButton
                    productId={product._id}
                    disabled={!product.inStock}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
};

export default FavouritesPage;