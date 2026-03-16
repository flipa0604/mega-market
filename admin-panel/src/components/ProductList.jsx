import React from 'react';

function ProductList({ products, onEdit, onDelete }) {
  if (!products.length) {
    return (
      <p className="loading">No products yet. Click “Add Product” to create one.</p>
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
              <div className="no-image">No image</div>
            )}
          </div>
          <div className="product-card-body">
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
