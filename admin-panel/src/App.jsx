import React, { useState, useEffect } from 'react';
import {
  uploadProductImage,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from './services/products';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import Login, { isAuthenticated, setAuthenticated } from './components/Login';
import './App.css';

const STEPS = ['image', 'name', 'price', 'description', 'save'];

function App() {
  const [auth, setAuth] = useState(() => isAuthenticated());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [step, setStep] = useState('image');
  const [form, setForm] = useState({
    imageFile: null,
    imageUrl: '',
    name: '',
    price: '',
    shortDescription: '',
  });
  const [submitStatus, setSubmitStatus] = useState(''); // 'uploading' | 'saving' | 'done' | 'error'

  const loadProducts = async () => {
    setLoading(true);
    try {
      const list = await getProducts();
      setProducts(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({
      imageFile: null,
      imageUrl: '',
      name: '',
      price: '',
      shortDescription: '',
    });
    setStep('image');
    setSubmitStatus('');
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      imageFile: null,
      imageUrl: product.imageUrl || '',
      name: product.name || '',
      price: product.price ?? '',
      shortDescription: product.shortDescription || '',
    });
    setStep('image');
    setSubmitStatus('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setStep('image');
    setSubmitStatus('');
  };

  const setFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: URL.createObjectURL(file),
    }));
    setStep('name');
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return;
    const priceNum = parseFloat(String(form.price).replace(/,/, '.')) || 0;

    setSubmitStatus('uploading');
    let imageUrl = form.imageUrl;

    if (form.imageFile) {
      try {
        imageUrl = await uploadProductImage(form.imageFile);
      } catch (err) {
        console.error(err);
        setSubmitStatus('error');
        return;
      }
    }

    setSubmitStatus('saving');
    try {
      const data = {
        name: form.name.trim(),
        price: priceNum,
        shortDescription: (form.shortDescription || '').trim(),
        imageUrl: imageUrl || null,
      };
      if (editingId) {
        await updateProduct(editingId, data);
      } else {
        await addProduct(data);
      }
      setSubmitStatus('done');
      await loadProducts();
      setTimeout(closeForm, 800);
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  if (!auth) {
    return <Login onSuccess={() => setAuth(true)} />;
  }

  const handleLogout = () => {
    setAuthenticated(false);
    setAuth(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mega Market — Admin</h1>
        <div className="app-header-actions">
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            + Add Product
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Chiqish
          </button>
        </div>
      </header>

      <main className="app-main">
        {loading ? (
          <p className="loading">Loading products…</p>
        ) : (
          <ProductList
            products={products}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      {formOpen && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button type="button" className="btn-close" onClick={closeForm} aria-label="Close">
                ×
              </button>
            </div>
            <ProductForm
              step={step}
              form={form}
              setFormField={setFormField}
              setStep={setStep}
              onImageSelect={handleImageSelect}
              onSave={handleSave}
              submitStatus={submitStatus}
              editingId={editingId}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
