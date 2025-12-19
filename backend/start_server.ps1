# Load .env file and start server
$envFile = Join-Path $PSScriptRoot ".env"

if (Test-Path $envFile) {
    Write-Host "Loading .env file..." -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"').Trim("'")
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "  Set $name" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "WARNING: .env file not found at $envFile" -ForegroundColor Yellow
}

Write-Host "`nStarting uvicorn server..." -ForegroundColor Green
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

