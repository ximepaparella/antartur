#!/bin/bash

# =============================================================================
# Script para ejecutar migraciones de Prisma en producción
# =============================================================================
# Este script ejecuta las migraciones pendientes en la base de datos
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Ejecutando Migraciones de Prisma ===${NC}"
echo ""

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo -e "${YELLOW}Directorio de trabajo: $PROJECT_DIR${NC}"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Por favor crea el archivo .env antes de ejecutar migraciones."
    exit 1
fi

# Check if docker-compose.prod.yml exists
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}Error: docker-compose.prod.yml not found!${NC}"
    echo "Asegúrate de estar en el directorio correcto del proyecto."
    exit 1
fi

# Step 1: Check migration status
echo -e "${YELLOW}Paso 1: Verificando estado de migraciones...${NC}"
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate status
echo ""

# Step 2: Run migrations
echo -e "${YELLOW}Paso 2: Ejecutando migraciones pendientes...${NC}"
if docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy; then
    echo ""
    echo -e "${GREEN}✓ Migraciones ejecutadas exitosamente${NC}"
else
    echo ""
    echo -e "${RED}✗ Error al ejecutar migraciones${NC}"
    echo ""
    echo -e "${YELLOW}Si la migración falló porque las columnas ya existen, puedes marcarla como aplicada:${NC}"
    echo "docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate resolve --applied 20250120000000_add_tour_weekdays"
    exit 1
fi

# Step 3: Verify migration
echo ""
echo -e "${YELLOW}Paso 3: Verificando migraciones aplicadas...${NC}"
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate status
echo ""

echo -e "${GREEN}=== Migraciones Completadas ===${NC}"
echo ""
echo "Las columnas de días de semana deberían estar disponibles ahora."
echo "Puedes verificar ejecutando:"
echo "docker compose -f docker-compose.prod.yml exec postgres psql -U antartur -d antartur -c '\\d \"Tour\"'"
