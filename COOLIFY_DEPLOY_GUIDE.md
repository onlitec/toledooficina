# 🚀 Guia de Deploy no Coolify com Docker Hub

## 📋 Pré-requisitos

### 1. Login no Docker Hub
Antes de fazer push das imagens, você precisa estar autenticado:

```bash
# Fazer login no Docker Hub
docker login

# Inserir suas credenciais:
# Username: seu-usuario-dockerhub
# Password: sua-senha-ou-token
```

### 2. Push das Imagens
Após o login, execute o script:

```bash
# Tornar o script executável
chmod +x push_docker_images.sh

# Executar o push
./push_docker_images.sh
```

## 🐳 Configuração no Coolify

### Opção 1: Deploy com Imagens Docker Hub (Recomendado)

#### Backend
1. **Tipo**: Docker Image
2. **Imagem**: `onlitec/toledooficina-backend:latest`
3. **Porta**: `5000`
4. **Variáveis de Ambiente**:
   ```
   FLASK_ENV=production
   DATABASE_URL=postgresql://usuario:senha@postgres:5432/erp_db
   REDIS_URL=redis://redis:6379/0
   SECRET_KEY=sua-chave-secreta
   JWT_SECRET_KEY=sua-jwt-chave
   ```

#### Frontend
1. **Tipo**: Docker Image
2. **Imagem**: `onlitec/toledooficina-frontend:latest`
3. **Porta**: `80`
4. **Variáveis de Ambiente**:
   ```
   VITE_API_URL=https://seu-backend.coolify.app
   ```

#### PostgreSQL
1. **Tipo**: Database
2. **Imagem**: `postgres:15`
3. **Variáveis de Ambiente**:
   ```
   POSTGRES_DB=erp_db
   POSTGRES_USER=erp_user
   POSTGRES_PASSWORD=senha-segura
   ```

#### Redis
1. **Tipo**: Service
2. **Imagem**: `redis:7-alpine`
3. **Porta**: `6379`

### Opção 2: Deploy com Git Build

#### Backend
1. **Tipo**: Git Repository
2. **Repository**: `https://github.com/seu-usuario/toledooficina`
3. **Branch**: `main`
4. **Build Pack**: `Dockerfile`
5. **Dockerfile Path**: `backend/Dockerfile`
6. **Context**: `backend/`

#### Frontend
1. **Tipo**: Git Repository
2. **Repository**: `https://github.com/seu-usuario/toledooficina`
3. **Branch**: `main`
4. **Build Pack**: `Dockerfile`
5. **Dockerfile Path**: `frontend/Dockerfile`
6. **Context**: `frontend/`

## 🔧 Configurações Importantes

### Health Checks
- **Backend**: `GET /health` (porta 5000)
- **Frontend**: `GET /` (porta 80)

### Volumes Persistentes
- **PostgreSQL**: `/var/lib/postgresql/data`
- **Redis**: `/data`
- **Backend Uploads**: `/app/uploads`

### Rede
Certifique-se de que todos os serviços estão na mesma rede para comunicação interna.

## 🚀 Vantagens de Cada Abordagem

### Docker Hub (Recomendado)
✅ **Vantagens:**
- Deploy mais rápido
- Menor uso de recursos do servidor
- Imagens pré-testadas
- Rollback mais fácil
- Consistência entre ambientes

❌ **Desvantagens:**
- Precisa manter imagens atualizadas
- Requer Docker Hub account

### Git Build
✅ **Vantagens:**
- Sempre atualizado com o código
- Não precisa de registry externo
- Deploy automático em push

❌ **Desvantagens:**
- Consome mais recursos
- Build pode falhar
- Deploy mais lento

## 🔍 Troubleshooting

### Erro de Autenticação Docker Hub
```bash
# Verificar se está logado
docker info | grep Username

# Se não estiver, fazer login
docker login
```

### Erro de Push
```bash
# Verificar se as imagens existem
docker images | grep onlitec

# Rebuild se necessário
docker-compose build
```

### Problemas de Conectividade
- Verificar se todos os serviços estão na mesma rede
- Confirmar variáveis de ambiente
- Verificar health checks

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs do Coolify
2. Testar localmente com `docker-compose up`
3. Verificar configurações de rede e variáveis

---

**Recomendação**: Use a abordagem Docker Hub para produção, pois oferece maior estabilidade e performance.