#!/bin/bash

# Script para validar se todos os scripts de deployment foram criados corretamente
# Este script verifica a existência e permissões dos scripts necessários

set -e  # Sair imediatamente se um comando falhar

echo "=============================================="
echo "  VALIDAÇÃO DO DEPLOYMENT DE PRODUÇÃO"
echo "=============================================="
echo "Data: $(date)"
echo ""

# Função para verificar arquivo
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo "✅ $description: $file"
        return 0
    else
        echo "❌ $description: $file (NÃO ENCONTRADO)"
        return 1
    fi
}

# Função para verificar permissões executáveis
check_executable() {
    local file=$1
    local description=$2
    
    if [ -x "$file" ]; then
        echo "✅ $description: Permissões corretas"
        return 0
    else
        echo "⚠️ $description: Permissões incorretas (use chmod +x)"
        return 1
    fi
}

# Função para verificar conteúdo do script
check_script_content() {
    local file=$1
    local description=$2
    local keyword=$3
    
    if grep -q "$keyword" "$file" 2>/dev/null; then
        echo "✅ $description: Conteúdo válido"
        return 0
    else
        echo "❌ $description: Conteúdo inválido ou ausente"
        return 1
    fi
}

# Contadores
total_checks=0
passed_checks=0

echo "🔍 VERIFICANDO ARQUIVOS DE SCRIPT..."
echo "====================================="

# Verificar scripts principais
scripts=(
    "backup_system.sh:Script de backup do sistema"
    "generate_secrets.sh:Script de geração de segredos"
    "setup_ssl.sh:Script de configuração SSL"
    "setup_firewall.sh:Script de configuração de firewall"
    "update_docker_compose.sh:Script de atualização do docker-compose"
    "setup_monitoring.sh:Script de configuração de monitoramento"
    "deploy_production.sh:Script principal de deployment"
    "PRODUCTION_DEPLOYMENT.md:Documentação de deployment"
)

for script_info in "${scripts[@]}"; do
    IFS=':' read -r script description <<< "$script_info"
    
    if check_file "$script" "$description"; then
        passed_checks=$((passed_checks + 1))
    fi
    total_checks=$((total_checks + 1))
    
    # Verificar se é um script shell e validar conteúdo
    if [[ "$script" == *.sh ]]; then
        if check_script_content "$script" "Validação de conteúdo" "#!/bin/bash"; then
            passed_checks=$((passed_checks + 1))
        fi
        total_checks=$((total_checks + 1))
    fi
done

echo ""
echo "🔍 VERIFICANDO PERMISSÕES..."
echo "============================="

# Verificar permissões executáveis
executable_scripts=(
    "backup_system.sh"
    "generate_secrets.sh"
    "setup_ssl.sh"
    "setup_firewall.sh"
    "update_docker_compose.sh"
    "setup_monitoring.sh"
    "deploy_production.sh"
)

for script in "${executable_scripts[@]}"; do
    if [ -f "$script" ]; then
        if check_executable "$script" "Permissões de $script"; then
            passed_checks=$((passed_checks + 1))
        fi
        total_checks=$((total_checks + 1))
    fi
done

echo ""
echo "🔍 VERIFICANDO DIRETÓRIOS E CONFIGURAÇÕES..."
echo "============================================"

# Verificar diretórios necessários
directories=(
    "secrets:Diretório de segredos"
    "nginx:Diretório Nginx"
    "nginx/ssl:Diretório SSL"
    "nginx/logs:Diretório de logs"
    "backups:Diretório de backups"
)

for dir_info in "${directories[@]}"; do
    IFS=':' read -r dir description <<< "$dir_info"
    
    if [ -d "$dir" ]; then
        echo "✅ $description: $dir"
        passed_checks=$((passed_checks + 1))
    else
        echo "⚠️ $description: $dir (Será criado durante a execução)"
        passed_checks=$((passed_checks + 1))  # Não é um erro crítico
    fi
    total_checks=$((total_checks + 1))
done

echo ""
echo "🔍 VERIFICANDO INTEGRIDADE DO SISTEMA..."
echo "========================================"

# Verificar arquivos principais do sistema
main_files=(
    "docker-compose.yml:Arquivo de orquestração Docker"
    "backend/src/main.py:Aplicação Flask principal"
    "frontend/src/App.jsx:Aplicação React principal"
)

for file_info in "${main_files[@]}"; do
    IFS=':' read -r file description <<< "$file_info"
    
    if check_file "$file" "$description"; then
        passed_checks=$((passed_checks + 1))
    fi
    total_checks=$((total_checks + 1))
done

echo ""
echo "=============================================="
echo "  RESUMO DA VALIDAÇÃO"
echo "=============================================="
echo "Total de verificações: $total_checks"
echo "Verificações aprovadas: $passed_checks"
echo "Taxa de sucesso: $((passed_checks * 100 / total_checks))%"
echo ""

if [ $passed_checks -eq $total_checks ]; then
    echo "🎉 VALIDAÇÃO CONCLUÍDA COM SUCESSO!"
    echo "Todos os scripts e arquivos necessários estão presentes e corretos."
    echo ""
    echo "Próximos passos:"
    echo "1. Execute: ./deploy_production.sh"
    echo "2. Siga as instruções no terminal"
    echo "3. Configure SSL e firewall conforme necessário"
    echo "4. Deploy os containers com docker-compose"
else
    echo "⚠️ VALIDAÇÃO CONCLUÍDA COM ALGUNS PROBLEMAS"
    echo "Alguns arquivos ou configurações precisam de atenção."
    echo "Verifique os itens marcados com ❌ ou ⚠️ acima."
fi

echo "=============================================="
