const SSLCommerzPayment = require("sslcommerz-lts");

const isLive = String(process.env.SSL_IS_LIVE).toLowerCase() === "true";

const getSslInstance = () =>
  new SSLCommerzPayment(
    process.env.SSL_STORE_ID,
    process.env.SSL_STORE_PASSWORD,
    isLive,
  );

const formatPaymentData = (order) => {
  const baseUrl = process.env.API_BASE_URL || "http://localhost:5000";
  const transactionId = order.transactionId;

  return {
    total_amount: order.amount,
    currency: "BDT",
    tran_id: transactionId,
    success_url: `${baseUrl}/api/payment/success/${transactionId}`,
    fail_url: `${baseUrl}/api/payment/failed/${transactionId}`,
    cancel_url: `${baseUrl}/api/payment/cancelled/${transactionId}`,
    ipn_url: `${baseUrl}/api/payment/ipn`,
    shipping_method: "NO",
    product_name: order.items?.[0]?.name || "ShopStream Product",
    product_category: "General",
    product_profile: "general",
    cus_name: order.customerInfo?.name || "Customer",
    cus_email: order.customerInfo?.email || "customer@example.com",
    cus_add1: order.customerInfo?.address || "N/A",
    cus_city: order.customerInfo?.city || "N/A",
    cus_postcode: order.customerInfo?.postcode || "0000",
    cus_country: order.customerInfo?.country || "Bangladesh",
    cus_phone: order.customerInfo?.phone || "0000000000",
    ship_name: order.customerInfo?.name || "Customer",
    ship_add1: order.customerInfo?.address || "N/A",
    ship_city: order.customerInfo?.city || "N/A",
    ship_postcode: order.customerInfo?.postcode || "0000",
    ship_country: order.customerInfo?.country || "Bangladesh",
  };
};

const initiateSslPayment = async (order) => {
  const sslcz = getSslInstance();
  const paymentData = formatPaymentData(order);
  const apiResponse = await sslcz.init(paymentData);

  return {
    redirectUrl: apiResponse?.GatewayPageURL || "",
    gatewayResponse: apiResponse || null,
  };
};

module.exports = {
  formatPaymentData,
  initiateSslPayment,
};
