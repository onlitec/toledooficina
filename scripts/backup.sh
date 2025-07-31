#!/bin/bash

# Script de backup automático para o sistema ERP
# Realiza backup do banco de dados, uploads e configurações

set -e

# Configurações
BACKUP_DIR="./backups"
LOG_DIR="./logs"
BACKUP_LOG="$LOG_DIR/backup.log"
RETENTION_DAYS=30
COMPRESSION_LEVEL=6

# Configurações do banco
DB_CONTAINER="erp-oficina-postgres"
DB_NAME="${POSTGRES_DB:-erp_oficina_prod}"
DB_USER="${POSTGRES_USER:-erp_user_prod}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para logging
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$BACKUP_LOG"
}

# Função para exibir progresso
progress() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

# Função para exibir sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
    log_message "SUCCESS" "$1"
}

# Função para exibir erro
error() {
    echo -e "${RED}❌ $1${NC}"
    log_message "ERROR" "$1"
}

# Função para exibir aviso
warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
    log_message "WARNING" "$1"
}

# Função para verificar dependências
check_dependencies() {
    progress "Verificando dependências..."
    
    # Verificar se o Docker está rodando
    if ! docker info >/dev/null 2>&1; then
        error "Docker não está rodando"
        exit 1
    fi
    
    # Verificar se o container do banco está rodando
    if ! docker ps --format "{{.Names}}" | grep -q "^$DB_CONTAINER$"; then
        error "Container do banco de dados não está rodando: $DB_CONTAINER"
        exit 1
    fi
    
    # Verificar se o pg_dump está disponível no container
    if ! docker exec "$DB_CONTAINER" which pg_dump >/dev/null 2>&1; then
        error "pg_dump não encontrado no container do banco"
        exit 1
    fi
    
    success "Todas as dependências verificadas"
}

# Função para criar estrutura de diretórios
setup_directories() {
    progress "Configurando diretórios de backup..."
    
    # Criar diretórios necessários
    mkdir -p "$BACKUP_DIR"/{database,uploads,configs,logs}
    mkdir -p "$LOG_DIR"
    
    # Verificar permissões
    if [ ! -w "$BACKUP_DIR" ]; then
        error "Sem permissão de escrita no diretório de backup: $BACKUP_DIR"
        exit 1
    fi
    
    success "Diretórios configurados"
}

# Função para backup do banco de dados
backup_database() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/database/db_backup_$timestamp.sql"
    local compressed_file="$backup_file.gz"
    
    progress "Iniciando backup do banco de dados..."
    
    # Realizar backup
    if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --verbose --no-owner --no-privileges > "$backup_file" 2>/dev/null; then
        # Comprimir backup
        if gzip -"$COMPRESSION_LEVEL" "$backup_file"; then
            local file_size=$(du -h "$compressed_file" | awk '{print $1}')
            success "Backup do banco criado: $(basename "$compressed_file") ($file_size)"
            
            # Verificar integridade do backup
            if gunzip -t "$compressed_file" 2>/dev/null; then
                success "Integridade do backup verificada"
            else
                error "Backup corrompido: $compressed_file"
                rm -f "$compressed_file"
                return 1
            fi
        else
            error "Falha ao comprimir backup do banco"
            rm -f "$backup_file"
            return 1
        fi
    else
        error "Falha ao criar backup do banco de dados"
        rm -f "$backup_file"
        return 1
    fi
}

# Função para backup dos uploads
backup_uploads() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/uploads/uploads_backup_$timestamp.tar.gz"
    local uploads_volume="uploads_data"
    
    progress "Iniciando backup dos uploads..."
    
    # Verificar se o volume existe
    if ! docker volume ls --format "{{.Name}}" | grep -q "^$uploads_volume$"; then
        warning "Volume de uploads não encontrado: $uploads_volume"
        return 0
    fi
    
    # Criar backup dos uploads usando um container temporário
    if docker run --rm -v "$uploads_volume:/data" -v "$(pwd)/$BACKUP_DIR/uploads:/backup" alpine:latest tar -czf "/backup/$(basename "$backup_file")" -C /data . 2>/dev/null; then
        local file_size=$(du -h "$backup_file" | awk '{print $1}')
        success "Backup dos uploads criado: $(basename "$backup_file") ($file_size)"
    else
        error "Falha ao criar backup dos uploads"
        return 1
    fi
}

# Função para backup das configurações
backup_configs() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/configs/configs_backup_$timestamp.tar.gz"
    
    progress "Iniciando backup das configurações..."
    
    # Lista de arquivos e diretórios para backup
    local config_items=(
        ".env.production"
        "docker-compose.production.yml"
        "nginx/nginx.production.conf"
        "scripts/"
    )
    
    # Verificar quais itens existem
    local existing_items=()
    for item in "${config_items[@]}"; do
        if [ -e "$item" ]; then
            existing_items+=("$item")
        fi
    done
    
    if [ ${#existing_items[@]} -eq 0 ]; then
        warning "Nenhum arquivo de configuração encontrado para backup"
        return 0
    fi
    
    # Criar backup das configurações
    if tar -czf "$backup_file" "${existing_items[@]}" 2>/dev/null; then
        local file_size=$(du -h "$backup_file" | awk '{print $1}')
        success "Backup das configurações criado: $(basename "$backup_file") ($file_size)"
    else
        error "Falha ao criar backup das configurações"
        return 1
    fi
}

# Função para backup dos logs
backup_logs() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/logs/logs_backup_$timestamp.tar.gz"
    
    progress "Iniciando backup dos logs..."
    
    # Verificar se o diretório de logs existe
    if [ ! -d "$LOG_DIR" ]; then
        warning "Diretório de logs não encontrado: $LOG_DIR"
        return 0
    fi
    
    # Criar backup dos logs (apenas arquivos dos últimos 7 dias)
    if find "$LOG_DIR" -name "*.log" -mtime -7 -print0 | tar -czf "$backup_file" --null -T - 2>/dev/null; then
        local file_size=$(du -h "$backup_file" | awk '{print $1}')
        success "Backup dos logs criado: $(basename "$backup_file") ($file_size)"
    else
        warning "Nenhum log recente encontrado ou falha ao criar backup"
        rm -f "$backup_file"
        return 0
    fi
}

# Função para limpeza de backups antigos
cleanup_old_backups() {
    progress "Limpando backups antigos (mais de $RETENTION_DAYS dias)..."
    
    local deleted_count=0
    
    # Limpar backups antigos em cada subdiretório
    for subdir in database uploads configs logs; do
        local backup_subdir="$BACKUP_DIR/$subdir"
        if [ -d "$backup_subdir" ]; then
            local old_files=$(find "$backup_subdir" -name "*backup*" -mtime +"$RETENTION_DAYS" -type f)
            if [ -n "$old_files" ]; then
                echo "$old_files" | while read -r file; do
                    rm -f "$file"
                    ((deleted_count++))
                    log_message "INFO" "Backup antigo removido: $(basename "$file")"
                done
            fi
        fi
    done
    
    if [ "$deleted_count" -gt 0 ]; then
        success "$deleted_count backups antigos removidos"
    else
        log_message "INFO" "Nenhum backup antigo para remover"
    fi
}

# Função para verificar espaço em disco
check_disk_space() {
    progress "Verificando espaço em disco..."
    
    local available_space=$(df "$BACKUP_DIR" | awk 'NR==2{print $4}')
    local available_gb=$((available_space / 1024 / 1024))
    
    if [ "$available_gb" -lt 1 ]; then
        error "Espaço em disco insuficiente: ${available_gb}GB disponível"
        return 1
    elif [ "$available_gb" -lt 5 ]; then
        warning "Pouco espaço em disco: ${available_gb}GB disponível"
    else
        success "Espaço em disco suficiente: ${available_gb}GB disponível"
    fi
}

# Função para gerar relatório de backup
generate_backup_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo ""
    echo "==========================================="
    echo "  RELATÓRIO DE BACKUP"
    echo "  $timestamp"
    echo "==========================================="
    
    # Estatísticas dos backups
    echo "📊 Estatísticas dos Backups:"
    
    for subdir in database uploads configs logs; do
        local backup_subdir="$BACKUP_DIR/$subdir"
        if [ -d "$backup_subdir" ]; then
            local count=$(find "$backup_subdir" -name "*backup*" -type f | wc -l)
            local size=$(du -sh "$backup_subdir" 2>/dev/null | awk '{print $1}' || echo "0B")
            echo "  📁 $subdir: $count arquivos ($size)"
        fi
    done
    
    # Backup mais recente
    echo ""
    echo "🕒 Backups Mais Recentes:"
    
    for subdir in database uploads configs logs; do
        local backup_subdir="$BACKUP_DIR/$subdir"
        if [ -d "$backup_subdir" ]; then
            local latest=$(find "$backup_subdir" -name "*backup*" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
            if [ -n "$latest" ]; then
                local file_date=$(stat -c %y "$latest" | cut -d' ' -f1,2 | cut -d'.' -f1)
                local file_size=$(du -h "$latest" | awk '{print $1}')
                echo "  📄 $subdir: $(basename "$latest") ($file_size) - $file_date"
            else
                echo "  📄 $subdir: Nenhum backup encontrado"
            fi
        fi
    done
    
    # Espaço total usado
    echo ""
    echo "💾 Espaço Total dos Backups:"
    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}' || echo "0B")
    echo "  $total_size"
    
    echo "==========================================="
}

# Função para backup completo
run_full_backup() {
    local start_time=$(date +%s)
    
    log_message "INFO" "Iniciando backup completo do sistema"
    
    # Verificações iniciais
    check_dependencies
    setup_directories
    check_disk_space
    
    # Executar backups
    local backup_success=true
    
    backup_database || backup_success=false
    backup_uploads || backup_success=false
    backup_configs || backup_success=false
    backup_logs || backup_success=false
    
    # Limpeza
    cleanup_old_backups
    
    # Calcular tempo total
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local duration_min=$((duration / 60))
    local duration_sec=$((duration % 60))
    
    # Relatório final
    if [ "$backup_success" = true ]; then
        success "Backup completo concluído com sucesso em ${duration_min}m${duration_sec}s"
        log_message "SUCCESS" "Backup completo concluído em ${duration_min}m${duration_sec}s"
    else
        error "Backup completo concluído com alguns erros em ${duration_min}m${duration_sec}s"
        log_message "ERROR" "Backup completo com erros em ${duration_min}m${duration_sec}s"
    fi
    
    generate_backup_report
}

# Função para backup rápido (apenas banco)
run_quick_backup() {
    log_message "INFO" "Iniciando backup rápido (apenas banco de dados)"
    
    check_dependencies
    setup_directories
    
    if backup_database; then
        success "Backup rápido concluído com sucesso"
    else
        error "Backup rápido falhou"
        exit 1
    fi
}

# Função para restaurar backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error "Arquivo de backup não especificado"
        echo "Uso: $0 --restore <arquivo_backup.sql.gz>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "Arquivo de backup não encontrado: $backup_file"
        exit 1
    fi
    
    progress "Iniciando restauração do backup: $backup_file"
    
    # Verificar se é um arquivo comprimido
    if [[ "$backup_file" == *.gz ]]; then
        progress "Descomprimindo backup..."
        if gunzip -c "$backup_file" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"; then
            success "Backup restaurado com sucesso"
        else
            error "Falha ao restaurar backup"
            exit 1
        fi
    else
        if docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$backup_file"; then
            success "Backup restaurado com sucesso"
        else
            error "Falha ao restaurar backup"
            exit 1
        fi
    fi
}

# Função para listar backups
list_backups() {
    echo "==========================================="
    echo "  BACKUPS DISPONÍVEIS"
    echo "==========================================="
    
    for subdir in database uploads configs logs; do
        local backup_subdir="$BACKUP_DIR/$subdir"
        if [ -d "$backup_subdir" ]; then
            echo ""
            echo "📁 $subdir:"
            
            local files=$(find "$backup_subdir" -name "*backup*" -type f -printf '%T@ %p\n' 2>/dev/null | sort -nr)
            
            if [ -n "$files" ]; then
                echo "$files" | while read -r timestamp filepath; do
                    local file_date=$(date -d "@${timestamp%.*}" '+%Y-%m-%d %H:%M:%S')
                    local file_size=$(du -h "$filepath" | awk '{print $1}')
                    echo "  📄 $(basename "$filepath") ($file_size) - $file_date"
                done
            else
                echo "  (Nenhum backup encontrado)"
            fi
        fi
    done
    
    echo ""
    echo "==========================================="
}

# Função para exibir ajuda
show_help() {
    echo "Uso: $0 [opção]"
    echo ""
    echo "Opções:"
    echo "  --full, -f           Backup completo (banco, uploads, configs, logs)"
    echo "  --quick, -q          Backup rápido (apenas banco de dados)"
    echo "  --database, -d       Backup apenas do banco de dados"
    echo "  --uploads, -u        Backup apenas dos uploads"
    echo "  --configs, -c        Backup apenas das configurações"
    echo "  --restore <arquivo>  Restaurar backup do banco de dados"
    echo "  --list, -l           Listar backups disponíveis"
    echo "  --report, -r         Exibir relatório de backups"
    echo "  --cleanup            Limpar backups antigos"
    echo "  --help, -h           Exibir esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 --full                              # Backup completo"
    echo "  $0 --quick                             # Backup rápido"
    echo "  $0 --restore backup_20231201_120000.sql.gz  # Restaurar backup"
    echo "  $0 --list                              # Listar backups"
    echo ""
    echo "Configurações:"
    echo "  Diretório de backup: $BACKUP_DIR"
    echo "  Retenção: $RETENTION_DAYS dias"
    echo "  Container do banco: $DB_CONTAINER"
}

# Criar diretórios necessários
mkdir -p "$LOG_DIR"

# Processar argumentos
case "${1:-}" in
    "--full"||"-f")
        run_full_backup
        ;;
    "--quick"||"-q")
        run_quick_backup
        ;;
    "--database"||"-d")
        check_dependencies
        setup_directories
        backup_database
        ;;
    "--uploads"||"-u")
        setup_directories
        backup_uploads
        ;;
    "--configs"||"-c")
        setup_directories
        backup_configs
        ;;
    "--restore")
        restore_backup "$2"
        ;;
    "--list"||"-l")
        list_backups
        ;;
    "--report"||"-r")
        generate_backup_report
        ;;
    "--cleanup")
        cleanup_old_backups
        ;;
    "--help"||"-h"||"")
        show_help
        ;;
    *)
        echo "Opção inválida: $1"
        show_help
        exit 1
        ;;
esac