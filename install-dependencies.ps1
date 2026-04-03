# Install dependencies for all apps in the monorepo
# Windows PowerShell script

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TaraG - Installing Dependencies" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Get-Location
$apps = @(
    @{name = "Admin Dashboard"; path = "apps/tarag_admin"},
    @{name = "Mobile App"; path = "apps/tarag_app"},
    @{name = "Backend"; path = "backend"}
)

$failed = @()
$success = @()

foreach ($app in $apps) {
    Write-Host "📦 Installing $($app.name)..." -ForegroundColor Yellow
    Write-Host "   Path: $($app.path)" -ForegroundColor Gray
    
    $appPath = Join-Path $rootDir $app.path
    
    if (Test-Path $appPath) {
        Push-Location $appPath
        
        # Check if package.json exists
        if (Test-Path "package.json") {
            try {
                npm install
                $success += $app.name
                Write-Host "✅ $($app.name) installed successfully" -ForegroundColor Green
            } catch {
                $failed += $app.name
                Write-Host "❌ Failed to install $($app.name)" -ForegroundColor Red
                Write-Host "   Error: $_" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠️  package.json not found in $($app.path)" -ForegroundColor Yellow
            $failed += $app.name
        }
        
        Pop-Location
    } else {
        Write-Host "❌ Directory not found: $($app.path)" -ForegroundColor Red
        $failed += $app.name
    }
    
    Write-Host ""
}

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Installation Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

if ($success.Count -gt 0) {
    Write-Host "✅ Successfully installed:" -ForegroundColor Green
    $success | ForEach-Object { Write-Host "   - $_" -ForegroundColor Green }
}

if ($failed.Count -gt 0) {
    Write-Host "❌ Failed to install:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
}

Write-Host ""

if ($failed.Count -eq 0) {
    Write-Host "🎉 All dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some installations failed. Check errors above." -ForegroundColor Yellow
    exit 1
}
