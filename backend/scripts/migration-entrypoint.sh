#!/bin/sh
set -e

echo "Migration Runner started"
echo "RUN_MIGRATIONS=${RUN_MIGRATIONS:-false}"
echo "RUN_SEED=${RUN_SEED:-false}"

# Automatic mode: run migrations if enabled
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running migrations..."
    npm run db:migrate
fi

# Automatic mode: run seed if enabled
if [ "$RUN_SEED" = "true" ]; then
    echo "Running seed..."
    npm run db:seed
fi

# Container exits after completing automatic tasks
# For manual mode, the command is passed via docker-compose run