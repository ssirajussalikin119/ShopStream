import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../utils/api";

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const response = await authAPI.getMe();
        if (response.success) {
          setUserData(response.data);
        } else {
          setError(response.message || "Failed to fetch profile");
        }
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const displayUser = userData || user;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">My Profile</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {displayUser ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-lg font-semibold">
                {displayUser.email || displayUser._id}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Role</p>
              <p className="text-lg font-semibold capitalize">
                {displayUser.role || "user"}
              </p>
            </div>

            {displayUser.createdAt && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Joined</p>
                <p className="text-lg font-semibold">
                  {new Date(displayUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {displayUser.isActive !== undefined && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Status</p>
                <p
                  className={`text-lg font-semibold ${displayUser.isActive ? "text-green-600" : "text-red-600"}`}
                >
                  {displayUser.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-600">No user data available</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
