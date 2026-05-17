import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../../services/api';
import { resolveImageUrl } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AdminLayout from './AdminLayout';
import ImageUploader from '../../components/ImageUploader';
import './Admin.css';

const EMPTY_FORM = {
  name: '',
  price: '',
  category: 'makeup',
  images: [],   // array of URL strings
  description: '',
  isActive: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getAllAdmin();
      setProducts(res.data.products || []);
    } catch {
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (product) => {
    setEditing(product._id);
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      // Support both old (single string) and new (array) products
      images: product.images?.length ? product.images : product.image ? [product.image] : [],
      description: product.description,
      isActive: product.isActive,
    });
    setModal(true);
  };

  const closeModal = () => setModal(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.images || form.images.length === 0) {
      addToast('Please upload at least one product image', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        images: form.images,
      };
      if (editing) {
        await productsAPI.update(editing, payload);
        addToast('Product updated!', 'success');
      } else {
        await productsAPI.create(payload);
        addToast('Product created!', 'success');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This will also remove its uploaded images.`)) return;
    try {
      await productsAPI.remove(id);
      addToast('Product deleted', 'default');
      fetchProducts();
    } catch {
      addToast('Failed to delete product', 'error');
    }
  };

  const handleToggleStatus = async (id, current) => {
    try {
      await productsAPI.toggleStatus(id, !current);
      addToast(`Product ${!current ? 'activated' : 'deactivated'}`, 'success');
      fetchProducts();
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  // Helper: get the display image for a product
  const getThumb = (p) => {
    const src = p.images?.[0] || p.image || '';
    return resolveImageUrl(src);
  };

  return (
    <AdminLayout title="Products">
      <div className="admin-section-header">
        <p className="admin-count">{products.length} products total</p>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-16) 0' }}>
          <div className="empty-state-icon">📦</div>
          <h2>No products yet</h2>
          <p>Add your first product to get started.</p>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Images</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="td-product">
                      <img
                        src={getThumb(p)}
                        alt={p.name}
                        className="td-thumb"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&size=60&background=f5d5dc&color=d4808f`;
                        }}
                      />
                      <span className="td-bold">{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="td-img-count">
                      {(p.images?.length || (p.image ? 1 : 0))} photo{(p.images?.length || 1) !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                  <td className="td-bold">{p.price.toLocaleString('ar-EG')} EGP</td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-success' : 'badge-error'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button
                        className={`btn btn-sm ${p.isActive ? 'btn-ghost' : 'btn-outline'}`}
                        onClick={() => handleToggleStatus(p._id, p.isActive)}
                      >
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ color: 'var(--error)', border: '1px solid var(--error)' }}
                        onClick={() => handleDelete(p._id, p.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Product Modal ─── */}
      {modal && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal-card animate-scale-in modal-card-wide">
            <div className="modal-header">
              <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              {/* ─ Product Name ─ */}
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Luminous Matte Lipstick"
                />
              </div>

              {/* ─ Price + Category ─ */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (EGP)</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="350"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="makeup">💄 Make-up</option>
                    <option value="accessories">✨ Accessories</option>
                  </select>
                </div>
              </div>

              {/* ─ Images ─ */}
              <div className="form-group">
                <label className="form-label">
                  Product Images
                  <span className="form-label-sub"> — up to 10, first is primary</span>
                </label>
                <ImageUploader
                  value={form.images}
                  onChange={(urls) => setForm(f => ({ ...f, images: urls }))}
                  maxImages={10}
                />
              </div>

              {/* ─ Description ─ */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the product..."
                />
              </div>

              {/* ─ Status ─ */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}
                >
                  <option value="true">Active — visible in shop</option>
                  <option value="false">Inactive — hidden from shop</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full btn-lg"
                disabled={saving || form.images.length === 0}
              >
                {saving ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="spinner spinner-sm" /> Saving…
                  </span>
                ) : (
                  editing ? 'Save Changes' : 'Add Product'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
