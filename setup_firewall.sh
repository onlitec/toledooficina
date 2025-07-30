#!/bin/bash

# Script para configurar firewall para o sistema ERP Oficina Mecânica
# Este script configura o firewall UFW para proteger o servidor

set -e  # Sair imediatamente se um comando falhar

echo "=== CONFIGURAÇÃO DE FIREWALL (UFW) ==="
echo "Data: $(date)"
echo "====================================="

# Verificar se UFW está instalado
if ! command -v ufw &> /dev/null; then
    echo "AVISO: UFW não está instalado."
    echo "Instalando UFW..."
    
    # Detectar sistema operacional
    if [ -f /etc/debian_version ]; then
        sudo apt update
        sudo apt install -y ufw
    elif [ -f /etc/redhat-release ]; then
        sudo yum install -y ufw
    else
        echo "ERRO: Sistema operacional não suportado para instalação automática do UFW."
        echo "Por favor, instale o UFW manualmente e execute este script novamente."
        exit 1
    fi
fi

# Verificar status do UFW
echo "Verificando status do UFW..."
ufw_status=$(sudo ufw status | head -1)
echo "Status atual do UFW: $ufw_status"

# Perguntar ao usuário se deseja configurar o firewall
echo ""
echo "Este script irá configurar o UFW com as seguintes regras:"
echo "- Permitir SSH (porta 22)"
echo "- Permitir HTTP (porta 80)"
echo "- Permitir HTTPS (porta 443)"
echo "- Negar todas as outras conexões por padrão"
echo ""

read -p "Deseja continuar com a configuração do firewall? (s/n): " confirm

if [[ $confirm != "s" && $confirm != "S" ]]; then
    echo "Configuração do firewall cancelada."
    exit 0
fi

# Configurar o firewall
echo "Configurando o firewall..."

# Resetar regras existentes (opcional)
echo "Resetando regras existentes..."
sudo ufw --force reset

# Definir políticas padrão
echo "Definindo políticas padrão..."
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir portas essenciais
echo "Permitindo portas essenciais..."

# SSH
echo "Permitindo SSH (porta 22)..."
sudo ufw allow ssh

# HTTP
echo "Permitindo HTTP (porta 80)..."
sudo ufw allow 80/tcp

# HTTPS
echo "Permitindo HTTPS (porta 443)..."
sudo ufw allow 443/tcp

# Permitir porta para desenvolvimento local (se necessário)
echo "Permitindo porta de desenvolvimento local (7080)..."
sudo ufw allow 7080/tcp

# Habilitar o firewall
echo "Habilitando o firewall..."
echo "y" | sudo ufw --force enable

# Verificar status final
echo ""
echo "=== STATUS FINAL DO FIREWALL ==="
sudo ufw status numbered

echo ""
echo "=== CONFIGURAÇÃO DE FIREWALL CONCLUÍDA ==="
echo "O firewall UFW foi configurado com sucesso."
echo "Regras aplicadas:"
echo "- SSH (22/tcp): Permitido"
echo "- HTTP (80/tcp): Permitido"
echo "- HTTPS (443/tcp): Permitido"
echo "- Desenvolvimento (7080/tcp): Permitido"
echo "- Todas as outras: Bloqueadas"
echo ""
echo "Para visualizar ou modificar regras no futuro:"
echo "sudo ufw status"
echo "sudo ufw allow <porta>"
echo "sudo ufw deny <porta>"
echo "sudo ufw delete <número_da_regra>"
echo "=========================================="
