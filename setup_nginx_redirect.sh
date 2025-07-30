#!/bin/bash

# Script para configurar redirecionamento nginx para o ERP
# IP do ERP: 172.20.120.44

echo "🔧 Configurando redirecionamento nginx para ERP..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

# Parar o nginx se estiver rodando
echo "📦 Parando nginx se estiver rodando..."
docker-compose --profile production stop nginx 2>/dev/null || true

# Remover container nginx antigo
echo "🗑️ Removendo container nginx antigo..."
docker-compose --profile production rm -f nginx 2>/dev/null || true

# Criar diretórios necessários
echo "📁 Criando diretórios necessários..."
mkdir -p nginx/logs
mkdir -p nginx/ssl

# Gerar certificados SSL auto-assinados se não existirem
if [ ! -f "nginx/ssl/server.crt" ] || [ ! -f "nginx/ssl/server.key" ]; then
    echo "🔐 Gerando certificados SSL auto-assinados..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/server.key \
        -out nginx/ssl/server.crt \
        -subj "/C=BR/ST=State/L=City/O=Organization/CN=localhost"
fi

# Iniciar nginx com a nova configuração
echo "🚀 Iniciando nginx com redirecionamento..."
docker-compose --profile production up -d nginx

# Verificar status
echo "📊 Verificando status do nginx..."
sleep 5
if docker-compose --profile production ps nginx | grep -q "Up"; then
    echo "✅ Nginx configurado com sucesso!"
    echo "📍 Redirecionamento configurado:"
    echo "   - Porta 80 (HTTP) -> 172.20.120.44:7080"
    echo "   - Porta 443 (HTTPS) -> 172.20.120.44:7080"
    echo ""
    echo "🌐 Acesse o ERP através de:"
    echo "   - http://seu-servidor"
    echo "   - https://seu-servidor"
else
    echo "❌ Erro ao iniciar nginx. Verificando logs..."
    docker-compose --profile production logs nginx
    exit 1
fi

echo "✨ Configuração concluída!"