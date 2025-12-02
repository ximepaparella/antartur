#!/bin/bash

# =============================================================================
# Antartur - Manual Deploy Script
# =============================================================================
# This script deploys the latest code from git and restarts the services.
# Run this on the VPS to deploy updates.
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Antartur Deploy Script ===${NC}"
echo ""

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo -e "${YELLOW}Working directory: $PROJECT_DIR${NC}"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create .env from .env.example before deploying."
    exit 1
fi

# Step 1: Pull latest code
echo -e "${YELLOW}Step 1: Pulling latest code from git...${NC}"
git fetch origin
git pull origin main

# Step 2: Build new images
echo -e "${YELLOW}Step 2: Building Docker images...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache app

# Step 3: Run database migrations
echo -e "${YELLOW}Step 3: Running database migrations...${NC}"
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# Step 4: Restart services
echo -e "${YELLOW}Step 4: Restarting services...${NC}"
docker compose -f docker-compose.prod.yml up -d

# Step 5: Cleanup old images
echo -e "${YELLOW}Step 5: Cleaning up old Docker images...${NC}"
docker image prune -f

# Step 6: Show status
echo ""
echo -e "${GREEN}=== Deploy Complete! ===${NC}"
echo ""
echo "Service status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo -e "${YELLOW}Recent logs (last 20 lines):${NC}"
docker compose -f docker-compose.prod.yml logs --tail=20 app

