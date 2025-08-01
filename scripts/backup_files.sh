#!/bin/bash

# Script para backup de arquivos do sistema ToledoOficina
# Este script cria um arquivo compactado com os arquivos do projeto
# Autor: ToledoOficina Team
# Data: 01/08/2025

# Definir variáveis
BACKUP_DIR="$(pwd)/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/toledooficina_backup_${TIMESTAMP}.tar.gz"
PROJECT_ROOT="$(pwd)"

# Verificar se o diretório de backup existe, se não, criar
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    echo "Diretório de backup criado: $BACKUP_DIR"
fi

# Criar o arquivo de backup
echo "Iniciando backup em: $(date)"
echo "Criando arquivo de backup: $BACKUP_FILE"

# Compactar os arquivos do projeto, excluindo diretórios desnecessários
tar -czf "$BACKUP_FILE" \
    --exclude=".git" \
    --exclude="venv" \
    --exclude="node_modules" \
    --exclude="__pycache__" \
    --exclude="data" \
    --exclude="logs" \
    --exclude="backup" \
    --exclude="backup_old" \
    --exclude="instance" \
    --exclude="secrets" \
    --exclude="nginx/cache" \
    --exclude="backups" \
    -C "$PROJECT_ROOT" \
    backend frontend nginx scripts docker-compose.yml .env README.md

# Verificar se o backup foi criado com sucesso
if [ $? -eq 0 ]; then
    echo "Backup concluído com sucesso: $BACKUP_FILE"
    echo "Tamanho do arquivo: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo "Para restaurar o backup, use o comando:"
    echo "tar -xzf $BACKUP_FILE -C /caminho/para/restauracao"
else
    echo "Erro ao criar o backup!"
    exit 1
fi

echo "Backup finalizado em: $(date)"
