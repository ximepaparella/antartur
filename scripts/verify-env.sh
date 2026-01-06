#!/bin/bash

# Script para verificar que las variables de entorno estén configuradas correctamente

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Verificación de Variables de Entorno ===${NC}"
echo ""

# Verificar si estamos en producción o desarrollo
if [ -f "docker-compose.prod.yml" ]; then
    echo -e "${YELLOW}Modo: Producción${NC}"
    COMPOSE_FILE="docker-compose.prod.yml"
else
    echo -e "${YELLOW}Modo: Desarrollo${NC}"
    COMPOSE_FILE="docker-compose.yml"
fi

echo ""
echo -e "${YELLOW}1. Verificando archivo .env...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    echo "   Crea un archivo .env con las variables necesarias"
    exit 1
else
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
fi

echo ""
echo -e "${YELLOW}2. Verificando variable SITE_URL en .env...${NC}"
if grep -q "^SITE_URL=" .env 2>/dev/null; then
    SITE_URL_VALUE=$(grep "^SITE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    echo -e "${GREEN}✅ SITE_URL encontrada: ${SITE_URL_VALUE}${NC}"
    
    # Verificar que no sea localhost en producción
    if [[ "$COMPOSE_FILE" == "docker-compose.prod.yml" ]] && [[ "$SITE_URL_VALUE" == *"localhost"* ]]; then
        echo -e "${RED}⚠️  ADVERTENCIA: SITE_URL apunta a localhost en producción!${NC}"
        echo "   Esto causará problemas con los pagos de PayPal/Payway"
    fi
else
    echo -e "${YELLOW}⚠️  SITE_URL no encontrada en .env${NC}"
    echo "   Se usará el fallback del docker-compose.prod.yml"
fi

echo ""
echo -e "${YELLOW}3. Verificando variables en el contenedor (si está corriendo)...${NC}"
if docker compose -f "$COMPOSE_FILE" ps app 2>/dev/null | grep -q "Up"; then
    echo "   Variables en el contenedor:"
    docker compose -f "$COMPOSE_FILE" exec app env 2>/dev/null | grep -E "SITE_URL|NEXT_PUBLIC_SITE_URL" || echo -e "${YELLOW}   (No se pudo leer, el contenedor puede estar iniciando)${NC}"
else
    echo -e "${YELLOW}   Contenedor no está corriendo${NC}"
    echo "   Ejecuta: docker compose -f $COMPOSE_FILE up -d"
fi

echo ""
echo -e "${GREEN}=== Verificación completada ===${NC}"
echo ""
echo "Para verificar manualmente después del deploy:"
echo "  docker compose -f $COMPOSE_FILE exec app env | grep SITE_URL"

