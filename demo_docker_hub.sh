#!/bin/bash

# Script de demonstração - Docker Hub ERP Oficina
# Mostra como usar as imagens separadas por ambiente

echo "🐳 Demonstração Docker Hub - ERP Oficina Mecânica"
echo "================================================="
echo ""
echo "Este script demonstra como usar as imagens Docker Hub"
echo "separadas por ambiente (desenvolvimento e produção)."
echo ""

# Função para mostrar menu
show_menu() {
    echo "🎯 Selecione uma opção:"
    echo ""
    echo "1) 🔧 Executar ambiente de DESENVOLVIMENTO"
    echo "2) 🚀 Executar ambiente de PRODUÇÃO"
    echo "3) 📥 Baixar apenas as imagens"
    echo "4) 📋 Listar imagens disponíveis"
    echo "5) 🧹 Limpar ambientes"
    echo "6) ❌ Sair"
    echo ""
    read -p "Escolha uma opção (1-6): " choice
}

# Função para executar desenvolvimento
run_development() {
    echo ""
    echo "🔧 Executando ambiente de DESENVOLVIMENTO..."
    echo "============================================="
    echo ""
    
    if [ ! -f "docker-compose.hub-dev.yml" ]; then
        echo "📥 Baixando docker-compose.hub-dev.yml..."
        wget -q https://raw.githubusercontent.com/onlitec/toledooficina/main/docker-compose.hub-dev.yml
    fi
    
    if [ ! -f ".env.hub-dev" ]; then
        echo "📥 Baixando .env.hub-dev..."
        wget -q https://raw.githubusercontent.com/onlitec/toledooficina/main/.env.hub-dev
    fi
    
    echo "🚀 Iniciando containers de desenvolvimento..."
    docker-compose -f docker-compose.hub-dev.yml --env-file .env.hub-dev up -d
    
    echo ""
    echo "✅ Ambiente de desenvolvimento iniciado!"
    echo ""
    echo "🌐 Acesso:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:3000/api"
    echo "   Banco: PostgreSQL na porta padrão (interno)"
    echo "   Cache: Redis na porta padrão (interno)"
    echo ""
    echo "📋 Containers criados:"
    docker ps | grep "dev" | awk '{print "   " $1 " - " $(NF)}'
}

# Função para executar produção
run_production() {
    echo ""
    echo "🚀 Executando ambiente de PRODUÇÃO..."
    echo "====================================="
    echo ""
    
    if [ ! -f "docker-compose.hub-prod.yml" ]; then
        echo "📥 Baixando docker-compose.hub-prod.yml..."
        wget -q https://raw.githubusercontent.com/onlitec/toledooficina/main/docker-compose.hub-prod.yml
    fi
    
    if [ ! -f ".env.hub-prod" ]; then
        echo "📥 Baixando .env.hub-prod..."
        wget -q https://raw.githubusercontent.com/onlitec/toledooficina/main/.env.hub-prod
        echo ""
        echo "⚠️  IMPORTANTE: Configure o arquivo .env.hub-prod antes de continuar!"
        echo "   Edite as senhas, domínio e outras configurações de produção."
        echo ""
        read -p "Deseja editar o arquivo agora? (y/N): " edit_env
        if [[ $edit_env =~ ^[Yy]$ ]]; then
            nano .env.hub-prod
        fi
    fi
    
    echo "🚀 Iniciando containers de produção..."
    docker-compose -f docker-compose.hub-prod.yml --env-file .env.hub-prod up -d
    
    echo ""
    echo "✅ Ambiente de produção iniciado!"
    echo ""
    echo "🌐 Acesso:"
    echo "   Frontend: http://seu-dominio.com (configure no .env.hub-prod)"
    echo "   Backend API: http://seu-dominio.com/api"
    echo "   HTTPS: https://seu-dominio.com (se SSL configurado)"
    echo ""
    echo "📋 Containers criados:"
    docker ps | grep "prod" | awk '{print "   " $1 " - " $(NF)}'
}

# Função para baixar imagens
download_images() {
    echo ""
    echo "📥 Baixando imagens do Docker Hub..."
    echo "==================================="
    echo ""
    
    echo "🔧 Baixando imagens de desenvolvimento..."
    docker pull onlitec/toledooficina-backend:dev
    docker pull onlitec/toledooficina-frontend:dev
    docker pull postgres:15-alpine
    docker pull redis:7-alpine
    
    echo ""
    echo "🚀 Baixando imagens de produção..."
    docker pull onlitec/toledooficina-backend:latest
    docker pull onlitec/toledooficina-frontend:latest
    docker pull nginx:alpine
    
    echo ""
    echo "✅ Download concluído!"
    echo ""
    echo "📋 Imagens baixadas:"
    docker images | grep -E "(onlitec|postgres|redis|nginx)" | head -10
}

# Função para listar imagens
list_images() {
    echo ""
    echo "📋 Imagens Docker Hub disponíveis"
    echo "================================="
    echo ""
    echo "🔧 DESENVOLVIMENTO:"
    echo "   onlitec/toledooficina-backend:dev"
    echo "   onlitec/toledooficina-backend:latest-dev"
    echo "   onlitec/toledooficina-frontend:dev"
    echo "   onlitec/toledooficina-frontend:latest-dev"
    echo ""
    echo "🚀 PRODUÇÃO:"
    echo "   onlitec/toledooficina-backend:latest"
    echo "   onlitec/toledooficina-backend:prod"
    echo "   onlitec/toledooficina-backend:v1.2"
    echo "   onlitec/toledooficina-frontend:latest"
    echo "   onlitec/toledooficina-frontend:prod"
    echo "   onlitec/toledooficina-frontend:v1.2"
    echo ""
    echo "🗃️ INFRAESTRUTURA:"
    echo "   postgres:15-alpine"
    echo "   redis:7-alpine"
    echo "   nginx:alpine"
    echo ""
    echo "📋 Imagens locais:"
    docker images | grep -E "(onlitec|postgres|redis|nginx)" || echo "   Nenhuma imagem encontrada localmente"
}

# Função para limpar ambientes
clean_environments() {
    echo ""
    echo "🧹 Limpeza de ambientes"
    echo "======================="
    echo ""
    echo "⚠️  Esta operação irá parar e remover containers!"
    echo ""
    echo "1) Limpar apenas desenvolvimento"
    echo "2) Limpar apenas produção"
    echo "3) Limpar ambos os ambientes"
    echo "4) Voltar ao menu principal"
    echo ""
    read -p "Escolha uma opção (1-4): " clean_choice
    
    case $clean_choice in
        1)
            echo "🧹 Limpando ambiente de desenvolvimento..."
            docker-compose -f docker-compose.hub-dev.yml down -v 2>/dev/null || echo "Ambiente de desenvolvimento não estava rodando"
            echo "✅ Desenvolvimento limpo!"
            ;;
        2)
            echo "🧹 Limpando ambiente de produção..."
            docker-compose -f docker-compose.hub-prod.yml down 2>/dev/null || echo "Ambiente de produção não estava rodando"
            echo "✅ Produção limpa!"
            ;;
        3)
            echo "🧹 Limpando ambos os ambientes..."
            docker-compose -f docker-compose.hub-dev.yml down -v 2>/dev/null || echo "Desenvolvimento não estava rodando"
            docker-compose -f docker-compose.hub-prod.yml down 2>/dev/null || echo "Produção não estava rodando"
            echo "✅ Ambos os ambientes limpos!"
            ;;
        4)
            return
            ;;
        *)
            echo "❌ Opção inválida!"
            ;;
    esac
}

# Loop principal
while true; do
    show_menu
    
    case $choice in
        1)
            run_development
            ;;
        2)
            run_production
            ;;
        3)
            download_images
            ;;
        4)
            list_images
            ;;
        5)
            clean_environments
            ;;
        6)
            echo ""
            echo "👋 Obrigado por usar o ERP Oficina Mecânica!"
            echo "🔗 Links úteis:"
            echo "   Backend: https://hub.docker.com/r/onlitec/toledooficina-backend"
            echo "   Frontend: https://hub.docker.com/r/onlitec/toledooficina-frontend"
            echo "   Documentação: https://github.com/onlitec/toledooficina"
            echo ""
            exit 0
            ;;
        *)
            echo "❌ Opção inválida! Tente novamente."
            ;;
    esac
    
    echo ""
    read -p "Pressione Enter para continuar..."
    clear
done