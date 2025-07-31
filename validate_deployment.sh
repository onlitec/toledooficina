#!/bin/bash

# Script de validação do deployment de produção
# Verifica se todos os serviços estão funcionando corretamente

set -e

echo "=============================================="
echo "  VALIDAÇÃO DO DEPLOYMENT DE PRODUÇÃO"
echo "=============================================="
echo "Data: $(date)"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Função para exibir progresso
progress() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

# Função para exibir sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

# Função para exibir falha
fail() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

# Função para exibir aviso
warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Função para executar teste
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    ((TOTAL_TESTS++))
    progress "Testando: $test_name"
    
    if eval "$test_command" &>/dev/null; then
        if [ "$expected_result" = "success" ]; then
            success "$test_name"
            return 0
        else
            fail "$test_name (esperado falha, mas passou)"
            return 1
        fi
    else
        if [ "$expected_result" = "fail" ]; then
            success "$test_name (falha esperada)"
            return 0
        else
            fail "$test_name"
            return 1
        fi
    fi
}

# Função para testar HTTP endpoint
test_http_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    local timeout="${4:-10}"
    
    ((TOTAL_TESTS++))
    progress "Testando endpoint: $name ($url)"
    
    local response
    local status_code
    
    response=$(curl -s -w "\n%{http_code}" --max-time "$timeout" "$url" 2>/dev/null || echo "000")
    status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "$expected_status" ]; then
        success "$name (Status: $status_code)"
        return 0
    else
        fail "$name (Esperado: $expected_status, Recebido: $status_code)"
        return 1
    fi
}

# Função para testar conectividade de banco
test_database_connection() {
    progress "Testando conexão com banco de dados..."
    
    if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U "${POSTGRES_USER:-erp_user_prod}" &>/dev/null; then
        success "Conexão com PostgreSQL"
    else
        fail "Conexão com PostgreSQL"
    fi
}

# Função para testar Redis
test_redis_connection() {
    progress "Testando conexão com Redis..."
    
    if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping &>/dev/null; then
        success "Conexão com Redis"
    else
        fail "Conexão com Redis"
    fi
}

# Função para verificar containers
check_containers() {
    progress "Verificando status dos containers..."
    
    local containers=("erp-oficina-postgres" "erp-oficina-redis" "erp-oficina-backend" "erp-oficina-frontend" "erp-oficina-nginx")
    
    for container in "${containers[@]}"; do
        if docker ps --format "{{.Names}}" | grep -q "^$container$"; then
            local status=$(docker inspect --format="{{.State.Status}}" "$container")
            if [ "$status" = "running" ]; then
                success "Container $container está rodando"
            else
                fail "Container $container não está rodando (Status: $status)"
            fi
        else
            fail "Container $container não encontrado"
        fi
    done
}

# Função para verificar volumes
check_volumes() {
    progress "Verificando volumes Docker..."
    
    local volumes=("postgres_data" "redis_data" "uploads_data" "backups_data")
    
    for volume in "${volumes[@]}"; do
        if docker volume ls --format "{{.Name}}" | grep -q "$volume"; then
            success "Volume $volume existe"
        else
            fail "Volume $volume não encontrado"
        fi
    done
}

# Função para verificar arquivos de configuração
check_config_files() {
    progress "Verificando arquivos de configuração..."
    
    local files=(
        ".env.production"
        "docker-compose.production.yml"
        "nginx/nginx.production.conf"
        "nginx/ssl/cert.pem"
        "nginx/ssl/key.pem"
        "secrets/generated_secrets.txt"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            success "Arquivo $file existe"
        else
            fail "Arquivo $file não encontrado"
        fi
    done
}

# Função para verificar permissões
check_permissions() {
    progress "Verificando permissões de arquivos..."
    
    # Verificar permissões do arquivo de segredos
    if [ -f "secrets/generated_secrets.txt" ]; then
        local perms=$(stat -c "%a" "secrets/generated_secrets.txt")
        if [ "$perms" = "600" ]; then
            success "Permissões do arquivo de segredos (600)"
        else
            fail "Permissões do arquivo de segredos incorretas ($perms, esperado 600)"
        fi
    fi
    
    # Verificar permissões dos scripts
    local scripts=("deploy_production.sh" "scripts/backup.sh" "scripts/monitor.sh")
    for script in "${scripts[@]}"; do
        if [ -f "$script" ] && [ -x "$script" ]; then
            success "Script $script é executável"
        else
            fail "Script $script não é executável ou não existe"
        fi
    done
}

# Função para verificar logs
check_logs() {
    progress "Verificando logs dos serviços..."
    
    # Verificar se há erros críticos nos logs
    local containers=("erp-oficina-backend" "erp-oficina-nginx")
    
    for container in "${containers[@]}"; do
        if docker ps --format "{{.Names}}" | grep -q "^$container$"; then
            local error_count=$(docker logs "$container" 2>&1 | grep -i "error\|critical\|fatal" | wc -l)
            if [ "$error_count" -eq 0 ]; then
                success "Sem erros críticos nos logs do $container"
            else
                warning "$error_count erros encontrados nos logs do $container"
            fi
        fi
    done
}

# Função para verificar recursos do sistema
check_system_resources() {
    progress "Verificando recursos do sistema..."
    
    # Verificar uso de memória
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local memory_threshold=90
    
    if (( $(echo "$memory_usage < $memory_threshold" | bc -l) )); then
        success "Uso de memória OK ($memory_usage%)"
    else
        warning "Uso de memória alto ($memory_usage%)"
    fi
    
    # Verificar uso de disco
    local disk_usage=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')
    local disk_threshold=85
    
    if [ "$disk_usage" -lt "$disk_threshold" ]; then
        success "Uso de disco OK ($disk_usage%)"
    else
        warning "Uso de disco alto ($disk_usage%)"
    fi
}

# Função para testar funcionalidades da API
test_api_functionality() {
    progress "Testando funcionalidades da API..."
    
    # Aguardar serviços estarem prontos
    sleep 5
    
    # Testar endpoints principais
    test_http_endpoint "Health Check" "http://localhost/api/health" "200"
    test_http_endpoint "Readiness Check" "http://localhost/api/ready" "200"
    test_http_endpoint "Liveness Check" "http://localhost/api/live" "200"
    test_http_endpoint "Frontend" "http://localhost/" "200"
    
    # Testar HTTPS (se SSL estiver configurado)
    if [ -f "nginx/ssl/cert.pem" ]; then
        test_http_endpoint "HTTPS Frontend" "https://localhost/" "200" 15
        test_http_endpoint "HTTPS API Health" "https://localhost/api/health" "200" 15
    fi
}

# Função para testar backup
test_backup_functionality() {
    progress "Testando funcionalidade de backup..."
    
    if [ -f "scripts/backup.sh" ]; then
        # Executar backup de teste
        if docker-compose -f docker-compose.production.yml --profile backup run --rm backup sh -c "echo 'Teste de backup' > /backups/test_backup.txt"; then
            success "Funcionalidade de backup"
            # Limpar arquivo de teste
            docker-compose -f docker-compose.production.yml --profile backup run --rm backup rm -f /backups/test_backup.txt
        else
            fail "Funcionalidade de backup"
        fi
    else
        warning "Script de backup não encontrado"
    fi
}

# Função para verificar segurança
check_security() {
    progress "Verificando configurações de segurança..."
    
    # Verificar se UFW está ativo
    if command -v ufw &>/dev/null; then
        if sudo ufw status | grep -q "Status: active"; then
            success "Firewall UFW está ativo"
        else
            warning "Firewall UFW não está ativo"
        fi
    else
        warning "UFW não está instalado"
    fi
    
    # Verificar headers de segurança
    if command -v curl &>/dev/null; then
        local security_headers=$(curl -s -I http://localhost/ | grep -i "x-frame-options\|x-content-type-options\|strict-transport-security")
        if [ -n "$security_headers" ]; then
            success "Headers de segurança configurados"
        else
            warning "Headers de segurança não detectados"
        fi
    fi
}

# Função para gerar relatório
generate_report() {
    echo ""
    echo "=============================================="
    echo "  RELATÓRIO DE VALIDAÇÃO"
    echo "=============================================="
    echo ""
    echo "📊 Estatísticas dos Testes:"
    echo "  Total de testes: $TOTAL_TESTS"
    echo "  Testes aprovados: $TESTS_PASSED"
    echo "  Testes falharam: $TESTS_FAILED"
    echo ""
    
    local success_rate=$((TESTS_PASSED * 100 / TOTAL_TESTS))
    echo "📈 Taxa de sucesso: $success_rate%"
    echo ""
    
    if [ "$TESTS_FAILED" -eq 0 ]; then
        echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
        echo "✅ O sistema está pronto para produção"
    elif [ "$success_rate" -ge 80 ]; then
        echo -e "${YELLOW}⚠️ A maioria dos testes passou, mas há algumas questões${NC}"
        echo "🔧 Revise os itens que falharam antes de ir para produção"
    else
        echo -e "${RED}❌ MUITOS TESTES FALHARAM${NC}"
        echo "🚨 O sistema NÃO está pronto para produção"
        echo "🔧 Corrija os problemas antes de continuar"
    fi
    
    echo ""
    echo "📋 Próximos passos:"
    if [ "$TESTS_FAILED" -eq 0 ]; then
        echo "  1. ✅ Sistema validado e pronto"
        echo "  2. 🌐 Configure seu domínio em .env.production"
        echo "  3. 🔒 Configure certificados SSL válidos"
        echo "  4. 📊 Configure monitoramento externo"
        echo "  5. 💾 Configure backup externo"
    else
        echo "  1. 🔧 Corrija os testes que falharam"
        echo "  2. 🔄 Execute a validação novamente"
        echo "  3. 📋 Verifique os logs para mais detalhes"
    fi
    
    echo ""
    echo "📁 Arquivos de log importantes:"
    echo "  - Logs da aplicação: ./logs/"
    echo "  - Logs do nginx: ./nginx/logs/"
    echo "  - Logs dos containers: docker-compose logs"
    echo ""
}

# Função principal
main() {
    echo "Iniciando validação do deployment..."
    echo ""
    
    # Verificar se o docker-compose.production.yml existe
    if [ ! -f "docker-compose.production.yml" ]; then
        echo -e "${RED}❌ Arquivo docker-compose.production.yml não encontrado!${NC}"
        echo "Execute o script de deploy primeiro: ./deploy_production.sh"
        exit 1
    fi
    
    # Executar todas as validações
    check_config_files
    check_permissions
    check_containers
    check_volumes
    test_database_connection
    test_redis_connection
    test_api_functionality
    check_logs
    check_system_resources
    test_backup_functionality
    check_security
    
    # Gerar relatório final
    generate_report
    
    # Retornar código de saída apropriado
    if [ "$TESTS_FAILED" -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Verificar argumentos
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Uso: $0 [opções]"
    echo ""
    echo "Opções:"
    echo "  --help, -h    Exibir esta ajuda"
    echo "  --quick       Executar apenas testes rápidos"
    echo "  --full        Executar todos os testes (padrão)"
    echo ""
    echo "Este script valida se o deployment de produção está funcionando corretamente."
    exit 0
fi

# Executar validação
main
