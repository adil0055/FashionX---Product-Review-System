# Quick Setup Guide

## Step 1: Database Migration

First, run the migration to add the new columns:

```bash
psql -U your_username -d fashionx -f migration_add_remarks.sql
```

Or if you're using a different database client, execute the SQL commands from `migration_add_remarks.sql`.

## Step 2: Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Create `.env` file:
```bash
# Copy the example file
copy env.example .env
# Or on Linux/Mac: cp env.example .env
```

4. Edit `.env` file with your database credentials:
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

5. Start the backend server:
```bash
npm start
```

The backend should now be running on `http://localhost:3001`

## Step 3: Frontend Setup

1. Open a NEW terminal window (keep backend running)

2. Navigate to frontend directory:
```bash
cd frontend
```

3. Install dependencies (if not already done):
```bash
npm install
```

4. Start the frontend:
```bash
npm start
```

The frontend should automatically open in your browser at `http://localhost:3000`

## Troubleshooting

### Backend won't start
- Check that PostgreSQL is running
- Verify database credentials in `.env` file
- Ensure the database exists and migration has been run

### Frontend can't connect to backend
- Make sure backend is running on port 3001
- Check that `proxy` in `frontend/package.json` points to `http://localhost:3001`

### Images not loading
- Ensure MinIO is running on `http://127.0.0.1:9000`
- Check that thumbnail images exist in MinIO storage

### Port already in use
- Change PORT in backend `.env` file
- Update proxy in frontend `package.json` to match

