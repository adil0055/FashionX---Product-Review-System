import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ProductCard from './components/ProductCard';
import Filters from './components/Filters';
import Pagination from './components/Pagination';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category_id: '',
    brand_id: '',
    gender: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    brands: [],
    genders: []
  });
  const [productRemarks, setProductRemarks] = useState({}); // { product_id: { is_flagged, remarks: [] } }
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch filter options
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/filters`);
        setFilterOptions(response.data);
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: 50,
          ...filters
        };
        
        // Remove empty filter values
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null) {
            delete params[key];
          }
        });

        const response = await axios.get(`${API_BASE_URL}/products`, { params });
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.totalPages);
        
        // Initialize product remarks state
        const initialRemarks = {};
        response.data.products.forEach(product => {
          initialRemarks[product.product_id] = {
            is_flagged: product.is_flagged || false,
            remarks: product.remarks ? product.remarks.split(',') : []
          };
        });
        setProductRemarks(initialRemarks);
        setHasChanges(false);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleRemarkChange = (productId, remarkType, checked) => {
    setProductRemarks(prev => {
      const current = prev[productId] || { is_flagged: false, remarks: [] };
      let newRemarks = [...current.remarks];
      
      if (checked) {
        if (!newRemarks.includes(remarkType)) {
          newRemarks.push(remarkType);
        }
      } else {
        newRemarks = newRemarks.filter(r => r !== remarkType);
      }
      
      // If any remark is checked, is_flagged should be true
      const is_flagged = newRemarks.length > 0;
      
      return {
        ...prev,
        [productId]: {
          is_flagged,
          remarks: newRemarks
        }
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const productsToUpdate = Object.entries(productRemarks)
        .filter(([_, data]) => data.is_flagged)
        .map(([product_id, data]) => ({
          product_id: parseInt(product_id),
          is_flagged: data.is_flagged,
          remarks: data.remarks
        }));

      if (productsToUpdate.length === 0) {
        alert('No products to save. Please select at least one remark.');
        return;
      }

      await axios.post(`${API_BASE_URL}/products/save-remarks`, {
        products: productsToUpdate
      });

      alert(`Successfully saved ${productsToUpdate.length} product(s)!`);
      setHasChanges(false);
      
      // Refresh products (flagged products will be filtered out)
      const params = {
        page: currentPage,
        limit: 50,
        ...filters
      };
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await axios.get(`${API_BASE_URL}/products`, { params });
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
      
      // Reset remarks for remaining products
      const initialRemarks = {};
      response.data.products.forEach(product => {
        initialRemarks[product.product_id] = {
          is_flagged: false,
          remarks: []
        };
      });
      setProductRemarks(initialRemarks);
    } catch (err) {
      alert('Failed to save remarks. Please try again.');
      console.error('Error saving remarks:', err);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>FashionX - Product Review System</h1>
        <p>Review products for virtual try-on suitability</p>
      </header>

      <Filters
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
      />

      <div className="save-container">
        <button
          className={`save-button ${hasChanges ? 'enabled' : 'disabled'}`}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Save Remarks
        </button>
        {hasChanges && (
          <span className="unsaved-indicator">You have unsaved changes</span>
        )}
      </div>

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-products">
            No products found. Try adjusting your filters.
          </div>
        ) : (
          products.map(product => (
            <ProductCard
              key={product.product_id}
              product={product}
              remarks={productRemarks[product.product_id] || { is_flagged: false, remarks: [] }}
              onRemarkChange={handleRemarkChange}
            />
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default App;

