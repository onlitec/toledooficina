# Status das Portas e Containers

## Portas de Acesso Externo

### Ambiente de Desenvolvimento Local

1. **Frontend (Vite Dev Server)**
   - Porta: **7082**
   - URL: http://localhost:7082
   - Status: Ativo (rodando via npm run dev)
   - Observação: Servidor de desenvolvimento do Vite

2. **Backend (Flask)**
   - Porta: **5000**
   - URL: http://localhost:5000
   - Status: Ativo (container Docker)
   - Container: backend-local-001

3. **Nginx (Proxy Reverso)**
   - Porta: **7080**
   - URL: http://localhost:7080
   - Status: Ativo (container Docker)
   - Container: nginx-local-001
   - Função: Serve arquivos estáticos e proxy para backend

## Status dos Containers

### Containers Ativos
```
CONTAINER ID   IMAGE                   STATUS                        PORTS                     NAMES
7071308ac0fd   toledooficina_backend   Up About a minute (healthy)   0.0.0.0:5000->5000/tcp   backend-local-001
a98aa4cebbc7   nginx:alpine            Up 26 hours (healthy)         0.0.0.0:7080->80/tcp     nginx-local-001
a2219a09a378   postgres:15             Up 26 hours (healthy)         5432/tcp                 postgres-local-001
```

### Container do Frontend
- **Status**: Parado (Exited)
- **Container**: frontend-local-001
- **Observação**: O frontend está rodando via Vite dev server (npm run dev) na porta 7082

## Configuração Atual

- **Desenvolvimento**: Frontend via Vite (porta 7082) + Backend Docker (porta 5000)
- **Produção**: Nginx (porta 7080) servindo frontend buildado + Backend (porta 5000)
- **Banco de Dados**: PostgreSQL (porta 5432, apenas interno)

## Acesso Recomendado

- **Para desenvolvimento**: http://localhost:7082 (Vite com hot reload)
- **Para teste de produção**: http://localhost:7080 (Nginx)
- **API direta**: http://localhost:5000 (Backend Flask)