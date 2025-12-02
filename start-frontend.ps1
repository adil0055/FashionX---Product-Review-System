# PowerShell script to start the frontend server
Write-Host "Starting FashionX Frontend..." -ForegroundColor Green

# Navigate to frontend directory
Set-Location frontend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the development server
Write-Host "Starting frontend server on http://localhost:3000..." -ForegroundColor Green
npm start

