# Dockerfile optimisé - multi-stage avec copie sélective des dépendances
FROM node:20-alpine AS builder

WORKDIR /app

# Outils nécessaires pour la compilation
RUN apk add --no-cache openssl ca-certificates

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer toutes les dépendances (dev + prod) pour le build
RUN npm install --legacy-peer-deps --no-audit --no-fund && \
    npm cache clean --force

# Copier le code source
COPY . .
COPY prisma ./prisma

# Générer Prisma et compiler TypeScript
RUN npx prisma generate && \
    npx tsc

# ==========================================
# Étape de production - image minimale
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

# Outils minimaux nécessaires en production
RUN apk add --no-cache openssl ca-certificates

# Copier uniquement les fichiers package.json
COPY package.json package-lock.json* ./

# Installer SEULEMENT les dépendances de production
# Nettoyer le cache npm immédiatement après
RUN npm ci --omit=dev --legacy-peer-deps --no-audit --no-fund && \
    npm cache clean --force && \
    # Nettoyer les fichiers inutiles de node_modules
    find node_modules -type f -name "*.d.ts" -delete && \
    find node_modules -type f -name "*.map" -delete && \
    find node_modules -type d -name "docs" -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -type d -name "test" -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -type d -name "examples" -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -type d -name ".github" -exec rm -rf {} + 2>/dev/null || true && \
    rm -rf node_modules/*/src node_modules/*/spec node_modules/*/benchmark

# Copier les fichiers compilés et Prisma depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env.example ./.env

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Healthcheck pour vérifier que l'application fonctionne
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
