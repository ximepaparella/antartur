#!/bin/bash

# =============================================================================
# Antartur - SSL Certificate Initialization Script
# =============================================================================
# This script obtains SSL certificates from Let's Encrypt for the first time.
# Run this ONCE after the initial server setup.
#
# Prerequisites:
# - Docker and Docker Compose installed
# - DNS pointing to this server (antartur.tur.ar and www.antartur.tur.ar)
# - Port 80 open and accessible from the internet
# =============================================================================

set -e

# Configuration
DOMAIN="antartur.tur.ar"
DOMAIN_WWW="www.antartur.tur.ar"
EMAIL="${SSL_EMAIL:-admin@antartur.tur.ar}"  # Email for Let's Encrypt notifications
STAGING="${SSL_STAGING:-0}"  # Set to 1 to use staging (for testing)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Antartur SSL Certificate Setup ===${NC}"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run this script as root or with sudo${NC}"
    exit 1
fi

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo -e "${YELLOW}Working directory: $PROJECT_DIR${NC}"
echo ""

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p certbot/conf
mkdir -p certbot/www

# Check if certificates already exist
if [ -d "certbot/conf/live/$DOMAIN" ]; then
    echo -e "${YELLOW}Certificates already exist for $DOMAIN${NC}"
    echo "If you want to renew, use: docker compose exec certbot certbot renew"
    exit 0
fi

# Step 1: Use the initial nginx config (HTTP only)
echo -e "${YELLOW}Step 1: Setting up initial nginx configuration (HTTP only)...${NC}"
cp docker/nginx.conf.initial docker/nginx.conf.backup 2>/dev/null || true
cp docker/nginx.conf docker/nginx.conf.ssl
cp docker/nginx.conf.initial docker/nginx.conf

# Step 2: Start nginx with HTTP-only config
echo -e "${YELLOW}Step 2: Starting services with HTTP-only configuration...${NC}"
docker compose -f docker-compose.prod.yml up -d nginx

# Wait for nginx to be ready
echo -e "${YELLOW}Waiting for nginx to start...${NC}"
sleep 5

# Step 3: Verify that the domain is reachable
echo -e "${YELLOW}Step 3: Verifying domain accessibility...${NC}"
echo "Testing http://$DOMAIN/.well-known/acme-challenge/test"

# Create a test file
mkdir -p certbot/www/.well-known/acme-challenge
echo "test" > certbot/www/.well-known/acme-challenge/test

# Test if accessible (this might fail if DNS isn't set up yet)
if curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN/.well-known/acme-challenge/test" | grep -q "200"; then
    echo -e "${GREEN}Domain is accessible!${NC}"
else
    echo -e "${RED}Warning: Could not verify domain accessibility.${NC}"
    echo "Make sure DNS is configured and port 80 is open."
    echo "Proceeding anyway..."
fi

rm -f certbot/www/.well-known/acme-challenge/test

# Step 4: Request certificates from Let's Encrypt
echo -e "${YELLOW}Step 4: Requesting SSL certificates from Let's Encrypt...${NC}"

STAGING_ARG=""
if [ "$STAGING" = "1" ]; then
    echo -e "${YELLOW}Using Let's Encrypt STAGING environment (for testing)${NC}"
    STAGING_ARG="--staging"
fi

docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    $STAGING_ARG \
    -d "$DOMAIN" \
    -d "$DOMAIN_WWW"

# Check if certificates were created
if [ -d "certbot/conf/live/$DOMAIN" ]; then
    echo -e "${GREEN}Certificates obtained successfully!${NC}"
else
    echo -e "${RED}Failed to obtain certificates.${NC}"
    echo "Check the output above for errors."
    # Restore original nginx config
    cp docker/nginx.conf.ssl docker/nginx.conf
    exit 1
fi

# Step 5: Restore the full nginx config with SSL
echo -e "${YELLOW}Step 5: Restoring full nginx configuration with SSL...${NC}"
cp docker/nginx.conf.ssl docker/nginx.conf
rm -f docker/nginx.conf.ssl docker/nginx.conf.backup

# Step 6: Restart all services
echo -e "${YELLOW}Step 6: Restarting all services with SSL...${NC}"
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

echo ""
echo -e "${GREEN}=== SSL Setup Complete! ===${NC}"
echo ""
echo "Your site should now be accessible at:"
echo "  - https://$DOMAIN"
echo "  - https://$DOMAIN_WWW"
echo ""
echo "Certificates will auto-renew via the certbot container."
echo ""
echo -e "${YELLOW}Note: If you used staging certificates (SSL_STAGING=1),${NC}"
echo -e "${YELLOW}run this script again with SSL_STAGING=0 for production certificates.${NC}"

