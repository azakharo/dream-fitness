#!/bin/bash
set -e

echo "=========================================="
echo "Docker Entrypoint Script"
echo "=========================================="

# Function to run migrations
run_migrations() {
    echo "Running database migrations..."
    npm run db:migrate
    echo "Migrations completed successfully"
}

# Function to run seed
run_seed() {
    echo "Running database seed..."
    npm run db:seed
    echo "Seed completed successfully"
}

# Check if migrations should be run
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "RUN_MIGRATIONS is enabled, running migrations..."
    run_migrations
else
    echo "RUN_MIGRATIONS is disabled, skipping migrations"
fi

# Check if seed should be run
if [ "$RUN_SEED" = "true" ]; then
    echo "RUN_SEED is enabled, running seeding..."
    run_seed
else
    echo "RUN_SEED is disabled, skipping seeding"
fi

echo "=========================================="
echo "Starting application: $@"
echo "=========================================="

# Execute the main command
exec "$@"