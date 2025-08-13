#!/bin/sh

# Create a directory for persistent data if it doesn't exist
mkdir -p /app/data

# Set the DATABASE_URL to point to a persistent location
export DATABASE_URL="file:/app/data/dev.db"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Start the Next.js application
echo "Starting Next.js application..."
exec npm run start