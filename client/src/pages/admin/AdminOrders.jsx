import { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AdminLayout from './AdminLayout';
import './Admin.css';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_BADGE = {
  pending:   'badge-warning',
  confirmed: 'badge-info',
  shipped:   'badge-nude',
  delivered: 'badge-success',
  cancelled: 'badge-error',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('');
  const { addToast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const res = await ordersAPI.getAll(params);
      setOrders(res.data.orders || []);
    } catch {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status);
      addToast('Order status updated', 'success');
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <AdminLayout title="Orders">
      {/* Filters */}
      <div className="admin-filters">
        <button
          className={`category-pill ${filter === '' ? 'active' : ''}`}
          onClick={() => setFilter('')}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`category-pill ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
            style={{ textTransform: 'capitalize' }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h2>No orders found</h2>
          <p>Orders will appear here as customers place them.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card card">
              <div
                className="order-card-header"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                role="button"
                tabIndex={0}
              >
                <div className="order-card-meta">
                  <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`}>
                    {order.status}
                  </span>
                  <span className="order-id">#{order._id.slice(-8)}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="order-card-info">
                  <div>
                    <span className="order-customer">👤 {order.name}</span>
                    <span className="order-phone">📞 {order.phone}</span>
                    <span className="order-address">📍 {order.address}</span>
                  </div>
                  <div className="order-total">
                    {order.totalPrice.toLocaleString('ar-EG')} EGP
                  </div>
                  <span className="order-expand-icon">{expanded === order._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {expanded === order._id && (
                <div className="order-card-body animate-fade-in">
                  <div className="order-items">
                    {order.items.map((item, i) => (
                      <div key={i} className="order-item">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="order-item-img"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div className="order-item-body">
                          <span className="order-item-name">{item.name}</span>
                          <span className="order-item-qty">×{item.quantity}</span>
                        </div>
                        <span className="order-item-price">
                          {(item.price * item.quantity).toLocaleString('ar-EG')} EGP
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="order-status-control">
                    <label className="form-label">Update Status</label>
                    <select
                      className="form-control"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      style={{ maxWidth: 200 }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} style={{ textTransform: 'capitalize' }}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
