#!/bin/bash

# Script para executar o ERP Oficina Mecânica
echo "🚀 ERP Oficina Mecânica - Executando Aplicação"
echo "=============================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
     Erro: docker-compose.yml não encontrado!"echo "
    exit 1
fi

echo "📁 Diretório: $(pwd)"
echo "✅ Arquivo docker-compose.yml encontrado"
echo ""

# Verificar permissões do Docker
echo "🔐 Verificando permissões do Docker..."
if docker ps >/dev/null 2>&1; then
    echo "✅ Docker funcionando sem sudo"
    USE_SUDO=""
elif sudo docker ps >/dev/null 2>&1; then
    echo "⚠️  Docker requer sudo - usando sudo para comandos Docker"
    USE_SUDO="sudo "
else
    echo "❌ Erro: Docker não está funcionando"
    echo "🔧 Para resolver: sudo usermod -aG docker $USER && newgrp docker"
    exit 1
fi

echo ""

# Parar containers existentes
echo "🛑 Parando containers existentes..."
${USE_SUDO}docker-compose down 2>/dev/null || true

echo ""

# Construir e executar containers
echo "🏗️  Construindo e executando containers..."
echo "Isso pode levar alguns minutos..."
echo ""

if ${USE_SUDO}docker-compose up --build -d; then
    echo ""
    echo "✅ Containers iniciados com sucesso!"
    echo ""
    
    # Aguardar containers iniciarem
    echo "⏳ Aguardando containers iniciarem..."
    sleep 15
    
    # Verificar status
    echo "📊 Status dos containers:"
    ${USE_SUDO}docker-compose ps
    echo ""
    
    echo "🎉 ERP Oficina Mecânica está executando!"
    echo ""
    echo "🌐 Acessos:"
    echo "   • Frontend: http://localhost"
    echo "   • Backend:  http://localhost/api"
    echo ""
    echo "🔧 Comandos úteis:"
    echo "   • Ver logs:     ${USE_SUDO}docker-compose logs -f"
     Parar:        ${USE_SUDO}docker-compose down"echo "   
    echo "   • Status:       ${USE_SUDO}docker-compose ps"
    echo ""
    
else
    echo "❌ Erro ao iniciar containers!"
    echo "🔍 Para diagnosticar: ${USE_SUDO}docker-compose logs"
    exit 1
fi
