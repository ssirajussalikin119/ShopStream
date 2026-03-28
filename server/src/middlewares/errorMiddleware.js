const sendResponse = require("../utils/sendResponse");

// This middleware catches all errors that happen in our app
// and sends a clean error response to the frontend
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const data =
    process.env.NODE_ENV === "development"
      ? { stack: err.stack || null }
      : null;

  return sendResponse(res, statusCode, false, message, data);
};

module.exports = errorMiddleware;
