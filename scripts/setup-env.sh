#!/usr/bin/env bash

if [ -f .env ]; then
    read -p "This will override your existing .env file (if one exists). Are you sure you want to generate a new .env file? (y/N) " -n 1 -r
    echo    # Move to a new line
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        echo "Operation cancelled."
        exit 1
    fi
fi

cp .env.example .env

# Generate random postgres password
POSTGRES_PASSWORD=$(openssl rand -hex 16)

# Read database values from .env.example
POSTGRES_USER=$(grep POSTGRES_USER .env.example | cut -d '=' -f2)
POSTGRES_HOST=$(grep POSTGRES_HOST .env.example | cut -d '=' -f2)
POSTGRES_PORT=$(grep POSTGRES_PORT .env.example | cut -d '=' -f2)
POSTGRES_DB=$(grep POSTGRES_DB .env.example | cut -d '=' -f2)

# Generate random postgres password
POSTGRES_PASSWORD=$(openssl rand -hex 16)

# Construct DATABASE_URL using values from .env.example
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

if [ "$(uname)" = "Darwin" ]; then
    sed -i '' -e 's|AUTH_JWT_SECRET=|AUTH_JWT_SECRET='"$(openssl rand -hex 32)"'|g' .env
    sed -i '' -e 's|APP_OAUTH_CALLBACK_STATE_SECRET=|APP_OAUTH_CALLBACK_STATE_SECRET='"$(openssl rand -hex 32)"'|g' .env
    sed -i '' -e 's|CRYPTO_ENCRYPTION_KEY=|CRYPTO_ENCRYPTION_KEY='"$(openssl rand -hex 16)"'|g' .env
    sed -i '' -e 's|POSTGRES_PASSWORD=|POSTGRES_PASSWORD='"${POSTGRES_PASSWORD}"'|g' .env
    sed -i '' -e 's|DATABASE_URL=|DATABASE_URL='"${DATABASE_URL}"'|g' .env
else
    sed -i 's|AUTH_JWT_SECRET=|AUTH_JWT_SECRET='"$(openssl rand -hex 32)"'|g' .env
    sed -i 's|APP_OAUTH_CALLBACK_STATE_SECRET=|APP_OAUTH_CALLBACK_STATE_SECRET='"$(openssl rand -hex 32)"'|g' .env
    sed -i 's|CRYPTO_ENCRYPTION_KEY=|CRYPTO_ENCRYPTION_KEY='"$(openssl rand -hex 16)"'|g' .env
    sed -i 's|POSTGRES_PASSWORD=|POSTGRES_PASSWORD='"${POSTGRES_PASSWORD}"'|g' .env
    sed -i 's|DATABASE_URL=|DATABASE_URL='"${DATABASE_URL}"'|g' .env
fi

echo "Environment file has been set up with secure random values."