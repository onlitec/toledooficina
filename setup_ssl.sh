#!/bin/bash

# Script para configurar SSL/HTTPS para o sistema ERP Oficina Mecânica
# Este script cria certificados autoassinados ou prepara para Let's Encrypt

set -e  # Sair imediatamente se um comando falhar

echo "=== CONFIGURAÇÃO DE SSL/HTTPS ==="
echo "Data: $(date)"
echo "=================================="

# Verificar se OpenSSL está instalado
if ! command -v openssl &> /dev/null; then
    echo "ERRO: OpenSSL não está instalado. Por favor, instale-o primeiro."
    exit 1
fi

# Criar diretório SSL se não existir
SSL_DIR="./nginx/ssl"
if [ ! -d "$SSL_DIR" ]; then
    echo "Criando diretório SSL..."
    mkdir -p "$SSL_DIR"
fi

# Perguntar ao usuário qual tipo de certificado deseja gerar
echo "Escolha o tipo de certificado SSL:"
echo "1) Certificado autoassinado (para testes/desenvolvimento)"
echo "2) Preparar para Let's Encrypt (requer domínio e acesso SSH)"
echo ""

read -p "Digite sua escolha (1 ou 2): " choice

case $choice in
    1)
        echo "Gerando certificado autoassinado..."
        
        # Gerar chave privada
        echo "1. Gerando chave privada..."
        openssl genrsa -out "${SSL_DIR}/privkey.pem" 2048
        
        # Gerar certificado autoassinado
        echo "2. Gerando certificado autoassinado..."
        openssl req -new -x509 -key "${SSL_DIR}/privkey.pem" -out "${SSL_DIR}/fullchain.pem" -days 365 -subj "/C=BR/ST=SaoPaulo/L=SaoPaulo/O=ERP Oficina Mecanica/CN=localhost"
        
        echo "Certificados autoassinados gerados:"
        echo "- Chave privada: ${SSL_DIR}/privkey.pem"
        echo "- Certificado: ${SSL_DIR}/fullchain.pem"
        
        echo ""
        echo "AVISO DE SEGURANÇA:"
        echo "Certificados autoassinados NÃO são recomendados para produção."
        echo "Os navegadores mostrarão avisos de segurança."
        echo "Use apenas para testes."
        ;;
        
    2)
        echo "Preparando para Let's Encrypt..."
        echo ""
        echo "Para usar Let's Encrypt, você precisará:"
        echo "1. Ter um domínio registrado (ex: erp.suaempresa.com.br)"
        echo "2. Apontar o DNS do domínio para este servidor"
        echo "3. Ter acesso SSH ao servidor"
        echo ""
        echo "Instruções para instalar certbot e obter certificados:"
        echo ""
        echo "# Instalar certbot (Ubuntu/Debian)"
        echo "sudo apt update"
        echo "sudo apt install certbot"
        echo ""
        echo "# Obter certificado (standalone)"
        echo "sudo certbot certonly --standalone -d erp.suaempresa.com.br"
        echo ""
        echo "# Os certificados serão salvos em /etc/letsencrypt/live/erp.suaempresa.com.br/"
        echo ""
        echo "Depois de obter os certificados, copie-os para o diretório SSL:"
        echo "sudo cp /etc/letsencrypt/live/erp.suaempresa.com.br/privkey.pem ${SSL_DIR}/"
        echo "sudo cp /etc/letsencrypt/live/erp.suaempresa.com.br/fullchain.pem ${SSL_DIR}/"
        echo "sudo chown \$(whoami):\$(whoami) ${SSL_DIR}/privkey.pem ${SSL_DIR}/fullchain.pem"
        echo "sudo chmod 600 ${SSL_DIR}/privkey.pem"
        echo "sudo chmod 644 ${SSL_DIR}/fullchain.pem"
        ;;
        
    *)
        echo "Opção inválida. Saindo."
        exit 1
        ;;
esac

echo ""
echo "=== CONFIGURAÇÃO SSL CONCLUÍDA ==="
echo "Diretório SSL: $SSL_DIR"
echo "=================================="
