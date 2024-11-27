# Usa una imagen base de Node.js (versión LTS recomendada)
FROM node:18-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todo el código fuente al contenedor
COPY . .

ENV SOLR_HOST=10.10.10.2
ENV SOLR_PORT=8983
ENV SOLR_CORE=ProyectoFinal

# Construye la aplicación
RUN npm run build

# Usa una imagen ligera para producción
FROM node:18-alpine AS production

# Establece el directorio de trabajo
WORKDIR /app

# Copia las dependencias instaladas y el código compilado
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist


# Expone el puerto que utiliza la aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/main"]
