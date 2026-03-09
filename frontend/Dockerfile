# ============================================
# Stage 1: Build React en production
# ============================================
FROM node:20-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci || npm install

# Copier le code source
COPY . .

# Variables d'environnement pour le build (injectées au build)
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV GENERATE_SOURCEMAP=false
ENV NODE_ENV=production

# Build de l'application React
RUN npm run build

# ============================================
# Stage 2: Servir avec Nginx (image légère)
# ============================================
FROM nginx:alpine

# Outil pour healthcheck
RUN apk add --no-cache curl

# Supprimer la config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build depuis le stage précédent
COPY --from=build /app/build /usr/share/nginx/html

# Fichiers statiques en lecture seule
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Exposition du port 80 (Nginx)
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f -s http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
