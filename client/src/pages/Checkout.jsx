import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI } from '../services/api';
import './Checkout.css';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [errors, setErrors] = useState({});

  if (cart.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^[0-9+\s-]{7,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
    if (!form.address.trim()) errs.address = 'Delivery address is required';
    return errs;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        totalPrice: cartTotal,
      };

      await ordersAPI.create(payload);
      clearCart();
      setSuccess(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="page page-content">
        <div className="container checkout-success animate-scale-in">
          <div className="success-icon">🎉</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase, <strong>{form.name}</strong>! We'll contact you on <strong>{form.phone}</strong> shortly to confirm your order.</p>
          <Link to="/" className="btn btn-primary btn-lg">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page page-content checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <Link to="/cart" className="btn btn-ghost btn-sm">← Back to Cart</Link>
        </div>

        <div className="checkout-layout">
          {/* Form */}
          <form onSubmit={handleSubmit} className="checkout-form card" id="checkout-form">
            <h2>Shipping Information</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`form-control ${errors.name ? 'input-error' : ''}`}
                placeholder="Sara Ahmed"
                autoComplete="name"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`form-control ${errors.phone ? 'input-error' : ''}`}
                placeholder="+20 100 000 0000"
                autoComplete="tel"
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Delivery Address</label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                className={`form-control ${errors.address ? 'input-error' : ''}`}
                placeholder="Street, District, City, Egypt"
                rows={4}
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>
          </form>

          {/* Summary */}
          <div className="checkout-summary">
            <div className="card checkout-summary-card">
              <h2>Order Summary</h2>

              <div className="checkout-items">
                {cart.map((item) => (
                  <div key={item._id} className="checkout-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="checkout-item-img"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=f5d5dc&color=d4808f&size=100`;
                      }}
                    />
                    <div className="checkout-item-body">
                      <span className="checkout-item-name">{item.name}</span>
                      <span className="checkout-item-qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="checkout-item-price">
                      {(item.price * item.quantity).toLocaleString('ar-EG')} EGP
                    </span>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-total">
                <span>Total</span>
                <span>{cartTotal.toLocaleString('ar-EG')} EGP</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="btn btn-primary btn-lg w-full"
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="spinner spinner-sm" /> Processing…
                  </span>
                ) : (
                  `Place Order · ${cartTotal.toLocaleString('ar-EG')} EGP`
                )}
              </button>

              <p className="checkout-note">
                🔒 Your information is safe and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
