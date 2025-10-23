# 🐳 Docker - Aide-Mémoire

## 🚀 Commandes Essentielles

### Construction
```bash
# Build simple
docker build -t ccapp:latest .

# Build avec tag de version
docker build -t ccapp:1.0.0 .

# Build sans cache
docker build --no-cache -t ccapp:latest .

# Avec docker-compose
docker-compose build
docker-compose build --no-cache
```

### Lancement
```bash
# Lancer le conteneur
docker run -d -p 8080:80 --name ccapp-container ccapp:latest

# Lancer avec docker-compose
docker-compose up -d

# Lancer et voir les logs
docker-compose up
```

### Gestion
```bash
# Arrêter
docker stop ccapp-container
docker-compose down

# Redémarrer
docker start ccapp-container
docker restart ccapp-container

# Supprimer
docker rm ccapp-container
docker rm -f ccapp-container  # Force
```

### Logs
```bash
# Voir les logs
docker logs ccapp-container

# Suivre les logs en temps réel
docker logs -f ccapp-container

# Dernières 100 lignes
docker logs --tail 100 ccapp-container

# Avec docker-compose
docker-compose logs -f
```

### Inspection
```bash
# Voir tous les conteneurs
docker ps
docker ps -a  # Inclus ceux arrêtés

# Inspecter un conteneur
docker inspect ccapp-container

# Statistiques en temps réel
docker stats
docker stats ccapp-container

# Voir les processus
docker top ccapp-container
```

### Accès au conteneur
```bash
# Ouvrir un shell
docker exec -it ccapp-container sh

# Exécuter une commande
docker exec ccapp-container ls -la /usr/share/nginx/html

# Voir la config nginx
docker exec ccapp-container cat /etc/nginx/conf.d/default.conf
```

### Images
```bash
# Lister les images
docker images

# Supprimer une image
docker rmi ccapp:latest
docker rmi -f ccapp:latest  # Force

# Voir l'historique d'une image
docker history ccapp:latest

# Voir la taille
docker images ccapp
```

## 📦 Docker Registry

### Tag et Push
```bash
# Se connecter à Azure Container Registry
docker login myregistry.azurecr.io

# Tag pour le registry
docker tag ccapp:latest myregistry.azurecr.io/ccapp:latest
docker tag ccapp:1.0.0 myregistry.azurecr.io/ccapp:1.0.0

# Push vers le registry
docker push myregistry.azurecr.io/ccapp:latest
docker push myregistry.azurecr.io/ccapp:1.0.0

# Pull depuis le registry
docker pull myregistry.azurecr.io/ccapp:latest
```

## 🧹 Nettoyage

### Nettoyage basique
```bash
# Supprimer conteneurs arrêtés
docker container prune

# Supprimer images non utilisées
docker image prune

# Supprimer tout ce qui n'est pas utilisé
docker system prune
```

### Nettoyage complet
```bash
# ATTENTION: Supprime TOUT
docker system prune -a --volumes

# Supprimer tous les conteneurs
docker rm -f $(docker ps -aq)

# Supprimer toutes les images
docker rmi -f $(docker images -q)
```

## 🔍 Debugging

### Problèmes courants

#### Le conteneur ne démarre pas
```bash
# Voir les logs d'erreur
docker logs ccapp-container

# Vérifier l'état
docker inspect ccapp-container | grep -A 10 "State"
```

#### L'application ne répond pas
```bash
# Vérifier que le port est bien mappé
docker port ccapp-container

# Tester la connexion
curl http://localhost:8080

# Vérifier nginx
docker exec ccapp-container nginx -t
```

#### Problème de build
```bash
# Build verbeux
docker build --progress=plain -t ccapp:latest .

# Vérifier le .dockerignore
cat .dockerignore

# Build sans cache
docker build --no-cache -t ccapp:latest .
```

#### Problème de permissions
```bash
# Reconstruire complètement
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Monitoring

### Health Check
```bash
# Vérifier le statut de santé
docker inspect --format='{{.State.Health.Status}}' ccapp-container

# Voir l'historique des health checks
docker inspect --format='{{json .State.Health}}' ccapp-container | jq
```

### Ressources
```bash
# Voir l'utilisation des ressources
docker stats ccapp-container

# Limiter les ressources
docker run -d -p 8080:80 \
  --memory="256m" \
  --cpus="0.5" \
  --name ccapp-container \
  ccapp:latest
```

## 🎯 Scénarios Courants

### Déploiement en production
```bash
# 1. Build
docker build -t ccapp:1.0.0 .

# 2. Test local
docker run -d -p 8080:80 --name ccapp-test ccapp:1.0.0
# Tester sur http://localhost:8080
docker stop ccapp-test && docker rm ccapp-test

# 3. Tag pour le registry
docker tag ccapp:1.0.0 myregistry.azurecr.io/ccapp:1.0.0
docker tag ccapp:1.0.0 myregistry.azurecr.io/ccapp:latest

# 4. Push
docker push myregistry.azurecr.io/ccapp:1.0.0
docker push myregistry.azurecr.io/ccapp:latest

# 5. Déployer (sur le serveur)
docker pull myregistry.azurecr.io/ccapp:latest
docker stop ccapp-prod || true
docker rm ccapp-prod || true
docker run -d -p 80:80 \
  --name ccapp-prod \
  --restart unless-stopped \
  myregistry.azurecr.io/ccapp:latest
```

### Mise à jour sans downtime
```bash
# 1. Pull la nouvelle version
docker pull myregistry.azurecr.io/ccapp:latest

# 2. Lancer le nouveau conteneur sur un autre port
docker run -d -p 8081:80 --name ccapp-new myregistry.azurecr.io/ccapp:latest

# 3. Tester
curl http://localhost:8081

# 4. Basculer le trafic (avec load balancer)
# ... configuration du load balancer ...

# 5. Arrêter l'ancien
docker stop ccapp-prod
docker rm ccapp-prod

# 6. Renommer le nouveau
docker rename ccapp-new ccapp-prod
```

### Rollback rapide
```bash
# Arrêter la version problématique
docker stop ccapp-prod

# Lancer la version précédente
docker run -d -p 80:80 \
  --name ccapp-prod \
  --restart unless-stopped \
  myregistry.azurecr.io/ccapp:1.0.0
```

## 💡 Astuces

### Alias utiles
```bash
# Ajouter dans ~/.bashrc ou ~/.zshrc

alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias dlog='docker logs -f'
alias dexec='docker exec -it'
alias dstop='docker stop'
alias drm='docker rm'
alias dprune='docker system prune -a'

# Arrêter tous les conteneurs
alias dstopall='docker stop $(docker ps -aq)'

# Supprimer tous les conteneurs
alias drmall='docker rm $(docker ps -aq)'
```

### Commandes avancées
```bash
# Copier des fichiers depuis/vers le conteneur
docker cp ccapp-container:/usr/share/nginx/html/index.html ./
docker cp ./fichier.txt ccapp-container:/tmp/

# Sauvegarder et restaurer une image
docker save ccapp:latest | gzip > ccapp-latest.tar.gz
gunzip -c ccapp-latest.tar.gz | docker load

# Voir les changements dans le conteneur
docker diff ccapp-container

# Export d'un conteneur
docker export ccapp-container > ccapp.tar
```

## 🔗 Ressources

- [Documentation officielle Docker](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Security Best Practices](https://docs.docker.com/engine/security/)

## 📞 Support

Pour toute question, contacter l'équipe DevOps ou Infrastructure.
