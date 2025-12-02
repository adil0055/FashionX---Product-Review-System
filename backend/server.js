const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const MINIO_BASE_URL = process.env.MINIO_BASE_URL || 'http://127.0.0.1:9000';

app.use(cors());
app.use(express.json());

// Get products with pagination and filters
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    const categoryId = req.query.category_id;
    const brandId = req.query.brand_id;
    const gender = req.query.gender;
    
    // Build WHERE clause
    let whereConditions = ['p.is_flagged = FALSE'];
    const queryParams = [];
    let paramIndex = 1;
    
    if (categoryId) {
      whereConditions.push(`p.category_id = $${paramIndex++}`);
      queryParams.push(categoryId);
    }
    
    if (brandId) {
      whereConditions.push(`p.brand_id = $${paramIndex++}`);
      queryParams.push(brandId);
    }
    
    if (gender) {
      whereConditions.push(`c.gender = $${paramIndex++}`);
      queryParams.push(gender);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get products with thumbnail URL
    const productsQuery = `
      SELECT 
        p.id,
        p.product_id,
        p.name,
        p.is_flagged,
        p.remarks,
        c.name as category_name,
        c.gender,
        b.name as brand_name,
        pi.minio_path as thumbnail_path,
        CASE 
          WHEN pi.minio_path IS NOT NULL 
          THEN '${MINIO_BASE_URL}/' || pi.minio_path 
          ELSE NULL 
        END as thumbnail_url
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_thumbnail = true
      WHERE ${whereClause}
      ORDER BY p.id ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    queryParams.push(limit, offset);
    
    const productsResult = await pool.query(productsQuery, queryParams);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
    `;
    
    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      products: productsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get filters (categories, brands, genders)
app.get('/api/filters', async (req, res) => {
  try {
    // Get categories with gender
    const categoriesQuery = `
      SELECT DISTINCT c.id, c.name, c.gender
      FROM categories c
      JOIN products p ON p.category_id = c.id
      WHERE p.is_flagged = FALSE
      ORDER BY c.gender, c.name
    `;
    
    // Get brands
    const brandsQuery = `
      SELECT DISTINCT b.id, b.name
      FROM brands b
      JOIN products p ON p.brand_id = b.id
      WHERE p.is_flagged = FALSE
      ORDER BY b.name
    `;
    
    // Get genders
    const gendersQuery = `
      SELECT DISTINCT c.gender
      FROM categories c
      JOIN products p ON p.category_id = c.id
      WHERE p.is_flagged = FALSE
      ORDER BY c.gender
    `;
    
    const [categoriesResult, brandsResult, gendersResult] = await Promise.all([
      pool.query(categoriesQuery),
      pool.query(brandsQuery),
      pool.query(gendersQuery)
    ]);
    
    res.json({
      categories: categoriesResult.rows,
      brands: brandsResult.rows,
      genders: gendersResult.rows.map(row => row.gender)
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save product remarks (batch update)
app.post('/api/products/save-remarks', async (req, res) => {
  try {
    const { products } = req.body; // Array of { product_id, is_flagged, remarks }
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const product of products) {
        const { product_id, is_flagged, remarks } = product;
        
        // Convert remarks array to comma-separated string or JSON
        let remarksValue = null;
        if (remarks && remarks.length > 0) {
          remarksValue = remarks.join(',');
        }
        
        const updateQuery = `
          UPDATE products
          SET is_flagged = $1, remarks = $2, updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $3
        `;
        
        await client.query(updateQuery, [is_flagged, remarksValue, product_id]);
      }
      
      await client.query('COMMIT');
      
      res.json({ 
        success: true, 
        message: `Updated ${products.length} product(s)` 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving remarks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

