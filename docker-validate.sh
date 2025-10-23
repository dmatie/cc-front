#!/bin/bash

# Script de validation Docker pour CC Application
# Vérifie que tous les fichiers nécessaires sont présents

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "  Validation de la configuration Docker"
echo "========================================="
echo ""

# Fonction de vérification
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 existe"
        return 0
    else
        echo -e "${RED}✗${NC} $1 manquant"
        return 1
    fi
}

# Fonction de vérification de commande
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 est installé"
        return 0
    else
        echo -e "${RED}✗${NC} $1 n'est pas installé"
        return 1
    fi
}

# Vérifier les fichiers Docker
echo "1. Vérification des fichiers Docker:"
check_file "Dockerfile"
check_file "docker-compose.yml"
check_file ".dockerignore"
check_file "nginx.conf"
echo ""

# Vérifier les fichiers de l'application
echo "2. Vérification des fichiers de l'application:"
check_file "package.json"
check_file "angular.json"
check_file "tsconfig.json"
echo ""

# Vérifier Docker
echo "3. Vérification de l'environnement Docker:"
check_command "docker"
if command -v docker &> /dev/null; then
    echo "   Version: $(docker --version)"
fi

check_command "docker-compose"
if command -v docker-compose &> /dev/null; then
    echo "   Version: $(docker-compose --version)"
fi
echo ""

# Vérifier le Dockerfile
echo "4. Validation du Dockerfile:"
if [ -f "Dockerfile" ]; then
    if grep -q "FROM node:22-alpine AS build" Dockerfile; then
        echo -e "${GREEN}✓${NC} Stage de build présent"
    else
        echo -e "${RED}✗${NC} Stage de build manquant"
    fi

    if grep -q "FROM nginx:alpine" Dockerfile; then
        echo -e "${GREEN}✓${NC} Stage nginx présent"
    else
        echo -e "${RED}✗${NC} Stage nginx manquant"
    fi

    if grep -q "npm run build:prod" Dockerfile; then
        echo -e "${GREEN}✓${NC} Commande de build correcte"
    else
        echo -e "${YELLOW}⚠${NC} Commande de build différente"
    fi
fi
echo ""

# Vérifier nginx.conf
echo "5. Validation de nginx.conf:"
if [ -f "nginx.conf" ]; then
    if grep -q "try_files.*index.html" nginx.conf; then
        echo -e "${GREEN}✓${NC} Support SPA configuré"
    else
        echo -e "${RED}✗${NC} Configuration SPA manquante"
    fi

    if grep -q "gzip on" nginx.conf; then
        echo -e "${GREEN}✓${NC} Compression gzip activée"
    else
        echo -e "${YELLOW}⚠${NC} Compression gzip non configurée"
    fi
fi
echo ""

# Suggestions
echo "========================================="
echo "  Prochaines étapes:"
echo "========================================="
echo ""
echo "Pour construire l'image Docker:"
echo "  → docker build -t ccapp:latest ."
echo ""
echo "Ou utiliser docker-compose:"
echo "  → docker-compose up -d"
echo ""
echo "Ou utiliser le script automatique:"
echo "  → ./docker-build.sh"
echo ""
echo "========================================="
