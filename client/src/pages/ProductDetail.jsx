import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI, resolveImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    productsAPI
      .getById(id)
      .then((res) => {
        setProduct(res.data);
        if (res.data.name) document.title = `${res.data.name} | KarKora Shop`;
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    addToast(`${quantity}× ${product.name} added to cart!`, 'success');
  };

  if (loading) return (
    <main className="page loading-center">
      <div className="spinner" />
    </main>
  );

  if (!product) return (
    <main className="page page-content">
      <div className="container empty-state">
        <div className="empty-state-icon">😕</div>
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    </main>
  );

  // Normalize: support both `images[]` array and legacy `image` string
  const images = (product.images?.length ? product.images : product.image ? [product.image] : [])
    .map(resolveImageUrl);

  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f5d5dc&color=d4808f&size=600`;

  return (
    <main className="page page-content">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} style={{ textTransform: 'capitalize' }}>
            {product.category}
          </Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-layout animate-fade-up">
          {/* ─── Gallery ─── */}
          <div className="product-gallery">
            {/* Main image */}
            <div className="product-gallery-main">
              {images.length > 0 ? (
                <img
                  key={activeImg}
                  src={images[activeImg]}
                  alt={`${product.name} — photo ${activeImg + 1}`}
                  className="animate-fade-in"
                  onError={(e) => { e.target.src = fallbackSrc; }}
                />
              ) : (
                <img src={fallbackSrc} alt={product.name} />
              )}

              {/* Arrow navigation (only if multiple images) */}
              {images.length > 1 && (
                <>
                  <button
                    className="gallery-arrow gallery-arrow-left"
                    onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    className="gallery-arrow gallery-arrow-right"
                    onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                  <span className="gallery-counter">{activeImg + 1} / {images.length}</span>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="product-gallery-thumbs">
                {images.map((src, i) => (
                  <button
                    key={i}
                    className={`gallery-thumb ${i === activeImg ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={src}
                      alt={`Thumbnail ${i + 1}`}
                      onError={(e) => { e.target.src = fallbackSrc; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Details ─── */}
          <div className="product-details">
            <span className="badge badge-rose product-category-badge">
              {product.category === 'makeup' ? '💄 Make-up' : '✨ Accessories'}
            </span>

            <h1 className="product-details-name">{product.name}</h1>

            <div className="product-details-price">
              {product.price.toLocaleString('ar-EG')} <span>EGP</span>
            </div>

            <p className="product-details-desc">{product.description}</p>

            <div className="product-details-divider" />

            {/* Quantity */}
            <div className="product-details-qty">
              <label className="form-label">Quantity</label>
              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="qty-display">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="product-details-actions">
              <button className="btn btn-primary btn-lg w-full" onClick={handleAddToCart}>
                Add to Cart · {(product.price * quantity).toLocaleString('ar-EG')} EGP
              </button>
              <Link to="/cart" className="btn btn-outline btn-lg w-full">
                Go to Cart
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="product-trust">
              <span>🚚 Fast delivery across Egypt</span>
              <span>💎 Premium quality guaranteed</span>
              <span>🔄 Easy 7-day returns</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
