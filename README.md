# FashionX Product Review System

A React-based web application for reviewing products and flagging them for virtual try-on suitability.

## Features

- **Product Listing**: Display products in paginated cards (50 per page)
- **Product Cards**: Show thumbnail image, name, gender, category, and brand
- **Remarks System**: 
  - Main remark: "Pose Issue"
  - Additional remarks: "Hands Visibility", "Quality Issue", "NSFW"
- **Flagging**: Products with remarks are flagged (is_flagged = true)
- **Filtering**: Filter by category, gender, and brand
- **Save Functionality**: Save remarks to database
- **Auto-hide**: Flagged products are automatically excluded from the list

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- MinIO server running on `http://127.0.0.1:9000`

## Setup Instructions

### 1. Database Setup

First, run the migration script to add the new columns:

```bash
psql -U your_username -d fashionx -f migration_add_remarks.sql
```

Or manually execute the SQL in `migration_add_remarks.sql` in your database.

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fashionx
DB_USER=your_username
DB_PASSWORD=your_password
PORT=3001
NODE_ENV=development
MINIO_BASE_URL=http://127.0.0.1:9000
```

Start the backend server:

```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional, defaults are set):

```env
REACT_APP_API_URL=http://localhost:3001/api
```

Start the frontend development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### GET `/api/products`
Get paginated products with filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `category_id` (optional): Filter by category
- `brand_id` (optional): Filter by brand
- `gender` (optional): Filter by gender

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1124,
    "totalPages": 23,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET `/api/filters`
Get available filter options.

**Response:**
```json
{
  "categories": [...],
  "brands": [...],
  "genders": ["Men", "Women"]
}
```

### POST `/api/products/save-remarks`
Save product remarks and flags.

**Request Body:**
```json
{
  "products": [
    {
      "product_id": 21697636,
      "is_flagged": true,
      "remarks": ["pose_issue", "hands_visibility"]
    }
  ]
}
```

## Database Schema Changes

The migration adds two new columns to the `products` table:

- `is_flagged` (BOOLEAN): True if product has been flagged/reviewed
- `remarks` (TEXT): Comma-separated list of remarks (e.g., "pose_issue,hands_visibility")

## Project Structure

```
.
├── backend/
│   ├── server.js          # Express server
│   ├── db.js              # Database connection
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main app component
│   │   ├── components/
│   │   │   ├── ProductCard.js
│   │   │   ├── Filters.js
│   │   │   └── Pagination.js
│   │   └── index.js
│   ├── public/
│   └── package.json
├── migration_add_remarks.sql
└── README.md
```

## Usage

1. Open the application in your browser
2. Use filters to narrow down products by category, gender, or brand
3. Review each product card and check the appropriate remarks
4. Click "Save Remarks" to save your changes
5. Flagged products will no longer appear in the list

## Notes

- Products are displayed in database order (by `id` ASC)
- Only unflagged products (`is_flagged = false`) are shown
- The save button is enabled when at least one product has remarks
- Thumbnail images are fetched from MinIO using the `minio_path` from `product_images` table

## Troubleshooting

- **Images not loading**: Ensure MinIO is running and accessible at the configured URL
- **Database connection errors**: Check your `.env` file and database credentials
- **CORS errors**: Ensure the backend CORS is configured correctly

