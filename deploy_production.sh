#!/bin/bash

# Script principal de deployment para produção do sistema ERP Oficina Mecânica
# Este script executa todos os passos necessários para implantar o sistema em produção

set -e  # Sair imediatamente se um comando falhar

echo "=============================================="
echo "  DEPLOYMENT DO ERP OFICINA MECÂNICA - PRODUÇÃO"
echo "=============================================="
echo "Data: $(date)"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir mensagens de progresso
progress() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

# Função para exibir sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para exibir aviso
warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Função para exibir erro
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Função para verificar dependências
check_dependencies() {
    progress "Verificando dependências..."
    
    local deps=("docker" "docker-compose" "openssl" "curl" "ufw")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        error "As seguintes dependências estão faltando:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "Instale as dependências com:"
        echo "sudo apt update && sudo apt install -y docker.io docker-compose openssl curl ufw"
        exit 1
    fi
    
    success "Todas as dependências estão instaladas"
}

# Função para verificar se o usuário está no grupo docker
check_docker_permissions() {
    progress "Verificando permissões do Docker..."
    
    if ! groups $USER | grep -q docker; then
        warning "Usuário não está no grupo docker"
        echo "Execute: sudo usermod -aG docker $USER"
        echo "Depois faça logout e login novamente"
        read -p "Pressione Enter para continuar se já fez isso..."
    fi
    
    success "Permissões do Docker verificadas"
}

# Função para criar estrutura de diretórios
create_directories() {
    progress "Criando estrutura de diretórios..."
    
    local dirs=(
        "data/postgres"
        "data/redis"
        "data/uploads"
        "data/backups"
        "secrets"
        "nginx/ssl"
        "nginx/logs"
        "nginx/cache"
        "logs"
        "scripts"
    )
    
    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
        echo "  📁 $dir"
    done
    
    success "Estrutura de diretórios criada"
}

# Função para gerar segredos seguros
generate_secrets() {
    progress "Gerando segredos seguros..."
    
    if [ ! -f ".env.production" ]; then
        error "Arquivo .env.production não encontrado!"
        exit 1
    fi
    
    # Gerar chaves seguras
    SECRET_KEY=$(openssl rand -hex 32)
    JWT_SECRET_KEY=$(openssl rand -hex 32)
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Substituir no arquivo .env.production
    sed -i "s/SUBSTITUA_POR_CHAVE_SEGURA_DE_64_CARACTERES_HEXADECIMAIS/$SECRET_KEY/g" .env.production
    sed -i "s/SUBSTITUA_POR_CHAVE_JWT_SEGURA_DE_64_CARACTERES_HEXADECIMAIS/$JWT_SECRET_KEY/g" .env.production
    sed -i "s/SUBSTITUA_POR_SENHA_SEGURA_DO_POSTGRES/$POSTGRES_PASSWORD/g" .env.production
    sed -i "s/SUBSTITUA_POR_SENHA_SEGURA_DO_REDIS/$REDIS_PASSWORD/g" .env.production
    
    # Salvar segredos em arquivo seguro
    cat > secrets/generated_secrets.txt << EOF
# Segredos gerados em $(date)
SECRET_KEY=$SECRET_KEY
JWT_SECRET_KEY=$JWT_SECRET_KEY
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
EOF
    
    chmod 600 secrets/generated_secrets.txt
    
    success "Segredos gerados e salvos em secrets/generated_secrets.txt"
}

# Função para configurar SSL
setup_ssl() {
    progress "Configurando SSL..."
    
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        warning "Certificados SSL não encontrados. Gerando certificados auto-assinados..."
        
        # Gerar certificado auto-assinado
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=BR/ST=SP/L=Toledo/O=Oficina/OU=IT/CN=localhost"
        
        warning "Certificado auto-assinado gerado. Para produção, use certificados válidos!"
    fi
    
    # Gerar parâmetros DH se não existirem
    if [ ! -f "nginx/ssl/dhparam.pem" ]; then
        progress "Gerando parâmetros Diffie-Hellman (isso pode demorar)..."
        openssl dhparam -out nginx/ssl/dhparam.pem 2048
    fi
    
    success "SSL configurado"
}

# Função para configurar firewall
setup_firewall() {
    progress "Configurando firewall..."
    
    # Verificar se UFW está instalado
    if ! command -v ufw &> /dev/null; then
        warning "UFW não está instalado. Pulando configuração do firewall."
        return
    fi
    
    # Configurar UFW
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Permitir SSH
    sudo ufw allow ssh
    
    # Permitir HTTP e HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Ativar UFW
    sudo ufw --force enable
    
    success "Firewall configurado"
}

# Função para otimizar sistema
optimize_system() {
    progress "Aplicando otimizações do sistema..."
    
    # Configurar limites do sistema
    cat > /tmp/erp-limits.conf << EOF
# Limites para ERP Oficina
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF
    
    sudo mv /tmp/erp-limits.conf /etc/security/limits.d/erp-limits.conf
    
    # Configurar parâmetros do kernel
    cat > /tmp/erp-sysctl.conf << EOF
# Otimizações para ERP Oficina
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 10
vm.swappiness = 10
EOF
    
    sudo mv /tmp/erp-sysctl.conf /etc/sysctl.d/erp-sysctl.conf
    sudo sysctl -p /etc/sysctl.d/erp-sysctl.conf
    
    success "Otimizações aplicadas"
}

# Função para configurar backup automático
setup_backup() {
    progress "Configurando backup automático..."
    
    # Criar script de backup
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# Script de backup automático
set -e

BACKUP_DIR="/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

echo "Iniciando backup em $(date)"

# Backup do banco de dados
pg_dump -h postgres -U $POSTGRES_USER -d $POSTGRES_DB > "$BACKUP_FILE"

# Comprimir backup
gzip "$BACKUP_FILE"

echo "Backup concluído: $BACKUP_FILE.gz"

# Manter apenas os últimos 7 backups
ls -t $BACKUP_DIR/backup_*.sql.gz | tail -n +8 | xargs -r rm

echo "Limpeza de backups antigos concluída"
EOF
    
    chmod +x scripts/backup.sh
    
    success "Backup automático configurado"
}

# Função para configurar monitoramento
setup_monitoring() {
    progress "Configurando monitoramento..."
    
    # Criar script de monitoramento
    cat > scripts/monitor.sh << 'EOF'
#!/bin/bash

# Script de monitoramento de saúde
set -e

check_service() {
    local service=$1
    local url=$2
    
    if curl -f -s "$url" > /dev/null; then
        echo "✅ $service está funcionando"
        return 0
    else
        echo "❌ $service não está respondendo"
        return 1
    fi
}

echo "=== Monitoramento de Saúde - $(date) ==="

# Verificar serviços
check_service "Frontend" "http://localhost/"
check_service "Backend" "http://localhost/api/health"
check_service "Nginx" "http://localhost/health"

# Verificar uso de recursos
echo ""
echo "=== Uso de Recursos ==="
echo "CPU: $(top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1)%"
echo "Memória: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
echo "Disco: $(df -h / | awk 'NR==2{printf "%s", $5}')"

# Verificar containers
echo ""
echo "=== Status dos Containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
EOF
    
    chmod +x scripts/monitor.sh
    
    success "Monitoramento configurado"
}

# Função para fazer pull das imagens
pull_images() {
    progress "Fazendo pull das imagens Docker..."
    
    docker-compose -f docker-compose.production.yml pull
    
    success "Imagens atualizadas"
}

# Função para iniciar serviços
start_services() {
    progress "Iniciando serviços..."
    
    # Parar serviços existentes
    docker-compose -f docker-compose.production.yml down --remove-orphans
    
    # Iniciar serviços
    docker-compose -f docker-compose.production.yml --env-file .env.production up -d
    
    success "Serviços iniciados"
}

# Função para verificar saúde dos serviços
check_health() {
    progress "Verificando saúde dos serviços..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Tentativa $attempt/$max_attempts..."
        
        if curl -f -s http://localhost/health > /dev/null; then
            success "Todos os serviços estão funcionando!"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    error "Serviços não estão respondendo após $max_attempts tentativas"
    return 1
}

# Função para exibir informações finais
show_final_info() {
    echo ""
    echo "=============================================="
    echo "  DEPLOYMENT CONCLUÍDO COM SUCESSO!"
    echo "=============================================="
    echo ""
    echo "🌐 Acesse o sistema em: https://localhost"
    echo "📊 Monitoramento: ./scripts/monitor.sh"
    echo "💾 Backup manual: ./scripts/backup.sh"
    echo "📋 Logs: docker-compose -f docker-compose.production.yml logs -f"
    echo ""
    echo "📁 Arquivos importantes:"
    echo "  - Configuração: .env.production"
    echo "  - Segredos: secrets/generated_secrets.txt"
    echo "  - SSL: nginx/ssl/"
    echo "  - Logs: logs/"
    echo "  - Backups: data/backups/"
    echo ""
    echo "⚠️ IMPORTANTE:"
    echo "  - Mantenha o arquivo secrets/generated_secrets.txt seguro"
    echo "  - Configure certificados SSL válidos para produção"
    echo "  - Ajuste o domínio em .env.production"
    echo "  - Configure backup externo se necessário"
    echo ""
}

# Função principal
main() {
    echo "Iniciando deployment de produção..."
    echo ""
    
    # Verificar se está executando como root
    if [ "$EUID" -eq 0 ]; then
        error "Não execute este script como root!"
        exit 1
    fi
    
    # Executar todas as etapas
    check_dependencies
    check_docker_permissions
    create_directories
    generate_secrets
    setup_ssl
    setup_firewall
    optimize_system
    setup_backup
    setup_monitoring
    pull_images
    start_services
    check_health
    show_final_info
    
    success "Deployment de produção concluído com sucesso!"
}

# Verificar argumentos
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Uso: $0 [opções]"
    echo ""
    echo "Opções:"
    echo "  --help, -h    Exibir esta ajuda"
    echo "  --force       Forçar execução sem confirmação"
    echo ""
    echo "Este script configura um ambiente de produção completo para o ERP Oficina."
    exit 0
fi

# Confirmação antes de executar
if [ "$1" != "--force" ]; then
    echo "⚠️ Este script irá configurar um ambiente de produção completo."
    echo "Isso inclui:"
    echo "  - Configuração de firewall"
    echo "  - Geração de certificados SSL"
    echo "  - Otimizações do sistema"
    echo "  - Configuração de backup automático"
    echo ""
    read -p "Deseja continuar? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Operação cancelada."
        exit 0
    fi
fi

# Executar função principal
main
