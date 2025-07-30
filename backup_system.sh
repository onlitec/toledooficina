#!/bin/bash

# Script de backup completo do sistema ERP Oficina Mecânica
# Este script cria backups de segurança antes de qualquer alteração

set -e  # Sair imediatamente se um comando falhar

echo "=== BACKUP DO SISTEMA ERP OFICINA MECÂNICA ==="
echo "Data: $(date)"
echo "=============================================="

# Criar diretório de backups se não existir
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Criando diretório de backups..."
    mkdir -p "$BACKUP_DIR"
fi

# 1. Backup do docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    echo "1. Fazendo backup do docker-compose.yml..."
    cp docker-compose.yml "${BACKUP_DIR}/docker-compose.yml.backup_${TIMESTAMP}"
    echo "   Backup salvo em: ${BACKUP_DIR}/docker-compose.yml.backup_${TIMESTAMP}"
else
    echo "1. Arquivo docker-compose.yml não encontrado"
fi

# 2. Backup do .env (se existir)
if [ -f ".env" ]; then
    echo "2. Fazendo backup do .env..."
    cp .env "${BACKUP_DIR}/.env.backup_${TIMESTAMP}"
    echo "   Backup salvo em: ${BACKUP_DIR}/.env.backup_${TIMESTAMP}"
else
    echo "2. Arquivo .env não encontrado"
fi

# 3. Backup do diretório nginx (se existir)
if [ -d "nginx" ]; then
    echo "3. Fazendo backup do diretório nginx..."
    tar -czf "${BACKUP_DIR}/nginx.backup_${TIMESTAMP}.tar.gz" nginx
    echo "   Backup salvo em: ${BACKUP_DIR}/nginx.backup_${TIMESTAMP}.tar.gz"
else
    echo "3. Diretório nginx não encontrado"
fi

# 4. Backup do banco de dados SQLite (se estiver em uso)
if [ -f "backend/src/database/app.db" ]; then
    echo "4. Fazendo backup do banco de dados SQLite..."
    cp backend/src/database/app.db "${BACKUP_DIR}/app.db.backup_${TIMESTAMP}"
    echo "   Backup salvo em: ${BACKUP_DIR}/app.db.backup_${TIMESTAMP}"
else
    echo "4. Banco de dados SQLite não encontrado"
fi

# 5. Backup dos arquivos de configuração do frontend
if [ -f "frontend/nginx.conf" ]; then
    echo "5. Fazendo backup da configuração do Nginx do frontend..."
    cp frontend/nginx.conf "${BACKUP_DIR}/frontend_nginx.conf.backup_${TIMESTAMP}"
    echo "   Backup salvo em: ${BACKUP_DIR}/frontend_nginx.conf.backup_${TIMESTAMP}"
fi

echo ""
echo "=== BACKUP CONCLUÍDO COM SUCESSO ==="
echo "Todos os backups foram salvos no diretório: $BACKUP_DIR"
echo "Timestamp: $TIMESTAMP"
echo "====================================="

# Listar backups criados
echo ""
echo "Backups criados:"
ls -la "$BACKUP_DIR" | grep "$TIMESTAMP"
