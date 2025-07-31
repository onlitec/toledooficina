#!/bin/bash

# Script de Backup Completo da Plataforma ERP Oficina
# Data: $(date '+%Y-%m-%d %H:%M:%S')

set -e

echo "=== INICIANDO BACKUP COMPLETO DA PLATAFORMA ==="
echo "Data/Hora: $(date '+%Y-%m-%d %H:%M:%S')"

# Criar diretório de backup com timestamp
BACKUP_DIR="backup/backup_$(date '+%Y%m%d_%H%M%S')"
mkdir -p "$BACKUP_DIR"

echo "📁 Diretório de backup: $BACKUP_DIR"

# 1. Backup do código fonte
echo "📦 Fazendo backup do código fonte..."
mkdir -p "$BACKUP_DIR/codigo"
cp -r backend/ "$BACKUP_DIR/codigo/" 2>/dev/null || true
cp -r frontend/ "$BACKUP_DIR/codigo/" 2>/dev/null || true
cp -r nginx/ "$BACKUP_DIR/codigo/" 2>/dev/null || true
cp -r scripts/ "$BACKUP_DIR/codigo/" 2>/dev/null || true

# 2. Backup dos arquivos de configuração
echo "⚙️ Fazendo backup das configurações..."
mkdir -p "$BACKUP_DIR/config"
cp docker-compose*.yml "$BACKUP_DIR/config/" 2>/dev/null || true
cp .env* "$BACKUP_DIR/config/" 2>/dev/null || true
cp *.sh "$BACKUP_DIR/config/" 2>/dev/null || true
cp *.md "$BACKUP_DIR/config/" 2>/dev/null || true
cp *.ini "$BACKUP_DIR/config/" 2>/dev/null || true
cp *.py "$BACKUP_DIR/config/" 2>/dev/null || true
cp *.json "$BACKUP_DIR/config/" 2>/dev/null || true

# 3. Backup do banco de dados PostgreSQL
echo "🗄️ Fazendo backup do banco de dados PostgreSQL..."
mkdir -p "$BACKUP_DIR/database"
if docker ps | grep -q "erp-oficina-postgres"; then
    echo "Exportando banco PostgreSQL..."
    docker exec erp-oficina-postgres pg_dump -U erp_user -d erp_oficina > "$BACKUP_DIR/database/postgres_backup_$(date '+%Y%m%d_%H%M%S').sql" 2>/dev/null || echo "⚠️ Erro ao fazer backup do PostgreSQL"
else
    echo "⚠️ Container PostgreSQL não está rodando"
fi

# 4. Backup dos dados persistentes
echo "💾 Fazendo backup dos dados persistentes..."
if [ -d "data" ]; then
    cp -r data/ "$BACKUP_DIR/" 2>/dev/null || true
fi

# 5. Backup dos uploads e arquivos estáticos
echo "📸 Fazendo backup dos uploads..."
if [ -d "backend/uploads" ]; then
    mkdir -p "$BACKUP_DIR/uploads"
    cp -r backend/uploads/ "$BACKUP_DIR/" 2>/dev/null || true
fi
if [ -d "backend/static" ]; then
    mkdir -p "$BACKUP_DIR/static"
    cp -r backend/static/ "$BACKUP_DIR/" 2>/dev/null || true
fi

# 6. Backup dos logs
echo "📋 Fazendo backup dos logs..."
if [ -d "logs" ]; then
    cp -r logs/ "$BACKUP_DIR/" 2>/dev/null || true
fi
if [ -d "nginx/logs" ]; then
    mkdir -p "$BACKUP_DIR/nginx_logs"
    cp -r nginx/logs/ "$BACKUP_DIR/nginx_logs/" 2>/dev/null || true
fi

# 7. Backup das imagens Docker (opcional)
echo "🐳 Fazendo backup das imagens Docker..."
mkdir -p "$BACKUP_DIR/docker"
echo "Salvando lista de imagens Docker..."
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}\t{{.Size}}" > "$BACKUP_DIR/docker/docker_images.txt" 2>/dev/null || true
echo "Salvando configuração dos containers..."
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" > "$BACKUP_DIR/docker/docker_containers.txt" 2>/dev/null || true

# 8. Criar arquivo de informações do backup
echo "📝 Criando arquivo de informações..."
cat > "$BACKUP_DIR/BACKUP_INFO.md" << EOF
# Backup da Plataforma ERP Oficina

**Data do Backup:** $(date '+%Y-%m-%d %H:%M:%S')
**Versão do Sistema:** $(git rev-parse HEAD 2>/dev/null || echo "N/A")
**Branch:** $(git branch --show-current 2>/dev/null || echo "N/A")

## Conteúdo do Backup

### 📦 Código Fonte
- Backend (Python/Flask)
- Frontend (React/Vite)
- Nginx (Configurações)
- Scripts auxiliares

### ⚙️ Configurações
- Docker Compose
- Variáveis de ambiente
- Scripts de deploy
- Documentação

### 🗄️ Banco de Dados
- Dump completo do PostgreSQL
- Dados de usuários, clientes, veículos, etc.

### 💾 Dados Persistentes
- Volumes Docker
- Uploads de arquivos
- Cache Redis

### 📋 Logs
- Logs da aplicação
- Logs do Nginx
- Logs do sistema

### 🐳 Docker
- Lista de imagens
- Configuração dos containers

## Como Restaurar

1. Extrair o backup em um diretório limpo
2. Restaurar o banco de dados:
   \`\`\`bash
   docker exec -i erp-oficina-postgres psql -U erp_user -d erp_oficina < database/postgres_backup_*.sql
   \`\`\`
3. Copiar os arquivos de configuração
4. Executar docker-compose up -d
5. Verificar se todos os serviços estão funcionando

## Verificação de Integridade

- **Tamanho do backup:** $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "N/A")
- **Número de arquivos:** $(find "$BACKUP_DIR" -type f | wc -l 2>/dev/null || echo "N/A")
- **Hash MD5:** $(find "$BACKUP_DIR" -type f -exec md5sum {} \; 2>/dev/null | md5sum | cut -d' ' -f1 || echo "N/A")
EOF

# 9. Compactar o backup (opcional)
echo "🗜️ Compactando backup..."
tar -czf "${BACKUP_DIR}.tar.gz" -C backup "$(basename "$BACKUP_DIR")" 2>/dev/null || echo "⚠️ Erro ao compactar backup"

# 10. Mostrar resumo
echo ""
echo "✅ BACKUP CONCLUÍDO COM SUCESSO!"
echo "📁 Localização: $BACKUP_DIR"
echo "📦 Arquivo compactado: ${BACKUP_DIR}.tar.gz"
echo "📊 Tamanho: $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "N/A")"
echo "🕒 Duração: $SECONDS segundos"
echo ""
echo "💡 Para restaurar o backup, consulte o arquivo BACKUP_INFO.md"
echo "🔒 Mantenha este backup em local seguro!"

echo "=== BACKUP FINALIZADO ==="