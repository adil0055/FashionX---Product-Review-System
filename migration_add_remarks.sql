-- Migration script to add is_flagged and remarks columns to products table
-- Run this script on your PostgreSQL database

-- Add is_flagged column (defaults to false for existing products)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE NOT NULL;

-- Add remarks column (stores JSON array of selected remarks)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS remarks TEXT NULL;

-- Add index on is_flagged for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_is_flagged ON products(is_flagged);

-- Add index on category_id, brand_id, and gender (via join) for filter performance
-- Note: gender is in categories table, so we'll filter via JOIN

-- Update existing products to have is_flagged = false
UPDATE products SET is_flagged = FALSE WHERE is_flagged IS NULL;

-- Comments
COMMENT ON COLUMN products.is_flagged IS 'True if product has been flagged/reviewed by user, false otherwise. Flagged products are excluded from review list.';
COMMENT ON COLUMN products.remarks IS 'Comma-separated or JSON array of remarks selected by user: "pose_issue", "hands_visibility", "quality_issue", "nsfw"';

