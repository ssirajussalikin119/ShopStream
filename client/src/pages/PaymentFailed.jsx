import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId =
    searchParams.get("tran_id") || searchParams.get("tranId") || "N/A";

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-lg w-full mx-4">
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} className="text-red-500" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-500 mb-2">
          Something went wrong with your payment. Please try again.
        </p>
        <p className="text-gray-500 mb-8">
          Transaction ID:{" "}
          <span className="font-bold text-gray-800">{transactionId}</span>
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-base font-bold text-white hover:bg-blue-700 transition-colors"
          >
            Go Back to Shop
          </button>

          <button
            onClick={() => navigate("/contact")}
            className="w-full inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-5 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </main>
  );
};

export default PaymentFailed;
