# =================================
# Étape 1: Build de l'application
# =================================
FROM node:22-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
# --legacy-peer-deps pour résoudre les conflits de dépendances si nécessaire
RUN npm ci --legacy-peer-deps

# Copier tout le code source
COPY . .

# Compiler l'application pour la production
RUN npm run build:prod

# =================================
# Étape 2: Servir avec Nginx
# =================================
FROM nginx:alpine

# Copier les fichiers compilés depuis l'étape de build
COPY --from=build /app/dist/ccapp/browser /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Ajouter un healthcheck pour vérifier que Nginx fonctionne
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Démarrer Nginx en mode foreground
CMD ["nginx", "-g", "daemon off;"]
