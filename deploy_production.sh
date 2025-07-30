#!/bin/bash

# Script principal de deployment para produção do sistema ERP Oficina Mecânica
# Este script executa todos os passos necessários para implantar o sistema em produção

set -e  # Sair imediatamente se um comando falhar

echo "=============================================="
echo "  DEPLOYMENT DO ERP OFICINA MECÂNICA - PRODUÇÃO"
echo "=============================================="
echo "Data: $(date)"
echo ""

# Função para exibir mensagens de progresso
progress() {
    echo "[$(date +%H:%M:%S)] $1"
}

# Função para verificar dependências
check_dependencies() {
    progress "Verificando dependências..."
    
    local deps=("docker" "openssl" "curl")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo "ERRO: As seguintes dependências estão faltando:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "Por favor, instale as dependências e execute o script novamente."
        exit 1
    fi
    
    progress "Todas as dependências estão instaladas"
}

# Função para executar script com verificação
run_script() {
    local script_name=$1
    local description=$2
    
    progress "Executando: $description"
    
    if [ ! -f "$script_name" ]; then
        echo "ERRO: Script $script_name não encontrado!"
        exit 1
    fi
    
    # Tornar o script executável
    chmod +x "$script_name"
    
    # Executar o script
    if ./"$script_name"; then
        progress "$description concluído com sucesso"
    else
        echo "ERRO: Falha ao executar $script_name"
        exit 1
    fi
    
    echo ""
}

# Verificar dependências
check_dependencies

# Etapa 1: Backup do sistema atual
run_script "backup_system.sh" "Backup do sistema"

# Etapa 2: Geração de segredos seguros
run_script "generate_secrets.sh" "Geração de segredos seguros"

# Etapa 3: Configuração de SSL/HTTPS
echo "Etapa 3: Configuração de SSL/HTTPS"
progress "Para configurar SSL, execute manualmente o script ./setup_ssl.sh"
progress "Escolha o tipo de certificado apropriado para seu ambiente"
echo ""

# Etapa 4: Configuração do firewall
echo "Etapa 4: Configuração do firewall"
progress "Para configurar o firewall, execute manualmente o script ./setup_firewall.sh"
progress "Isso requer permissões sudo e deve ser feito com cuidado"
echo ""

# Etapa 5: Atualização do docker-compose para produção
run_script "update_docker_compose.sh" "Atualização do docker-compose para produção"

# Etapa 6: Configuração de monitoramento
run_script "setup_monitoring.sh" "Configuração de monitoramento e logging"

# Etapa 7: Instruções finais
echo "=============================================="
echo "  INSTRUÇÕES FINAIS DE DEPLOYMENT"
echo "=============================================="
echo ""

progress "1. Configuração de SSL"
echo "   Execute: ./setup_ssl.sh"
echo "   Siga as instruções para configurar certificados SSL"
echo ""

progress "2. Configuração do firewall"
echo "   Execute: sudo ./setup_firewall.sh"
echo "   Isso requer permissões sudo"
echo ""

progress "3. Deployment dos containers"
echo "   Execute um dos seguintes comandos:"
echo "   "
echo "   Para desenvolvimento:"
echo "     docker-compose up --build -d"
echo "   "
echo "   Para produção (com PostgreSQL e Redis):"
echo "     docker-compose --profile production up --build -d"
echo ""

progress "4. Verificação do deployment"
echo "   Verifique os logs:"
echo "     docker-compose logs -f"
echo "   "
echo "   Verifique os serviços:"
echo "     docker-compose ps"
echo "   "
echo "   Teste a conectividade:"
echo "     curl -f http://localhost/api/health"
echo ""

progress "5. Monitoramento contínuo"
echo "   Os seguintes scripts foram configurados para execução automática:"
echo "   - Monitoramento de saúde (a cada 30 minutos)"
echo "   - Rotação de logs (diariamente)"
echo "   - Backup automático (semanalmente)"
echo ""

progress "6. Acesso ao sistema"
echo "   Após o deployment, acesse:"
echo "   - Frontend: http://localhost (ou seu domínio)"
echo "   - Backend API: http://localhost/api"
echo "   - Documentação da API: http://localhost/api/docs (se disponível)"
echo ""

echo "=============================================="
echo "  DEPLOYMENT CONCLUÍDO COM SUCESSO!"
echo "=============================================="
echo ""
echo "Próximos passos:"
echo "1. Configure SSL: ./setup_ssl.sh"
echo "2. Configure firewall: sudo ./setup_firewall.sh"
echo "3. Deploy os containers: docker-compose up -d"
echo "4. Verifique o funcionamento"
echo ""
echo "Para qualquer problema, consulte os logs em ./nginx/logs/"
