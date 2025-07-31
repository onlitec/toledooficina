# 🔧 Correção das Variáveis de Ambiente no Coolify

## 🚨 Problema Identificado

As variáveis de ambiente estão **inconsistentes** entre os ambientes de produção e preview no Coolify, causando erro de conexão ao tentar fazer login.

### ❌ Configuração Atual (Inconsistente)

**Produção:**
```bash
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
POSTGRES_DB=erp_oficina_db
POSTGRES_PASSWORD=ErP@2024!Sec#DB$Pass
POSTGRES_USER=erp_admin_user
SECRET_KEY=your-default-secret-key-change-in-production
```

**Preview:**
```bash
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
POSTGRES_DB=erp_oficina
POSTGRES_PASSWORD=Erp@2024#Prod$Secure!9876
POSTGRES_USER=erp_user
SECRET_KEY=your-default-secret-key-change-in-production
```

## ✅ Solução: Padronizar Variáveis

### 1. Configuração Recomendada (Produção)

```bash
# Chaves de Segurança (GERAR NOVAS!)
SECRET_KEY=<GERAR_CHAVE_SEGURA_64_CHARS>
JWT_SECRET_KEY=<GERAR_CHAVE_JWT_SEGURA_64_CHARS>

# Banco de Dados PostgreSQL
POSTGRES_HOST=<NOME_DO_CONTAINER_POSTGRES_NO_COOLIFY>
POSTGRES_DB=erp_oficina_db
POSTGRES_USER=erp_admin_user
POSTGRES_PASSWORD=ErP@2024!Sec#DB$Pass
POSTGRES_PORT=5432

# Configurações da Aplicação
FLASK_ENV=production
FLASK_DEBUG=False
DATABASE_URL=postgresql://erp_admin_user:ErP@2024!Sec#DB$Pass@<POSTGRES_HOST>:5432/erp_oficina_db

# Upload e Cache
UPLOAD_FOLDER=/app/uploads
MAX_CONTENT_LENGTH=16777216
CACHE_TYPE=simple

# CORS (ajustar conforme necessário)
CORS_ORIGINS=*
```

### 2. Gerar Chaves Seguras

```bash
# SECRET_KEY (64 caracteres hexadecimais)
openssl rand -hex 32

# JWT_SECRET_KEY (64 caracteres hexadecimais)
openssl rand -hex 32
```

## 🛠️ Passos para Correção no Coolify

### Passo 1: Acessar Configurações do Projeto
1. Acesse o **Coolify Dashboard**
2. Vá para o projeto **toledooficina**
3. Clique na aplicação **ERP**
4. Vá para a aba **"Environment Variables"**

### Passo 2: Atualizar Variáveis de Produção
```bash
# Remover variáveis antigas (se existirem)
# Adicionar/Atualizar as seguintes:

SECRET_KEY=<SUA_CHAVE_GERADA_64_CHARS>
JWT_SECRET_KEY=<SUA_CHAVE_JWT_GERADA_64_CHARS>
POSTGRES_HOST=<NOME_DO_SEU_POSTGRES_CONTAINER>
POSTGRES_DB=erp_oficina_db
POSTGRES_USER=erp_admin_user
POSTGRES_PASSWORD=ErP@2024!Sec#DB$Pass
POSTGRES_PORT=5432
FLASK_ENV=production
FLASK_DEBUG=False
DATABASE_URL=postgresql://erp_admin_user:ErP@2024!Sec#DB$Pass@<POSTGRES_HOST>:5432/erp_oficina_db
```

### Passo 3: Atualizar Variáveis de Preview
```bash
# Usar as mesmas credenciais para consistência
SECRET_KEY=<MESMA_CHAVE_DA_PRODUÇÃO>
JWT_SECRET_KEY=<MESMA_CHAVE_JWT_DA_PRODUÇÃO>
POSTGRES_HOST=<NOME_DO_POSTGRES_PREVIEW>
POSTGRES_DB=erp_oficina_db
POSTGRES_USER=erp_admin_user
POSTGRES_PASSWORD=ErP@2024!Sec#DB$Pass
POSTGRES_PORT=5432
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=postgresql://erp_admin_user:ErP@2024!Sec#DB$Pass@<POSTGRES_HOST>:5432/erp_oficina_db
```

### Passo 4: Verificar PostgreSQL no Coolify
1. Vá para **"Resources" → "Databases"**
2. Verifique se existe um PostgreSQL com:
   - **Database Name:** `erp_oficina_db`
   - **Username:** `erp_admin_user`
   - **Password:** `ErP@2024!Sec#DB$Pass`
3. Se não existir, crie um novo PostgreSQL com essas credenciais
4. Anote o **nome do container** para usar em `POSTGRES_HOST`

### Passo 5: Redeploy da Aplicação
1. Após atualizar as variáveis, clique em **"Deploy"**
2. Aguarde o deploy completar
3. Verifique os logs para confirmar que não há erros de conexão

## 🔍 Verificação Pós-Correção

### 1. Testar Conexão com Banco
```bash
# Via logs do container
# Procurar por mensagens de conexão bem-sucedida com PostgreSQL
```

### 2. Testar Login
```bash
# Credenciais atualizadas no banco:
# Username: AdminSuperUser
# Password: AdM!n@2024#Sec$Pass
# Email: admin.super@oficina.com
```

### 3. Verificar Logs de Erro
```bash
# No Coolify, verificar logs da aplicação
# Procurar por erros relacionados a:
# - Conexão com PostgreSQL
# - Autenticação JWT
# - Variáveis de ambiente faltando
```

## 🚨 Problemas Comuns e Soluções

### 1. "Credenciais inválidas" no Login
**Causa:** Banco não foi inicializado com as novas credenciais
**Solução:**
```bash
# Executar script de inicialização via Coolify terminal:
python src/init_db.py
```

### 2. "Erro de conexão com banco"
**Causa:** `POSTGRES_HOST` incorreto ou PostgreSQL não rodando
**Solução:**
- Verificar nome correto do container PostgreSQL
- Confirmar que PostgreSQL está rodando
- Verificar se as credenciais estão corretas

### 3. "JWT decode error"
**Causa:** `JWT_SECRET_KEY` não configurada ou diferente
**Solução:**
- Gerar nova chave JWT segura
- Garantir que a mesma chave seja usada em todos os ambientes

### 4. "Database does not exist"
**Causa:** Banco `erp_oficina_db` não foi criado
**Solução:**
- Criar banco manualmente no PostgreSQL
- Ou recriar o PostgreSQL no Coolify com o nome correto

## 📋 Checklist de Verificação

- [ ] Variáveis de ambiente atualizadas na produção
- [ ] Variáveis de ambiente atualizadas no preview
- [ ] PostgreSQL criado/configurado com credenciais corretas
- [ ] `POSTGRES_HOST` aponta para o container correto
- [ ] Chaves `SECRET_KEY` e `JWT_SECRET_KEY` geradas e configuradas
- [ ] `DATABASE_URL` construída corretamente
- [ ] Deploy realizado após mudanças
- [ ] Logs verificados (sem erros de conexão)
- [ ] Login testado com credenciais corretas
- [ ] Banco inicializado com usuário admin atualizado

## 🔐 Credenciais do Sistema

### Usuário Administrador (Após Inicialização)
```
Username: AdminSuperUser
Email: admin.super@oficina.com
Password: AdM!n@2024#Sec$Pass
```

### Usuário de Teste
```
Username: user
Email: user@oficina.com
Password: user123
```

### Banco de Dados
```
Database: erp_oficina_db
User: erp_admin_user
Password: ErP@2024!Sec#DB$Pass
```

---

**⚠️ Importante:** Após corrigir as variáveis de ambiente, sempre faça um redeploy completo da aplicação para garantir que as mudanças sejam aplicadas corretamente.