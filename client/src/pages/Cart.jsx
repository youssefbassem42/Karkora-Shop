import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './Cart.css';

export default function Cart() {
  const { cart, cartTotal, removeFromCart, updateQuantity } = useCart();
  const { addToast } = useToast();

  const handleRemove = (item) => {
    removeFromCart(item._id);
    addToast(`${item.name} removed from cart`, 'default');
  };

  if (cart.length === 0) {
    return (
      <main className="page page-content">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🛍️</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet. Let's find something beautiful!</p>
            <Link to="/shop" className="btn btn-primary btn-lg">Start Shopping</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page page-content">
      <div className="container">
        <h1 className="cart-page-title">Your Cart</h1>
        <p className="cart-page-subtitle">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items card">
            {cart.map((item) => (
              <div key={item._id} className="cart-item">
                <Link to={`/product/${item._id}`} className="cart-item-img-link">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=f5d5dc&color=d4808f&size=200`;
                    }}
                  />
                </Link>

                <div className="cart-item-body">
                  <div className="cart-item-header">
                    <div>
                      <span className="badge badge-rose cart-item-cat">{item.category}</span>
                      <Link to={`/product/${item._id}`}>
                        <h3 className="cart-item-name">{item.name}</h3>
                      </Link>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => handleRemove(item)}
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="cart-item-footer">
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-price">
                      {(item.price * item.quantity).toLocaleString('ar-EG')} EGP
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary card">
            <h2 className="cart-summary-title">Order Summary</h2>

            <div className="cart-summary-rows">
              {cart.map((item) => (
                <div key={item._id} className="cart-summary-row">
                  <span>{item.name} ×{item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString('ar-EG')} EGP</span>
                </div>
              ))}
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-total">
              <span>Total</span>
              <span>{cartTotal.toLocaleString('ar-EG')} EGP</span>
            </div>

            <Link to="/checkout" className="btn btn-primary btn-lg w-full" style={{ marginTop: 'var(--space-6)' }}>
              Proceed to Checkout
            </Link>
            <Link to="/shop" className="btn btn-ghost btn-sm w-full" style={{ marginTop: 'var(--space-2)', textAlign: 'center' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
