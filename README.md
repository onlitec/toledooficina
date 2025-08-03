# ERP Oficina Toledo

Sistema ERP completo para gestão de oficina mecânica.

## Status do Sistema ✅

O sistema está **FUNCIONANDO** e pronto para uso!

### Credenciais de Acesso

**Administrador Principal:**
- **Usuário**: `AdminSuperUser`
- **Senha**: `AdM!n@2024#Sec$Pass`
- **Email**: `admin.super@oficina.com`

**Usuário de Teste:**
- **Usuário**: `user`
- **Senha**: `user123`
- **Email**: `user@oficina.com`

## 🚀 Funcionalidades

- **Gestão de Clientes**: Cadastro completo com histórico de serviços
- **Gestão de Veículos**: Controle detalhado com fotos e documentação
- **Ordens de Serviço**: Criação e acompanhamento de serviços
- **Estoque**: Controle de peças e materiais
- **Financeiro**: Controle de receitas e despesas
- **Relatórios**: Análises e relatórios gerenciais
- **Sistema de Backup**: Backup automático completo

## 🛠️ Tecnologias

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: React, Vite, TailwindCSS
- **Infraestrutura**: Docker, Nginx, Redis
- **Banco de Dados**: PostgreSQL

## 📦 Instalação e Execução

### Desenvolvimento
```bash
# Clone o repositório
git clone https://github.com/onlitec/toledooficina.git
cd toledooficina

# Execute com Docker Compose
docker-compose up -d
```

### Produção
```bash
# Execute o script de deploy
./deploy_production.sh
```

## 🔧 Configuração

O sistema utiliza variáveis de ambiente para configuração. Copie o arquivo `.env.example` para `.env` e configure as variáveis necessárias.

## 📋 Scripts Disponíveis

- `backup_completo.sh`: Backup completo do sistema
- `deploy_production.sh`: Deploy para produção
- `validate_deployment.sh`: Validação do deployment

## 🔒 Segurança

- Autenticação JWT
- CORS configurado
- Validação de dados
- Backup automático

## 📄 Licença

Este projeto está sob a licença MIT.
