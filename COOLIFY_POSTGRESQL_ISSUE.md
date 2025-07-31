# 🐘 Problema PostgreSQL no Coolify - Análise e Solução

## 🔍 Problema Identificado

O container PostgreSQL não está sendo criado durante o deploy no Coolify. Após análise dos logs de deploy e pesquisa na documentação do Coolify, identificamos a causa raiz:

### Causa do Problema

**O Coolify trata bancos de dados de forma especial e não os cria automaticamente via Docker Compose quando marcados com `coolify.type=database`** <mcreference link="https://coolify.io/docs/knowledge-base/docker/compose" index="1">1</mcreference>

### Evidências

1. **Logs de Deploy**: O deploy mostra apenas:
   ```
   Starting deployment of onlitec/toledooficina:main-lo0ggoows8woogs8wcw4s0cw to localhost.
   Preparing container with helper image: ghcr.io/coollabsio/coolify-helper:1.0.8.
   Importing onlitec/toledooficina:main (commit sha HEAD) to /artifacts/ykko8ggo84cwco0k40oww0g8.
   Pulling & building required images.
   Removing old containers.
   Starting new application.
   New container started.
   ```
   
2. **Configuração Atual**: No `docker-compose.coolify.yml`, o PostgreSQL está marcado como:
   ```yaml
   postgres:
     labels:
       - "coolify.type=database"
   ```

3. **Comportamento do Coolify**: <mcreference link="https://coolify.io/docs/databases/postgresql" index="2">2</mcreference> O Coolify espera que bancos de dados sejam criados separadamente através da interface web, não via Docker Compose.

## 🔧 Soluções Disponíveis

### Solução 1: Criar PostgreSQL Separadamente no Coolify (Recomendada)

1. **Remover PostgreSQL do docker-compose.coolify.yml**
2. **Criar banco PostgreSQL via interface do Coolify**:
   - Ir para "Databases" → "Add Database" → "PostgreSQL"
   - Configurar nome: `erp-oficina-postgres`
   - Configurar credenciais

3. **Conectar aplicação ao banco**:
   - Habilitar "Connect to Predefined Network" no projeto <mcreference link="https://zixianchen.com/blog/finally-connecting-docker-compose-app-postgres-db-coolify" index="5">5</mcreference>
   - Usar o hostname interno gerado pelo Coolify

### Solução 2: Remover Labels do Coolify

Remover as labels `coolify.type=database` para que o PostgreSQL seja tratado como um serviço normal:

```yaml
postgres:
  image: postgres:15-alpine
  container_name: erp-oficina-postgres
  # Remover estas labels:
  # labels:
  #   - "coolify.type=database"
  environment:
    POSTGRES_DB: erp_oficina
    POSTGRES_USER: erp_user
    POSTGRES_PASSWORD: erp_password_2024
```

### Solução 3: Usar Banco Externo

Configurar um banco PostgreSQL externo (como AWS RDS, DigitalOcean Managed Database, etc.) e conectar a aplicação.

## 🚀 Implementação da Solução Recomendada

### Passo 1: Atualizar docker-compose.coolify.yml

```yaml
version: '3.8'

services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: erp-oficina-backend
    labels:
      - "coolify.managed=true"
      - "coolify.type=application"
    environment:
      - FLASK_ENV=production
      - POSTGRES_DB=erp_oficina
      - POSTGRES_USER=erp_user
      - POSTGRES_PASSWORD=erp_password_2024
      - POSTGRES_HOST=postgres-<uuid>  # UUID gerado pelo Coolify
    depends_on: []
    networks:
      - default
    restart: unless-stopped

  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.coolify
    container_name: erp-oficina-frontend
    labels:
      - "coolify.managed=true"
      - "coolify.type=application"
    environment:
      - VITE_API_URL=https://oficina.onlitec.com.br/api
    depends_on:
      - backend
    networks:
      - default
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: erp-oficina-nginx
    labels:
      - "coolify.managed=true"
      - "coolify.type=application"
      - "traefik.enable=true"
      - "traefik.http.routers.erp-oficina.rule=Host(`oficina.onlitec.com.br`)"
      - "traefik.http.routers.erp-oficina.tls=true"
      - "traefik.http.services.erp-oficina.loadbalancer.server.port=80"
    volumes:
      - ./nginx/nginx.coolify.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    networks:
      - default
    restart: unless-stopped

networks:
  default:
    external: true
    name: coolify
```

### Passo 2: Configurar no Coolify

1. **Criar PostgreSQL Database**:
   - Nome: `erp-oficina-postgres`
   - Versão: PostgreSQL 15
   - Database: `erp_oficina`
   - User: `erp_user`
   - Password: `erp_password_2024`

2. **Configurar Projeto**:
   - Habilitar "Connect to Predefined Network"
   - Usar hostname interno do PostgreSQL (ex: `postgres-abc123def456`)

3. **Atualizar Variáveis de Ambiente**:
   ```
   POSTGRES_HOST=postgres-<uuid-gerado-pelo-coolify>
   POSTGRES_DB=erp_oficina
   POSTGRES_USER=erp_user
   POSTGRES_PASSWORD=erp_password_2024
   ```

## 🔍 Verificação

Após implementar a solução:

1. **Verificar containers**:
   ```bash
   docker ps | grep erp-oficina
   ```

2. **Verificar conectividade**:
   ```bash
   docker network inspect coolify
   ```

3. **Testar aplicação**:
   - Frontend: `https://oficina.onlitec.com.br/`
   - API: `https://oficina.onlitec.com.br/api/health`

## 📚 Referências

- <mcreference link="https://coolify.io/docs/knowledge-base/docker/compose" index="1">1</mcreference> Coolify Docker Compose Documentation
- <mcreference link="https://coolify.io/docs/databases/postgresql" index="2">2</mcreference> Coolify PostgreSQL Documentation  
- <mcreference link="https://zixianchen.com/blog/finally-connecting-docker-compose-app-postgres-db-coolify" index="5">5</mcreference> Connecting Docker Compose App to Postgres DB in Coolify

## ✅ Status

- [x] Problema identificado
- [x] Causa raiz encontrada
- [x] Soluções documentadas
- [ ] Solução implementada
- [ ] Teste realizado
- [ ] Deploy validado

---

**Próximos Passos**: Implementar a Solução 1 (recomendada) criando o PostgreSQL separadamente no Coolify e atualizando o docker-compose.coolify.yml.