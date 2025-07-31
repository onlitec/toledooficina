#!/bin/bash

# Script para fazer push das imagens Docker para o Docker Hub
# Organiza imagens por ambiente: desenvolvimento e produção
echo "🐳 Push das Imagens Docker - ERP Oficina Mecânica"
echo "================================================"
echo ""

# Verificar se as imagens existem
echo "🔍 Verificando imagens locais..."
docker images | grep -E "(REPOSITORY|toledooficina)"
echo ""

# Verificar se está logado no Docker Hub
echo "🔐 Verificando autenticação no Docker Hub..."
if ! docker info | grep -q "Username:"; then
    echo "❌ Você não está logado no Docker Hub!"
    echo "💡 Execute: docker login"
    exit 1
fi
echo "✅ Autenticado no Docker Hub"
echo ""

# Selecionar ambiente
echo "🎯 Selecione o ambiente para push:"
echo "1) Desenvolvimento (dev)"
echo "2) Produção (prod)"
echo "3) Ambos"
read -p "Escolha uma opção (1-3): " choice
echo ""

case $choice in
    1)
        ENVIRONMENT="dev"
        TAGS=("dev" "latest-dev")
        echo "📦 Ambiente selecionado: DESENVOLVIMENTO"
        ;;
    2)
        ENVIRONMENT="prod"
        TAGS=("prod" "latest" "v1.2")
        echo "📦 Ambiente selecionado: PRODUÇÃO"
        ;;
    3)
        ENVIRONMENT="both"
        TAGS=("dev" "latest-dev" "prod" "latest" "v1.2")
        echo "📦 Ambiente selecionado: DESENVOLVIMENTO + PRODUÇÃO"
        ;;
    *)
        echo "❌ Opção inválida!"
        exit 1
        ;;
esac

echo ""

# Confirmar push
read -p "Deseja fazer push das imagens para o Docker Hub? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Push cancelado pelo usuário."
    exit 0
fi

echo ""
echo "🚀 Iniciando push das imagens..."
echo ""

# Função para fazer tag e push
push_image() {
    local service=$1
    local tag=$2
    
    echo "📤 Fazendo push: onlitec/toledooficina-${service}:${tag}"
    
    # Fazer tag da imagem local
    docker tag toledooficina-${service}:latest onlitec/toledooficina-${service}:${tag}
    
    # Push para Docker Hub
    docker push onlitec/toledooficina-${service}:${tag}
    
    if [ $? -eq 0 ]; then
        echo "✅ Push concluído: onlitec/toledooficina-${service}:${tag}"
    else
        echo "❌ Erro no push: onlitec/toledooficina-${service}:${tag}"
    fi
    echo ""
}

# Push Backend
echo "🔧 === BACKEND ==="
for tag in "${TAGS[@]}"; do
    push_image "backend" "$tag"
done

# Push Frontend
echo "🎨 === FRONTEND ==="
for tag in "${TAGS[@]}"; do
    push_image "frontend" "$tag"
done

echo "✅ Push concluído com sucesso!"
echo ""
echo "📋 Estratégia de Tags no Docker Hub:"
echo ""
echo "🔧 DESENVOLVIMENTO:"
echo "   • onlitec/toledooficina-backend:dev"
echo "   • onlitec/toledooficina-backend:latest-dev"
echo "   • onlitec/toledooficina-frontend:dev"
echo "   • onlitec/toledooficina-frontend:latest-dev"
echo ""
echo "🚀 PRODUÇÃO:"
echo "   • onlitec/toledooficina-backend:prod"
echo "   • onlitec/toledooficina-backend:latest"
echo "   • onlitec/toledooficina-backend:v1.2"
echo "   • onlitec/toledooficina-frontend:prod"
echo "   • onlitec/toledooficina-frontend:latest"
echo "   • onlitec/toledooficina-frontend:v1.2"
echo ""
echo "💡 COMO USAR:"
echo ""
echo "Para DESENVOLVIMENTO:"
echo "   docker pull onlitec/toledooficina-backend:dev"
echo "   docker pull onlitec/toledooficina-frontend:dev"
echo ""
echo "Para PRODUÇÃO:"
echo "   docker pull onlitec/toledooficina-backend:latest"
echo "   docker pull onlitec/toledooficina-frontend:latest"
echo ""
echo "🔗 Links Docker Hub:"
echo "   Backend: https://hub.docker.com/r/onlitec/toledooficina-backend"
echo "   Frontend: https://hub.docker.com/r/onlitec/toledooficina-frontend"
