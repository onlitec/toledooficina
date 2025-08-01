# Backup da Plataforma Toledo Oficina

## Data do Backup
**Data:** $(date '+%d/%m/%Y às %H:%M:%S')

## Conteúdo do Backup

### 1. Código Fonte
- **Arquivo:** `codigo_fonte_YYYYMMDD_HHMMSS.tar.gz`
- **Conteúdo:** Todo o código fonte da aplicação (frontend, backend, nginx)
- **Exclusões:** node_modules, venv, __pycache__, .git, cache, dados temporários

### 2. Uploads de Veículos
- **Arquivo:** `uploads_veiculos_YYYYMMDD_HHMMSS.tar.gz`
- **Conteúdo:** Todas as imagens e arquivos enviados pelos usuários
- **Localização:** backend/uploads/ e backend/static/uploads/

### 3. Banco de Dados
- **Arquivo:** `database_backup_YYYYMMDD_HHMMSS.sql`
- **Conteúdo:** Dump completo do PostgreSQL com todos os dados
- **Formato:** SQL dump (pg_dumpall)

### 4. Configurações
- **docker-compose_YYYYMMDD_HHMMSS.yml:** Configuração dos containers
- **env_YYYYMMDD_HHMMSS.backup:** Variáveis de ambiente

## Como Restaurar

### 1. Restaurar Código Fonte
```bash
tar -xzf codigo_fonte_YYYYMMDD_HHMMSS.tar.gz
```

### 2. Restaurar Uploads
```bash
tar -xzf uploads_veiculos_YYYYMMDD_HHMMSS.tar.gz
```

### 3. Restaurar Banco de Dados
```bash
# Primeiro, certifique-se que o PostgreSQL está rodando
docker-compose up -d postgres

# Restaurar o banco
docker-compose exec -T postgres psql -U postgres < database_backup_YYYYMMDD_HHMMSS.sql
```

### 4. Restaurar Configurações
```bash
cp docker-compose_YYYYMMDD_HHMMSS.yml docker-compose.yml
cp env_YYYYMMDD_HHMMSS.backup .env
```

### 5. Reiniciar a Aplicação
```bash
docker-compose down
docker-compose up -d
```

## Notas Importantes

- Sempre teste a restauração em um ambiente de desenvolvimento primeiro
- Verifique se todas as variáveis de ambiente estão corretas após a restauração
- Certifique-se de que as permissões dos arquivos estão corretas
- Faça backups regulares para garantir a segurança dos dados

## Estrutura da Aplicação

- **Frontend:** React + Vite (porta 7080)
- **Backend:** Python Flask (porta 5000)
- **Banco de Dados:** PostgreSQL (porta 5432)
- **Cache:** Redis (porta 6379)
- **Proxy:** Nginx

## Contato
Em caso de dúvidas sobre a restauração, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.