import React from "react";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AddToCartButton = ({ productId, disabled = false, size = "default", quantity = 1, fullWidth = false }) => {
  const { addToCart, actionLoading, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isLoading = actionLoading[productId];
  const inCart = isInCart(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate("/login"); return; }
    await addToCart(productId, quantity);
  };

  const base = `flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all ${fullWidth ? "w-full" : ""}`;
  const sizes = {
    sm: "px-3 py-2 text-xs",
    default: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const colors = disabled
    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
    : inCart
    ? "bg-green-600 hover:bg-green-700 text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  return (
    <button className={`${base} ${sizes[size]} ${colors}`} onClick={handleClick} disabled={disabled || isLoading} aria-label="Add to cart">
      {isLoading ? (
        <Loader2 size={size === "sm" ? 13 : 16} className="animate-spin" />
      ) : inCart ? (
        <><Check size={size === "sm" ? 13 : 16} />{size !== "sm" && "In Cart"}</>
      ) : (
        <><ShoppingCart size={size === "sm" ? 13 : 16} />{size !== "sm" && "Add to Cart"}</>
      )}
    </button>
  );
};

export default AddToCartButton;
