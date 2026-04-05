const express = require("express");
const { getOffers, validatePromoCode, createOffer, updateOffer, deleteOffer } = require("../controllers/offerController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", getOffers);
router.get("/validate/:code", validatePromoCode);
router.post("/", protect, authorizeRoles("admin"), createOffer);
router.patch("/:id", protect, authorizeRoles("admin"), updateOffer);
router.delete("/:id", protect, authorizeRoles("admin"), deleteOffer);

module.exports = router;
