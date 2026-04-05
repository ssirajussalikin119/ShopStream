const Offer = require("../models/Offer");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

// GET /api/offers — get all active, non-expired offers
const getOffers = asyncHandler(async (req, res) => {
  const now = new Date();
  const { featured } = req.query;

  const query = {
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  };

  if (featured === "true") {
    query.featured = true;
  }

  const offers = await Offer.find(query).sort({ featured: -1, createdAt: -1 }).lean();

  return sendResponse(res, 200, true, "Offers fetched successfully", offers);
});

// GET /api/offers/:code — validate a promo code
const validatePromoCode = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const now = new Date();

  const offer = await Offer.findOne({ code: code.toUpperCase() });

  if (!offer) {
    return sendResponse(res, 404, false, "Promo code not found");
  }

  if (!offer.isActive) {
    return sendResponse(res, 400, false, "This promo code is no longer active");
  }

  if (offer.expiresAt && now > offer.expiresAt) {
    return sendResponse(res, 400, false, "This promo code has expired");
  }

  if (offer.maxUses !== null && offer.usedCount >= offer.maxUses) {
    return sendResponse(res, 400, false, "This promo code has reached its usage limit");
  }

  return sendResponse(res, 200, true, "Valid promo code", {
    code: offer.code,
    title: offer.title,
    description: offer.description,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    minOrderAmount: offer.minOrderAmount,
  });
});

// POST /api/offers — admin: create an offer
const createOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.create(req.body);
  return sendResponse(res, 201, true, "Offer created successfully", offer);
});

// PATCH /api/offers/:id — admin: update an offer
const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!offer) {
    res.status(404);
    throw new Error("Offer not found");
  }
  return sendResponse(res, 200, true, "Offer updated", offer);
});

// DELETE /api/offers/:id — admin: delete an offer
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);
  if (!offer) {
    res.status(404);
    throw new Error("Offer not found");
  }
  return sendResponse(res, 200, true, "Offer deleted");
});

module.exports = { getOffers, validatePromoCode, createOffer, updateOffer, deleteOffer };
