import React from 'react';

function CategoryList({ categories, onOpenCategory, onAdd, onEdit, onDelete }) {
  return (
    <section className="category-section">
      <div className="category-section-header">
        <h2>Kategoriyalar</h2>
        <button type="button" className="btn btn-primary" onClick={onAdd}>
          + Kategoriya qo‘shish
        </button>
      </div>
      {!categories.length ? (
        <p className="loading">Kategoriya yo‘q. Avval kategoriya qo‘shing.</p>
      ) : (
        <ul className="category-list">
          {categories.map((c) => (
            <li key={c.id} className="category-card category-card-row">
              <button
                type="button"
                className="category-open-btn"
                onClick={() => onOpenCategory(c)}
                title="Mahsulotlarni ko‘rish"
              >
                <span className="category-name">{c.name}</span>
                <span className="category-open-hint">→</span>
              </button>
              <div className="category-actions" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="btn btn-ghost" onClick={() => onEdit(c)}>
                  Tahrirlash
                </button>
                <button type="button" className="btn btn-danger" onClick={() => onDelete(c.id)}>
                  O‘chirish
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default CategoryList;
