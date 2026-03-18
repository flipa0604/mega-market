import React from 'react';

const STEPS_ALL = ['category', 'image', 'name', 'price', 'description', 'save'];
const STEPS_NO_CAT = ['image', 'name', 'price', 'description', 'save'];

function ProductForm({
  step,
  form,
  setFormField,
  setStep,
  categories,
  fixedCategory,
  onImageSelect,
  onSave,
  submitStatus,
  editingId,
}) {
  const noCat = Boolean(fixedCategory);
  const stepsNav = noCat ? STEPS_NO_CAT : STEPS_ALL;
  const stepIndex = stepsNav.indexOf(step);

  const goToStep = (s) => {
    if (stepsNav.indexOf(s) <= Math.max(0, stepIndex) + 1) setStep(s);
  };

  const selectCategory = (cat) => {
    setFormField('categoryId', cat.id);
    setFormField('categoryName', cat.name);
    setStep('image');
  };

  const labelNum = (s) => {
    const i = stepsNav.indexOf(s);
    return i >= 0 ? i + 1 : '';
  };

  return (
    <div className="modal-body">
      <div className="step-nav">
        {stepsNav.map((s) => (
          <button
            key={s}
            type="button"
            className={step === s ? 'active' : ''}
            onClick={() => goToStep(s)}
          >
            {s === 'category' && `${labelNum(s)}. Kategoriya`}
            {s === 'image' && `${labelNum(s)}. Rasm`}
            {s === 'name' && `${labelNum(s)}. Nomi`}
            {s === 'price' && `${labelNum(s)}. Narx`}
            {s === 'description' && `${labelNum(s)}. Tavsif`}
            {s === 'save' && `${labelNum(s)}. Saqlash`}
          </button>
        ))}
      </div>

      {!noCat && step === 'category' && (
        <div className="form-group">
          <label>1. Kategoriyani tanlang</label>
          {!categories?.length ? (
            <p className="status">Avval kategoriya qo‘shing.</p>
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
          <label>{labelNum('image')}. Rasm yuklash (yangi mahsulot uchun majburiy)</label>
          <label className="image-upload">
            <input type="file" accept="image/*" onChange={onImageSelect} />
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Preview" className="image-preview" />
            ) : (
              <span>Rasm tanlang</span>
            )}
          </label>
          {editingId && !form.imageFile && form.imageUrl && (
            <p className="status">Joriy rasm saqlanadi. Yangi fayl yuklasangiz almashtiriladi.</p>
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
          {!noCat && (
            <div className="form-actions" style={{ marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep('category')}>
                ← Kategoriya
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'name' && (
        <div className="form-group">
          <label>{labelNum('name')}. Mahsulot nomi</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setFormField('name', e.target.value)}
            placeholder="Mahsulot nomi"
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
          <label>{labelNum('price')}. Narx</label>
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
            <button type="button" className="btn btn-primary" onClick={() => setStep('description')}>
              Keyingi: Tavsif →
            </button>
          </div>
        </div>
      )}

      {step === 'description' && (
        <div className="form-group">
          <label>{labelNum('description')}. Qisqa tavsif</label>
          <textarea
            value={form.shortDescription}
            onChange={(e) => setFormField('shortDescription', e.target.value)}
            placeholder="Qisqa tavsif"
          />
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('price')}>
              ← Orqaga
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setStep('save')}>
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
              <li>Kategoriya: {form.categoryName || fixedCategory?.name || '—'}</li>
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
              {submitStatus === 'uploading' && 'Yuklanmoqda…'}
              {submitStatus === 'saving' && 'Saqlanmoqda…'}
              {(submitStatus === 'done' || !submitStatus) && (editingId ? 'Tahrirlash' : 'Saqlash')}
              {submitStatus === 'error' && 'Qayta urinish'}
            </button>
          </div>
          {submitStatus && (
            <p className={`status ${submitStatus}`}>
              {submitStatus === 'uploading' && 'Rasm Storage ga yuklanmoqda…'}
              {submitStatus === 'saving' && 'Firestore ga yozilmoqda…'}
              {submitStatus === 'done' && 'Saqlandi.'}
              {submitStatus === 'error' && 'Xato. Konsolni tekshiring.'}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default ProductForm;
