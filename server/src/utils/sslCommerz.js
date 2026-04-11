const SSLCommerzPayment = require("sslcommerz-lts");

const isLive = String(process.env.SSL_IS_LIVE).toLowerCase() === "true";

const getSslInstance = () =>
  new SSLCommerzPayment(
    process.env.SSL_STORE_ID,
    process.env.SSL_STORE_PASSWORD,
    isLive,
  );

const formatPaymentData = (paymentOrder) => {
  const baseUrl = process.env.API_BASE_URL || "http://localhost:5000";
  const transactionId = paymentOrder.transactionId;

  return {
    total_amount: paymentOrder.amount,
    currency: paymentOrder.currency || "BDT",
    tran_id: transactionId,
    success_url: `${baseUrl}/api/payment/success/${transactionId}`,
    fail_url: `${baseUrl}/api/payment/failed/${transactionId}`,
    cancel_url: `${baseUrl}/api/payment/cancelled/${transactionId}`,
    ipn_url: `${baseUrl}/api/payment/ipn`,
    shipping_method: "NO",
    product_name: "ShopStream Product",
    product_category: "General",
    product_profile: "general",
    cus_name: paymentOrder.customerInfo?.name || "Customer",
    cus_email: paymentOrder.customerInfo?.email || "customer@example.com",
    cus_add1: paymentOrder.customerInfo?.address || "N/A",
    cus_city: paymentOrder.customerInfo?.city || "N/A",
    cus_postcode: paymentOrder.customerInfo?.postcode || "0000",
    cus_country: paymentOrder.customerInfo?.country || "Bangladesh",
    cus_phone: paymentOrder.customerInfo?.phone || "0000000000",
    ship_name: paymentOrder.customerInfo?.name || "Customer",
    ship_add1: paymentOrder.customerInfo?.address || "N/A",
    ship_city: paymentOrder.customerInfo?.city || "N/A",
    ship_postcode: paymentOrder.customerInfo?.postcode || "0000",
    ship_country: paymentOrder.customerInfo?.country || "Bangladesh",
  };
};

const initiateSslPayment = async (paymentOrder) => {
  const sslcz = getSslInstance();
  const paymentData = formatPaymentData(paymentOrder);
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
