const mongoose = require("mongoose");

const paymentOrderSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true,
      index: true,
      trim: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "BDT",
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    customerInfo: {
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Customer email is required"],
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: [true, "Customer phone is required"],
        trim: true,
      },
      address: {
        type: String,
        default: "",
        trim: true,
      },
      city: {
        type: String,
        default: "",
        trim: true,
      },
      postcode: {
        type: String,
        default: "",
        trim: true,
      },
      country: {
        type: String,
        default: "Bangladesh",
        trim: true,
      },
    },
    sellerInfo: {
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      sellerName: {
        type: String,
        default: "",
        trim: true,
      },
      shopName: {
        type: String,
        default: "",
        trim: true,
      },
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

const PaymentOrder = mongoose.model("PaymentOrder", paymentOrderSchema);

module.exports = PaymentOrder;
