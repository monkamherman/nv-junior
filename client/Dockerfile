# Étape de construction
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ARG NODE_ENV

# Copier les fichiers de configuration
COPY package.json package-lock.json* ./

# Installer les dépendances (y compris devDependencies pour le build)
# Forcer l'installation des devDependencies en définissant NODE_ENV=development
RUN NODE_ENV=development npm install --legacy-peer-deps

# Définir les variables d'environnement après l'installation
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=${NODE_ENV}

# Copier le reste des fichiers
COPY . .

# Construire l'application
RUN npm run build

# Étape de production
FROM nginx:stable-alpine

# Copier la configuration Nginx interne au container
COPY nginx-config/default.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers construits depuis l'étape de construction
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port 80 (port interne du container)
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]