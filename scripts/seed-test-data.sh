#!/bin/bash

# Seed test data into database
# Usage: ./scripts/seed-test-data.sh [environment]

ENV=${1:-development}
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5432}
DB_NAME=${DATABASE_NAME:-brain-storm}
DB_USER=${DATABASE_USERNAME:-brain-storm}

echo "Seeding test data for $ENV environment..."

# Run seed script
npm run seed:test --workspace=@brain-storm/backend

echo "Test data seeded successfully!"
