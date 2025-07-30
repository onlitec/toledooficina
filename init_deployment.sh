#!/bin/bash

# Script de inicialização do deployment de produção
# Este script configura a estrutura de diretórios e permissões necessárias

set -e  # Sair imediatamente se um comando falhar

echo "=============================================="
echo "  INICIALIZAÇÃO DO DEPLOYMENT DE PRODUÇÃO"
echo "=============================================="
echo "Data: $(date)"
echo ""

# Criar diretórios necessários
echo "📁 Criando estrutura de diretórios..."
mkdir -p secrets
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p backups

echo "✅ Diretórios criados:"
echo "   - secrets/"
echo "   - nginx/ssl/"
echo "   - nginx/logs/"
echo "   - backups/"
echo ""

# Tornar todos os scripts executáveis
echo "🔧 Configurando permissões dos scripts..."
chmod +x *.sh

echo "✅ Permissões configuradas para todos os scripts"
echo ""

# Verificar se OpenSSL está disponível
echo "🔍 Verificando dependências..."
if command -v openssl &> /dev/null; then
    echo "✅ OpenSSL disponível"
else
    echo "⚠️ OpenSSL não encontrado - alguns recursos podem ser limitados"
fi

# Verificar se Docker está disponível
if command -v docker &> /dev/null; then
    echo "✅ Docker disponível"
else
    echo "⚠️ Docker não encontrado - instale Docker para executar o sistema"
fi

# Verificar se Docker Compose está disponível
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose disponível"
else
    echo "⚠️ Docker Compose não encontrado - instale Docker Compose para executar o sistema"
fi

echo ""
echo "=============================================="
echo "  INICIALIZAÇÃO CONCLUÍDA!"
echo "=============================================="
echo ""
echo "Estrutura pronta para deployment de produção."
echo ""
echo "Próximos passos:"
echo "1. Execute o script de validação:"
echo "   ./validate_deployment.sh"
echo ""
echo "2. Execute o deployment completo:"
echo "   ./deploy_production.sh"
echo ""
echo "3. Siga as instruções no terminal para:"
echo "   - Configurar SSL/HTTPS"
echo "   - Configurar firewall"
echo "   - Deploy dos containers"
echo ""
echo "Documentação completa disponível em:"
echo "   PRODUCTION_DEPLOYMENT.md"
echo ""
echo "=============================================="
