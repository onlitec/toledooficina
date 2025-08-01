#!/bin/bash

# Script para backup dos arquivos do projeto ToledoOficina
# Complementa o script backup.sh existente

set -e

# Configurações
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="toledooficina_backup_${TIMESTAMP}.tar.gz"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Função para exibir progresso
echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} Iniciando backup dos arquivos do projeto..."

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Executar o backup
echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} Compactando arquivos..."

tar -czvf "${BACKUP_DIR}/${BACKUP_FILENAME}" \
  --exclude=".git" \
  --exclude="venv" \
  --exclude="node_modules" \
  --exclude="__pycache__" \
  --exclude="*.pyc" \
  --exclude="data" \
  --exclude="logs" \
  --exclude="backup" \
  --exclude="backup_old" \
  --exclude="backups" \
  --exclude="instance" \
  --exclude="secrets" \
  --exclude="nginx/cache" \
  backend frontend nginx scripts docker-compose.yml .env README.md

# Verificar se o backup foi criado com sucesso
if [ -f "${BACKUP_DIR}/${BACKUP_FILENAME}" ]; then
  FILESIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILENAME}" | cut -f1)
  echo -e "${GREEN}✅ Backup concluído com sucesso: ${BACKUP_DIR}/${BACKUP_FILENAME} (${FILESIZE})${NC}"
  
  # Listar backups existentes
  echo -e "\nBackups disponíveis:"
  ls -lh "${BACKUP_DIR}" | grep ".tar.gz"
  
  # Mostrar comando para restauração
  echo -e "\nPara restaurar este backup, use:\n"
  echo -e "tar -xzvf ${BACKUP_DIR}/${BACKUP_FILENAME} -C /caminho/para/restauracao\n"
else
  echo -e "${RED}❌ Falha ao criar o backup${NC}"
  exit 1
fi