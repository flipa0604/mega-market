import React from 'react';

function ProductList({ products, categories = [], onEdit, onDelete }) {
  const getCategoryName = (categoryId) => categories.find((c) => c.id === categoryId)?.name || '—';

  if (!products.length) {
    return (
      <p className="loading">Mahsulot yo‘q. “Add Product” orqali qo‘shing.</p>
    );
  }

  return (
    <ul className="product-list">
      {products.map((p) => (
        <li key={p.id} className="product-card">
          <div className="product-card-image">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} />
            ) : (
              <div className="no-image">Rasm yo‘q</div>
            )}
          </div>
          <div className="product-card-body">
            <p className="product-category">📁 {getCategoryName(p.categoryId)}</p>
            <h3 className="product-name">{p.name}</h3>
            <p className="product-price">💰 {p.price}</p>
            {p.shortDescription && (
              <p className="product-desc">{p.shortDescription}</p>
            )}
            <div className="product-actions">
              <button type="button" className="btn btn-ghost" onClick={() => onEdit(p)}>
                Edit
              </button>
              <button type="button" className="btn btn-danger" onClick={() => onDelete(p.id)}>
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default ProductList;
