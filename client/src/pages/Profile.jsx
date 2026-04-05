import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../utils/api";
import { Link } from "react-router-dom";
import { User, Mail, Shield, Calendar, Package, Heart, ShoppingCart, LogOut, Edit2, CheckCircle } from "lucide-react";
import Container from "../components/layout/Container/Container";

const ProfilePage = () => {
  const { user, token, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) { setError("No authentication token"); setLoading(false); return; }
    authAPI.getMe()
      .then((res) => { if (res.success) setUserData(res.data); else setError(res.message); })
      .catch((e) => setError(e?.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [token]);

  const displayUser = userData || user;

  const handleSaveName = () => {
    if (!newName.trim()) return;
    setSaved(true);
    setEditName(false);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-black text-gray-900 mb-8">My Account</h1>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 mb-6">{error}</div>
          )}

          {displayUser && (
            <div className="space-y-5">
              {/* Avatar card */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-black shrink-0">
                  {(displayUser.name || displayUser.email || "U")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  {editName ? (
                    <div className="flex gap-2 items-center">
                      <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your name"
                      />
                      <button onClick={handleSaveName} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Save</button>
                      <button onClick={() => setEditName(false)} className="text-gray-400 text-sm">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-gray-900">{newName || displayUser.name || "ShopStream User"}</h2>
                      <button onClick={() => { setEditName(true); setNewName(newName || displayUser.name || ""); }} className="text-gray-400 hover:text-blue-600 transition">
                        <Edit2 size={15} />
                      </button>
                      {saved && <CheckCircle size={15} className="text-green-500" />}
                    </div>
                  )}
                  <p className="text-gray-500 text-sm mt-1">{displayUser.email}</p>
                  <span className={`mt-2 inline-block text-xs font-bold px-3 py-1 rounded-full ${displayUser.role === "admin" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                    {displayUser.role?.toUpperCase() || "USER"}
                  </span>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { icon: <Mail size={18} />, label: "Email Address", value: displayUser.email },
                  { icon: <Shield size={18} />, label: "Account Status", value: displayUser.isActive !== false ? "Active" : "Inactive", valueClass: displayUser.isActive !== false ? "text-green-600" : "text-red-600" },
                  { icon: <Calendar size={18} />, label: "Member Since", value: displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                  { icon: <User size={18} />, label: "Account Role", value: displayUser.role || "user" },
                ].map(({ icon, label, value, valueClass }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                    <div className="bg-blue-50 text-blue-600 rounded-xl w-10 h-10 flex items-center justify-center shrink-0">{icon}</div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                      <p className={`font-bold text-gray-900 mt-0.5 capitalize ${valueClass || ""}`}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-black text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <Link to="/orders" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition group">
                    <Package size={20} className="text-gray-400 group-hover:text-blue-600" />
                    <span className="font-semibold text-gray-700 group-hover:text-blue-700 text-sm">Order History</span>
                  </Link>
                  <Link to="/favourites" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50 transition group">
                    <Heart size={20} className="text-gray-400 group-hover:text-red-600" />
                    <span className="font-semibold text-gray-700 group-hover:text-red-700 text-sm">Favourites</span>
                  </Link>
                  <Link to="/cart" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition group">
                    <ShoppingCart size={20} className="text-gray-400 group-hover:text-green-600" />
                    <span className="font-semibold text-gray-700 group-hover:text-green-700 text-sm">My Cart</span>
                  </Link>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl py-4 font-bold transition"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
};

export default ProfilePage;
