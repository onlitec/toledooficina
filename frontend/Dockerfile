# Multi-stage build for React app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

RUN pnpm run build

# Etapa 2: Servir com Nginx
FROM nginx:alpine

# Copiar build da etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 7080
EXPOSE 7080

# Healthcheck para verificar se o Nginx está rodando
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:7080/ || exit 1

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]

