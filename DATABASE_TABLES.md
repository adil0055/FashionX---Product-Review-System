# Database Tables - Detailed Documentation

Complete documentation of all database tables used to store garment/product details in the FashionX database.

---

## Table of Contents

1. [categories](#1-categories-table)
2. [brands](#2-brands-table)
3. [products](#3-products-table)
4. [product_attributes](#4-product_attributes-table)
5. [product_images](#5-product_images-table)
6. [migration_log](#6-migration_log-table)

---

## 1. categories Table

Stores product subcategories organized by gender.

### Purpose
Organizes products into subcategories (e.g., "formal shirts", "jeans", "ethnic-tops") with gender separation (e.g., "Men", "Women"). The same subcategory name can exist for both genders (e.g., "T-shirts" for both Men and Women).

### Schema

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `name` | VARCHAR(100) | NOT NULL | Subcategory name (e.g., "formal shirts", "jeans", "ethnic-tops") |
| `gender` | VARCHAR(20) | NOT NULL | Gender classification ("Men" or "Women") |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp (auto-updated via trigger) |

### Constraints
- **UNIQUE(name, gender)**: The combination of subcategory name and gender must be unique. This allows the same subcategory (e.g., "T-shirts") to exist for both Men and Women.

### Indexes
- Primary key on `id`
- Unique constraint on `(name, gender)`
- Index on `gender` for efficient gender-based queries

### Triggers
- `update_categories_updated_at`: Automatically updates `updated_at` on row update

### Example Data
```sql
id | name              | gender | created_at          | updated_at
---|-------------------|--------|---------------------|-------------------
1  | formal shirts     | Men    | 2025-11-18 13:25:13 | 2025-11-18 13:25:13
2  | jeans             | Men    | 2025-11-18 13:25:13 | 2025-11-18 13:25:13
3  | suits             | Men    | 2025-11-18 13:25:15 | 2025-11-18 13:25:15
4  | T-shirts          | Men    | 2025-11-18 13:25:20 | 2025-11-18 13:25:20
5  | ethnic-tops       | Women  | 2025-11-18 13:25:16 | 2025-11-18 13:25:16
6  | skirts-palazzos   | Women  | 2025-11-18 13:25:17 | 2025-11-18 13:25:17
7  | women-kurtas-kurtis-suits | Women | 2025-11-18 13:25:18 | 2025-11-18 13:25:18
```

### Relationships
- **One-to-Many** with `products` table (one category has many products)

### Common Queries
```sql
-- Get all categories with product counts, grouped by gender
SELECT c.gender, c.name, COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.gender, c.name
ORDER BY c.gender, c.name;

-- Get all Men's categories
SELECT * FROM categories WHERE gender = 'Men';

-- Get all Women's categories
SELECT * FROM categories WHERE gender = 'Women';
```

---

## 2. brands Table

Stores brand information for products.

### Purpose
Maintains a normalized list of all brands to avoid duplication and enable brand-based queries.

### Schema

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Brand name (e.g., "Arrow", "Levis", "WROGN") |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### Indexes
- Primary key on `id`
- Unique constraint on `name`

### Example Data
```sql
id | name    | created_at
---|---------|-------------------
1  | Arrow   | 2025-11-18 13:25:13
2  | Levis   | 2025-11-18 13:25:13
3  | WROGN   | 2025-11-18 13:25:20
4  | KALINI  | 2025-11-18 13:25:16
```

### Relationships
- **One-to-Many** with `products` table (one brand has many products)

### Common Queries
```sql
-- Get brands with product counts
SELECT b.name, COUNT(p.id) as product_count, AVG(p.mrp) as avg_price
FROM brands b
LEFT JOIN products p ON p.brand_id = b.id
GROUP BY b.id, b.name
HAVING COUNT(p.id) > 0
ORDER BY product_count DESC;
```

---

## 3. products Table

Main table storing all product information.

### Purpose
Central table containing core product data including pricing, descriptions, ratings, and metadata.

### Schema

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing internal database ID |
| `product_id` | BIGINT | NOT NULL, UNIQUE | Original Myntra product ID (external identifier) |
| `name` | TEXT | NOT NULL | Product name/title |
| `brand_id` | INTEGER | FOREIGN KEY → brands(id) | Reference to brand |
| `category_id` | INTEGER | FOREIGN KEY → categories(id) | Reference to category |
| `mrp` | DECIMAL(10, 2) | NULL | Maximum Retail Price (in currency units) |
| `base_colour` | VARCHAR(50) | NULL | Primary/base color of the product |
| `description` | TEXT | NULL | Product description (HTML allowed) |
| `material_care` | TEXT | NULL | Material composition and care instructions |
| `original_url` | TEXT | NULL | Original Myntra product page URL |
| `ratings` | DECIMAL(3, 2) | NULL | Product rating (0.00 to 5.00 scale) |
| `sizes` | TEXT | NULL | Available sizes (comma-separated, e.g., "38, 39, 40, 42") |
| `image_count` | INTEGER | DEFAULT 0 | Total number of images for this product |
| `first_image_filename` | VARCHAR(255) | NULL | Filename of the thumbnail/first image |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp (auto-updated via trigger) |

### Indexes
- Primary key on `id`
- Unique constraint on `product_id` (prevents duplicate products)
- Index on `category_id` (for faster category-based queries)
- Index on `brand_id` (for faster brand-based queries)
- Index on `product_id` (for faster lookups by external ID)

### Triggers
- `update_products_updated_at`: Automatically updates `updated_at` on row update

### Example Data
```sql
id | product_id | name                                    | brand_id | category_id | mrp   | base_colour | ratings
---|------------|-----------------------------------------|----------|-------------|-------|-------------|--------
1  | 21697636   | Arrow Men Slim Fit Solid Long Sleeves   | 1        | 1           | 2499  | Blue        | 4.39
2  | 25756776   | Levis Men 511 Slim Fit Jeans            | 2        | 2           | 1999  | Blue        | 4.50
3  | 10106195   | HRX Men Olive Green Printed T-shirt     | 5        | 3           | 499   | Olive Green | 4.20
```

### Relationships
- **Many-to-One** with `brands` table (many products belong to one brand)
- **Many-to-One** with `categories` table (many products belong to one category)
- **One-to-Many** with `product_attributes` table (one product has many attributes)
- **One-to-Many** with `product_images` table (one product has many images)

### Data Constraints
- `product_id` must be unique (prevents duplicate imports)
- `name` cannot be NULL or empty
- `mrp` is stored as DECIMAL(10,2) to handle prices up to 99,999,999.99
- `ratings` is stored as DECIMAL(3,2) to handle ratings from 0.00 to 5.00

### Common Queries
```sql
-- Get product with full details
SELECT 
    p.product_id,
    p.name,
    b.name as brand,
    c.name as category,
    p.mrp,
    p.base_colour,
    p.ratings,
    p.sizes
FROM products p
JOIN brands b ON p.brand_id = b.id
JOIN categories c ON p.category_id = c.id
WHERE p.product_id = 21697636;

-- Search products by name
SELECT product_id, name, mrp, ratings
FROM products
WHERE name ILIKE '%shirt%'
ORDER BY ratings DESC
LIMIT 20;
```

---

## 4. product_attributes Table

Flexible table for category-specific product attributes.

### Purpose
Stores variable attributes that differ by category without requiring schema changes. This allows formal shirts to have "collar" and "cuff" attributes while jeans have "rise" and "fit" attributes, all in the same table.

### Schema

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `product_id` | INTEGER | FOREIGN KEY → products(id) ON DELETE CASCADE | Reference to product (deletes when product is deleted) |
| `attribute_name` | VARCHAR(100) | NOT NULL | Attribute name (e.g., "sleeve_length", "fit", "collar", "rise") |
| `attribute_value` | TEXT | NULL | Attribute value (can be any text) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### Indexes
- Primary key on `id`
- Unique constraint on (`product_id`, `attribute_name`) - prevents duplicate attributes per product
- Index on `product_id` (for faster product-based queries)

### CASCADE Behavior
- When a product is deleted, all its attributes are automatically deleted

### Example Data
```sql
id | product_id | attribute_name    | attribute_value      | created_at
---|------------|-------------------|----------------------|-------------------
1  | 1          | sleeve_length     | Long Sleeves         | 2025-11-18 13:25:13
2  | 1          | fit               | Slim Fit             | 2025-11-18 13:25:13
3  | 1          | collar            | Spread Collar        | 2025-11-18 13:25:13
4  | 1          | cuff              | Button               | 2025-11-18 13:25:13
5  | 1          | fabrics           | Cotton               | 2025-11-18 13:25:13
6  | 2          | rise              | Mid Rise             | 2025-11-18 13:25:13
7  | 2          | fit               | Slim Fit             | 2025-11-18 13:25:13
8  | 2          | closure           | Zip                  | 2025-11-18 13:25:13
```

### Common Attributes by Category

**Formal Shirts:**
- `sleeve_length`, `collar`, `cuff`, `fit`, `hemline`, `placket`, `placket_length`, `pocket_type`, `patterns`, `print_pattern_types`, `fabrics`, `fashion_trends`, `closure`, `number_of_pockets`, `occasions`

**Jeans:**
- `rise`, `fit`, `wash_care`, `closure`, `stretch`, `brand_fit_name`, `body_or_garment_size`, `sustainable`, `transparency`

**T-shirts:**
- `sleeve_length`, `neck_type`, `fit`, `fabric`, `pattern`, `style`, `occasion`

**Women's Ethnic:**
- `stitch`, `weave_type`, `weave_pattern`, `wash_care`, `technique`, `theme`, `character`, `features`, `add_ons`, `body_or_garment_size`, `net_quantity_unit`, `number_of_items`, `package_contains`, `sustainable`

### Relationships
- **Many-to-One** with `products` table (many attributes belong to one product)

### Common Queries
```sql
-- Get all attributes for a product
SELECT attribute_name, attribute_value
FROM product_attributes
WHERE product_id = (SELECT id FROM products WHERE product_id = 21697636)
ORDER BY attribute_name;

-- Find products by attribute
SELECT p.product_id, p.name, pa.attribute_value
FROM products p
JOIN product_attributes pa ON p.id = pa.product_id
WHERE pa.attribute_name = 'fit' 
  AND pa.attribute_value = 'Slim Fit'
LIMIT 10;

-- Most common attributes
SELECT attribute_name, COUNT(*) as usage_count
FROM product_attributes
GROUP BY attribute_name
ORDER BY usage_count DESC
LIMIT 20;
```

---

## 5. product_images Table

Stores image metadata and MinIO storage paths.

### Purpose
Tracks all product images, their order, storage locations, and metadata. Links products to their images stored in MinIO.

### Schema

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `product_id` | INTEGER | FOREIGN KEY → products(id) ON DELETE CASCADE | Reference to product (deletes when product is deleted) |
| `image_filename` | VARCHAR(255) | NOT NULL | Original image filename from source |
| `image_order` | INTEGER | NOT NULL | Display order (1 = first image, 2 = second, etc.) |
| `minio_path` | TEXT | NULL | Full MinIO path (e.g., "fashionx-storage/men/formal-shirts/21697636/images/filename.jpg") |
| `is_thumbnail` | BOOLEAN | DEFAULT FALSE | True if this is the thumbnail/first image |
| `file_size` | BIGINT | NULL | Image file size in bytes |
| `uploaded_at` | TIMESTAMP | NULL | Timestamp when image was uploaded to MinIO |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### Indexes
- Primary key on `id`
- Unique constraint on (`product_id`, `image_filename`) - prevents duplicate images per product
- Index on `product_id` (for faster product-based queries)

### CASCADE Behavior
- When a product is deleted, all its images are automatically deleted

### MinIO Path Structure
```
fashionx-storage/
  ├── {gender}/
  │   ├── {subcategory}/
  │   │   ├── {product_id}/
  │   │   │   ├── thumbnail/
  │   │   │   │   └── {first_image_filename}
  │   │   │   └── images/
  │   │   │       ├── {image_2_filename}
  │   │   │       ├── {image_3_filename}
  │   │   │       └── ...
```

### Public Access URLs
```
http://127.0.0.1:9000/fashionx-storage/{gender}/{subcategory}/{product_id}/images/{filename}
http://127.0.0.1:9000/fashionx-storage/{gender}/{subcategory}/{product_id}/thumbnail/{filename}
```

**Examples:**
- `http://127.0.0.1:9000/fashionx-storage/men/formal-shirts/21697636/images/image1.jpg`
- `http://127.0.0.1:9000/fashionx-storage/women/ethnic-tops/30744995/thumbnail/30744995.jpg`

### Example Data
```sql
id | product_id | image_filename                                    | image_order | is_thumbnail | minio_path
---|------------|---------------------------------------------------|-------------|--------------|--------------------------------------------------------
1  | 1          | 21697636_1_8dcf3c16-...jpg                        | 1           | true         | fashionx-storage/men/formal-shirts/21697636/thumbnail/...
2  | 1          | 21697636_2_195a48da-...jpg                        | 2           | false        | fashionx-storage/men/formal-shirts/21697636/images/...
3  | 1          | 21697636_3_9332771d-...jpg                        | 3           | false        | fashionx-storage/men/formal-shirts/21697636/images/...
4  | 1          | 21697636_4_8a88a261-...jpg                        | 4           | false        | fashionx-storage/men/formal-shirts/21697636/images/...
```

### Relationships
- **Many-to-One** with `products` table (many images belong to one product)

### Data Notes
- `is_thumbnail` should be TRUE for exactly one image per product (the first image)
- `minio_path` is NULL until image is uploaded to MinIO
- `uploaded_at` is NULL until image is successfully uploaded
- `file_size` is stored in bytes (BIGINT can handle files up to ~9 petabytes)

### Common Queries
```sql
-- Get all images for a product
SELECT 
    image_filename,
    image_order,
    minio_path,
    is_thumbnail,
    file_size,
    'http://127.0.0.1:9000/' || minio_path as public_url
FROM product_images
WHERE product_id = (SELECT id FROM products WHERE product_id = 21697636)
ORDER BY image_order;

-- Get thumbnail for a product
SELECT minio_path
FROM product_images
WHERE product_id = (SELECT id FROM products WHERE product_id = 21697636)
  AND is_thumbnail = true;

-- Products missing images
SELECT 
    p.product_id,
    p.name,
    p.image_count as expected,
    COUNT(pi.id) as actual
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.product_id, p.name, p.image_count
HAVING COUNT(pi.id) < p.image_count;
```

---

## 6. migration_log Table

Tracks migration progress for each product.

### Purpose
Enables resume capability, error tracking, and migration auditing. Records the status of each product's migration process.

### Schema

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `category_path` | VARCHAR(255) | NOT NULL | Full file system path to category directory |
| `product_id` | BIGINT | NULL | Product ID being migrated (can be NULL for category-level logs) |
| `status` | VARCHAR(50) | NOT NULL | Migration status: 'pending', 'processing', 'completed', 'failed' |
| `error_message` | TEXT | NULL | Error message if status is 'failed' |
| `images_uploaded` | INTEGER | DEFAULT 0 | Number of images successfully uploaded |
| `started_at` | TIMESTAMP | NULL | Migration start timestamp |
| `completed_at` | TIMESTAMP | NULL | Migration completion timestamp |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### Indexes
- Primary key on `id`
- Index on `category_path` (for category-based queries)
- Index on `product_id` (for product-based queries)
- Index on `status` (for filtering by status)

### Status Values
- **pending**: Product identified but not yet processed
- **processing**: Currently being migrated
- **completed**: Successfully migrated
- **failed**: Migration failed (check `error_message`)

### Example Data
```sql
id | category_path                          | product_id | status    | images_uploaded | completed_at
---|----------------------------------------|------------|-----------|-----------------|-------------------
1  | /home/nihal/Desktop/asset/Men/jeans    | 25756776   | completed | 7               | 2025-11-18 13:25:14
2  | /home/nihal/Desktop/asset/Men/jeans    | 25756798   | completed | 6               | 2025-11-18 13:25:14
3  | /home/nihal/Desktop/asset/Men/jeans    | 25756810   | failed    | 0               | NULL
4  | /home/nihal/Desktop/asset/Men/suits    | 13412304   | completed | 7               | 2025-11-18 13:25:15
```

### Relationships
- **No foreign keys** - Standalone tracking table

### Use Cases
- Resume failed migrations
- Track migration progress
- Generate migration reports
- Debug migration issues
- Audit trail

### Common Queries
```sql
-- Migration status summary
SELECT 
    status,
    COUNT(*) as count,
    SUM(images_uploaded) as total_images
FROM migration_log
GROUP BY status
ORDER BY count DESC;

-- Failed migrations
SELECT 
    category_path,
    product_id,
    error_message,
    created_at
FROM migration_log
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;

-- Migration progress by category
SELECT 
    SUBSTRING(category_path FROM '/([^/]+)/?$') as category,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM migration_log
GROUP BY category_path
ORDER BY total DESC;
```

---

## Table Relationships Summary

```
categories (1) ──< (many) products (1) ──< (many) product_attributes
                                 │
                                 │ (1)
                                 │
                                 └──< (many) product_images

brands (1) ──< (many) products

migration_log (standalone tracking table)
```

## Data Integrity

### Foreign Key Constraints
- `products.brand_id` → `brands.id`
- `products.category_id` → `categories.id`
- `product_attributes.product_id` → `products.id` (CASCADE DELETE)
- `product_images.product_id` → `products.id` (CASCADE DELETE)

### Unique Constraints
- `categories(name, gender)` - No duplicate subcategory names per gender (allows same subcategory for both genders)
- `brands.name` - No duplicate brand names
- `products.product_id` - No duplicate products
- `product_attributes(product_id, attribute_name)` - No duplicate attributes per product
- `product_images(product_id, image_filename)` - No duplicate images per product

### CASCADE Deletes
When a product is deleted:
- All `product_attributes` for that product are automatically deleted
- All `product_images` for that product are automatically deleted
- `migration_log` entries remain (for audit trail)

## Current Database Statistics

Based on the latest migration with gender/subcategory structure (as of latest run):
- **Categories**: 7 (organized by gender: Men/Women)
- **Brands**: 61
- **Products**: 1,124
- **Product Images**: 6,787
- **Product Attributes**: Varies by product (flexible schema)
- **Migration Logs**: Tracks all migration attempts

### Category Structure & Product Distribution
- **Men**:
  - formal shirts: 25 products
  - jeans: 30 products
  - suits: 30 products
  - T-shirts: 949 products
- **Women**:
  - ethnic-tops: 30 products
  - skirts-palazzos: 30 products
  - women-kurtas-kurtis-suits: 30 products

## Best Practices

1. **Always use `product_id` (BIGINT)** for external references, not `id` (SERIAL)
2. **Check `is_thumbnail`** when displaying product thumbnails
3. **Use `minio_path`** to construct public image URLs
4. **Query `product_attributes`** by `attribute_name` for category-specific searches
5. **Monitor `migration_log`** for failed migrations and retry them
6. **Use transactions** when inserting related data (products + attributes + images)

