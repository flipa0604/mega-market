import React, { useState, useEffect } from 'react';
import {
  uploadProductImage,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from './services/products';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from './services/categories';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import CategoryList from './components/CategoryList';
import Login, { isAuthenticated, setAuthenticated } from './components/Login';
import './App.css';

function App() {
  const [auth, setAuth] = useState(() => isAuthenticated());
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [step, setStep] = useState('image');
  const [form, setForm] = useState({
    categoryId: '',
    categoryName: '',
    imageFile: null,
    imageUrl: '',
    name: '',
    price: '',
    shortDescription: '',
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const productsInCategory = selectedCategoryId
    ? products.filter((p) => p.categoryId === selectedCategoryId)
    : [];

  const loadCategories = async () => {
    try {
      const list = await getCategories();
      setCategories(list);
    } catch (err) {
      console.error(err);
    }
  };

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
    loadCategories();
    loadProducts();
  }, []);

  const openCategory = (cat) => {
    setSelectedCategoryId(cat.id);
  };

  const backToCategories = () => {
    setSelectedCategoryId(null);
  };

  const openAdd = () => {
    if (!selectedCategoryId || !selectedCategory) return;
    setEditingId(null);
    setForm({
      categoryId: selectedCategoryId,
      categoryName: selectedCategory.name,
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
    const cat = categories.find((c) => c.id === product.categoryId) || selectedCategory;
    setForm({
      categoryId: product.categoryId || selectedCategoryId || '',
      categoryName: cat?.name || '',
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

  const openCategoryAdd = () => {
    setEditingCategoryId(null);
    setCategoryNameInput('');
    setCategoryModalOpen(true);
  };

  const openCategoryEdit = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryNameInput(cat.name);
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditingCategoryId(null);
    setCategoryNameInput('');
  };

  const handleCategorySave = async () => {
    const name = categoryNameInput.trim();
    if (!name) return;
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, name);
      } else {
        await addCategory(name);
      }
      await loadCategories();
      closeCategoryModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryDelete = async (id) => {
    if (!confirm('Kategoriyani o‘chirish? Unga tegishli mahsulotlar kategoriyasiz qoladi.')) return;
    try {
      await deleteCategory(id);
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
      await loadCategories();
    } catch (err) {
      console.error(err);
    }
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

    if (!form.categoryId?.trim()) {
      setSubmitStatus('error');
      return;
    }
    setSubmitStatus('saving');
    try {
      const data = {
        categoryId: form.categoryId.trim(),
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
    if (!confirm('Mahsulotni o‘chirish?')) return;
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

  const fixedCategory =
    selectedCategoryId && selectedCategory
      ? { id: selectedCategoryId, name: selectedCategory.name }
      : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mega Market — Admin</h1>
        <div className="app-header-actions">
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Chiqish
          </button>
        </div>
      </header>

      <main className="app-main">
        {!selectedCategoryId ? (
          <CategoryList
            categories={categories}
            onOpenCategory={openCategory}
            onAdd={openCategoryAdd}
            onEdit={openCategoryEdit}
            onDelete={handleCategoryDelete}
          />
        ) : (
          <section className="category-products-section">
            <div className="category-products-header">
              <button type="button" className="btn btn-ghost back-categories-btn" onClick={backToCategories}>
                ← Kategoriyalarga qaytish
              </button>
              <div className="category-products-title-row">
                <h2 className="category-products-title">{selectedCategory?.name}</h2>
                <button type="button" className="btn btn-primary" onClick={openAdd}>
                  + Mahsulot qo‘shish
                </button>
              </div>
            </div>
            {loading ? (
              <p className="loading">Yuklanmoqda…</p>
            ) : (
              <ProductList
                products={productsInCategory}
                categories={categories}
                hideCategoryBadge
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            )}
          </section>
        )}
      </main>

      {categoryModalOpen && (
        <div className="modal-overlay" onClick={closeCategoryModal}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategoryId ? 'Kategoriyani tahrirlash' : 'Kategoriya qo‘shish'}</h2>
              <button type="button" className="btn-close" onClick={closeCategoryModal} aria-label="Close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nomi</label>
                <input
                  type="text"
                  value={categoryNameInput}
                  onChange={(e) => setCategoryNameInput(e.target.value)}
                  placeholder="Kategoriya nomi"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={closeCategoryModal}>
                  Bekor qilish
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCategorySave}
                  disabled={!categoryNameInput.trim()}
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {formOpen && fixedCategory && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Mahsulotni tahrirlash' : 'Mahsulot qo‘shish'}</h2>
              <button type="button" className="btn-close" onClick={closeForm} aria-label="Close">
                ×
              </button>
            </div>
            <ProductForm
              step={step}
              form={form}
              setFormField={setFormField}
              setStep={setStep}
              categories={categories}
              fixedCategory={fixedCategory}
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
