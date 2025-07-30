# ERP Oficina Mecânica

Sistema ERP completo para gestão de oficina mecânica desenvolvido com Flask (backend) e React (frontend), containerizado com Docker.

## 🚀 Funcionalidades

### Módulos Implementados
- **Dashboard**: Visão geral com estatísticas e gráficos
- **Clientes**: Cadastro completo de clientes (PF/PJ)
- **Veículos**: Gestão de veículos dos clientes
- **Estoque**: Controle de peças e insumos
- **Ferramentas**: Inventário e controle de empréstimos
- **Ordens de Serviço**: Gestão completa de OS
- **Financeiro**: Contas a receber/pagar, fluxo de caixa
- **Relatórios**: Relatórios em PDF e análises
- **Configurações**: Empresa, email, notificações

### Tecnologias
- **Backend**: Flask, SQLAlchemy, SQLite/PostgreSQL
- **Frontend**: React, Tailwind CSS, shadcn/ui, Recharts
- **Containerização**: Docker, Docker Compose
- **Proxy**: Nginx

## 📋 Pré-requisitos

- Docker
- Docker Compose
- Git

## 🛠️ Instalação e Execução

### 1. Clone o repositório
```bash
git clone <repository-url>
cd erp-oficina
```

### 2. Execução com Docker Compose

#### Desenvolvimento (SQLite)
```bash
# Construir e executar os containers
docker-compose up --build

# Executar em background
docker-compose up -d --build
```

#### Produção (PostgreSQL + Redis)
```bash
# Executar com perfil de produção
docker-compose --profile production up -d --build
```

### 3. Acessar a aplicação
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api

## 🐳 Comandos Docker Úteis

### Gerenciamento de Containers
```bash
# Parar todos os containers
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Executar comandos no container
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Build e Deploy
```bash
# Rebuild apenas um serviço
docker-compose build backend
docker-compose build frontend

# Forçar rebuild sem cache
docker-compose build --no-cache

# Atualizar containers
docker-compose pull
docker-compose up -d
```

## 📁 Estrutura do Projeto

```
erp-oficina/
├── backend/                 # API Flask
│   ├── src/
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── static/         # Arquivos estáticos
│   │   └── main.py         # Aplicação principal
│   ├── requirements.txt    # Dependências Python
│   └── Dockerfile         # Container backend
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas da aplicação
│   │   └── App.jsx        # Componente principal
│   ├── package.json       # Dependências Node.js
│   ├── nginx.conf         # Configuração Nginx
│   └── Dockerfile         # Container frontend
├── docker-compose.yml     # Orquestração Docker
└── README.md             # Este arquivo
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Backend
- `FLASK_ENV`: Ambiente (development/production)
- `DATABASE_URL`: URL do banco de dados
- `SECRET_KEY`: Chave secreta do Flask

#### Frontend
- Configurações são definidas no build time

### Volumes Docker
- `backend_data`: Dados do banco SQLite
- `uploads_data`: Arquivos enviados
- `backups_data`: Backups do sistema
- `postgres_data`: Dados PostgreSQL (produção)
- `redis_data`: Dados Redis (produção)

## 📊 Banco de Dados

### Desenvolvimento
- SQLite (arquivo local)
- Dados persistidos em volume Docker

### Produção
- PostgreSQL 15
- Configuração automática via Docker Compose

## 🔒 Segurança

### Headers de Segurança
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy

### HTTPS (Produção)
- Certificados SSL no diretório `nginx/ssl/`
- Redirecionamento automático HTTP → HTTPS

## 📈 Monitoramento

### Health Checks
- Backend: Endpoint `/api/users`
- Frontend: Página principal
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`

### Logs
```bash
# Ver logs em tempo real
docker-compose logs -f

# Logs do Nginx (produção)
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

## 🚀 Deploy em Produção

### 1. Configurar SSL
```bash
mkdir -p nginx/ssl
# Copiar certificados SSL para nginx/ssl/
```

### 2. Configurar variáveis de produção
```bash
# Editar docker-compose.yml
# Alterar senhas padrão
# Configurar domínio
```

### 3. Executar
```bash
docker-compose --profile production up -d --build
```

## 🛠️ Desenvolvimento

### Backend
```bash
# Entrar no container
docker-compose exec backend bash

# Instalar dependências
pip install <package>

# Atualizar requirements
pip freeze > requirements.txt
```

### Frontend
```bash
# Entrar no container
docker-compose exec frontend sh

# Instalar dependências
pnpm add <package>
```

## 📝 API Endpoints

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `GET /api/clientes/{id}` - Obter cliente
- `PUT /api/clientes/{id}` - Atualizar cliente
- `DELETE /api/clientes/{id}` - Deletar cliente

### Relatórios
- `GET /api/relatorios/dashboard` - Dados do dashboard
- `GET /api/relatorios/clientes/pdf` - Relatório de clientes em PDF
- `GET /api/relatorios/financeiro` - Relatório financeiro

### Configurações
- `GET /api/configuracoes/empresa` - Configurações da empresa
- `PUT /api/configuracoes/empresa` - Atualizar configurações
- `POST /api/configuracoes/empresa/logotipo` - Upload logotipo

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato via email

---

**ERP Oficina Mecânica v1.0** - Sistema completo para gestão de oficinas mecânicas

