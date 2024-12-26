# setup-env.ps1

# Check if .env exists and prompt for confirmation
if (Test-Path .env) {
    $confirmation = Read-Host "This will override your existing .env file (if one exists). Are you sure you want to generate a new .env file? (y/N)"
    if ($confirmation -notmatch '^[Yy]$') {
        Write-Host "Operation cancelled."
        exit 1
    }
}

# Copy .env.example to .env
Copy-Item .env.example .env

# Generate random passwords and secrets
$POSTGRES_PASSWORD = -join ((48..57) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$AUTH_JWT_SECRET = -join ((48..57) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$APP_OAUTH_CALLBACK_STATE_SECRET = -join ((48..57) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$CRYPTO_ENCRYPTION_KEY = -join ((48..57) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Read database values from .env.example
$envExample = Get-Content .env.example
$POSTGRES_USER = ($envExample | Select-String "POSTGRES_USER=").ToString().Split("=")[1]
$POSTGRES_HOST = ($envExample | Select-String "POSTGRES_HOST=").ToString().Split("=")[1]
$POSTGRES_PORT = ($envExample | Select-String "POSTGRES_PORT=").ToString().Split("=")[1]
$POSTGRES_DB = ($envExample | Select-String "POSTGRES_DB=").ToString().Split("=")[1]

# Construct DATABASE_URL
$DATABASE_URL = "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

# Read the entire .env file
$envContent = Get-Content .env -Raw

# Replace the values
$envContent = $envContent -replace "AUTH_JWT_SECRET=", "AUTH_JWT_SECRET=$AUTH_JWT_SECRET"
$envContent = $envContent -replace "APP_OAUTH_CALLBACK_STATE_SECRET=", "APP_OAUTH_CALLBACK_STATE_SECRET=$APP_OAUTH_CALLBACK_STATE_SECRET"
$envContent = $envContent -replace "CRYPTO_ENCRYPTION_KEY=", "CRYPTO_ENCRYPTION_KEY=$CRYPTO_ENCRYPTION_KEY"
$envContent = $envContent -replace "POSTGRES_PASSWORD=", "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
$envContent = $envContent -replace "DATABASE_URL=", "DATABASE_URL=$DATABASE_URL"

# Write the content back to .env
$envContent | Set-Content .env -NoNewline

Write-Host "Environment file has been set up with secure random values."