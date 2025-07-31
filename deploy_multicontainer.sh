#!/bin/bash

# Script para Deploy Multicontainer - ERP Oficina Mecânica
echo "🚀 Deploy Multicontainer - ERP Oficina Mecânica"
echo "================================================"
echo ""

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando!"
    echo "💡 Inicie o Docker e tente novamente."
    exit 1
fi
echo "✅ Docker está rodando"

# Verificar se as imagens existem no Docker Hub
echo "🔍 Verificando imagens no Docker Hub..."
docker pull onlitec/toledooficina-backend:latest
docker pull onlitec/toledooficina-frontend:latest
echo "✅ Imagens baixadas com sucesso"
echo ""

# Criar diretórios necessários
echo "📁 Criando diretórios necessários..."
mkdir -p data/postgres data/redis data/uploads data/backups logs nginx/logs nginx/cache
echo "✅ Diretórios criados"
echo ""

# Verificar se o arquivo .env.multicontainer existe
if [ ! -f ".env.multicontainer" ]; then
    echo "⚠️  Arquivo .env.multicontainer não encontrado!"
    echo "💡 Criando arquivo .env.multicontainer com valores padrão..."
    cp .env.multicontainer.example .env.multicontainer 2>/dev/null || echo "Arquivo de exemplo não encontrado"
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer down 2>/dev/null || true
echo ""

# Confirmar deploy
read -p "Deseja iniciar o deploy multicontainer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deploy cancelado pelo usuário."
    exit 0
fi

echo ""
echo "🚀 Iniciando deploy multicontainer..."
echo ""

# Subir os serviços
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer up -d

echo ""
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos containers
echo "📊 Status dos containers:"
docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer ps

echo ""
echo "🔍 Verificando saúde dos serviços..."

# Verificar PostgreSQL
echo "📊 PostgreSQL:"
docker exec erp-oficina-postgres pg_isready -U erp_user -d erp_oficina && echo "✅ PostgreSQL OK" || echo "❌ PostgreSQL com problemas"

# Verificar Redis
echo "📊 Redis:"
docker exec erp-oficina-redis redis-cli ping && echo "✅ Redis OK" || echo "❌ Redis com problemas"

# Verificar Backend
echo "📊 Backend:"
curl -f http://localhost:5000/api/health > /dev/null 2>&1 && echo "✅ Backend OK" || echo "❌ Backend com problemas"

# Verificar Frontend
echo "📊 Frontend:"
curl -f http://localhost/ > /dev/null 2>&1 && echo "✅ Frontend OK" || echo "❌ Frontend com problemas"

echo ""
echo "✅ Deploy multicontainer concluído!"
echo ""
echo "📋 Informações do Deploy:"
echo "   🌐 Frontend: http://localhost"
echo "   🔧 Backend API: http://localhost/api"
echo "   🗄️  PostgreSQL: localhost:5432"
echo "   🔄 Redis: localhost:6379"
echo ""
echo "📊 Para monitorar os logs:"
echo "   docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer logs -f"
echo ""
echo "🛑 Para parar os serviços:"
echo "   docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer down"
echo ""
echo "🔄 Para reiniciar os serviços:"
echo "   docker-compose -f docker-compose.multicontainer.yml --env-file .env.multicontainer restart"