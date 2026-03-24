import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Error fetching data');
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Products List</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <strong>{product.name}</strong> - ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
