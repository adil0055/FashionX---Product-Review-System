import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product, remarks, onRemarkChange }) => {
  const handleCheckboxChange = (remarkType) => {
    const isChecked = remarks.remarks.includes(remarkType);
    onRemarkChange(product.product_id, remarkType, !isChecked);
  };

  const remarkOptions = [
    { key: 'pose_issue', label: 'Pose Issue' },
    { key: 'hands_visibility', label: 'Hands Visibility' },
    { key: 'quality_issue', label: 'Quality Issue' },
    { key: 'nsfw', label: 'NSFW' }
  ];

  return (
    <div className={`product-card ${remarks.is_flagged ? 'flagged' : ''}`}>
      <div className="product-image-container">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x500?text=Image+Not+Found';
            }}
          />
        ) : (
          <div className="product-image-placeholder">
            No Image Available
          </div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-meta">
          <span className="product-gender">{product.gender}</span>
          <span className="product-category">{product.category_name}</span>
        </div>
        {product.brand_name && (
          <div className="product-brand">Brand: {product.brand_name}</div>
        )}
      </div>

      <div className="product-remarks">
        <div className="remarks-header">Remarks:</div>
        <div className="remarks-list">
          {remarkOptions.map(option => (
            <label key={option.key} className="remark-checkbox">
              <input
                type="checkbox"
                checked={remarks.remarks.includes(option.key)}
                onChange={() => handleCheckboxChange(option.key)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {remarks.is_flagged && (
          <div className="flagged-badge">Flagged</div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

