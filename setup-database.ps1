# Playwright-CRX Database Setup Script
# Run this AFTER installing PostgreSQL

Write-Host "🎭 Playwright-CRX Database Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = & psql --version 2>&1
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL not found! Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 1: Creating Database" -ForegroundColor Yellow
Write-Host "You will be prompted for the PostgreSQL password..." -ForegroundColor Gray

# Create database and user
$sqlCommands = @"
CREATE DATABASE playwright_crx;
CREATE USER playwright_user WITH PASSWORD 'playwright123';
GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO playwright_user;
"@

# Write SQL to temp file
$sqlCommands | Out-File -FilePath "temp_setup.sql" -Encoding UTF8

# Execute SQL
try {
    & psql -U postgres -f temp_setup.sql
    Remove-Item "temp_setup.sql"
    Write-Host "✅ Database created successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Database might already exist or permission denied" -ForegroundColor Yellow
    Remove-Item "temp_setup.sql" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Step 2: Installing Backend Dependencies" -ForegroundColor Yellow
Set-Location -Path ".\playwright-crx-enhanced\backend"

if (Test-Path "node_modules") {
    Write-Host "⏭️ Dependencies already installed" -ForegroundColor Gray
} else {
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Generating Prisma Client" -ForegroundColor Yellow
npm run prisma:generate
Write-Host "✅ Prisma client generated" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Running Database Migrations" -ForegroundColor Yellow
npm run prisma:migrate
Write-Host "✅ Migrations completed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Seeding Database (Optional)" -ForegroundColor Yellow
$seed = Read-Host "Seed database with test data? (y/N)"
if ($seed -eq "y" -or $seed -eq "Y") {
    npm run prisma:seed
    Write-Host "✅ Database seeded" -ForegroundColor Green
} else {
    Write-Host "⏭️ Skipping seed" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 Database Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start backend:  npm run dev" -ForegroundColor White
Write-Host "2. Start frontend: cd ../frontend && npm install && npm run dev" -ForegroundColor White
Write-Host "3. Open http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Database Info:" -ForegroundColor Cyan
Write-Host "  Host:     localhost" -ForegroundColor White
Write-Host "  Port:     5432" -ForegroundColor White
Write-Host "  Database: playwright_crx" -ForegroundColor White
Write-Host "  User:     playwright_user" -ForegroundColor White
Write-Host "  Password: playwright123" -ForegroundColor White
Write-Host ""

# Return to root
Set-Location -Path "../.."
