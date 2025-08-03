# Configuração do Projeto - ERP Oficina

## Portas de Acesso

### Frontend (Desenvolvimento)
- **Porta**: 7080
- **URL**: http://localhost:7080
- **Descrição**: Porta padrão para visualização da página do frontend em desenvolvimento

### Backend (API)
- **Porta**: 5000
- **URL**: http://localhost:5000
- **Descrição**: Porta da API Flask do backend

### Nginx (Proxy)
- **Porta**: 80
- **URL**: http://localhost
- **Descrição**: Proxy reverso para roteamento entre frontend e backend

### PostgreSQL (Banco de Dados)
- **Porta**: 5432
- **Descrição**: Porta do banco de dados PostgreSQL

## Regras do Projeto

1. **Porta de Visualização**: A porta 7080 é a porta oficial para visualização da página do projeto
2. **Desenvolvimento Local**: Sempre usar http://localhost:7080 para acessar a aplicação
3. **Testes de Interface**: Todos os testes de UI devem ser realizados na porta 7080

## Comandos Úteis

```bash
# Iniciar todos os serviços
docker-compose up -d

# Acessar aplicação
open http://localhost:7080

# Verificar logs do frontend
docker-compose logs frontend

# Verificar status dos containers
docker-compose ps
```

## Credenciais de Acesso

Para informações sobre credenciais de login, consulte o arquivo `CREDENCIAIS_LOGIN.md`.
