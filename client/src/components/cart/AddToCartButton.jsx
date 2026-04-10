import React from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useCart } from "../../context/CartContext";

const AddToCartButton = ({
  productId,
  disabled = false,
  className = "",
  size = "default", // "sm" | "default" | "lg"
}) => {
  const { addToCart, actionLoading, isInCart, getItemQuantity } = useCart();

  const isLoading = actionLoading[productId];
  const inCart = isInCart(productId);
  const qty = getItemQuantity(productId);

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1",
    default: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(productId, 1);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 
        ${sizeClasses[size] || sizeClasses.default}
        ${
          inCart
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-gray-900 text-white hover:bg-blue-600"
        }
        disabled:opacity-60 disabled:cursor-not-allowed active:scale-95
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 size={size === "sm" ? 13 : 16} className="animate-spin" />
      ) : inCart ? (
        <Check size={size === "sm" ? 13 : 16} />
      ) : (
        <ShoppingCart size={size === "sm" ? 13 : 16} />
      )}
      {isLoading
        ? "Adding..."
        : inCart
        ? `In Cart (${qty})`
        : "Add to Cart"}
    </button>
  );
};

export default AddToCartButton;
