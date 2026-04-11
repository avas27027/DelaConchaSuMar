FROM node:22-alpine

WORKDIR /app

# Instalamos dependencias primero para aprovechar el caché de Docker
COPY package*.json ./
RUN npm install

# No copiamos el resto del código aquí porque lo montaremos con volúmenes
# Pero exponemos el puerto
EXPOSE 3001

# Comando para desarrollo con hot-reload
CMD ["npm", "run", "start:dev"]