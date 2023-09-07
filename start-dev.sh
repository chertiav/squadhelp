#!/usr/bin/env bash

#################################
## Run application in DEV mode ##
#################################

started_at=$(date +"%s")

echo "-----> Provisioning containers"
docker compose --file docker-compose-dev.yaml up -d
echo ""

# Run migrate.
echo "-----> Running migrating"
docker exec -it server-server-dev-1 npx prisma migrate dev
echo "<----- Migrate is done"

# Run seed.
echo "-----> Running seeding"
docker exec -it server-server-dev-1 npx prisma db seed
echo "<----- Seed is done"

# Run tests.
echo "-----> Running testing"
docker exec -it server-server-dev-1 npm run test:e2e
echo "<----- Tests is done"

ended_at=$(date +"%s")

minutes=$(((ended_at - started_at) / 60))
seconds=$(((ended_at - started_at) % 60))

echo "-----> Done in ${minutes}m${seconds}s"