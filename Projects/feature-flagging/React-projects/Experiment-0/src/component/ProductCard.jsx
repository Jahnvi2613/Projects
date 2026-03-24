import React from 'react';

function ProductCard({ title, price, status }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>Price: ${price}</p>
      <p>Status: {status}</p>
    </div>
  );
}

export default ProductCard;
