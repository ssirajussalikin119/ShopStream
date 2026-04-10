import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sellerAPI } from '../utils/api';
import { shopCategories } from '../data/catalogData';

const initialProductForm = {
  name: '',
  price: '',
  description: '',
  stockQuantity: '',
  category: '',
  images: [],
  status: 'published',
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
  import.meta.env.CLOUDINARY_CLOUD_NAME ||
  '';
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
  import.meta.env.CLOUDINARY_UPLOAD_PRESET ||
  'seller_products';
const CLOUDINARY_CLOUD_NAME_VALUE = CLOUDINARY_CLOUD_NAME.trim();
const CLOUDINARY_UPLOAD_PRESET_VALUE = CLOUDINARY_UPLOAD_PRESET.trim();
const CATEGORY_OPTIONS = shopCategories.map((category) => ({
  value: category.slug,
  label: category.name,
}));

const formatCloudinaryUploadError = (message) => {
  const normalizedMessage = String(message || '').trim();
  const lowerMessage = normalizedMessage.toLowerCase();

  if (lowerMessage.includes('unknown api key')) {
    return `Cloudinary rejected the upload setup. Check that VITE_CLOUDINARY_CLOUD_NAME is your Cloudinary cloud name, not your API key, and that preset "${CLOUDINARY_UPLOAD_PRESET_VALUE}" belongs to the same Cloudinary account.`;
  }

  if (
    lowerMessage.includes('upload preset') &&
    lowerMessage.includes('not found')
  ) {
    return `Cloudinary upload preset "${CLOUDINARY_UPLOAD_PRESET_VALUE}" was not found. Create that preset in Cloudinary and set it to unsigned uploads.`;
  }

  if (lowerMessage.includes('unsigned')) {
    return `Cloudinary upload preset "${CLOUDINARY_UPLOAD_PRESET_VALUE}" is not enabled for unsigned uploads. In Cloudinary, edit the preset and mark it as unsigned.`;
  }

  if (normalizedMessage) {
    return `Cloudinary upload failed: ${normalizedMessage}`;
  }

  return 'Cloudinary upload failed. Check the Cloudinary cloud name and unsigned upload preset.';
};

const SellerDashboard = () => {
  const { user, updateUser } = useAuth();
  const isSeller =
    user?.role === 'seller' ||
    user?.accountType === 'seller' ||
    user?.accountType === 'both';

  const [shopForm, setShopForm] = useState({
    shopName: '',
    shopLogo: '',
    email: '',
    joinedAt: '',
  });
  const [productForm, setProductForm] = useState(initialProductForm);
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingShop, setSavingShop] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeSection, setActiveSection] = useState('shop-profile');
  const [rowLoadingId, setRowLoadingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSellerData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, productsRes] = await Promise.all([
        sellerAPI.getProfile(),
        sellerAPI.getProducts(),
      ]);

      if (profileRes.success) {
        setShopForm({
          shopName: profileRes.data.shopName || '',
          shopLogo: profileRes.data.shopLogo || '',
          email: profileRes.data.email || '',
          joinedAt: profileRes.data.joinedAt || '',
        });
      }

      if (productsRes.success) {
        setProducts(productsRes.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load seller dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSeller) {
      loadSellerData();
    }
  }, [isSeller]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleShopSave = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      setSavingShop(true);
      console.log('[SellerDashboard] Saving shop profile:', {
        shopName: shopForm.shopName,
        shopLogo: shopForm.shopLogo,
        email: shopForm.email,
      });

      const response = await sellerAPI.updateProfile({
        shopName: shopForm.shopName,
        shopLogo: shopForm.shopLogo,
        email: shopForm.email,
      });

      console.log('[SellerDashboard] Save response:', response);

      if (response.success) {
        console.log(
          '[SellerDashboard] Success! Updating local state and user context'
        );
        setShopForm((prev) => ({
          ...prev,
          shopName: response.data.shopName,
          shopLogo: response.data.shopLogo,
          email: response.data.email,
        }));

        if (user) {
          updateUser({
            ...user,
            email: response.data.email,
            shopName: response.data.shopName,
            shopLogo: response.data.shopLogo,
          });
        }

        setSuccess('Shop profile updated successfully.');
      } else {
        console.warn('[SellerDashboard] Response success=false:', response);
        setError(response.message || 'Failed to update shop profile');
      }
    } catch (err) {
      console.error('[SellerDashboard] Catch block error:', err);
      setError(err.message || 'Failed to update shop profile');
    } finally {
      setSavingShop(false);
    }
  };

  const buildPayload = (form) => ({
    name: form.name,
    price: Number(form.price),
    description: form.description,
    stockQuantity: Number(form.stockQuantity),
    category: form.category,
    images: (form.images || []).filter(Boolean),
    status: form.status,
  });

  const uploadFileToCloudinary = async (file) => {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME_VALUE}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET_VALUE);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.secure_url) {
      throw new Error(formatCloudinaryUploadError(data?.error?.message));
    }

    return data.secure_url;
  };

  const handleImageSelect = async (event) => {
    clearMessages();

    if (!CLOUDINARY_CLOUD_NAME_VALUE) {
      setError(
        'Cloudinary cloud name missing. Set VITE_CLOUDINARY_CLOUD_NAME in client environment.'
      );
      return;
    }

    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) {
      return;
    }

    const invalidTypeFile = selectedFiles.find(
      (file) => !ACCEPTED_IMAGE_TYPES.includes(file.type)
    );
    if (invalidTypeFile) {
      setError('Only JPG, PNG, and WEBP files are allowed.');
      event.target.value = '';
      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_IMAGE_SIZE_BYTES
    );
    if (oversizedFile) {
      setError('Image size must be 5MB or less.');
      event.target.value = '';
      return;
    }

    try {
      setUploadingImages(true);
      const uploadedUrls = [];

      for (const file of selectedFiles) {
        const secureUrl = await uploadFileToCloudinary(file);
        uploadedUrls.push(secureUrl);
      }

      setProductForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
      setSuccess('Image uploaded successfully.');
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };

  const removeImageAtIndex = (index) => {
    setProductForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleLogoSelect = async (event) => {
    clearMessages();

    if (!CLOUDINARY_CLOUD_NAME_VALUE) {
      setError(
        'Cloudinary cloud name missing. Set VITE_CLOUDINARY_CLOUD_NAME in client environment.'
      );
      return;
    }

    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(selectedFile.type)) {
      setError('Only JPG, PNG, and WEBP files are allowed.');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
      setError('Image size must be 5MB or less.');
      event.target.value = '';
      return;
    }

    try {
      setUploadingLogo(true);
      const secureUrl = await uploadFileToCloudinary(selectedFile);
      setShopForm((prev) => ({
        ...prev,
        shopLogo: secureUrl,
      }));
      setSuccess('Shop logo uploaded successfully.');
    } catch (err) {
      setError(err.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
      event.target.value = '';
    }
  };

  const removeShopLogo = () => {
    setShopForm((prev) => ({
      ...prev,
      shopLogo: '',
    }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (
      !productForm.name ||
      !productForm.price ||
      !productForm.stockQuantity ||
      !productForm.category
    ) {
      setError('Please fill name, price, stock quantity and category.');
      return;
    }

    try {
      setSavingProduct(true);
      if (editingProductId) {
        const updateRes = await sellerAPI.updateProduct(
          editingProductId,
          buildPayload(productForm)
        );
        if (updateRes.success) {
          setSuccess('Product updated successfully.');
        }
      } else {
        const createRes = await sellerAPI.addProduct(buildPayload(productForm));
        if (createRes.success) {
          setSuccess('Product added successfully.');
        }
      }

      setProductForm(initialProductForm);
      setEditingProductId(null);
      await loadSellerData();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const startEdit = (item) => {
    clearMessages();
    setActiveSection('add-product');
    const matchedCategory = CATEGORY_OPTIONS.find(
      (option) =>
        option.value === item.categorySlug ||
        option.label.toLowerCase() ===
          String(item.categoryName || '').toLowerCase()
    );

    setEditingProductId(item._id);
    setProductForm({
      name: item.name || '',
      price: item.price ?? '',
      description: item.description || '',
      stockQuantity: item.stockCount ?? '',
      category: matchedCategory?.value || item.categorySlug || '',
      images: (item.images || [item.image]).filter(Boolean),
      status: item.status || 'draft',
    });
  };

  const handleDelete = async (productId) => {
    clearMessages();
    try {
      setRowLoadingId(productId);
      const response = await sellerAPI.deleteProduct(productId);
      if (response.success) {
        setProducts((prev) => prev.filter((item) => item._id !== productId));
        setSuccess('Product deleted successfully.');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setRowLoadingId('');
    }
  };

  const handleToggleStatus = async (productId) => {
    clearMessages();
    try {
      setRowLoadingId(productId);
      const response = await sellerAPI.toggleStatus(productId);
      if (response.success) {
        setProducts((prev) =>
          prev.map((item) =>
            item._id === productId
              ? { ...item, status: response.data.status }
              : item
          )
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle product status');
    } finally {
      setRowLoadingId('');
    }
  };

  const sortedProducts = useMemo(
    () =>
      [...products].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [products]
  );

  const dashboardStats = useMemo(() => {
    const totalProducts = sortedProducts.length;
    const publishedCount = sortedProducts.filter(
      (item) => item.status === 'published'
    ).length;
    const draftCount = totalProducts - publishedCount;
    const totalSales = sortedProducts.reduce(
      (sum, item) => sum + Number(item.soldCount || 0),
      0
    );

    return {
      totalProducts,
      publishedCount,
      draftCount,
      totalSales,
    };
  }, [sortedProducts]);

  if (!isSeller) {
    return <Navigate to="/profile" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading seller dashboard...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-lg">
          <h1 className="text-3xl font-black">Seller Dashboard</h1>
          <p className="mt-1 text-sm text-blue-100">
            Manage your shop profile, products, publishing status, and sales
            visibility.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Total Products
            </p>
            <p className="mt-2 text-3xl font-black text-gray-900">
              {dashboardStats.totalProducts}
            </p>
          </article>
          <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Published
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-900">
              {dashboardStats.publishedCount}
            </p>
          </article>
          <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Draft
            </p>
            <p className="mt-2 text-3xl font-black text-amber-900">
              {dashboardStats.draftCount}
            </p>
          </article>
          <article className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Total Sales
            </p>
            <p className="mt-2 text-3xl font-black text-indigo-900">
              {dashboardStats.totalSales}
            </p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <nav className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveSection('shop-profile')}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  activeSection === 'shop-profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Shop Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('add-product')}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  activeSection === 'add-product'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {editingProductId ? 'Edit Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('my-products')}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  activeSection === 'my-products'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                My Products
              </button>
            </nav>
          </aside>

          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-300 bg-green-100 px-4 py-3 text-green-700">
                {success}
              </div>
            )}

            {activeSection === 'shop-profile' && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Shop Profile</h2>
                <form
                  onSubmit={handleShopSave}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shop Name
                    </label>
                    <input
                      value={shopForm.shopName}
                      onChange={(e) =>
                        setShopForm((prev) => ({
                          ...prev,
                          shopName: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="My Awesome Store"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seller Email
                    </label>
                    <input
                      type="email"
                      value={shopForm.email}
                      onChange={(e) =>
                        setShopForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="seller@email.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shop Logo (JPG, PNG, WEBP, max 5MB)
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleLogoSelect}
                      disabled={uploadingLogo}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Uploads use Cloudinary unsigned preset:{' '}
                      {CLOUDINARY_UPLOAD_PRESET_VALUE}
                    </p>
                    {import.meta.env.DEV && (
                      <p className="text-xs text-gray-400 mt-1">
                        Debug upload target: cloud{' '}
                        {CLOUDINARY_CLOUD_NAME_VALUE || '(missing)'}, preset{' '}
                        {CLOUDINARY_UPLOAD_PRESET_VALUE || '(missing)'}
                      </p>
                    )}

                    <p className="text-xs text-amber-700 mt-1">
                      Do not put your Cloudinary API secret in the frontend.
                      This page only needs the cloud name and an unsigned upload
                      preset.
                    </p>

                    {uploadingLogo && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                        Uploading logo...
                      </div>
                    )}

                    {shopForm.shopLogo && (
                      <div className="mt-3 relative rounded-lg overflow-hidden border border-gray-200 bg-white max-w-xs">
                        <img
                          src={shopForm.shopLogo}
                          alt="Shop logo preview"
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeShopLogo}
                          className="absolute top-1 right-1 bg-red-600 text-white text-[11px] font-semibold px-2 py-1 rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Join Date
                    </label>
                    <input
                      value={
                        shopForm.joinedAt
                          ? new Date(shopForm.joinedAt).toLocaleDateString()
                          : ''
                      }
                      readOnly
                      className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={savingShop || uploadingLogo}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-70"
                    >
                      {savingShop ? 'Saving...' : 'Save Shop Profile'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeSection === 'add-product' && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">
                  {editingProductId ? 'Edit Product' : 'Add Product'}
                </h2>
                <form
                  onSubmit={handleProductSubmit}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.stockQuantity}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          stockQuantity: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select category</option>
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={3}
                      placeholder="Product description"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Images (JPG, PNG, WEBP, max 5MB each)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleImageSelect}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Uploads use Cloudinary unsigned preset:{' '}
                      {CLOUDINARY_UPLOAD_PRESET_VALUE}
                    </p>
                    {import.meta.env.DEV && (
                      <p className="text-xs text-gray-400 mt-1">
                        Debug upload target: cloud{' '}
                        {CLOUDINARY_CLOUD_NAME_VALUE || '(missing)'}, preset{' '}
                        {CLOUDINARY_UPLOAD_PRESET_VALUE || '(missing)'}
                      </p>
                    )}
                    <p className="text-xs text-amber-700 mt-1">
                      Do not put your Cloudinary API secret in the frontend.
                      This page only needs the cloud name and an unsigned upload
                      preset.
                    </p>

                    {uploadingImages && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                        Uploading image(s)...
                      </div>
                    )}

                    {(productForm.images || []).length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {(productForm.images || []).map((url, index) => (
                          <div
                            key={`${url}-${index}`}
                            className="relative rounded-lg overflow-hidden border border-gray-200 bg-white"
                          >
                            <img
                              src={url}
                              alt={`Product preview ${index + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImageAtIndex(index)}
                              className="absolute top-1 right-1 bg-red-600 text-white text-[11px] font-semibold px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={productForm.status}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      disabled={savingProduct || uploadingImages}
                      className="bg-gray-900 hover:bg-black text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-70"
                    >
                      {savingProduct
                        ? 'Saving...'
                        : editingProductId
                          ? 'Update Product'
                          : 'Add Product'}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProductId(null);
                          setProductForm(initialProductForm);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-semibold"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </section>
            )}

            {activeSection === 'my-products' && (
              <section className="overflow-x-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">My Products</h2>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="py-2 pr-4">Product Name</th>
                      <th className="py-2 pr-4">Price</th>
                      <th className="py-2 pr-4">Stock</th>
                      <th className="py-2 pr-4">Sold Count</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.length === 0 ? (
                      <tr>
                        <td className="py-4 text-gray-500" colSpan={6}>
                          No products yet.
                        </td>
                      </tr>
                    ) : (
                      sortedProducts.map((item) => (
                        <tr key={item._id} className="border-b border-gray-100">
                          <td className="py-3 pr-4 font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="py-3 pr-4">
                            ${Number(item.price || 0).toFixed(2)}
                          </td>
                          <td className="py-3 pr-4">{item.stockCount || 0}</td>
                          <td className="py-3 pr-4">{item.soldCount || 0}</td>
                          <td className="py-3 pr-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                item.status === 'published'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {item.status === 'published'
                                ? 'Published'
                                : 'Draft'}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => startEdit(item)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                disabled={rowLoadingId === item._id}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-md font-semibold disabled:opacity-70"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleToggleStatus(item._id)}
                                disabled={rowLoadingId === item._id}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md font-semibold disabled:opacity-70"
                              >
                                {item.status === 'published'
                                  ? 'Set Draft'
                                  : 'Publish'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default SellerDashboard;
