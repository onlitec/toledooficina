#!/bin/bash

# Script de Deploy para Coolify - ERP Oficina
# Este script aplica as correções necessárias para resolver os erros de deploy

set -e

echo "🚀 Iniciando deploy para Coolify..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    log_error "docker-compose.yml não encontrado. Execute este script no diretório raiz do projeto."
    exit 1
fi

# 1. Backup dos arquivos originais
log_info "Fazendo backup dos arquivos originais..."
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
cp docker-compose.yml backup/$(date +%Y%m%d_%H%M%S)/
cp .env backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
cp nginx/nginx.coolify.conf backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# 2. Aplicar correções no docker-compose.yml
log_info "Aplicando correções no docker-compose.yml..."

# Verificar se já existe a versão corrigida
if [ -f "docker-compose.coolify.yml" ]; then
    log_info "Usando docker-compose.coolify.yml otimizado"
    cp docker-compose.coolify.yml docker-compose.yml
else
    log_warn "docker-compose.coolify.yml não encontrado, aplicando correções manuais..."
    
    # Remover mapeamento de porta 80 do nginx
    sed -i 's/- "80:80"/# - "80:80" # Removido para Coolify/' docker-compose.yml
    
    # Adicionar expose ao invés de ports
    if ! grep -q "expose:" docker-compose.yml; then
        sed -i '/ports:/a\      expose:' docker-compose.yml
    fi
fi

# 3. Configurar variáveis de ambiente
log_info "Configurando variáveis de ambiente..."

if [ -f ".env.coolify" ]; then
    log_info "Usando .env.coolify otimizado"
    cp .env.coolify .env
else
    log_warn "Adicionando variáveis faltantes ao .env..."
    
    # Adicionar variável Pass se não existir
    if ! grep -q "Pass=" .env 2>/dev/null; then
        echo "" >> .env
        echo "# Variável Pass para Coolify" >> .env
        echo "Pass=coolify-auth-pass" >> .env
    fi
    
    # Adicionar RANDOM_ID se não existir
    if ! grep -q "RANDOM_ID=" .env 2>/dev/null; then
        echo "RANDOM_ID=$(date +%s)" >> .env
    fi
fi

# 4. Otimizar configuração do nginx
log_info "Otimizando configuração do nginx..."

if [ -f "nginx/nginx.coolify.optimized.conf" ]; then
    log_info "Usando configuração otimizada do nginx"
    cp nginx/nginx.coolify.optimized.conf nginx/nginx.coolify.conf
fi

# 5. Limpar containers e imagens antigas
log_info "Limpando containers e imagens antigas..."

# Parar containers se estiverem rodando
docker-compose down 2>/dev/null || true

# Remover containers órfãos
docker system prune -f

# Remover imagens antigas do projeto
docker images | grep -E "(toledooficina|oficina)" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

# 6. Verificar portas em uso
log_info "Verificando portas em uso..."

if netstat -tulpn 2>/dev/null | grep -q ":80 "; then
    log_warn "Porta 80 está em uso. Isso pode causar conflitos."
    log_info "Serviços usando porta 80:"
    netstat -tulpn 2>/dev/null | grep ":80 " || true
fi

# 7. Construir imagens
log_info "Construindo imagens Docker..."
docker-compose build --no-cache

# 8. Validar configuração
log_info "Validando configuração..."
docker-compose config > /dev/null

if [ $? -eq 0 ]; then
    log_info "✅ Configuração válida!"
else
    log_error "❌ Erro na configuração do docker-compose.yml"
    exit 1
fi

# 9. Mostrar resumo das correções
echo ""
log_info "📋 Resumo das correções aplicadas:"
echo "   ✅ Backup dos arquivos originais criado"
echo "   ✅ Mapeamento de porta 80 removido do nginx"
echo "   ✅ Variáveis de ambiente configuradas"
echo "   ✅ Configuração do nginx otimizada"
echo "   ✅ Containers antigos removidos"
echo "   ✅ Imagens reconstruídas"
echo ""

# 10. Instruções finais
log_info "🎯 Próximos passos:"
echo "   1. Faça commit das alterações:"
echo "      git add ."
echo "      git commit -m 'fix: correções para deploy no Coolify'"
echo "      git push"
echo ""
echo "   2. No Coolify:"
echo "      - Faça redeploy da aplicação"
echo "      - Verifique se as variáveis de ambiente estão configuradas"
echo "      - Monitore os logs durante o deploy"
echo ""
echo "   3. Para testar localmente:"
echo "      docker-compose up -d"
echo ""

log_info "✨ Deploy preparado com sucesso para o Coolify!"