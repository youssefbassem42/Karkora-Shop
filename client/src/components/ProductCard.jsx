import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { resolveImageUrl } from '../services/api';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  // Normalize: support both images[] array and legacy image string
  const primaryImage = resolveImageUrl(
    (product.images?.length ? product.images[0] : product.image) || ''
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    addToast(`${product.name} added to cart!`, 'success');
  };

  return (
    <article className="product-card animate-fade-up">
      <Link to={`/product/${product._id}`} className="product-card-link" tabIndex={-1}>
        <div className="product-card-img-wrap">
          <img
            src={primaryImage}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f5d5dc&color=d4808f&size=300`;
            }}
          />
          <div className="product-card-overlay">
            <button
              className="product-card-atc btn btn-primary btn-sm"
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              Add to Cart
            </button>
          </div>
          <span className="product-card-category">{product.category === 'makeup' ? '💄 Make-up' : '✨ Accessories'}</span>
        </div>
      </Link>

      <div className="product-card-body">
        <Link to={`/product/${product._id}`} className="product-card-name-link">
          <h3 className="product-card-name">{product.name}</h3>
        </Link>
        <p className="product-card-desc">{product.description?.slice(0, 72)}{product.description?.length > 72 ? '…' : ''}</p>
        <div className="product-card-footer">
          <span className="product-card-price">{product.price.toLocaleString('ar-EG')} EGP</span>
          <button
            className="product-card-atc-mobile btn btn-rose btn-sm"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            + Cart
          </button>
        </div>
      </div>
    </article>
  );
}
