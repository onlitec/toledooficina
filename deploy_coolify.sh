#!/bin/bash

# Deploy script para Coolify - ERP Oficina Mecânica
# Este script prepara o projeto para deploy no Coolify

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.coolify.yml" ]; then
    log_error "Arquivo docker-compose.coolify.yml não encontrado!"
    log_error "Execute este script no diretório raiz do projeto."
    exit 1
fi

log_info "Iniciando preparação para deploy no Coolify..."

# 1. Verificar dependências
log_info "Verificando dependências..."

if ! command -v docker &> /dev/null; then
    log_error "Docker não está instalado!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose não está instalado!"
    exit 1
fi

log_success "Dependências verificadas"

# 2. Criar arquivo .env.coolify se não existir
if [ ! -f ".env.coolify" ]; then
    log_info "Criando arquivo .env.coolify..."
    cat > .env.coolify << EOF
# Configurações para Coolify - ERP Oficina Mecânica

# Segurança
SECRET_KEY=sua-chave-secreta-super-segura-aqui-$(openssl rand -hex 32)
JWT_SECRET_KEY=sua-chave-jwt-super-segura-aqui-$(openssl rand -hex 32)

# API URL (ajuste conforme seu domínio)
VITE_API_URL=https://oficina.onlitec.com.br/api

# Banco de dados
POSTGRES_DB=erp_oficina
POSTGRES_USER=erp_user
POSTGRES_PASSWORD=erp_password_2024_$(openssl rand -hex 16)

# Ambiente
FLASK_ENV=production
FLASK_DEBUG=0
ENVIRONMENT=production
EOF
    log_success "Arquivo .env.coolify criado"
else
    log_warning "Arquivo .env.coolify já existe"
fi

# 3. Verificar estrutura de arquivos
log_info "Verificando estrutura de arquivos..."

required_files=(
    "docker-compose.coolify.yml"
    "nginx/nginx.coolify.conf"
    "frontend/Dockerfile.coolify"
    "frontend/nginx.coolify.conf"
    "backend/Dockerfile"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "Arquivo obrigatório não encontrado: $file"
        exit 1
    fi
done

log_success "Estrutura de arquivos verificada"

# 4. Testar build local (opcional)
read -p "Deseja testar o build localmente? (y/N): " test_build
if [[ $test_build =~ ^[Yy]$ ]]; then
    log_info "Testando build local..."
    
    # Build apenas do frontend e backend para teste
    docker-compose -f docker-compose.coolify.yml build frontend backend
    
    if [ $? -eq 0 ]; then
        log_success "Build local concluído com sucesso"
    else
        log_error "Falha no build local"
        exit 1
    fi
fi

# 5. Instruções para o Coolify
log_success "Preparação concluída!"
echo ""
log_info "=== INSTRUÇÕES PARA O COOLIFY ==="
echo ""
echo "1. No Coolify, configure o projeto com:"
echo "   - Docker Compose File: docker-compose.coolify.yml"
echo "   - Domínio: oficina.onlitec.com.br"
echo "   - SSL: Habilitado"
echo ""
echo "2. Configure as seguintes variáveis de ambiente:"
echo "   (Copie do arquivo .env.coolify criado)"
echo ""
echo "3. Variáveis importantes:"
echo "   - SECRET_KEY: $(grep SECRET_KEY .env.coolify | cut -d'=' -f2)"
echo "   - JWT_SECRET_KEY: $(grep JWT_SECRET_KEY .env.coolify | cut -d'=' -f2)"
echo "   - VITE_API_URL: https://oficina.onlitec.com.br/api"
echo ""
echo "4. Após o deploy, verifique:"
echo "   - Frontend: https://oficina.onlitec.com.br/"
echo "   - API Health: https://oficina.onlitec.com.br/api/health"
echo "   - Nginx Health: https://oficina.onlitec.com.br/health"
echo ""
log_info "=== FIM DAS INSTRUÇÕES ==="
echo ""
log_success "Deploy preparado para o Coolify!"

# 6. Criar arquivo de resumo
cat > COOLIFY_SETUP.md << EOF
# Setup Coolify - ERP Oficina Mecânica

## Arquivos Criados
- \`docker-compose.coolify.yml\` - Docker Compose específico para Coolify
- \`nginx/nginx.coolify.conf\` - Configuração do Nginx principal
- \`frontend/Dockerfile.coolify\` - Dockerfile do frontend para Coolify
- \`frontend/nginx.coolify.conf\` - Configuração do Nginx do frontend
- \`.env.coolify\` - Variáveis de ambiente para Coolify

## Configuração no Coolify

1. **Docker Compose File**: \`docker-compose.coolify.yml\`
2. **Domínio**: \`oficina.onlitec.com.br\`
3. **SSL**: Habilitado
4. **Porta**: 80 (nginx)

## Variáveis de Ambiente

Copie as variáveis do arquivo \`.env.coolify\` para o Coolify.

## Verificação Pós-Deploy

- Frontend: https://oficina.onlitec.com.br/
- API: https://oficina.onlitec.com.br/api/health
- Health Check: https://oficina.onlitec.com.br/health

## Troubleshooting

Se o site ainda mostrar o backend:
1. Verifique se o nginx está rodando
2. Verifique se o domínio aponta para a porta 80 do nginx
3. Verifique os logs dos containers
EOF

log_success "Arquivo COOLIFY_SETUP.md criado com instruções detalhadas"