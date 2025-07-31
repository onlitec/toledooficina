# 🐳 ERP Oficina Mecânica - Deploy Multicontainer

Este guia explica como usar a versão multicontainer do ERP Oficina Mecânica, que inclui todos os serviços necessários em uma única stack Docker.

## 📋 Visão Geral

A versão multicontainer inclui:
- **Frontend**: Interface React (Vite + Nginx)
- **Backend**: API Flask com autenticação JWT
- **PostgreSQL**: Banco de dados principal
- **Redis**: Cache e sessões
- **Nginx**: Proxy reverso e balanceador de carga

## 🚀 Deploy Rápido

### Opção 1: Script Automático (Recomendado)

```bash
# Executar o script de deploy
./deploy_multicontainer.sh
```

### Opção 2: Manual

```bash
# 1. Baixar as imagens do Docker Hub
docker pull onlitec/toledooficina-backend:latest
docker pull onlitec/toledooficina-frontend:latest

# 2. Criar diretórios necessários
mkdir -p data/{postgres,redis,uploads,backups} logs nginx/{logs,cache}

# 3. Configurar variáveis de ambiente
cp .env.multicontainer.example .env.multicontainer
# Editar .env.multicontainer com suas configurações

# 4. Subir os serviços
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer up -d
```

## ⚙️ Configuração

### Variáveis de Ambiente

Edite o arquivo `.env.multicontainer` com suas configurações:

```env
# Banco de Dados
POSTGRES_DB=erp_oficina
POSTGRES_USER=erp_user
POSTGRES_PASSWORD=sua_senha_postgres

# Cache
REDIS_PASSWORD=sua_senha_redis

# Segurança
SECRET_KEY=sua_chave_secreta_flask
JWT_SECRET_KEY=sua_chave_jwt

# Domínio
DOMAIN_NAME=seu-dominio.com
```

### Portas Utilizadas

- **80**: Frontend (Nginx)
- **443**: HTTPS (Nginx) - quando SSL configurado
- **5432**: PostgreSQL (interno)
- **6379**: Redis (interno)
- **5000**: Backend API (interno)

## 📊 Monitoramento

### Verificar Status dos Containers

```bash
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer ps
```

### Ver Logs

```bash
# Todos os serviços
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer logs -f

# Serviço específico
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer logs -f backend
```

### Health Checks

```bash
# PostgreSQL
docker exec erp-oficina-postgres pg_isready -U erp_user -d erp_oficina

# Redis
docker exec erp-oficina-redis redis-cli ping

# Backend API
curl http://localhost/api/health

# Frontend
curl http://localhost/
```

## 🔧 Comandos Úteis

### Gerenciamento dos Serviços

```bash
# Parar todos os serviços
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer down

# Reiniciar todos os serviços
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer restart

# Reiniciar serviço específico
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer restart backend

# Atualizar imagens
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer pull
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer up -d
```

### Backup do Banco de Dados

```bash
# Criar backup
docker exec erp-oficina-postgres pg_dump -U erp_user -d erp_oficina > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker exec -i erp-oficina-postgres psql -U erp_user -d erp_oficina < backup_file.sql
```

### Acesso ao Banco de Dados

```bash
# Conectar ao PostgreSQL
docker exec -it erp-oficina-postgres psql -U erp_user -d erp_oficina

# Conectar ao Redis
docker exec -it erp-oficina-redis redis-cli
```

## 🌐 Acesso à Aplicação

Após o deploy bem-sucedido:

- **Frontend**: http://localhost
- **API Backend**: http://localhost/api
- **Documentação da API**: http://localhost/api/docs

## 📁 Estrutura de Volumes

```
data/
├── postgres/     # Dados do PostgreSQL
├── redis/        # Dados do Redis
├── uploads/      # Arquivos enviados
└── backups/      # Backups automáticos

logs/             # Logs da aplicação
nginx/
├── logs/         # Logs do Nginx
└── cache/        # Cache do Nginx
```

## 🔒 Segurança

### Configurações Recomendadas

1. **Senhas Fortes**: Use senhas complexas para PostgreSQL e Redis
2. **Chaves Secretas**: Gere chaves secretas únicas para Flask e JWT
3. **SSL/TLS**: Configure certificados SSL para produção
4. **Firewall**: Limite acesso às portas necessárias
5. **Backup**: Configure backups automáticos regulares

### Gerar Senhas Seguras

```bash
# Gerar senha aleatória
openssl rand -base64 32

# Ou usar o script de geração de segredos
./generate_secrets.sh
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Containers não sobem**:
   ```bash
   docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer logs
   ```

2. **Erro de conexão com banco**:
   - Verificar se PostgreSQL está rodando
   - Verificar credenciais no .env.multicontainer
   - Aguardar o health check do PostgreSQL

3. **Frontend não carrega**:
   - Verificar se Nginx está rodando
   - Verificar configuração do proxy reverso
   - Verificar logs do Nginx

4. **API não responde**:
   - Verificar se backend está rodando
   - Verificar conexão com PostgreSQL e Redis
   - Verificar logs do backend

### Logs Detalhados

```bash
# Ver logs de um serviço específico
docker logs erp-oficina-backend
docker logs erp-oficina-frontend
docker logs erp-oficina-postgres
docker logs erp-oficina-redis
docker logs erp-oficina-nginx
```

## 📈 Performance

### Recursos Configurados

- **Backend**: 1GB RAM, 0.5 CPU
- **Frontend**: 512MB RAM, 0.25 CPU
- **PostgreSQL**: Sem limite (configurável)
- **Redis**: Sem limite (configurável)
- **Nginx**: 256MB RAM, 0.25 CPU

### Otimizações

1. **Cache Redis**: Configurado para sessões e rate limiting
2. **Nginx**: Configurado com cache e compressão
3. **PostgreSQL**: Configurado com health checks
4. **Logs**: Rotação automática configurada

## 🔄 Atualizações

### Atualizar para Nova Versão

```bash
# 1. Fazer backup
./backup_system.sh

# 2. Baixar novas imagens
docker pull onlitec/toledooficina-backend:latest
docker pull onlitec/toledooficina-frontend:latest

# 3. Reiniciar com novas imagens
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer up -d
```

## 📞 Suporte

Para suporte técnico:
- 📧 Email: suporte@onlitec.com.br
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Site: https://onlitec.com.br

---

**Desenvolvido por OnliTec** 🚀