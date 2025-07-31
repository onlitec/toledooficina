# 🐳 Guia Docker Hub - ERP Oficina Mecânica

## 📦 Imagens Disponíveis

As imagens Docker do ERP Oficina Mecânica estão disponíveis no Docker Hub com separação por ambiente:

### Backend (Flask API)
- **Repositório:** `onlitec/toledooficina-backend`
- **Tags Desenvolvimento:** `dev`, `latest-dev`
- **Tags Produção:** `prod`, `latest`, `v1.2`
- **Tamanho:** ~486MB
- **Link:** https://hub.docker.com/r/onlitec/toledooficina-backend

### Frontend (React + Nginx)
- **Repositório:** `onlitec/toledooficina-frontend`
- **Tags Desenvolvimento:** `dev`, `latest-dev`
- **Tags Produção:** `prod`, `latest`, `v1.2`
- **Tamanho:** ~53MB
- **Link:** https://hub.docker.com/r/onlitec/toledooficina-frontend

## 🎯 Estratégia de Tags

### 🔧 Desenvolvimento
- `dev` - Versão de desenvolvimento atual
- `latest-dev` - Última versão de desenvolvimento

### 🚀 Produção
- `prod` - Versão de produção atual
- `latest` - Última versão estável (produção)
- `v1.2` - Versão específica com número

## 🚀 Execução Rápida

### 🔧 Desenvolvimento

#### Opção 1: Docker Compose (Recomendado)
```bash
# Baixar arquivos de configuração
wget https://raw.githubusercontent.com/onlitec/toledooficina/main/docker-compose.hub-dev.yml
wget https://raw.githubusercontent.com/onlitec/toledooficina/main/.env.hub-dev

# Executar ambiente de desenvolvimento
docker-compose -f docker-compose.hub-dev.yml --env-file .env.hub-dev up -d
```

#### Acesso Desenvolvimento
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3000/api

### 🚀 Produção

#### Opção 1: Docker Compose (Recomendado)
```bash
# Baixar arquivos de configuração
wget https://raw.githubusercontent.com/onlitec/toledooficina/main/docker-compose.hub-prod.yml
wget https://raw.githubusercontent.com/onlitec/toledooficina/main/.env.hub-prod

# IMPORTANTE: Editar .env.hub-prod com suas configurações
nano .env.hub-prod

# Executar ambiente de produção
docker-compose -f docker-compose.hub-prod.yml --env-file .env.hub-prod up -d
```

#### Acesso Produção
- **Frontend:** http://seu-dominio.com
- **Backend API:** http://seu-dominio.com/api

### Opção 2: Comandos Docker Manuais (Desenvolvimento)
```bash
# Criar rede
docker network create erp-network-dev

# PostgreSQL
docker run -d \
  --name erp-oficina-postgres-dev \
  --network erp-network-dev \
  -e POSTGRES_DB=erp_oficina_dev \
  -e POSTGRES_USER=erp_user_dev \
  -e POSTGRES_PASSWORD=dev_password_123 \
  postgres:15-alpine

# Redis
docker run -d \
  --name erp-oficina-redis-dev \
  --network erp-network-dev \
  redis:7-alpine redis-server --requirepass dev_redis_123

# Backend
docker run -d \
  --name erp-oficina-backend-dev \
  --network erp-network-dev \
  -e FLASK_ENV=development \
  -e DATABASE_URL=postgresql://erp_user_dev:dev_password_123@erp-oficina-postgres-dev:5432/erp_oficina_dev \
  -e REDIS_URL=redis://:dev_redis_123@erp-oficina-redis-dev:6379/0 \
  -e PYTHONPATH=/app \
  onlitec/toledooficina-backend:dev

# Frontend
docker run -d \
  --name erp-oficina-frontend-dev \
  --network erp-network-dev \
  -p 3000:80 \
  onlitec/toledooficina-frontend:dev
```

## 📥 Download das Imagens

### Desenvolvimento
```bash
# Baixar imagens de desenvolvimento
docker pull onlitec/toledooficina-backend:dev
docker pull onlitec/toledooficina-frontend:dev

# Ou usar latest-dev
docker pull onlitec/toledooficina-backend:latest-dev
docker pull onlitec/toledooficina-frontend:latest-dev
```

### Produção
```bash
# Baixar imagens de produção
docker pull onlitec/toledooficina-backend:latest
docker pull onlitec/toledooficina-frontend:latest

# Ou versão específica
docker pull onlitec/toledooficina-backend:v1.2
docker pull onlitec/toledooficina-frontend:v1.2
```

### Verificar Imagens
```bash
# Verificar todas as imagens
docker images | grep onlitec

# Verificar apenas desenvolvimento
docker images | grep "onlitec.*dev"

# Verificar apenas produção
docker images | grep "onlitec.*latest\|onlitec.*prod\|onlitec.*v1"
```

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
# Status dos containers de desenvolvimento
docker ps | grep "dev"

# Logs de desenvolvimento
docker logs erp-oficina-backend-dev
docker logs erp-oficina-frontend-dev
docker logs erp-oficina-postgres-dev
docker logs erp-oficina-redis-dev

# Parar ambiente de desenvolvimento
docker-compose -f docker-compose.hub-dev.yml down

# Remover volumes de desenvolvimento (CUIDADO: apaga dados!)
docker-compose -f docker-compose.hub-dev.yml down -v
```

### Produção
```bash
# Status dos containers de produção
docker ps | grep "prod"

# Logs de produção
docker logs erp-oficina-backend-prod
docker logs erp-oficina-frontend-prod
docker logs erp-oficina-nginx-prod
docker logs erp-oficina-postgres-prod
docker logs erp-oficina-redis-prod

# Parar ambiente de produção
docker-compose -f docker-compose.hub-prod.yml down

# Backup antes de parar produção
docker exec erp-oficina-backup-prod /backup.sh
```

### Comandos Gerais
```bash
# Ver todos os containers do ERP
docker ps -a | grep erp-oficina

# Monitorar recursos
docker stats

# Limpar imagens não utilizadas
docker image prune

# Limpar tudo (CUIDADO!)
docker system prune -a
```

## 📋 Requisitos

- Docker 20.10+
- Docker Compose 2.0+ (opcional)
- Porta 80 disponível

## 
Se você quiser fazer build das imagens localmente:

```bash
# Clonar repositório
git clone https://github.com/onlitec/toledooficina.git
cd toledooficina

# Build e execução
docker-compose up --build -d
```

## 📊 Informações das Imagens

### Backend
- **Base:** python:3.11-slim
- **Dependências:** Flask, SQLAlchemy, ReportLab, etc.
- **Porta:** 5000 (interna)
- **Volumes:** database, uploads, backups

### Frontend
- **Base:** node:18-alpine (build) + nginx:alpine (runtime)
- **Framework:** React + Vite
- **Porta:** 80
- **Proxy:** Nginx para backend

## 🔄 Atualizações

Para atualizar para a versão mais recente:

```bash
# Parar containers
docker-compose -f docker-compose.hub.yml down

# Baixar imagens atualizadas
docker pull onlitec/toledooficina-backend:latest
docker pull onlitec/toledooficina-frontend:latest

# Executar novamente
docker-compose -f docker-compose.hub.yml up -d
```

---

**ERP Oficina Mecânica v1.0** - Sistema completo para gestão de oficinas mecânicas
