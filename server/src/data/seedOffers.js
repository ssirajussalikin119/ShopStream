const Offer = require("../models/Offer");

const defaultOffers = [
  {
    title: "Welcome Deal",
    description: "Get 15% off your first order on any product!",
    discountType: "percentage",
    discountValue: 15,
    code: "WELCOME15",
    minOrderAmount: 0,
    maxUses: null,
    badge: "NEW USER",
    featured: true,
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Electronics Flash Sale",
    description: "Save $30 on any electronics order over $150.",
    discountType: "fixed",
    discountValue: 30,
    code: "ELEC30",
    minOrderAmount: 150,
    maxUses: 200,
    badge: "FLASH",
    categorySlug: "electronics",
    featured: true,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Ebook Bundle",
    description: "20% off all digital books and learning content.",
    discountType: "percentage",
    discountValue: 20,
    code: "READ20",
    minOrderAmount: 0,
    maxUses: null,
    badge: "DIGITAL",
    categorySlug: "ebooks",
    featured: false,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Software & Tools",
    description: "Get 25% off any software purchase above $50.",
    discountType: "percentage",
    discountValue: 25,
    code: "DEVTOOLS25",
    minOrderAmount: 50,
    maxUses: 100,
    badge: "DEV",
    categorySlug: "software-tools",
    featured: true,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Accessories Special",
    description: "Buy accessories and save $10 on orders over $60.",
    discountType: "fixed",
    discountValue: 10,
    code: "ACC10",
    minOrderAmount: 60,
    maxUses: null,
    badge: "SAVE",
    categorySlug: "accessories",
    featured: false,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Weekend Mega Sale",
    description: "Flat $50 off sitewide. No minimum order required!",
    discountType: "fixed",
    discountValue: 50,
    code: "MEGA50",
    minOrderAmount: 100,
    maxUses: 500,
    badge: "LIMITED",
    featured: true,
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=800&q=80",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
];

const seedOffersIfEmpty = async () => {
  try {
    const count = await Offer.countDocuments();
    if (count === 0) {
      await Offer.insertMany(defaultOffers);
      console.log("✅ Offers seeded successfully");
    } else {
      console.log(`ℹ️  Offers already exist (${count} found), skipping seed`);
    }
  } catch (error) {
    console.error("❌ Error seeding offers:", error.message);
  }
};

module.exports = seedOffersIfEmpty;
