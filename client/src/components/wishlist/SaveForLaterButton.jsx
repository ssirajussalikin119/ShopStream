import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { wishlistAPI } from '../../utils/api';

const SaveForLaterButton = ({ productId, className = '' }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      setLoading(true);
      const response = await wishlistAPI.addItem(productId);
      if (response.success) {
        setSaved(true);
      }
    } catch {
      // Keep this silent in card UI to avoid breaking shopping flow.
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        saved
          ? 'bg-pink-100 text-pink-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } disabled:opacity-70 ${className}`}
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Heart
          size={13}
          className={saved ? 'fill-pink-600 text-pink-600' : ''}
        />
      )}
      {saved ? 'Saved' : 'Save for Later'}
    </button>
  );
};

export default SaveForLaterButton;
