#!/bin/bash

# Script de monitoramento do sistema ERP em produção
# Monitora recursos, logs e saúde dos serviços

set -e

# Configurações
LOG_DIR="./logs"
MONITOR_LOG="$LOG_DIR/monitor.log"
ALERT_LOG="$LOG_DIR/alerts.log"
CHECK_INTERVAL=60  # segundos
MAX_LOG_SIZE=100M

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=90
LOAD_THRESHOLD=4.0

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
    echo "[$timestamp] [$level] $message" | tee -a "$MONITOR_LOG"
}

# Função para alertas
send_alert() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "[$timestamp] [ALERT-$level] $message" | tee -a "$ALERT_LOG"
    
    # Aqui você pode adicionar integração com sistemas de alerta
    # como Slack, Discord, email, etc.
    case "$level" in
        "CRITICAL")
            echo -e "${RED}🚨 ALERTA CRÍTICO: $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️ AVISO: $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️ INFO: $message${NC}"
            ;;
    esac
}

# Função para verificar se um container está rodando
check_container() {
    local container_name="$1"
    
    if docker ps --format "{{.Names}}" | grep -q "^$container_name$"; then
        local status=$(docker inspect --format="{{.State.Status}}" "$container_name")
        if [ "$status" = "running" ]; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# Função para verificar saúde dos containers
check_containers_health() {
    local containers=("erp-oficina-postgres" "erp-oficina-redis" "erp-oficina-backend" "erp-oficina-frontend" "erp-oficina-nginx")
    local failed_containers=()
    
    for container in "${containers[@]}"; do
        if ! check_container "$container"; then
            failed_containers+=("$container")
        fi
    done
    
    if [ ${#failed_containers[@]} -eq 0 ]; then
        log_message "INFO" "Todos os containers estão rodando normalmente"
        return 0
    else
        local failed_list=$(IFS=', '; echo "${failed_containers[*]}")
        send_alert "CRITICAL" "Containers com problemas: $failed_list"
        return 1
    fi
}

# Função para verificar uso de CPU
check_cpu_usage() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    local cpu_int=${cpu_usage%.*}
    
    if [ "$cpu_int" -gt "$CPU_THRESHOLD" ]; then
        send_alert "WARNING" "Uso de CPU alto: ${cpu_usage}% (threshold: ${CPU_THRESHOLD}%)"
        return 1
    else
        log_message "INFO" "Uso de CPU: ${cpu_usage}%"
        return 0
    fi
}

# Função para verificar uso de memória
check_memory_usage() {
    local memory_info=$(free | grep Mem)
    local total=$(echo $memory_info | awk '{print $2}')
    local used=$(echo $memory_info | awk '{print $3}')
    local usage_percent=$((used * 100 / total))
    
    if [ "$usage_percent" -gt "$MEMORY_THRESHOLD" ]; then
        send_alert "WARNING" "Uso de memória alto: ${usage_percent}% (threshold: ${MEMORY_THRESHOLD}%)"
        return 1
    else
        log_message "INFO" "Uso de memória: ${usage_percent}%"
        return 0
    fi
}

# Função para verificar uso de disco
check_disk_usage() {
    local disk_usage=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        send_alert "CRITICAL" "Uso de disco alto: ${disk_usage}% (threshold: ${DISK_THRESHOLD}%)"
        return 1
    else
        log_message "INFO" "Uso de disco: ${disk_usage}%"
        return 0
    fi
}

# Função para verificar load average
check_load_average() {
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    
    if (( $(echo "$load_avg > $LOAD_THRESHOLD" | bc -l) )); then
        send_alert "WARNING" "Load average alto: $load_avg (threshold: $LOAD_THRESHOLD)"
        return 1
    else
        log_message "INFO" "Load average: $load_avg"
        return 0
    fi
}

# Função para verificar conectividade de rede
check_network_connectivity() {
    # Testar conectividade interna
    if ! curl -s --max-time 5 http://localhost/api/health > /dev/null; then
        send_alert "CRITICAL" "API health check falhou"
        return 1
    fi
    
    # Testar conectividade externa (opcional)
    if ! ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        send_alert "WARNING" "Conectividade externa com problemas"
        return 1
    fi
    
    log_message "INFO" "Conectividade de rede OK"
    return 0
}

# Função para verificar logs de erro
check_error_logs() {
    local error_count=0
    local containers=("erp-oficina-backend" "erp-oficina-nginx")
    
    for container in "${containers[@]}"; do
        if check_container "$container"; then
            # Verificar erros nos últimos 5 minutos
            local recent_errors=$(docker logs --since="5m" "$container" 2>&1 | grep -i "error\|critical\|fatal" | wc -l)
            error_count=$((error_count + recent_errors))
            
            if [ "$recent_errors" -gt 0 ]; then
                send_alert "WARNING" "$recent_errors novos erros encontrados no container $container"
            fi
        fi
    done
    
    if [ "$error_count" -eq 0 ]; then
        log_message "INFO" "Nenhum erro recente encontrado nos logs"
        return 0
    else
        return 1
    fi
}

# Função para verificar espaço em volumes Docker
check_docker_volumes() {
    local volumes=("postgres_data" "redis_data" "uploads_data" "backups_data")
    
    for volume in "${volumes[@]}"; do
        if docker volume ls --format "{{.Name}}" | grep -q "$volume"; then
            # Verificar se o volume está sendo usado
            local volume_path=$(docker volume inspect "$volume" --format '{{.Mountpoint}}')
            if [ -d "$volume_path" ]; then
                local volume_size=$(du -sh "$volume_path" 2>/dev/null | awk '{print $1}' || echo "N/A")
                log_message "INFO" "Volume $volume: $volume_size"
            fi
        else
            send_alert "WARNING" "Volume $volume não encontrado"
        fi
    done
}

# Função para verificar backup
check_backup_status() {
    local backup_dir="./backups"
    
    if [ -d "$backup_dir" ]; then
        # Verificar se há backups recentes (últimas 24 horas)
        local recent_backups=$(find "$backup_dir" -name "*.sql" -mtime -1 | wc -l)
        
        if [ "$recent_backups" -eq 0 ]; then
            send_alert "WARNING" "Nenhum backup recente encontrado (últimas 24h)"
            return 1
        else
            log_message "INFO" "$recent_backups backups recentes encontrados"
            return 0
        fi
    else
        send_alert "WARNING" "Diretório de backup não encontrado"
        return 1
    fi
}

# Função para limpar logs antigos
cleanup_logs() {
    # Limpar logs maiores que MAX_LOG_SIZE
    if [ -f "$MONITOR_LOG" ]; then
        local log_size=$(stat -c%s "$MONITOR_LOG")
        local max_size_bytes=$(echo "$MAX_LOG_SIZE" | sed 's/M/*1024*1024/' | bc)
        
        if [ "$log_size" -gt "$max_size_bytes" ]; then
            # Manter apenas as últimas 1000 linhas
            tail -n 1000 "$MONITOR_LOG" > "${MONITOR_LOG}.tmp"
            mv "${MONITOR_LOG}.tmp" "$MONITOR_LOG"
            log_message "INFO" "Log de monitoramento rotacionado"
        fi
    fi
    
    # Limpar logs de alerta antigos (mais de 30 dias)
    find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null || true
}

# Função para gerar relatório de status
generate_status_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "==========================================="
    echo "  RELATÓRIO DE STATUS DO SISTEMA"
    echo "  $timestamp"
    echo "==========================================="
    
    # Status dos containers
    echo "📦 Status dos Containers:"
    local containers=("erp-oficina-postgres" "erp-oficina-redis" "erp-oficina-backend" "erp-oficina-frontend" "erp-oficina-nginx")
    for container in "${containers[@]}"; do
        if check_container "$container"; then
            echo "  ✅ $container: Rodando"
        else
            echo "  ❌ $container: Parado/Com problemas"
        fi
    done
    
    # Recursos do sistema
    echo ""
    echo "💻 Recursos do Sistema:"
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local disk_usage=$(df -h / | awk 'NR==2{print $5}')
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    
    echo "  🔥 CPU: ${cpu_usage}%"
    echo "  🧠 Memória: ${memory_usage}%"
    echo "  💾 Disco: ${disk_usage}"
    echo "  ⚖️ Load Average: ${load_avg}"
    
    # Uptime
    echo ""
    echo "⏰ Uptime do Sistema:"
    echo "  $(uptime -p)"
    
    echo "==========================================="
}

# Função para executar verificação completa
run_health_check() {
    log_message "INFO" "Iniciando verificação de saúde do sistema"
    
    local checks_passed=0
    local total_checks=8
    
    # Executar todas as verificações
    check_containers_health && ((checks_passed++))
    check_cpu_usage && ((checks_passed++))
    check_memory_usage && ((checks_passed++))
    check_disk_usage && ((checks_passed++))
    check_load_average && ((checks_passed++))
    check_network_connectivity && ((checks_passed++))
    check_error_logs && ((checks_passed++))
    check_backup_status && ((checks_passed++))
    
    # Verificações adicionais
    check_docker_volumes
    cleanup_logs
    
    local health_percentage=$((checks_passed * 100 / total_checks))
    
    if [ "$health_percentage" -eq 100 ]; then
        log_message "INFO" "Sistema 100% saudável ($checks_passed/$total_checks verificações passaram)"
    elif [ "$health_percentage" -ge 80 ]; then
        send_alert "WARNING" "Sistema com pequenos problemas ($checks_passed/$total_checks verificações passaram - $health_percentage%)"
    else
        send_alert "CRITICAL" "Sistema com problemas sérios ($checks_passed/$total_checks verificações passaram - $health_percentage%)"
    fi
    
    log_message "INFO" "Verificação de saúde concluída"
}

# Função para modo daemon
run_daemon() {
    log_message "INFO" "Iniciando monitoramento em modo daemon (intervalo: ${CHECK_INTERVAL}s)"
    
    while true; do
        run_health_check
        sleep "$CHECK_INTERVAL"
    done
}

# Função para exibir ajuda
show_help() {
    echo "Uso: $0 [opção]"
    echo ""
    echo "Opções:"
    echo "  --daemon, -d     Executar em modo daemon (monitoramento contínuo)"
    echo "  --check, -c      Executar verificação única"
    echo "  --status, -s     Exibir relatório de status"
    echo "  --logs, -l       Exibir logs de monitoramento"
    echo "  --alerts, -a     Exibir logs de alertas"
    echo "  --help, -h       Exibir esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 --daemon     # Monitoramento contínuo"
    echo "  $0 --check      # Verificação única"
    echo "  $0 --status     # Relatório de status"
}

# Criar diretório de logs se não existir
mkdir -p "$LOG_DIR"

# Processar argumentos
case "${1:-}" in
    "--daemon"||"-d")
        run_daemon
        ;;
    "--check"||"-c")
        run_health_check
        ;;
    "--status"||"-s")
        generate_status_report
        ;;
    "--logs"||"-l")
        if [ -f "$MONITOR_LOG" ]; then
            tail -n 50 "$MONITOR_LOG"
        else
            echo "Arquivo de log não encontrado: $MONITOR_LOG"
        fi
        ;;
    "--alerts"||"-a")
        if [ -f "$ALERT_LOG" ]; then
            tail -n 50 "$ALERT_LOG"
        else
            echo "Arquivo de alertas não encontrado: $ALERT_LOG"
        fi
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