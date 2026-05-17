import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Customer pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

// Guard for admin routes
function AdminGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

// Layout wrapper for customer-facing pages
function CustomerLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ─── Customer Routes ─── */}
      <Route
        path="/"
        element={
          <CustomerLayout>
            <Home />
          </CustomerLayout>
        }
      />
      <Route
        path="/shop"
        element={
          <CustomerLayout>
            <Shop />
          </CustomerLayout>
        }
      />
      <Route
        path="/product/:id"
        element={
          <CustomerLayout>
            <ProductDetail />
          </CustomerLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <CustomerLayout>
            <Cart />
          </CustomerLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <CustomerLayout>
            <Checkout />
          </CustomerLayout>
        }
      />

      {/* ─── Admin Routes ─── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminGuard>
            <AdminDashboard />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminGuard>
            <AdminProducts />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminGuard>
            <AdminOrders />
          </AdminGuard>
        }
      />

      {/* Redirect /admin to /admin/login */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <CustomerLayout>
            <main className="page page-content">
              <div className="container empty-state">
                <div className="empty-state-icon">🔍</div>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <a href="/" className="btn btn-primary">Go Home</a>
              </div>
            </main>
          </CustomerLayout>
        }
      />
    </Routes>
  );
}
