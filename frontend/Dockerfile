# =========================================
# Stage 1: Construction de l'application React
# =========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (y compris dev)
RUN npm ci

# Copier le code source
COPY . .

# Construire l'application pour la production
RUN npm run build

# =========================================
# Stage 2: Serveur Nginx pour les fichiers statiques
# =========================================
FROM nginx:alpine AS runner

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers construits depuis le stage builder
COPY --from=builder /app/build /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
