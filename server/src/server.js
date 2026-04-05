const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const seedProductsIfEmpty = require("./data/seedProducts");
const seedOffersIfEmpty = require("./data/seedOffers");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedProductsIfEmpty();
  await seedOffersIfEmpty();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
};

startServer();
