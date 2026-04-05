const Subscriber = require("../models/Subscriber");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

// POST /api/newsletter/subscribe
const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendResponse(res, 400, false, "Valid email is required");
  }

  const existing = await Subscriber.findOne({ email: email.toLowerCase() });

  if (existing) {
    if (existing.isActive) {
      return sendResponse(res, 200, true, "You are already subscribed!");
    } else {
      existing.isActive = true;
      await existing.save();
      return sendResponse(res, 200, true, "Welcome back! You've been re-subscribed.");
    }
  }

  await Subscriber.create({ email });
  return sendResponse(res, 201, true, "Successfully subscribed to the newsletter!");
});

// DELETE /api/newsletter/unsubscribe
const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendResponse(res, 400, false, "Email is required");
  }

  await Subscriber.findOneAndUpdate(
    { email: email.toLowerCase() },
    { isActive: false }
  );

  return sendResponse(res, 200, true, "Successfully unsubscribed.");
});

module.exports = { subscribe, unsubscribe };
