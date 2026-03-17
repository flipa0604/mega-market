import React from 'react';

function CategoryList({ categories, onAdd, onEdit, onDelete }) {
  return (
    <section className="category-section">
      <div className="category-section-header">
        <h2>Kategoriyalar</h2>
        <button type="button" className="btn btn-primary" onClick={onAdd}>
          + Kategoriya qo‘shish
        </button>
      </div>
      {!categories.length ? (
        <p className="loading">Kategoriya yo‘q. Avval kategoriya qo‘shing, keyin mahsulot.</p>
      ) : (
        <ul className="category-list">
          {categories.map((c) => (
            <li key={c.id} className="category-card">
              <span className="category-name">{c.name}</span>
              <div className="category-actions">
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
