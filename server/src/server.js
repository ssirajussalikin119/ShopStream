const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const seedProductsIfEmpty = require("./data/seedProducts");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start the server
const startServer = async () => {
  await connectDB();
  await seedProductsIfEmpty();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
