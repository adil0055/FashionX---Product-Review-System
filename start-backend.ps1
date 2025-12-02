# PowerShell script to start the backend server
Write-Host "Starting FashionX Backend Server..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "backend\env.example" "backend\.env"
    Write-Host "Please edit backend\.env with your database credentials before starting!" -ForegroundColor Red
    Write-Host "Press any key to continue after editing .env file..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Navigate to backend directory
Set-Location backend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host "Starting backend server on http://localhost:3001..." -ForegroundColor Green
npm start

