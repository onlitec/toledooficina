#!/bin/bash

# Script para fazer push das imagens Docker para o Docker Hub
echo "🐳 Push das Imagens Docker - ERP Oficina Mecânica"
echo "================================================"
echo ""

# Verificar se as imagens existem
echo "🔍 Verificando imagens locais..."
docker images | grep -E "(REPOSITORY|onlitec/toledooficina)"
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

# Push Backend
echo "📤 Fazendo push do Backend..."
docker push onlitec/toledooficina-backend:latest
docker push onlitec/toledooficina-backend:v1.0

echo ""

# Push Frontend  
echo "📤 Fazendo push do Frontend..."
docker push onlitec/toledooficina-frontend:latest
docker push onlitec/toledooficina-frontend:v1.0

echo "✅ Push concluído com sucesso!"
echo ""
echo "📋 Imagens no Docker Hub:"
echo "   • onlitec/toledooficina-backend:latest"
echo "   • onlitec/toledooficina-backend:v1.0"
echo "   • onlitec/toledooficina-frontend:latest"
echo "   • onlitec/toledooficina-frontend:v1.0"
echo ""
echo "🚀 Para usar no Coolify, configure:"
echo "   Backend: onlitec/toledooficina-backend:latest"
echo "   Frontend: onlitec/toledooficina-frontend:latest"
