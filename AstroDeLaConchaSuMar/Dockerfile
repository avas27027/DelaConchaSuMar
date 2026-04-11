FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

EXPOSE 3000

# Forzamos a Astro a escuchar en 0.0.0.0 y en el puerto 3000
CMD ["npx", "astro", "dev", "--host", "0.0.0.0", "--port", "3000"]