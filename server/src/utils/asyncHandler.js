// This is a wrapper function that catches errors in async functions
// Instead of writing try/catch in every controller, we wrap it here
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
