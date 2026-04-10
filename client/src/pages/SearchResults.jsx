import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import Container from '../components/layout/Container/Container';
import AddToCartButton from '../components/cart/AddToCartButton';
import SaveForLaterButton from '../components/wishlist/SaveForLaterButton';
import { productAPI } from '../utils/api';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price || 0);

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const runSearch = async () => {
      if (!query) {
        if (mounted) {
          setProducts([]);
          setLoading(false);
          setError('');
        }
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await productAPI.search(query);
        if (!mounted) {
          return;
        }
        setProducts(Array.isArray(result) ? result : []);
      } catch (apiError) {
        if (!mounted) {
          return;
        }
        setError(apiError?.message || 'Unable to fetch search results.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    runSearch();

    return () => {
      mounted = false;
    };
  }, [query]);

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="mx-auto px-4 sm:px-6">
        <section className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Search</p>
          <h1 className="mt-1 text-2xl font-black text-gray-900">
            {query ? `Results for "${query}"` : 'Search products'}
          </h1>
          {!loading && !error && (
            <p className="mt-2 text-sm text-gray-500">
              {products.length} result{products.length === 1 ? '' : 's'} found
            </p>
          )}
        </section>

        {error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse bg-gray-200" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-5 w-4/5 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && !error && !query ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm text-gray-600">
            Type a keyword in the navbar search box to find products.
          </div>
        ) : null}

        {!loading && !error && query && products.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">
              No results found
            </h3>
            <p className="mt-2 text-gray-500">
              Try a different product name, brand, or category keyword.
            </p>
          </div>
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product._id}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div className="space-y-3 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    {product.brand || 'Brand'}
                  </p>

                  <h3 className="text-xl font-extrabold text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-sm leading-6 text-gray-500 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-700">
                      {(product.rating || 0).toFixed(1)}
                    </span>
                    <span>
                      ({product.reviewCount || 0} review
                      {Number(product.reviewCount || 0) === 1 ? '' : 's'})
                    </span>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-3xl font-black text-gray-900">
                        {formatPrice(product.price)}
                      </p>
                      {product.compareAtPrice ? (
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.inStock
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.inStock ? 'In stock' : 'Out of stock'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1">
                      <AddToCartButton
                        productId={product._id}
                        inStock={product.inStock}
                      />
                    </div>
                    <SaveForLaterButton productId={product._id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </Container>
    </main>
  );
};

export default SearchResults;
