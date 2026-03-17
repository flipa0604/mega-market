import React from 'react';

const STEPS_ORDER = ['category', 'image', 'name', 'price', 'description', 'save'];

function ProductForm({
  step,
  form,
  setFormField,
  setStep,
  categories,
  onImageSelect,
  onSave,
  submitStatus,
  editingId,
}) {
  const stepIndex = STEPS_ORDER.indexOf(step);

  const goToStep = (s) => {
    if (STEPS_ORDER.indexOf(s) <= stepIndex + 1) setStep(s);
  };

  const selectCategory = (cat) => {
    setFormField('categoryId', cat.id);
    setFormField('categoryName', cat.name);
    setStep('image');
  };

  return (
    <div className="modal-body">
      <div className="step-nav">
        {STEPS_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            className={step === s ? 'active' : ''}
            onClick={() => goToStep(s)}
          >
            {s === 'category' && '1. Kategoriya'}
            {s === 'image' && '2. Rasm'}
            {s === 'name' && '3. Nomi'}
            {s === 'price' && '4. Narx'}
            {s === 'description' && '5. Tavsif'}
            {s === 'save' && '6. Saqlash'}
          </button>
        ))}
      </div>

      {step === 'category' && (
        <div className="form-group">
          <label>1. Kategoriyani tanlang</label>
          {!categories?.length ? (
            <p className="status">Avval kategoriya qo‘shing (yuqorida).</p>
          ) : (
            <div className="category-buttons">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`btn ${form.categoryId === c.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => selectCategory(c)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
          {form.categoryId && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setStep('image')}
            >
              Keyingi: Rasm →
            </button>
          )}
        </div>
      )}

      {step === 'image' && (
        <div className="form-group">
          <label>2. Rasm yuklash (yangi mahsulot uchun majburiy)</label>
          <label className="image-upload">
            <input
              type="file"
              accept="image/*"
              onChange={onImageSelect}
            />
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Preview" className="image-preview" />
            ) : (
              <span>Click to choose image</span>
            )}
          </label>
          {editingId && !form.imageFile && form.imageUrl && (
            <p className="status">Current image kept. Upload a new file to replace.</p>
          )}
          {(form.imageUrl || form.imageFile) && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: '0.5rem' }}
              onClick={() => setStep('name')}
            >
              Keyingi: Nomi →
            </button>
          )}
          <div className="form-actions" style={{ marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setStep('category')}>
              ← Kategoriya
            </button>
          </div>
        </div>
      )}

      {step === 'name' && (
        <div className="form-group">
          <label>3. Mahsulot nomi</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setFormField('name', e.target.value)}
            placeholder="Product name"
            autoFocus
          />
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('image')}>
              ← Orqaga
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep('price')}
              disabled={!form.name?.trim()}
            >
              Keyingi: Narx →
            </button>
          </div>
        </div>
      )}

      {step === 'price' && (
        <div className="form-group">
          <label>4. Narx</label>
          <input
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => setFormField('price', e.target.value)}
            placeholder="0"
          />
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('name')}>
              ← Orqaga
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep('description')}
            >
              Keyingi: Tavsif →
            </button>
          </div>
        </div>
      )}

      {step === 'description' && (
        <div className="form-group">
          <label>5. Qisqa tavsif</label>
          <textarea
            value={form.shortDescription}
            onChange={(e) => setFormField('shortDescription', e.target.value)}
            placeholder="Short description"
          />
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('price')}>
              ← Orqaga
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep('save')}
            >
              Keyingi: Saqlash →
            </button>
          </div>
        </div>
      )}

      {step === 'save' && (
        <>
          <div className="form-group">
            <p className="status">Tekshirib Firestore ga saqlang.</p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#94a3b8', fontSize: '0.875rem' }}>
              <li>Kategoriya: {form.categoryName || '—'}</li>
              <li>Rasm: {form.imageUrl ? '✓' : '—'}</li>
              <li>Nomi: {form.name || '—'}</li>
              <li>Narx: {form.price ?? '—'}</li>
              <li>Tavsif: {(form.shortDescription || '').trim() || '—'}</li>
            </ul>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('description')}>
              ← Orqaga
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSave}
              disabled={!form.name?.trim() || submitStatus === 'uploading' || submitStatus === 'saving'}
            >
              {submitStatus === 'uploading' && 'Uploading image…'}
              {submitStatus === 'saving' && 'Saving…'}
              {(submitStatus === 'done' || !submitStatus) && (editingId ? 'Tahrirlash' : 'Saqlash')}
              {submitStatus === 'error' && 'Retry'}
            </button>
          </div>
          {submitStatus && (
            <p className={`status ${submitStatus}`}>
              {submitStatus === 'uploading' && 'Uploading image to Firebase Storage…'}
              {submitStatus === 'saving' && 'Saving to Firestore…'}
              {submitStatus === 'done' && 'Saved.'}
              {submitStatus === 'error' && 'Error. Check console and try again.'}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default ProductForm;
