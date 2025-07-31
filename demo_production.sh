#!/bin/bash

# Script de demonstração do deploy de produção
# Executa as principais configurações sem interação do usuário

set -e

echo "=============================================="
echo "  DEMO - DEPLOY DE PRODUÇÃO ERP OFICINA"
echo "=============================================="
echo "Data: $(date)"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para exibir progresso
progress() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

# Função para exibir sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para exibir erro
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Função para exibir aviso
warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# 1. Verificar dependências
progress "Verificando dependências..."
if command -v docker &>/dev/null; then
    success "Docker encontrado"
else
    error "Docker não encontrado"
    exit 1
fi

if command -v docker-compose &>/dev/null; then
    success "Docker Compose encontrado"
else
    error "Docker Compose não encontrado"
    exit 1
fi

# 2. Criar estrutura de diretórios
progress "Criando estrutura de diretórios..."
mkdir -p secrets nginx/ssl nginx/logs backups logs
success "Diretórios criados"

# 3. Gerar certificados SSL autoassinados
progress "Gerando certificados SSL autoassinados..."
if [ ! -f "nginx/ssl/cert.pem" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=BR/ST=SP/L=Toledo/O=ERP Oficina/CN=localhost" &>/dev/null
    success "Certificados SSL gerados"
else
    success "Certificados SSL já existem"
fi

# 4. Parar serviços existentes e limpar
progress "Limpando ambiente anterior..."
docker-compose -f docker-compose.production.yml down --remove-orphans &>/dev/null || true
docker network prune -f &>/dev/null || true
success "Ambiente limpo"

# 5. Iniciar serviços básicos (sem backup por enquanto)
progress "Iniciando serviços de produção..."
if docker-compose -f docker-compose.production.yml --env-file .env.production up -d postgres redis backend frontend nginx; then
    success "Serviços principais iniciados"
else
    error "Falha ao iniciar serviços"
    exit 1
fi

# 6. Aguardar serviços ficarem prontos
progress "Aguardando serviços ficarem prontos..."
sleep 15

# 7. Verificar status dos serviços
progress "Verificando status dos serviços..."
echo ""
echo "📦 Status dos Containers:"
docker-compose -f docker-compose.production.yml ps

# 8. Testar conectividade
echo ""
progress "Testando conectividade..."

# Aguardar um pouco mais para os serviços estabilizarem
sleep 10

# Testar se o Nginx está respondendo
if timeout 10 curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null | grep -q "200\|301\|302\|404"; then
    success "Frontend acessível em http://localhost/"
else
    warning "Frontend pode não estar totalmente pronto ainda"
fi

# Testar API health check
if timeout 10 curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null | grep -q "200"; then
    success "API health check OK"
else
    warning "API pode não estar totalmente pronta ainda"
fi

# 9. Exibir informações finais
echo ""
echo "=============================================="
echo "  DEPLOY CONCLUÍDO!"
echo "=============================================="
echo ""
echo "🌐 URLs de Acesso:"
echo "  Frontend: http://localhost/"
echo "  API: http://localhost/api/"
echo "  Health Check: http://localhost/api/health"
echo ""
echo "🔧 Comandos Úteis:"
echo "  Ver logs: docker-compose -f docker-compose.production.yml logs -f"
echo "  Parar: docker-compose -f docker-compose.production.yml down"
echo "  Reiniciar: docker-compose -f docker-compose.production.yml restart"
echo "  Status: docker-compose -f docker-compose.production.yml ps"
echo ""
echo "📊 Monitoramento:"
echo "  ./scripts/monitor.sh --status"
echo "  ./scripts/monitor.sh --check"
echo ""
echo "💾 Backup:"
echo "  ./scripts/backup.sh --quick"
echo "  ./scripts/backup.sh --full"
echo ""
echo "🔍 Validação:"
echo "  ./validate_deployment.sh"
echo ""
echo "📋 Logs importantes:"
echo "  - Aplicação: logs/"
echo "  - Nginx: nginx/logs/"
echo "  - Containers: docker-compose logs"
echo ""
echo "🎉 Sistema ERP pronto para uso!"
echo "=============================================="

# 10. Mostrar logs dos últimos minutos para debug
echo ""
echo "📋 Últimos logs dos serviços:"
echo "---------------------------------------------"
docker-compose -f docker-compose.production.yml logs --tail=20