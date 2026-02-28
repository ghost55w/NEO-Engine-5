# Base Node.js officielle
FROM node:20-bullseye-slim

# Installer ffmpeg et git pour gérer médias et mises à jour
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /neo_engine_5

# Copier le package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer toutes les dépendances
RUN npm install --legacy-peer-deps

# Copier tout le reste du projet
COPY . .

# Exposer le port pour le serveur web intégré (index.js)
EXPOSE 3000

# Commande de démarrage avec PM2
CMD ["npx", "pm2-runtime", "index.js", "--name", "neo-engine-5"]
