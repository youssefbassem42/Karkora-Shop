import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersAPI.getStats(),
      ordersAPI.getAll({ limit: 5 }),
    ])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.orders || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColors = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    shipped: 'badge-nude',
    delivered: 'badge-success',
    cancelled: 'badge-error',
  };

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--rose-xlight)', color: 'var(--rose-dark)' }}>📦</div>
              <div className="stat-body">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">{stats?.totalOrders ?? 0}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>💰</div>
              <div className="stat-body">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value">{(stats?.totalRevenue ?? 0).toLocaleString('ar-EG')} EGP</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>🛍️</div>
              <div className="stat-body">
                <span className="stat-label">Active Products</span>
                <span className="stat-value">{stats?.totalProducts ?? 0}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>⏳</div>
              <div className="stat-body">
                <span className="stat-label">Pending Orders</span>
                <span className="stat-value">{stats?.pendingOrders ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Recent Orders</h2>
              <Link to="/admin/orders" className="btn btn-outline btn-sm">View All</Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="empty-note">No orders yet.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="td-bold">{order.name}</td>
                        <td>{order.phone}</td>
                        <td>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                        <td className="td-bold">{order.totalPrice.toLocaleString('ar-EG')} EGP</td>
                        <td>
                          <span className={`badge ${statusColors[order.status] || 'badge-gray'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
