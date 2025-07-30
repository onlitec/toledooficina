#!/bin/bash

# Script para atualizar docker-compose.yml com configurações de produção seguras
# Este script modifica o docker-compose.yml para usar secrets seguras e PostgreSQL

set -e  # Sair imediatamente se um comando falhar

echo "=== ATUALIZAÇÃO DO DOCKER-COMPOSE PARA PRODUÇÃO ==="
echo "Data: $(date)"
echo "==================================================="

# Verificar se o arquivo docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo "ERRO: Arquivo docker-compose.yml não encontrado!"
    exit 1
fi

# Verificar se os secrets foram gerados
if [ ! -d "./secrets" ]; then
    echo "ERRO: Diretório de secrets não encontrado!"
    echo "Por favor, execute primeiro o script generate_secrets.sh"
    exit 1
fi

# Fazer backup do docker-compose.yml atual
echo "Fazendo backup do docker-compose.yml atual..."
cp docker-compose.yml docker-compose.yml.backup.$(date +"%Y%m%d_%H%M%S")

# Ler os secrets gerados
FLASK_SECRET_KEY=$(cat ./secrets/flask_secret_key)
POSTGRES_PASSWORD=$(cat ./secrets/postgres_password)

# Criar novo docker-compose.yml com configurações seguras
echo "Atualizando docker-compose.yml com configurações seguras..."

cat > docker-compose.yml << EOF
version: '3.8'

services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: erp-oficina-backend
    environment:
      - FLASK_ENV=production
      - FLASK_DEBUG=0
      - DATABASE_URL=postgresql://erp_user:${POSTGRES_PASSWORD}@postgres:5432/erp_oficina
      - PYTHONPATH=/app
    secrets:
      - secret_key
    volumes:
      - backend_data:/app/src/database
      - uploads_data:/app/uploads
      - backups_data:/app/backups
    networks:
      - erp-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/users"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile
    container_name: erp-oficina-frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - erp-network
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL database (produção)
  postgres:
    image: postgres:15-alpine
    container_name: erp-oficina-postgres
    environment:
      POSTGRES_DB: erp_oficina
      POSTGRES_USER: erp_user
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups/postgres:/backups
    networks:
      - erp-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U erp_user -d erp_oficina"]
      interval: 30s
      timeout: 10s
      retries: 3
    command: |
      postgres -c logging_collector=on 
      -c log_statement=all 
      -c log_destination=stderr 
      -c log_directory=/var/lib/postgresql/data/logs 
      -c log_filename=postgresql-%Y-%m-%d_%H%M%S.log 
      -c log_rotation_age=1d 
      -c log_rotation_size=100MB 
      -c log_min_duration_statement=0 
      -c log_connections=on 
      -c log_disconnections=on

  # Redis para cache (produção)
  redis:
    image: redis:7-alpine
    container_name: erp-oficina-redis
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD}
    environment:
      REDIS_PASSWORD: \${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - erp-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx reverse proxy (para produção com SSL)
  nginx:
    image: nginx:alpine
    container_name: erp-oficina-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - frontend
    networks:
      - erp-network
    restart: unless-stopped

networks:
  erp-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.100.0.0/16

volumes:
  backend_data:
    driver: local
  uploads_data:
    driver: local
  backups_data:
    driver: local
  postgres_data:
    driver: local
  redis_data:
    driver: local

secrets:
  secret_key:
    file: ./secrets/flask_secret_key
  postgres_password:
    file: ./secrets/postgres_password
EOF

echo "docker-compose.yml atualizado com configurações seguras!"

# Criar arquivo .env para variáveis de ambiente
echo "Criando arquivo .env com variáveis de ambiente..."
cat > .env << EOF
# Variáveis de ambiente para produção - Atualizado em $(date)
FLASK_ENV=production
FLASK_DEBUG=0
DATABASE_URL=postgresql://erp_user:${POSTGRES_PASSWORD}@postgres:5432/erp_oficina
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
REDIS_PASSWORD=$(openssl rand -base64 16 | tr -d '/+=' | cut -c1-16)

# Configurações de segurança adicionais
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=Lax
EOF

echo ""
echo "=== ATUALIZAÇÃO DO DOCKER-COMPOSE CONCLUÍDA ==="
echo "Arquivo docker-compose.yml atualizado com:"
echo "- Configurações seguras de secrets"
echo "- PostgreSQL como banco de dados de produção"
echo "- Redis para cache"
echo "- Nginx como reverse proxy"
echo "- Volumes persistentes para todos os serviços"
echo ""
echo "Backup do docker-compose.yml original salvo."
echo "Arquivo .env criado com variáveis de ambiente."
echo "==============================================="

# Verificar a sintaxe do docker-compose.yml
echo ""
echo "Verificando sintaxe do docker-compose.yml..."
if command -v docker-compose &> /dev/null; then
    docker-compose config > /dev/null && echo "✓ Sintaxe do docker-compose.yml está correta" || echo "✗ Erro na sintaxe do docker-compose.yml"
else
    echo "⚠ Não foi possível verificar a sintaxe - docker-compose não encontrado"
fi
