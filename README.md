# Sistema de Gestão para Oficina Mecânica

Sistema completo de gestão para oficinas mecânicas desenvolvido com Flask (backend) e React (frontend).

## Funcionalidades

- **Gestão de Clientes**: Cadastro, edição e consulta de clientes
- **Gestão de Veículos**: Controle completo do cadastro de veículos
- **Sistema de Autenticação**: Login seguro com JWT tokens
- **Interface Responsiva**: Design moderno e adaptável
- **Upload de Imagens**: Suporte para fotos de veículos
- **Configurações do Sistema**: Personalização de títulos e configurações

## Tecnologias Utilizadas

### Backend
- Flask (Python)
- PostgreSQL
- JWT para autenticação
- SQLAlchemy ORM
- Flask-CORS

### Frontend
- React 18
- Vite
- Material-UI
- Axios para requisições HTTP
- Context API para gerenciamento de estado

### Infraestrutura
- Docker & Docker Compose
- Nginx como proxy reverso
- Coolify para deploy

## Instalação e Execução

### Pré-requisitos
- Docker
- Docker Compose

### Executando o projeto

1. Clone o repositório:
```bash
git clone https://github.com/onlitec/toledooficina.git
cd toledooficina
```

2. Execute com Docker Compose:
```bash
docker-compose up -d
```

3. Acesse a aplicação:
- Frontend: http://localhost:7080
- Backend API: http://localhost:5000

### Usuário padrão
- **Usuário**: AdminSuperUser
- **Senha**: admin123

## Estrutura do Projeto

```
toledooficina/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── app.py
│   ├── uploads/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── public/
│   └── Dockerfile.coolify
├── nginx/
│   └── nginx.coolify.conf
└── docker-compose.yml
```

## Correções Recentes

### Problemas de Autenticação Resolvidos
- ✅ Corrigido erro 401/500 nos endpoints de autenticação
- ✅ Ajustado envio do refresh_token no corpo da requisição JSON
- ✅ Corrigido parsing da resposta do endpoint `/api/auth/refresh`

### Problemas de CORS Resolvidos
- ✅ Eliminado conflito entre servidor Vite (porta 7082) e Docker (porta 7080)
- ✅ Configurado proxy correto no nginx para requisições da API
- ✅ Frontend agora é servido exclusivamente através do Docker/nginx

### Exibição de Imagens Corrigida
- ✅ Configurado proxy para `/static` no vite.config.js
- ✅ Mapeamento de volume para diretório `uploads` no docker-compose.yml
- ✅ Fotos dos veículos sendo exibidas corretamente

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
