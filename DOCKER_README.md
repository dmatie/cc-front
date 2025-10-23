# 🐳 Docker - Guide Rapide

## 🚀 Démarrage Rapide

### Option 1 : Script automatique (Recommandé)
```bash
chmod +x docker-build.sh
./docker-build.sh
```

### Option 2 : Docker Compose
```bash
docker-compose up -d
```

### Option 3 : Commandes manuelles
```bash
# Build
docker build -t ccapp:latest .

# Run
docker run -d -p 8080:80 --name ccapp-container ccapp:latest
```

## 📦 Accéder à l'application

Une fois lancée, ouvrir : **http://localhost:8080**

## 📋 Commandes essentielles

```bash
# Voir les logs
docker logs -f ccapp-container

# Arrêter
docker stop ccapp-container

# Redémarrer
docker start ccapp-container

# Supprimer
docker rm -f ccapp-container
```

## 📚 Documentation complète

Voir [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) pour la documentation détaillée.

## 🆘 Problème ?

```bash
# Reconstruire complètement
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Structure de l'image

```
Multi-stage build:
├─ Stage 1: Build (Node.js 22 Alpine) ~500MB
│  ├─ Installer les dépendances
│  └─ Compiler l'application Angular
│
└─ Stage 2: Production (Nginx Alpine) ~25MB ✨
   ├─ Copier les fichiers compilés
   └─ Servir avec Nginx
```

## 🔐 Variables d'environnement

Les variables d'environnement Angular sont compilées dans le build.

Pour modifier :
1. Éditer `.env`
2. Reconstruire l'image : `docker-compose build`
3. Relancer : `docker-compose up -d`

## 🎯 Pour l'équipe Infrastructure

### Tags d'image recommandés
```bash
# Build avec version
docker build -t ccapp:1.0.0 .
docker build -t ccapp:latest .

# Pour registry Azure
docker tag ccapp:1.0.0 myregistry.azurecr.io/ccapp:1.0.0
docker push myregistry.azurecr.io/ccapp:1.0.0
```

### Health Check
L'image inclut un health check :
```bash
docker inspect ccapp-container | grep -A 5 "Health"
```

### Logs
Configuration des logs dans `docker-compose.yml` :
- Taille max : 10MB par fichier
- Rotation : 3 fichiers max

### Ressources
Limiter les ressources si nécessaire :
```yaml
services:
  ccapp:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

## ✨ Caractéristiques

- ✅ Multi-stage build (image légère)
- ✅ Nginx optimisé pour Angular SPA
- ✅ Compression gzip activée
- ✅ Cache intelligent des assets
- ✅ Headers de sécurité
- ✅ Health check intégré
- ✅ Support des routes Angular
- ✅ Logs structurés

## 🔍 Vérification

```bash
# Taille de l'image (devrait être ~25MB)
docker images ccapp

# Vérifier que le conteneur fonctionne
docker ps | grep ccapp

# Tester le health check
docker inspect --format='{{.State.Health.Status}}' ccapp-container
```

## 📈 Performance

L'image finale optimisée :
- **Taille** : ~25MB (vs ~500MB sans multi-stage)
- **Démarrage** : < 2 secondes
- **RAM** : ~10MB au repos
- **CPU** : Minimal
