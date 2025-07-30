# Release Notes - ERP Oficina Mecânica

## Versão 1.1 - 27/07/2025

### 🎉 Novas Funcionalidades

#### 📧 **Configuraçeeeees de Notificações por E-mail**
- ✅ Campo para múltiplos destinatários de e-mail (separados por vírgula)
- ✅ Configuração de eventos para notificação:
  - Nova OS criada
  - OS concluída
  - OS cancelada
  - Vencimento de OS
  - Estoque baixo
  - Contas a vencer
  - Contas vencidas
  - Backup realizado
- ✅ Interface com checkboxes para ativar/desativar eventos específicos

#### 📱 **Configurações de Notificações por WhatsApp**
- ✅ Campo para URL da API WhatsApp
- ✅ Campo para token de acesso (protegido)
- ✅ Campo para número de destino (com código do país)
- ✅ Botão de teste para verificar conectividade
- ✅ Interface preparada para templates personalizáveis

#### ⏰ **Configurações de Tempo**
- ✅ Dias de antecedência para vencimento de OS
- ✅ Dias de antecedência para contas a vencer
- ✅ Nel mínimo de estoque para alertas

### 🔧 **Melhorias e Correções**

#### 🔤 **Correções de Texto**
- ✅ Corrigido "Notificaeeeees" → "Notificações"
- ✅ Corrigido "Configuraçeeeees" → "Configurações"
- ✅ Corrigido "configuraeeeees" → "configurações"

#### 🎨 **Interface do Usuário**
- ✅ Layout responsivo com seções bem organizadas
- ✅ Ícones coloridos para diferentes tipos de notificação
- ✅ Campos agrupados logicamente por funcionalidade
- ✅ Feedback visual melhorado

### 🚀 **Melhorias Técnicas**

#### 🔗 **Backend**
- ✅ Rotas completas para configurações (/api/configuracoes/*)
- ✅ Modelos de dados para empresa, email, notificações e sistema
- ✅ Validação de dados e tratamento de erros
-  Suporte a teste de configurações SMTP

#### 🎯 **Frontend**
- ✅ Componente de configurações completamente reescrito
- ✅ Estados gerenciados para todas as seções
- ✅ Integração completa com API do backend
- ✅ Interface responsiva e moderna

### 📦 **Docker Images**

#### 🐳 **Imagens Disponíveis no DockerHub**
- `onlitec/toledooficina-frontend:v1.1`
- `onlitec/toledooficina-frontend:latest`
- `onlitec/toledooficina-backend:v1.1`
- `onlitec/toledooficina-backend:latest`

### 🔄 **Como Atualizar**

#### Para desenvolvimento local:
```bash
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

#### Para produção:
```bash
docker pull onlitec/toledooficina-frontend:v1.1
docker pull onlitec/toledooficina-backend:v1.1
# Reiniciar containers com as novas imagens
```

---

**Data de Release:** 27 de Julho de 2025  
**Versão:** 1.1  
**Compatibilidade:** Totalmente compatível com versão 1.0
