# 🔧 Variáveis de Ambiente Completas para Coolify

## 📋 Análise dos Containers

Baseado nos containers identificados:

```bash
# Containers ativos:
postgres-lkcckwk8cc00cw04kggckkwo-163748728166  # PostgreSQL (healthy)
frontend-lkcckwk8cc00cw04kggckkwo-163748724946  # Frontend (healthy)
backend-lkcckwk8cc00cw04kggckkwo-163748687933   # Backend (restarting)
nginx-lkcckwk8cc00cw04kggckkwo-163748743188     # Nginx (restarting)
```

## 🔐 Variáveis de Ambiente Completas

### 📦 Para a Aplicação Backend/Frontend no Coolify

```bash
# === CHAVES DE SEGURANÇA ===
# Gerar com: openssl rand -hex 32
SECRET_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
JWT_SECRET_KEY=fedcba0987654321098765432109876543210fedcba0987654321098765432

# === CONFIGURAÇÃO DO BANCO DE DADOS ===
POSTGRES_HOST=postgres-lkcckwk8cc00cw04kggckkwo-163748728166
POSTGRES_DB=erp_oficina_db
POSTGRES_USER=erp_admin_user
POSTGRES_PASSWORD=ErP@2024!Sec#DB$Pass
POSTGRES_PORT=5432

# === URL DE CONEXÃO COMPLETA ===
DATABASE_URL=postgresql://erp_admin_user:ErP@2024!Sec#DB$Pass@postgres-lkcckwk8cc00cw04kggckkwo-163748728166:5432/erp_oficina_db

# === CONFIGURAÇÕES DA APLICAÇÃO ===
FLASK_ENV=production
FLASK_DEBUG=False
FLASK_APP=src.main:app

# === CONFIGURAÇÕES DE UPLOAD ===
UPLOAD_FOLDER=/app/uploads
MAX_CONTENT_LENGTH=16777216
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx

# === CONFIGURAÇÕES DE CACHE ===
CACHE_TYPE=simple
CACHE_DEFAULT_TIMEOUT=300

# === CONFIGURAÇÕES DE CORS ===
CORS_ORIGINS=*
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization

# === CONFIGURAÇÕES DE SESSÃO ===
SESSION_TYPE=filesystem
SESSION_PERMANENT=False
SESSION_USE_SIGNER=True
SESSION_KEY_PREFIX=erp_oficina:

# === CONFIGURAÇÕES DE LOGGING ===
LOG_LEVEL=INFO
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s

# === CONFIGURAÇÕES DE TIMEZONE ===
TZ=America/Sao_Paulo
LANG=pt_BR.UTF-8
LC_ALL=pt_BR.UTF-8

# === CONFIGURAÇÕES DE BACKUP ===
BACKUP_ENABLED=True
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# === CONFIGURAÇÕES DE EMAIL (se necessário) ===
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-app
MAIL_DEFAULT_SENDER=seu-email@gmail.com

# === CONFIGURAÇÕES DE REDIS (se usar cache Redis) ===
# REDIS_URL=redis://redis:6379/0
# CACHE_TYPE=redis
# CACHE_REDIS_URL=redis://redis:6379/0
```

## 🐘 Configuração do PostgreSQL Container

### Variáveis para o Container PostgreSQL:

```bash
# === CONFIGURAÇÕES DO POSTGRESQL ===
POSTGRES_DB=erp_oficina_db
POSTGRES_USER=erp_admin_user
POSTGRES_PASSWORD=ErP@2024!Sec#DB$Pass
POSTGRES_INITDB_ARGS=--encoding=UTF-8 --locale=pt_BR.UTF-8
PGDATA=/var/lib/postgresql/data/pgdata

# === CONFIGURAÇÕES DE PERFORMANCE ===
POSTGRES_SHARED_BUFFERS=256MB
POSTGRES_EFFECTIVE_CACHE_SIZE=1GB
POSTGRES_MAINTENANCE_WORK_MEM=64MB
POSTGRES_CHECKPOINT_COMPLETION_TARGET=0.9
POSTGRES_WAL_BUFFERS=16MB
POSTGRES_DEFAULT_STATISTICS_TARGET=100
```

## 🌐 Configuração do Nginx (se necessário)

```bash
# === CONFIGURAÇÕES DO NGINX ===
NGINX_HOST=localhost
NGINX_PORT=80
UPSTREAM_BACKEND=backend-lkcckwk8cc00cw04kggckkwo-163748687933:5000
UPSTREAM_FRONTEND=frontend-lkcckwk8cc00cw04kggckkwo-163748724946:80
```

## 🔧 Configuração Específica por Ambiente

### 🚀 Produção
```bash
# Adicionar às variáveis acima:
FLASK_ENV=production
FLASK_DEBUG=False
LOG_LEVEL=WARNING
CACHE_DEFAULT_TIMEOUT=3600
```

### 🧪 Preview/Development
```bash
# Adicionar às variáveis acima:
FLASK_ENV=development
FLASK_DEBUG=True
LOG_LEVEL=DEBUG
CACHE_DEFAULT_TIMEOUT=60
```

## 📝 Instruções de Aplicação no Coolify

### 1. Acessar Configurações
1. Vá para o **Coolify Dashboard**
2. Selecione o projeto **toledooficina**
3. Clique na aplicação **ERP**
4. Vá para **"Environment Variables"**

### 2. Aplicar Variáveis
1. **Copie** todas as variáveis da seção "Para a Aplicação Backend/Frontend"
2. **Cole** no campo de variáveis de ambiente
3. **Substitua** `a1b2c3d4e5f6...` pelas chaves reais geradas com `openssl rand -hex 32`
4. **Verifique** se o `POSTGRES_HOST` está correto: `postgres-lkcckwk8cc00cw04kggckkwo-163748728166`

### 3. Configurar PostgreSQL
1. Vá para **"Resources" → "Databases"**
2. Verifique se o PostgreSQL existe com:
   - **Name:** `postgres-lkcckwk8cc00cw04kggckkwo-163748728166`
   - **Database:** `erp_oficina_db`
   - **User:** `erp_admin_user`
   - **Password:** `ErP@2024!Sec#DB$Pass`

### 4. Redeploy
1. Clique em **"Deploy"**
2. Aguarde o deploy completar
3. Verifique os logs para confirmar conexão

## 🔍 Verificação de Problemas

### Backend/Nginx Reiniciando
Os containers `backend` e `nginx` estão reiniciando. Possíveis causas:

1. **Variáveis de ambiente faltando**
2. **Erro de conexão com PostgreSQL**
3. **Configuração incorreta do DATABASE_URL**
4. **Chaves SECRET_KEY/JWT_SECRET_KEY não configuradas**

### Comandos de Debug
```bash
# Verificar logs do backend
docker logs backend-lkcckwk8cc00cw04kggckkwo-163748687933

# Verificar logs do nginx
docker logs nginx-lkcckwk8cc00cw04kggckkwo-163748743188

# Testar conexão com PostgreSQL
docker exec -it postgres-lkcckwk8cc00cw04kggckkwo-163748728166 psql -U erp_admin_user -d erp_oficina_db
```

## 🎯 Próximos Passos

1. ✅ **Aplicar variáveis** conforme instruções acima
2. ✅ **Gerar chaves seguras** com `openssl rand -hex 32`
3. ✅ **Fazer redeploy** da aplicação
4. ✅ **Verificar logs** para confirmar que containers param de reiniciar
5. ✅ **Testar login** com credenciais: `AdminSuperUser` / `AdM!n@2024#Sec$Pass`
6. ✅ **Executar init_db.py** se necessário para inicializar banco

---

**⚠️ Importante:** Use exatamente o nome do container PostgreSQL `postgres-lkcckwk8cc00cw04kggckkwo-163748728166` na variável `POSTGRES_HOST` para garantir conectividade correta.