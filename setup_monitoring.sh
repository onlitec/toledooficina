#!/bin/bash

# Script para configurar monitoramento e logging para o sistema ERP Oficina Mecânica
# Este script configura monitoramento de saúde e coleta de logs

set -e  # Sair imediatamente se um comando falhar

echo "=== CONFIGURAÇÃO DE MONITORAMENTO E LOGGING ==="
echo "Data: $(date)"
echo "=============================================="

# Criar diretório de logs se não existir
LOGS_DIR="./nginx/logs"
if [ ! -d "$LOGS_DIR" ]; then
    echo "Criando diretório de logs..."
    mkdir -p "$LOGS_DIR"
fi

# Criar script de monitoramento de saúde
echo "Criando script de monitoramento de saúde..."
cat > monitor_health.sh << 'EOF'
#!/bin/bash

# Script de monitoramento de saúde do sistema ERP Oficina Mecânica
# Verifica o status de todos os serviços e envia notificações se necessário

echo "=== MONITORAMENTO DE SAÚDE DO SISTEMA ==="
echo "Data: $(date)"
echo "========================================"

# Verificar se docker está instalado e em execução
if ! command -v docker &> /dev/null; then
    echo "ERRO: Docker não está instalado!"
    exit 1
fi

# Verificar status dos containers
echo "Verificando status dos containers..."
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker ps
fi

# Verificar conectividade com os serviços
echo ""
echo "Verificando conectividade com os serviços..."

# Verificar backend
echo "1. Verificando backend..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend está respondendo"
else
    echo "   ❌ Backend não está respondendo"
fi

# Verificar frontend
echo "2. Verificando frontend..."
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "   ✅ Frontend está respondendo"
else
    echo "   ❌ Frontend não está respondendo"
fi

# Verificar banco de dados PostgreSQL
echo "3. Verificando banco de dados..."
if command -v docker-compose &> /dev/null; then
    if docker-compose exec postgres pg_isready -U erp_user > /dev/null 2>&1; then
        echo "   ✅ PostgreSQL está pronto"
    else
        echo "   ❌ PostgreSQL não está pronto"
    fi
else
    echo "   ⚠ Não é possível verificar PostgreSQL - docker-compose não encontrado"
fi

# Verificar Redis
echo "4. Verificando Redis..."
if command -v docker-compose &> /dev/null; then
    if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
        echo "   ✅ Redis está respondendo"
    else
        echo "   ❌ Redis não está respondendo"
    fi
else
    echo "   ⚠ Não é possível verificar Redis - docker-compose não encontrado"
fi

echo ""
echo "=== FIM DO MONITORAMENTO ==="
EOF

chmod +x monitor_health.sh
echo "Script de monitoramento de saúde criado: monitor_health.sh"

# Criar script de rotação de logs
echo "Criando script de rotação de logs..."
cat > log_rotation.sh << 'EOF'
#!/bin/bash

# Script de rotação de logs para o sistema ERP Oficina Mecânica
# Gerencia o tamanho e a retenção dos arquivos de log

echo "=== ROTAÇÃO DE LOGS ==="
echo "Data: $(date)"
echo "======================="

# Diretórios de logs
LOG_DIRS=("./nginx/logs" "./backups")

# Tamanho máximo dos logs (em MB)
MAX_SIZE_MB=100

# Número máximo de arquivos de backup a manter
MAX_BACKUPS=10

for log_dir in "${LOG_DIRS[@]}"; do
    if [ -d "$log_dir" ]; then
        echo "Processando diretório: $log_dir"
        
        # Comprimir logs antigos
        find "$log_dir" -name "*.log" -size +${MAX_SIZE_MB}M -exec gzip {} \; 2>/dev/null || true
        
        # Remover logs muito antigos
        find "$log_dir" -name "*.log.*" -mtime +30 -delete 2>/dev/null || true
        
        # Manter apenas os últimos N arquivos de backup
        ls -t "$log_dir"/*.log.*.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f 2>/dev/null || true
    fi
done

echo "Rotação de logs concluída."
EOF

chmod +x log_rotation.sh
echo "Script de rotação de logs criado: log_rotation.sh"

# Criar script de backup automático
echo "Criando script de backup automático..."
cat > auto_backup.sh << 'EOF'
#!/bin/bash

# Script de backup automático para o sistema ERP Oficina Mecânica
# Realiza backups regulares do banco de dados e arquivos importantes

echo "=== BACKUP AUTOMÁTICO ==="
echo "Data: $(date)"
echo "========================="

# Diretório de backups
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Criar diretório se não existir
mkdir -p "$BACKUP_DIR"

# Backup do banco de dados PostgreSQL (se estiver rodando)
echo "Realizando backup do banco de dados..."
if command -v docker-compose &> /dev/null; then
    if docker-compose ps postgres | grep "Up" > /dev/null 2>&1; then
        docker-compose exec postgres pg_dump -U erp_user erp_oficina > "${BACKUP_DIR}/erp_oficina_${TIMESTAMP}.sql"
        echo "Backup do banco de dados salvo: ${BACKUP_DIR}/erp_oficina_${TIMESTAMP}.sql"
    else
        echo "PostgreSQL não está em execução, pulando backup do banco"
    fi
else
    echo "docker-compose não encontrado, pulando backup do banco"
fi

# Comprimir backup do banco (se existir)
if [ -f "${BACKUP_DIR}/erp_oficina_${TIMESTAMP}.sql" ]; then
    gzip "${BACKUP_DIR}/erp_oficina_${TIMESTAMP}.sql"
    echo "Backup do banco comprimido"
fi

# Backup dos volumes importantes
echo "Realizando backup dos volumes..."
VOLUMES=("backend_data" "uploads_data" "postgres_data")

for volume in "${VOLUMES[@]}"; do
    if command -v docker &> /dev/null; then
        # Verificar se o volume existe
        if docker volume ls | grep "$volume" > /dev/null 2>&1; then
            docker run --rm -v "$volume:/volume" -v "$BACKUP_DIR:/backup" alpine tar czf "/backup/${volume}_${TIMESTAMP}.tar.gz" -C /volume . 2>/dev/null || true
            echo "Backup do volume $volume salvo: ${BACKUP_DIR}/${volume}_${TIMESTAMP}.tar.gz"
        fi
    fi
done

# Remover backups antigos (manter apenas os últimos 7)
echo "Removendo backups antigos..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true

echo "Backup automático concluído."
EOF

chmod +x auto_backup.sh
echo "Script de backup automático criado: auto_backup.sh"

# Criar cron job para execução automática
echo "Configurando cron jobs para execução automática..."

# Verificar se crontab está disponível
if command -v crontab &> /dev/null; then
    # Criar arquivo temporário com entradas do cron
    CRON_TEMP=$(mktemp)
    
    # Adicionar entradas do cron existentes
    crontab -l > "$CRON_TEMP" 2>/dev/null || true
    
    # Adicionar novas entradas do cron
    echo "" >> "$CRON_TEMP"
    echo "# Monitoramento do sistema ERP Oficina Mecânica" >> "$CRON_TEMP"
    echo "*/30 * * * * cd $(pwd) && ./monitor_health.sh >> ./nginx/logs/health_check.log 2>&1" >> "$CRON_TEMP"
    echo "0 2 * * * cd $(pwd) && ./log_rotation.sh >> ./nginx/logs/log_rotation.log 2>&1" >> "$CRON_TEMP"
    echo "0 1 * * 0 cd $(pwd) && ./auto_backup.sh >> ./nginx/logs/backup.log 2>&1" >> "$CRON_TEMP"
    
    # Instalar o cron
    crontab "$CRON_TEMP"
    
    echo "Cron jobs configurados:"
    echo "- Monitoramento a cada 30 minutos"
    echo "- Rotação de logs diariamente às 02:00"
    echo "- Backup automático semanalmente às 01:00 de domingo"
    
    # Limpar arquivo temporário
    rm "$CRON_TEMP"
else
    echo "Crontab não disponível. Criando scripts manuais:"
    echo "Para monitoramento a cada 30 minutos: */30 * * * * cd $(pwd) && ./monitor_health.sh"
    echo "Para rotação de logs diária: 0 2 * * * cd $(pwd) && ./log_rotation.sh"
    echo "Para backup semanal: 0 1 * * 0 cd $(pwd) && ./auto_backup.sh"
fi

echo ""
echo "=== CONFIGURAÇÃO DE MONITORAMENTO CONCLUÍDA ==="
echo "Scripts criados:"
echo "- monitor_health.sh: Verifica saúde dos serviços"
echo "- log_rotation.sh: Gerencia rotação de logs"
echo "- auto_backup.sh: Realiza backups automáticos"
echo ""
echo "Cron jobs configurados para execução automática"
echo "================================================="
