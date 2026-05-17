import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../services/api';
import './Home.css';

const CATEGORIES = [
  {
    id: 'makeup',
    label: 'Make-up',
    emoji: '💄',
    desc: 'Lipsticks, palettes, foundations & more',
    bg: '#fdf0f2',
    darkBg: '#3a1520',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    emoji: '✨',
    desc: 'Necklaces, earrings, bracelets & more',
    bg: '#f5f0eb',
    darkBg: '#2d2218',
  },
];

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI
      .getAll({ limit: 8 })
      .then((res) => setTrending(res.data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page home-page">
      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="container hero-content animate-fade-up">
          <span className="section-label">New Collection 2025</span>
          <h1 className="hero-title">
            Elevate Your <br />
            <span className="hero-title-accent">Everyday Elegance</span>
          </h1>
          <p className="hero-subtitle">
            Discover our curated collection of premium makeup and timeless accessories
            designed for the modern woman.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary btn-lg">
              Shop Collection
            </Link>
            <Link to="/shop?category=makeup" className="btn btn-outline btn-lg">
              Explore Make-up
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">500+</span>
              <span className="hero-stat-label">Products</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">10k+</span>
              <span className="hero-stat-label">Happy Customers</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">100%</span>
              <span className="hero-stat-label">Premium Quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="home-categories">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Browse By</span>
            <h2 className="section-title">Our Categories</h2>
            <p className="section-subtitle">Everything you need, beautifully organized.</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.id}`} className="category-card">
                <div className="category-card-emoji">{cat.emoji}</div>
                <div className="category-card-body">
                  <h3>{cat.label}</h3>
                  <p>{cat.desc}</p>
                </div>
                <span className="category-card-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trending Products ─── */}
      <section className="home-trending">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Most Loved</span>
            <h2 className="section-title">Trending Now</h2>
            <p className="section-subtitle">Our most popular pieces this season — loved by thousands.</p>
          </div>

          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
            </div>
          ) : trending.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛍️</div>
              <h2>No products yet</h2>
              <p>Check back soon — we're adding amazing products!</p>
            </div>
          ) : (
            <div className="products-grid">
              {trending.map((product, i) => (
                <div key={product._id} style={{ animationDelay: `${i * 0.07}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {trending.length > 0 && (
            <div className="home-trending-cta">
              <Link to="/shop" className="btn btn-outline btn-lg">
                View All Products →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Features Banner ─── */}
      <section className="home-features">
        <div className="container features-grid">
          {[
            { icon: '🚚', title: 'Fast Delivery', desc: 'Quick delivery across Egypt' },
            { icon: '💎', title: 'Premium Quality', desc: 'Carefully selected products' },
            { icon: '🔄', title: 'Easy Returns', desc: 'Hassle-free 7-day returns' },
            { icon: '💬', title: '24/7 Support', desc: "We're always here to help" },
          ].map((f) => (
            <div key={f.title} className="feature-item">
              <span className="feature-icon">{f.icon}</span>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
