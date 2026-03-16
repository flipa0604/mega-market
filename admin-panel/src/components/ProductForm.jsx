import React from 'react';

const STEPS_ORDER = ['image', 'name', 'price', 'description', 'save'];

function ProductForm({
  step,
  form,
  setFormField,
  setStep,
  onImageSelect,
  onSave,
  submitStatus,
  editingId,
}) {
  const stepIndex = STEPS_ORDER.indexOf(step);

  const goToStep = (s) => {
    if (STEPS_ORDER.indexOf(s) <= stepIndex + 1) setStep(s);
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
            {s === 'image' && '1. Image'}
            {s === 'name' && '2. Name'}
            {s === 'price' && '3. Price'}
            {s === 'description' && '4. Description'}
            {s === 'save' && '5. Save'}
          </button>
        ))}
      </div>

      {step === 'image' && (
        <div className="form-group">
          <label>1. Upload image (required for new product)</label>
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
              Next: Name →
            </button>
          )}
        </div>
      )}

      {step === 'name' && (
        <div className="form-group">
          <label>2. Product name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setFormField('name', e.target.value)}
            placeholder="Product name"
            autoFocus
          />
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('image')}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep('price')}
              disabled={!form.name?.trim()}
            >
              Next: Price →
            </button>
          </div>
        </div>
      )}

      {step === 'price' && (
        <div className="form-group">
          <label>3. Price</label>
          <input
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => setFormField('price', e.target.value)}
            placeholder="0"
          />
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('name')}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep('description')}
            >
              Next: Description →
            </button>
          </div>
        </div>
      )}

      {step === 'description' && (
        <div className="form-group">
          <label>4. Short description</label>
          <textarea
            value={form.shortDescription}
            onChange={(e) => setFormField('shortDescription', e.target.value)}
            placeholder="Short description"
          />
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('price')}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep('save')}
            >
              Next: Save →
            </button>
          </div>
        </div>
      )}

      {step === 'save' && (
        <>
          <div className="form-group">
            <p className="status">Review and save to Firestore.</p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#94a3b8', fontSize: '0.875rem' }}>
              <li>Image: {form.imageUrl ? '✓' : '—'}</li>
              <li>Name: {form.name || '—'}</li>
              <li>Price: {form.price ?? '—'}</li>
              <li>Description: {(form.shortDescription || '').trim() || '—'}</li>
            </ul>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('description')}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSave}
              disabled={!form.name?.trim() || submitStatus === 'uploading' || submitStatus === 'saving'}
            >
              {submitStatus === 'uploading' && 'Uploading image…'}
              {submitStatus === 'saving' && 'Saving…'}
              {(submitStatus === 'done' || !submitStatus) && (editingId ? 'Update product' : 'Save product')}
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
