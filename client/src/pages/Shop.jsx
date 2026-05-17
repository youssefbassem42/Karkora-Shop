import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../services/api';
import './Shop.css';

const CATEGORIES = [
  { id: '', label: 'All Products' },
  { id: 'makeup', label: '💄 Make-up' },
  { id: 'accessories', label: '✨ Accessories' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const LIMIT = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page };
      if (category) params.category = category;
      if (search) params.search = search;
      const res = await productsAPI.getAll(params);
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const setCategory = (cat) => {
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    if (search) params.set('search', search);
    setSearchParams(params);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <main className="page page-content shop-page">
      <div className="container">
        {/* Header */}
        <div className="shop-header">
          <div>
            <h1 className="shop-title">
              {search ? `Search: "${search}"` : category ? CATEGORIES.find(c => c.id === category)?.label || 'Products' : 'All Products'}
            </h1>
            <p className="shop-count">{loading ? '...' : `${total} product${total !== 1 ? 's' : ''} found`}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="shop-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-pill ${category === cat.id ? 'active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h2>No products found</h2>
            <p>Try a different category or search term.</p>
            <button className="btn btn-primary" onClick={() => setSearchParams({})}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-grid shop-grid">
            {products.map((product, i) => (
              <div key={product._id} style={{ animationDelay: `${i * 0.05}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-outline btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span className="pagination-info">Page {page} of {totalPages}</span>
            <button
              className="btn btn-outline btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
