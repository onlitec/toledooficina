# 🐳 Guia Docker Hub - ERP Oficina Mecânica

## 📦 Imagens Disponeis

As imagens Docker do ERP Oficina Mecânica estão disponíveis no Docker Hub:

### Backend (Flask API)
- **Repositório:** `onlitec/toledooficina-backend`
- **Tags:** `latest`, `v1.0`
- **Tamanho:** ~486MB
- **Link:** https://hub.docker.com/r/onlitec/toledooficina-backend

### Frontend (React + Nginx)
- **Repositório:** `onlitec/toledooficina-frontend`
- **Tags:** `latest`, `v1.0`
- **Tamanho:** ~53MB
- **Link:** https://hub.docker.com/r/onlitec/toledooficina-frontend

## 🚀 Execução Rápida

### Opção 1: Docker Compose (Recomendado)
```bash
# Baixar docker-compose.hub.yml
wget https://raw.githubusercontent.com/onlitec/toledooficina/main/docker-compose.hub.yml

# Executar
docker-compose -f docker-compose.hub.yml up -d
```

### Opção 2: Comandos Docker Manuais
```bash
# Criar rede
docker network create erp-network

# Backend
docker run -d \
  --name erp-oficina-backend \
  --network erp-network \
  -e FLASK_ENV=production \
  -e DATABASE_URL=sqlite:///src/database/app.db \
  -e PYTHONPATH=/app \
  onlitec/toledooficina-backend:latest

# Frontend
docker run -d \
  --name erp-oficina-frontend \
  --network erp-network \
  -p 80:80 \
  onlitec/toledooficina-frontend:latest
```

## 📥 Download das Imagens

```bash
# Baixar imagens
docker pull onlitec/toledooficina-backend:latest
docker pull onlitec/toledooficina-frontend:latest

# Verificar imagens
docker images | grep onlitec
```

## 🌐 Acesso

Após executar os containers:
- **Frontend:** http://localhost
- **Backend API:** http://localhost/api

## 🔧 Comandos Úteis

```bash
# Status dos containers
docker ps

# Logs
docker logs erp-oficina-backend
docker logs erp-oficina-frontend

# Parar containers
docker stop erp-oficina-backend erp-oficina-frontend

# Remover containers
docker rm erp-oficina-backend erp-oficina-frontend
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
