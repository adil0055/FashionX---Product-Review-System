import React from 'react';
import './Filters.css';

const Filters = ({ filters, filterOptions, onFilterChange }) => {
  return (
    <div className="filters-container">
      <h3 className="filters-title">Filters</h3>
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="gender-filter">Gender</label>
          <select
            id="gender-filter"
            value={filters.gender}
            onChange={(e) => onFilterChange('gender', e.target.value)}
            className="filter-select"
          >
            <option value="">All Genders</option>
            {filterOptions.genders.map(gender => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={filters.category_id}
            onChange={(e) => onFilterChange('category_id', e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {filterOptions.categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.gender} - {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="brand-filter">Brand</label>
          <select
            id="brand-filter"
            value={filters.brand_id}
            onChange={(e) => onFilterChange('brand_id', e.target.value)}
            className="filter-select"
          >
            <option value="">All Brands</option>
            {filterOptions.brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {(filters.gender || filters.category_id || filters.brand_id) && (
          <button
            className="clear-filters-button"
            onClick={() => {
              onFilterChange('gender', '');
              onFilterChange('category_id', '');
              onFilterChange('brand_id', '');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default Filters;

