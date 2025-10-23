# 🐳 Guide Docker - CC Application

## 📋 Table des matières
1. [Prérequis](#prérequis)
2. [Structure des fichiers Docker](#structure-des-fichiers-docker)
3. [Commandes de base](#commandes-de-base)
4. [Déploiement](#déploiement)
5. [Dépannage](#dépannage)

---

## Prérequis

Installer Docker sur votre machine :
- **Windows/Mac** : [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux** : `sudo apt-get install docker.io docker-compose`

Vérifier l'installation :
```bash
docker --version
docker-compose --version
```

---

## Structure des fichiers Docker

### 📄 Dockerfile
Le fichier principal qui contient les instructions pour construire l'image Docker.

**Architecture multi-stage** :
- **Stage 1 (build)** : Compile l'application Angular avec Node.js
- **Stage 2 (production)** : Sert l'application avec Nginx (image légère)

### 📄 nginx.conf
Configuration du serveur web Nginx pour servir l'application Angular :
- Support des routes Angular (SPA)
- Cache optimisé pour les assets statiques
- Compression gzip
- Headers de sécurité

### 📄 .dockerignore
Liste des fichiers à exclure de l'image Docker (comme `.gitignore`)

### 📄 docker-compose.yml
Fichier d'orchestration pour faciliter le lancement de l'application

---

## Commandes de base

### Option 1 : Utiliser Docker directement

#### 1. Construire l'image
```bash
docker build -t ccapp:latest .
```
- `-t ccapp:latest` : Tag (nom) de l'image
- `.` : Contexte de build (dossier actuel)

#### 2. Lancer le conteneur
```bash
docker run -d -p 8080:80 --name ccapp-container ccapp:latest
```
- `-d` : Mode détaché (arrière-plan)
- `-p 8080:80` : Map le port 80 du conteneur vers le port 8080
- `--name` : Nom du conteneur

#### 3. Accéder à l'application
Ouvrir le navigateur : `http://localhost:8080`

#### 4. Voir les logs
```bash
docker logs ccapp-container
docker logs -f ccapp-container  # Suivre les logs en temps réel
```

#### 5. Arrêter le conteneur
```bash
docker stop ccapp-container
```

#### 6. Redémarrer le conteneur
```bash
docker start ccapp-container
```

#### 7. Supprimer le conteneur
```bash
docker rm ccapp-container
```

#### 8. Supprimer l'image
```bash
docker rmi ccapp:latest
```

---

### Option 2 : Utiliser Docker Compose (Recommandé)

#### 1. Construire et lancer
```bash
docker-compose up -d
```
- `-d` : Mode détaché

#### 2. Voir les logs
```bash
docker-compose logs -f
```

#### 3. Arrêter l'application
```bash
docker-compose down
```

#### 4. Reconstruire après modifications
```bash
docker-compose up -d --build
```

#### 5. Voir l'état des conteneurs
```bash
docker-compose ps
```

---

## Déploiement

### Workflow de déploiement complet

#### 1. Développement local
```bash
# Tester localement
npm run dev

# Vérifier le build
npm run build:prod
```

#### 2. Construire l'image Docker
```bash
docker build -t ccapp:1.0.0 .
```

#### 3. Tester l'image localement
```bash
docker run -d -p 8080:80 --name ccapp-test ccapp:1.0.0
# Tester sur http://localhost:8080
docker stop ccapp-test
docker rm ccapp-test
```

#### 4. Taguer pour le registry
```bash
# Pour Azure Container Registry (exemple)
docker tag ccapp:1.0.0 myregistry.azurecr.io/ccapp:1.0.0
docker tag ccapp:1.0.0 myregistry.azurecr.io/ccapp:latest
```

#### 5. Pousser vers le registry
```bash
# Se connecter au registry
docker login myregistry.azurecr.io

# Pousser l'image
docker push myregistry.azurecr.io/ccapp:1.0.0
docker push myregistry.azurecr.io/ccapp:latest
```

#### 6. Déployer en production
```bash
# Sur le serveur de production
docker pull myregistry.azurecr.io/ccapp:latest
docker run -d -p 80:80 --name ccapp-prod --restart unless-stopped \
  myregistry.azurecr.io/ccapp:latest
```

---

## Variables d'environnement

### Au moment du build
Les variables d'environnement Angular sont compilées dans le build.
Pour différents environnements, créez des images séparées :

```bash
# Pour la production
docker build -t ccapp:prod .

# Pour le staging (modifier angular.json si nécessaire)
docker build -t ccapp:staging --build-arg ENV=staging .
```

### Au moment de l'exécution
Passer des variables au conteneur :

```bash
docker run -d -p 8080:80 \
  -e API_URL=https://api.production.com \
  --name ccapp-container \
  ccapp:latest
```

Avec docker-compose :
```yaml
services:
  ccapp:
    environment:
      - API_URL=https://api.production.com
```

---

## Dépannage

### Le conteneur ne démarre pas
```bash
# Voir les logs d'erreur
docker logs ccapp-container

# Inspecter le conteneur
docker inspect ccapp-container
```

### L'application ne se charge pas
```bash
# Vérifier que Nginx fonctionne
docker exec ccapp-container nginx -t

# Vérifier les fichiers statiques
docker exec ccapp-container ls -la /usr/share/nginx/html
```

### Problème de permissions
```bash
# Reconstruire l'image complètement
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### L'image est trop grande
```bash
# Vérifier la taille de l'image
docker images ccapp

# L'image devrait faire ~20-30MB avec le multi-stage build
# Si plus grande, vérifier le .dockerignore
```

### Les routes Angular ne fonctionnent pas
Vérifier que `nginx.conf` contient :
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Nettoyer Docker
```bash
# Supprimer tous les conteneurs arrêtés
docker container prune

# Supprimer toutes les images non utilisées
docker image prune -a

# Nettoyer complètement Docker
docker system prune -a --volumes
```

---

## Commandes utiles

### Informations système
```bash
# Voir tous les conteneurs
docker ps -a

# Voir toutes les images
docker images

# Voir l'utilisation du disque
docker system df

# Statistiques en temps réel
docker stats
```

### Accéder au conteneur
```bash
# Ouvrir un shell dans le conteneur
docker exec -it ccapp-container sh

# Lire un fichier de configuration
docker exec ccapp-container cat /etc/nginx/conf.d/default.conf
```

### Sauvegarder/Restaurer une image
```bash
# Sauvegarder
docker save ccapp:latest > ccapp-latest.tar

# Restaurer
docker load < ccapp-latest.tar
```

---

## Bonnes pratiques

1. ✅ Toujours taguer les images avec des versions (`1.0.0`, `1.0.1`, etc.)
2. ✅ Utiliser le multi-stage build pour des images légères
3. ✅ Ne jamais inclure de secrets dans l'image
4. ✅ Utiliser `.dockerignore` pour exclure les fichiers inutiles
5. ✅ Tester l'image localement avant de déployer
6. ✅ Configurer des healthchecks
7. ✅ Limiter les logs avec un driver de logging
8. ✅ Utiliser des registries privés pour les applications de production

---

## Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Best practices Dockerfile](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Documentation Nginx](https://nginx.org/en/docs/)
- [Angular Deployment](https://angular.dev/tools/cli/deployment)

---

## Support

Pour toute question sur la configuration Docker, contacter l'équipe DevOps.
