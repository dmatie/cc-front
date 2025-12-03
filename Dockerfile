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
#RUN npm run build --configuration=perso

# =================================
# Étape 2: Build Nginx avec headers-more
# =================================
FROM alpine:3.19 AS nginx-build

# Versions
ENV NGINX_VERSION=1.26.2
ENV HEADERS_MORE_VERSION=0.37

# Installer les dépendances de compilation
RUN apk add --no-cache \
    gcc \
    libc-dev \
    make \
    openssl-dev \
    pcre-dev \
    zlib-dev \
    linux-headers \
    curl \
    gnupg \
    libxslt-dev \
    gd-dev \
    geoip-dev

# Télécharger et extraire Nginx
WORKDIR /tmp
RUN curl -fSL https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz -o nginx.tar.gz && \
    tar -xzf nginx.tar.gz && \
    rm nginx.tar.gz

# Télécharger et extraire headers-more-nginx-module
RUN curl -fSL https://github.com/openresty/headers-more-nginx-module/archive/refs/tags/v${HEADERS_MORE_VERSION}.tar.gz -o headers-more.tar.gz && \
    tar -xzf headers-more.tar.gz && \
    rm headers-more.tar.gz

# Compiler Nginx avec le module headers-more
WORKDIR /tmp/nginx-${NGINX_VERSION}
RUN ./configure \
    --prefix=/etc/nginx \
    --sbin-path=/usr/sbin/nginx \
    --modules-path=/usr/lib/nginx/modules \
    --conf-path=/etc/nginx/nginx.conf \
    --error-log-path=/var/log/nginx/error.log \
    --http-log-path=/var/log/nginx/access.log \
    --pid-path=/var/run/nginx.pid \
    --lock-path=/var/run/nginx.lock \
    --http-client-body-temp-path=/var/cache/nginx/client_temp \
    --http-proxy-temp-path=/var/cache/nginx/proxy_temp \
    --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
    --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
    --http-scgi-temp-path=/var/cache/nginx/scgi_temp \
    --user=nginx \
    --group=nginx \
    --with-http_ssl_module \
    --with-http_realip_module \
    --with-http_addition_module \
    --with-http_sub_module \
    --with-http_dav_module \
    --with-http_flv_module \
    --with-http_mp4_module \
    --with-http_gunzip_module \
    --with-http_gzip_static_module \
    --with-http_random_index_module \
    --with-http_secure_link_module \
    --with-http_stub_status_module \
    --with-http_auth_request_module \
    --with-http_xslt_module=dynamic \
    --with-http_image_filter_module=dynamic \
    --with-http_geoip_module=dynamic \
    --with-threads \
    --with-stream \
    --with-stream_ssl_module \
    --with-stream_ssl_preread_module \
    --with-stream_realip_module \
    --with-stream_geoip_module=dynamic \
    --with-http_slice_module \
    --with-mail \
    --with-mail_ssl_module \
    --with-compat \
    --with-file-aio \
    --with-http_v2_module \
    --add-module=/tmp/headers-more-nginx-module-${HEADERS_MORE_VERSION} && \
    make -j$(nproc) && \
    make install

# =================================
# Étape 3: Image finale Nginx
# =================================
FROM alpine:3.19

# Installer les dépendances runtime
RUN apk add --no-cache \
    pcre \
    zlib \
    openssl \
    libxslt \
    gd \
    geoip \
    curl

# Créer l'utilisateur nginx
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Créer les répertoires nécessaires
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    /var/log/nginx \
    /etc/nginx/conf.d \
    /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html

# Copier Nginx compilé depuis l'étape de build
COPY --from=nginx-build /usr/sbin/nginx /usr/sbin/nginx
COPY --from=nginx-build /etc/nginx /etc/nginx
COPY --from=nginx-build /usr/lib/nginx/modules /usr/lib/nginx/modules

# Copier les fichiers compilés de l'application
COPY --from=build /app/dist/ccapp/browser /usr/share/nginx/html

# Copier le script d'extraction CSP
COPY auto-extract-csp-hashes.sh /tmp/auto-extract-csp-hashes.sh
RUN chmod +x /tmp/auto-extract-csp-hashes.sh

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exécuter le script pour extraire et injecter les hashes CSP automatiquement
RUN /tmp/auto-extract-csp-hashes.sh /usr/share/nginx/html/index.html /etc/nginx/conf.d/default.conf

# Créer une configuration nginx.conf minimale
RUN echo "user nginx;" > /etc/nginx/nginx.conf && \
    echo "worker_processes auto;" >> /etc/nginx/nginx.conf && \
    echo "error_log /var/log/nginx/error.log warn;" >> /etc/nginx/nginx.conf && \
    echo "pid /var/run/nginx.pid;" >> /etc/nginx/nginx.conf && \
    echo "" >> /etc/nginx/nginx.conf && \
    echo "events {" >> /etc/nginx/nginx.conf && \
    echo "    worker_connections 1024;" >> /etc/nginx/nginx.conf && \
    echo "}" >> /etc/nginx/nginx.conf && \
    echo "" >> /etc/nginx/nginx.conf && \
    echo "http {" >> /etc/nginx/nginx.conf && \
    echo "    include /etc/nginx/mime.types;" >> /etc/nginx/nginx.conf && \
    echo "    default_type application/octet-stream;" >> /etc/nginx/nginx.conf && \
    echo "    log_format main '\$remote_addr - \$remote_user [\$time_local] \"\$request\" '" >> /etc/nginx/nginx.conf && \
    echo "                    '\$status \$body_bytes_sent \"\$http_referer\" '" >> /etc/nginx/nginx.conf && \
    echo "                    '\"\$http_user_agent\" \"\$http_x_forwarded_for\"';" >> /etc/nginx/nginx.conf && \
    echo "    access_log /var/log/nginx/access.log main;" >> /etc/nginx/nginx.conf && \
    echo "    sendfile on;" >> /etc/nginx/nginx.conf && \
    echo "    keepalive_timeout 65;" >> /etc/nginx/nginx.conf && \
    echo "    include /etc/nginx/conf.d/*.conf;" >> /etc/nginx/nginx.conf && \
    echo "}" >> /etc/nginx/nginx.conf

# Copier le fichier mime.types standard
RUN curl -fSL https://raw.githubusercontent.com/nginx/nginx/master/conf/mime.types -o /etc/nginx/mime.types

# Exposer le port 80
EXPOSE 80

# Ajouter un healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Démarrer Nginx en mode foreground
CMD ["nginx", "-g", "daemon off;"]
