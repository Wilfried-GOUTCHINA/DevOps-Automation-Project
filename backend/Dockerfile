# Utiliser une image Node.js légère (Alpine)
FROM node:18-alpine

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances d'abord (pour le cache Docker)
COPY package*.json ./

# Installer les dépendances avec --legacy-peer-deps pour résoudre le conflit
# ET nettoyer le cache npm pour réduire la taille
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

# Copier le reste du code source
COPY --chown=nodejs:nodejs . .

# Changer pour l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 5000

# Démarrer l'application
CMD ["node", "server.js"]
