#!/bin/bash

# Script para gerar segredos seguros para o sistema ERP Oficina Mecânica
# Este script cria segredos aleatórios e seguros para uso em produção

set -e  # Sair imediatamente se um comando falhar

echo "=== GERAÇÃO DE SEGREDOS SEGURAS ==="
echo "Data: $(date)"
echo "==================================="

# Criar diretório de secrets se não existir
SECRETS_DIR="./secrets"
if [ ! -d "$SECRETS_DIR" ]; then
    echo "Criando diretório de secrets..."
    mkdir -p "$SECRETS_DIR"
fi

# 1. Gerar SECRET_KEY para Flask
echo "1. Gerando SECRET_KEY para Flask..."
FLASK_SECRET_KEY=$(openssl rand -base64 32 | tr -d '/+=' | cut -c1-50)
echo "$FLASK_SECRET_KEY" > "${SECRETS_DIR}/flask_secret_key"
echo "   SECRET_KEY gerada e salva em: ${SECRETS_DIR}/flask_secret_key"

# 2. Gerar senha segura para PostgreSQL
echo "2. Gerando senha segura para PostgreSQL..."
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | cut -c1-32)
echo "$POSTGRES_PASSWORD" > "${SECRETS_DIR}/postgres_password"
echo "   Senha PostgreSQL gerada e salva em: ${SECRETS_DIR}/postgres_password"

# 3. Gerar senha para usuário admin do sistema
echo "3. Gerando senha para usuário admin do sistema..."
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d '/+=' | cut -c1-16)
echo "$ADMIN_PASSWORD" > "${SECRETS_DIR}/admin_password"
echo "   Senha admin gerada e salva em: ${SECRETS_DIR}/admin_password"

# 4. Gerar JWT secret para autenticação
echo "4. Gerando JWT secret para autenticação..."
JWT_SECRET=$(openssl rand -base64 32 | tr -d '/+=' | cut -c1-50)
echo "$JWT_SECRET" > "${SECRETS_DIR}/jwt_secret"
echo "   JWT secret gerado e salva em: ${SECRETS_DIR}/jwt_secret"

# 5. Criar arquivo .env com as variáveis de ambiente
echo "5. Criando arquivo .env com variáveis de ambiente..."
cat > .env << EOF
# Variáveis de ambiente para produção - Gerado em $(date)
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=$(cat ${SECRETS_DIR}/flask_secret_key)
DATABASE_URL=postgresql://erp_user:$(cat ${SECRETS_DIR}/postgres_password)@postgres:5432/erp_oficina
POSTGRES_PASSWORD=$(cat ${SECRETS_DIR}/postgres_password)
ADMIN_PASSWORD=$(cat ${SECRETS_DIR}/admin_password)
JWT_SECRET=$(cat ${SECRETS_DIR}/jwt_secret)

# Configurações de segurança adicionais
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=Lax
EOF

echo "   Arquivo .env criado com variáveis de ambiente"

# 6. Definir permissões restritivas para os arquivos de secrets
echo "6. Definindo permissões restritivas para os arquivos de secrets..."
chmod 600 ${SECRETS_DIR}/*
chmod 600 .env

echo ""
echo "=== SEGREDOS GERADOS COM SUCESSO ==="
echo "Segredos salvos no diretório: $SECRETS_DIR"
echo "Arquivo .env criado com variáveis de ambiente"
echo ""
echo "SEGURANÇA IMPORTANTE:"
echo "- Mantenha os arquivos em $SECRETS_DIR em local seguro"
echo "- Nunca commite estes arquivos para repositórios públicos"
echo "- Faça backup seguro destes arquivos"
echo "===================================="

# Exibir resumo dos segredos gerados (sem revelar os valores)
echo ""
echo "Resumo dos segredos gerados:"
echo "- SECRET_KEY: $(cat ${SECRETS_DIR}/flask_secret_key | wc -c) caracteres"
echo "- PostgreSQL Password: $(cat ${SECRETS_DIR}/postgres_password | wc -c) caracteres"
echo "- Admin Password: $(cat ${SECRETS_DIR}/admin_password | wc -c) caracteres"
echo "- JWT Secret: $(cat ${SECRETS_DIR}/jwt_secret | wc -c) caracteres"
