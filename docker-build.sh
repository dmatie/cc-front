#!/bin/bash

# Script de build et test Docker pour CC Application
# Usage: ./docker-build.sh [options]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
IMAGE_NAME="ccapp"
VERSION=${1:-"latest"}
CONTAINER_NAME="ccapp-container"
PORT=${2:-8080}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   CC Application - Docker Build${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Fonction pour afficher les messages
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

info "Docker version: $(docker --version)"
echo ""

# Nettoyer les conteneurs existants
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    warning "Arrêt et suppression du conteneur existant..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
fi

# Construire l'image
info "Construction de l'image Docker..."
echo ""
docker build -t $IMAGE_NAME:$VERSION .

if [ $? -eq 0 ]; then
    success "Image construite avec succès!"
    echo ""
else
    error "Échec de la construction de l'image"
    exit 1
fi

# Afficher les informations sur l'image
info "Informations sur l'image:"
docker images $IMAGE_NAME:$VERSION
echo ""

# Demander si on veut lancer le conteneur
read -p "Voulez-vous lancer le conteneur maintenant? (o/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[OoYy]$ ]]; then
    info "Lancement du conteneur sur le port $PORT..."
    docker run -d -p $PORT:80 --name $CONTAINER_NAME $IMAGE_NAME:$VERSION

    if [ $? -eq 0 ]; then
        success "Conteneur lancé avec succès!"
        echo ""
        info "Application disponible sur: http://localhost:$PORT"
        echo ""
        info "Commandes utiles:"
        echo "  - Voir les logs: docker logs -f $CONTAINER_NAME"
        echo "  - Arrêter: docker stop $CONTAINER_NAME"
        echo "  - Redémarrer: docker start $CONTAINER_NAME"
        echo "  - Supprimer: docker rm -f $CONTAINER_NAME"
    else
        error "Échec du lancement du conteneur"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Build terminé avec succès!${NC}"
echo -e "${GREEN}========================================${NC}"
