# 🐳 Estratégia de Ambientes - Docker Hub

## 📋 Visão Geral

O ERP Oficina Mecânica utiliza uma estratégia de **separação por ambientes** no Docker Hub, permitindo que desenvolvedores e administradores de sistema utilizem versões específicas para desenvolvimento e produção.

## 🎯 Estratégia de Tags

### 🔧 Desenvolvimento
| Tag | Descrição | Uso |
|-----|-----------|-----|
| `dev` | Versão atual de desenvolvimento | Desenvolvimento ativo |
| `latest-dev` | Última versão estável de desenvolvimento | Testes e homologação |

### 🚀 Produção
| Tag | Descrição | Uso |
|-----|-----------|-----|
| `latest` | Última versão estável de produção | Produção recomendada |
| `prod` | Versão de produção atual | Produção alternativa |
| `v1.2` | Versão específica numerada | Produção com versão fixa |

## 📦 Repositórios

### Backend (Flask API)
- **Repositório:** `onlitec/toledooficina-backend`
- **Link:** https://hub.docker.com/r/onlitec/toledooficina-backend
- **Tamanho:** ~486MB
- **Base:** python:3.11-slim

### Frontend (React + Nginx)
- **Repositório:** `onlitec/toledooficina-frontend`
- **Link:** https://hub.docker.com/r/onlitec/toledooficina-frontend
- **Tamanho:** ~53MB
- **Base:** node:18-alpine + nginx:alpine

## 🚀 Como Usar

### 🔧 Desenvolvimento

#### Método 1: Docker Compose (Recomendado)
```bash
# Baixar configurações
wget https://raw.githubusercontent.com/onlitec/toledooficina/main/docker-compose.hub-dev.yml
wget https://raw.githubusercontent.com/onlitec/toledooficina/main/.env.hub-dev

# Executar
docker-compose -f docker-compose.hub-dev.yml --env-file .env.hub-dev up -d
```

#### Método 2: Script de Demonstração
```bash
# Baixar e executar script
wget https://raw.githubusercontent.com/onlitec/toledooficina/main/demo_docker_hub.sh
chmod +x demo_docker_hub.sh
./demo_docker_hub.sh
```

#### Método 3: Comandos Manuais
```bash
# Baixar imagens
docker pull onlitec/toledooficina-backend:dev
docker pull onlitec/toledooficina-frontend:dev
docker pull postgres:15-alpine
docker pull redis:7-alpine

# Executar (exemplo simplificado)
docker network create erp-dev
docker run -d --name postgres-dev --network erp-dev postgres:15-alpine
docker run -d --name redis-dev --network erp-dev redis:7-alpine
docker run -d --name backend-dev --network erp-dev onlitec/toledooficina-backend:dev
docker run -d --name frontend-dev --network erp-dev -p 3000:80 onlitec/toledooficina-frontend:dev
```

### 🚀 Produção

#### Método 1: Docker Compose (Recomendado)
```bash
# Baixar configurações
wget https://raw.githubusercontent.com/onlitec/toledooficina/main/docker-compose.hub-prod.yml
wget https://raw.githubusercontent.com/onlitec/toledooficina/main/.env.hub-prod

# IMPORTANTE: Configurar variáveis de produção
nano .env.hub-prod

# Executar
docker-compose -f docker-compose.hub-prod.yml --env-file .env.hub-prod up -d
```

#### Método 2: Comandos Manuais
```bash
# Baixar imagens
docker pull onlitec/toledooficina-backend:latest
docker pull onlitec/toledooficina-frontend:latest
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull nginx:alpine

# Executar com configurações de produção
# (Ver docker-compose.hub-prod.yml para configuração completa)
```

## 🔄 Processo de Deploy

### Para Desenvolvedores

1. **Desenvolvimento Local:**
   ```bash
   # Fazer alterações no código
   # Testar localmente
   docker-compose up --build
   ```

2. **Push para Desenvolvimento:**
   ```bash
   # Fazer build das imagens
   docker build -t toledooficina-backend:latest ./backend
   docker build -t toledooficina-frontend:latest ./frontend
   
   # Push para desenvolvimento
   ./push_docker_images.sh
   # Escolher opção 1 (Desenvolvimento)
   ```

3. **Testar no Ambiente de Dev:**
   ```bash
   # Em outro servidor/máquina
   docker pull onlitec/toledooficina-backend:dev
   docker pull onlitec/toledooficina-frontend:dev
   # Executar testes
   ```

### Para Administradores de Sistema

1. **Validação em Desenvolvimento:**
   ```bash
   # Testar versão de desenvolvimento
   docker-compose -f docker-compose.hub-dev.yml up -d
   # Executar testes de aceitação
   ```

2. **Promoção para Produção:**
   ```bash
   # Fazer push para produção
   ./push_docker_images.sh
   # Escolher opção 2 (Produção)
   ```

3. **Deploy em Produção:**
   ```bash
   # Configurar ambiente de produção
   nano .env.hub-prod
   
   # Deploy
   docker-compose -f docker-compose.hub-prod.yml up -d
   
   # Monitorar
   docker logs -f erp-oficina-backend-prod
   ```

## 🔒 Configurações de Segurança

### Desenvolvimento
- Senhas simples e conhecidas
- Debug habilitado
- Logs detalhados
- Porta 3000 (não conflita com produção)

### Produção
- **OBRIGATÓRIO:** Configurar senhas seguras
- **OBRIGATÓRIO:** Configurar domínio real
- **OBRIGATÓRIO:** Configurar SSL/HTTPS
- Debug desabilitado
- Logs otimizados
- Backup automático
- Monitoramento

## 📊 Comparação de Ambientes

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| **Porta** | 3000 | 80/443 |
| **Banco** | PostgreSQL (dev) | PostgreSQL (prod) |
| **Cache** | Redis (dev) | Redis (prod) |
| **SSL** | Não | Sim |
| **Backup** | Não | Automático |
| **Logs** | Debug | Info |
| **Recursos** | Ilimitado | Limitado |
| **Rede** | 172.101.0.0/16 | 172.102.0.0/16 |

## 🛠️ Comandos Úteis

### Verificar Imagens
```bash
# Todas as imagens
docker images | grep onlitec

# Apenas desenvolvimento
docker images | grep "onlitec.*dev"

# Apenas produção
docker images | grep "onlitec.*latest\|onlitec.*prod"
```

### Monitoramento
```bash
# Status dos containers
docker ps | grep erp-oficina

# Logs em tempo real
docker logs -f erp-oficina-backend-dev
docker logs -f erp-oficina-backend-prod

# Recursos utilizados
docker stats
```

### Limpeza
```bash
# Parar desenvolvimento
docker-compose -f docker-compose.hub-dev.yml down -v

# Parar produção (com backup)
docker exec erp-oficina-backup-prod /backup.sh
docker-compose -f docker-compose.hub-prod.yml down

# Limpar imagens antigas
docker image prune
```

## 🔗 Links Úteis

- **Backend Docker Hub:** https://hub.docker.com/r/onlitec/toledooficina-backend
- **Frontend Docker Hub:** https://hub.docker.com/r/onlitec/toledooficina-frontend
- **Repositório GitHub:** https://github.com/onlitec/toledooficina
- **Documentação Completa:** [README.md](./README.md)
- **Guia de Deploy:** [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação completa
2. Verifique os logs dos containers
3. Execute o script de demonstração
4. Abra uma issue no GitHub

---

**ERP Oficina Mecânica v1.2** - Sistema completo para gestão de oficinas mecânicas com arquitetura multicontainer e separação de ambientes.