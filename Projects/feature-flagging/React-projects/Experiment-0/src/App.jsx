import React from 'react';
import ProductCard from './component/ProductCard';
import './App.css';
function App() {
  const products = [
    { title: 'Wireless Mouse', price: 25.99, status: 'In Stock' },
    { title: 'Keyboard', price: 45.5, status: 'Out of Stock' },
    { title: 'Monitor', price: 199.99, status: 'In Stock' }
  ];

  return (
    <div className="container">
      <h1 className="heading">Products List</h1>
      <div className="products">
        {products.map((product, idx) => (
          <ProductCard
            key={idx}
            title={product.title}
            price={product.price}
            status={product.status}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
