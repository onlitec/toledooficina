# 🏭 ERP Oficina - Versão de Produção

## 📋 Visão Geral

Este é o sistema ERP completo para oficinas mecânicas, configurado para ambiente de produção com alta disponibilidade, segurança e performance otimizada.

## 🚀 Características da Versão de Produção

### 🔧 Tecnologias
- **Backend**: Flask + Gunicorn + PostgreSQL
- **Frontend**: React + Nginx
- **Cache**: Redis
- **Proxy**: Nginx com SSL/TLS
- **Orquestração**: Docker Compose
- **Monitoramento**: Scripts automatizados
- **Backup**: Sistema automatizado

### 🛡️ Segurança
- ✅ SSL/TLS configurado
- ✅ Firewall UFW
- ✅ Headers de segurança
- ✅ Secrets gerenciados
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Validação de entrada

### 📊 Performance
- ✅ Cache Redis
- ✅ Compressão Gzip
- ✅ Otimizações de banco
- ✅ Load balancing ready
- ✅ CDN ready
- ✅ Logs estruturados

### 🔄 Operações
- ✅ Health checks
- ✅ Monitoramento automático
- ✅ Backup automático
- ✅ Rotação de logs
- ✅ Alertas configurados

## 📁 Estrutura do Projeto

```
toledooficina/
├── 📂 backend/                    # Aplicação Flask
│   ├── 📂 src/
│   │   ├── 📂 models/             # Modelos do banco
│   │   ├── 📂 routes/             # Rotas da API
│   │   ├── 📂 database/           # Configurações do banco
│   │   └── 📄 main.py             # Aplicação principal
│   ├── 📄 requirements.txt        # Dependências Python
│   ├── 📄 config.py              # Configurações de produção
│   ├── 📄 gunicorn.conf.py       # Configuração Gunicorn
│   └── 📄 Dockerfile.production   # Dockerfile otimizado
├── 📂 frontend/                   # Aplicação React
│   ├── 📂 src/
│   ├── 📄 package.json
│   └── 📄 Dockerfile
├── 📂 nginx/                      # Configurações Nginx
│   ├── 📄 nginx.production.conf   # Configuração de produção
│   ├── 📂 ssl/                    # Certificados SSL
│   └── 📂 logs/                   # Logs do Nginx
├── 📂 scripts/                    # Scripts de operação
│   ├── 📄 monitor.sh              # Monitoramento
│   └── 📄 backup.sh               # Backup automático
├── 📂 secrets/                    # Arquivos de segredos
├── 📂 backups/                    # Backups do sistema
├── 📂 logs/                       # Logs da aplicação
├── 📄 docker-compose.production.yml  # Orquestração de produção
├── 📄 .env.production             # Variáveis de ambiente
├── 📄 deploy_production.sh        # Script de deploy
├── 📄 validate_deployment.sh      # Validação do deploy
└── 📄 README_PRODUCTION.md        # Este arquivo
```

## 🚀 Deploy Rápido

### 1. Pré-requisitos

```bash
# Instalar Docker e Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar dependências adicionais
sudo apt install -y ufw openssl curl bc
```

### 2. Deploy Automático

```bash
# Executar script de deploy
./deploy_production.sh
```

O script irá:
- ✅ Verificar dependências
- ✅ Criar estrutura de diretórios
- ✅ Gerar secrets seguros
- ✅ Configurar SSL
- ✅ Configurar firewall
- ✅ Otimizar sistema
- ✅ Iniciar serviços
- ✅ Validar deployment

### 3. Validação

```bash
# Validar deployment
./validate_deployment.sh
```

## 🔧 Configuração Manual

### 1. Variáveis de Ambiente

Edite o arquivo `.env.production`:

```bash
# Configurações principais
DOMAIN=seu-dominio.com
EMAIL_ADMIN=admin@seu-dominio.com

# Banco de dados
POSTGRES_PASSWORD=sua_senha_super_segura

# JWT
JWT_SECRET_KEY=sua_chave_jwt_super_segura

# Email (opcional)
SMTP_SERVER=smtp.gmail.com
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua_senha_app
```

### 2. SSL/TLS

#### Certificados Let's Encrypt (Recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem nginx/ssl/key.pem
sudo chown $USER:$USER nginx/ssl/*.pem
```

#### Certificados Autoassinados (Desenvolvimento)

```bash
# Gerar certificados (já incluído no deploy_production.sh)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=BR/ST=State/L=City/O=Organization/CN=localhost"
```

### 3. Firewall

```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw status
```

## 🎛️ Operação e Manutenção

### 📊 Monitoramento

```bash
# Monitoramento contínuo
./scripts/monitor.sh --daemon

# Verificação única
./scripts/monitor.sh --check

# Status do sistema
./scripts/monitor.sh --status

# Ver logs de monitoramento
./scripts/monitor.sh --logs

# Ver alertas
./scripts/monitor.sh --alerts
```

### 💾 Backup

```bash
# Backup completo
./scripts/backup.sh --full

# Backup rápido (apenas banco)
./scripts/backup.sh --quick

# Backup específico
./scripts/backup.sh --database
./scripts/backup.sh --uploads
./scripts/backup.sh --configs

# Listar backups
./scripts/backup.sh --list

# Restaurar backup
./scripts/backup.sh --restore backups/database/db_backup_20231201_120000.sql.gz

# Relatório de backups
./scripts/backup.sh --report
```

### 🔄 Gerenciamento de Serviços

```bash
# Ver status dos serviços
docker-compose -f docker-compose.production.yml ps

# Ver logs
docker-compose -f docker-compose.production.yml logs -f

# Reiniciar serviços
docker-compose -f docker-compose.production.yml restart

# Parar serviços
docker-compose -f docker-compose.production.yml down

# Iniciar serviços
docker-compose -f docker-compose.production.yml up -d

# Atualizar imagens
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

### 📋 Logs

```bash
# Logs da aplicação
tail -f logs/app.log

# Logs do Nginx
tail -f nginx/logs/access.log
tail -f nginx/logs/error.log

# Logs dos containers
docker-compose -f docker-compose.production.yml logs backend
docker-compose -f docker-compose.production.yml logs nginx
docker-compose -f docker-compose.production.yml logs postgres
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Serviços não iniciam

```bash
# Verificar logs
docker-compose -f docker-compose.production.yml logs

# Verificar recursos
df -h
free -h

# Verificar portas
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

#### 2. Banco de dados não conecta

```bash
# Verificar container do PostgreSQL
docker-compose -f docker-compose.production.yml exec postgres pg_isready

# Conectar ao banco
docker-compose -f docker-compose.production.yml exec postgres psql -U erp_user_prod -d erp_oficina_prod

# Verificar logs do banco
docker-compose -f docker-compose.production.yml logs postgres
```

#### 3. SSL não funciona

```bash
# Verificar certificados
ls -la nginx/ssl/
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Testar SSL
curl -I https://localhost/
openssl s_client -connect localhost:443
```

#### 4. Performance baixa

```bash
# Verificar recursos
top
htop
iostat

# Verificar cache Redis
docker-compose -f docker-compose.production.yml exec redis redis-cli info

# Verificar conexões do banco
docker-compose -f docker-compose.production.yml exec postgres psql -U erp_user_prod -d erp_oficina_prod -c "SELECT count(*) FROM pg_stat_activity;"
```

### 🆘 Comandos de Emergência

```bash
# Parar tudo imediatamente
docker-compose -f docker-compose.production.yml down

# Backup de emergência
./scripts/backup.sh --quick

# Restaurar último backup
latest_backup=$(find backups/database -name "*.sql.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
./scripts/backup.sh --restore "$latest_backup"

# Reiniciar sistema completo
sudo reboot
```

## 📈 Otimizações Avançadas

### 1. Performance do Banco

```sql
-- Conectar ao PostgreSQL e executar:

-- Índices importantes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_veiculos_cliente_id ON veiculos(cliente_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_servicos_data ON servicos(data_servico);

-- Estatísticas
ANALYZE;

-- Vacuum
VACUUM ANALYZE;
```

### 2. Cache Redis

```bash
# Configurar cache mais agressivo
docker-compose -f docker-compose.production.yml exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
docker-compose -f docker-compose.production.yml exec redis redis-cli CONFIG SET maxmemory 512mb
```

### 3. Nginx

```nginx
# Adicionar ao nginx.production.conf

# Cache de arquivos estáticos
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Compressão adicional
gzip_types
    text/plain
    text/css
    text/js
    text/xml
    text/javascript
    application/javascript
    application/xml+rss
    application/json;
```

## 🔐 Segurança Avançada

### 1. Fail2Ban

```bash
# Instalar Fail2Ban
sudo apt install -y fail2ban

# Configurar para Nginx
sudo tee /etc/fail2ban/jail.local << EOF
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /home/alfreire/toledooficina/nginx/logs/error.log
maxretry = 3
bantime = 3600
EOF

sudo systemctl restart fail2ban
```

### 2. Monitoramento de Intrusão

```bash
# Instalar AIDE
sudo apt install -y aide
sudo aideinit
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Verificação diária
echo "0 2 * * * root /usr/bin/aide --check" | sudo tee -a /etc/crontab
```

### 3. Auditoria

```bash
# Logs de acesso
tail -f nginx/logs/access.log | grep -E "(POST|PUT|DELETE)"

# Logs de erro
tail -f nginx/logs/error.log

# Logs da aplicação
tail -f logs/app.log | grep -E "(ERROR|WARNING)"
```

## 📅 Manutenção Programada

### Crontab Recomendado

```bash
# Editar crontab
crontab -e

# Adicionar tarefas
# Backup diário às 2:00
0 2 * * * /home/alfreire/toledooficina/scripts/backup.sh --full >> /home/alfreire/toledooficina/logs/cron.log 2>&1

# Monitoramento a cada 5 minutos
*/5 * * * * /home/alfreire/toledooficina/scripts/monitor.sh --check >> /home/alfreire/toledooficina/logs/cron.log 2>&1

# Limpeza de logs semanalmente
0 3 * * 0 find /home/alfreire/toledooficina/logs -name "*.log" -mtime +7 -delete

# Atualização de certificados SSL mensalmente
0 4 1 * * sudo certbot renew --quiet

# Reinicialização semanal (opcional)
0 5 * * 0 /usr/bin/docker-compose -f /home/alfreire/toledooficina/docker-compose.production.yml restart
```

## 🌐 Configuração de Domínio

### 1. DNS

```
# Configurar registros DNS:
A     seu-dominio.com        IP_DO_SERVIDOR
CNAME www.seu-dominio.com    seu-dominio.com
CNAME api.seu-dominio.com    seu-dominio.com
```

### 2. Cloudflare (Opcional)

```
# Configurações recomendadas:
- SSL/TLS: Full (strict)
- Always Use HTTPS: On
- HSTS: Enabled
- Minify: CSS, JS, HTML
- Brotli: Enabled
- Caching Level: Standard
```

## 📞 Suporte

### Contatos
- **Desenvolvedor**: [Seu Nome]
- **Email**: [seu-email@dominio.com]
- **Documentação**: Este arquivo
- **Issues**: GitHub Issues

### Logs Importantes
- **Aplicação**: `logs/app.log`
- **Nginx**: `nginx/logs/access.log`, `nginx/logs/error.log`
- **Monitoramento**: `logs/monitor.log`
- **Backup**: `logs/backup.log`
- **Alertas**: `logs/alerts.log`

### Comandos Úteis

```bash
# Status geral
./validate_deployment.sh

# Monitoramento
./scripts/monitor.sh --status

# Backup
./scripts/backup.sh --report

# Logs em tempo real
docker-compose -f docker-compose.production.yml logs -f

# Recursos do sistema
htop
df -h
free -h
```

---

## 🎉 Sistema Pronto para Produção!

O ERP Oficina está configurado com:

✅ **Alta Disponibilidade**: Containers otimizados com health checks  
✅ **Segurança**: SSL, firewall, secrets, headers de segurança  
✅ **Performance**: Cache Redis, compressão, otimizações de banco  
✅ **Monitoramento**: Scripts automatizados com alertas  
✅ **Backup**: Sistema automatizado com retenção  
✅ **Logs**: Estruturados e rotacionados  
✅ **Manutenção**: Scripts de operação e troubleshooting  

**Acesse seu sistema em**: `https://seu-dominio.com`

**Painel de administração**: `https://seu-dominio.com/admin`

**API**: `https://seu-dominio.com/api`

---

*Desenvolvido com ❤️ para oficinas mecânicas*