# 🚀 Deployment de Produção - ERP Oficina Mecânica

Este documento explica como utilizar os scripts automatizados para implantar o sistema ERP Oficina Mecânica em um ambiente de produção seguro.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Scripts Disponíveis](#scripts-disponíveis)
4. [Ordem de Execução](#ordem-de-execução)
5. [Instruções Detalhadas](#instruções-detalhadas)
6. [Monitoramento](#monitoramento)
7. [Segurança](#segurança)
8. [Backup e Recuperação](#backup-e-recuperação)

## 🎯 Visão Geral

Os scripts automatizados neste diretório implementam todas as práticas recomendadas de segurança e configuração para produção, incluindo:

- Geração automática de segredos seguros
- Configuração de SSL/HTTPS
- Firewall UFW
- Monitoramento de saúde dos serviços
- Rotação automática de logs
- Backup automático
- Configuração de variáveis de ambiente seguras

## ⚙️ Pré-requisitos

Antes de executar os scripts, certifique-se de ter:

```bash
# Sistema operacional Linux (Ubuntu/Debian recomendado)
# Docker e Docker Compose instalados
sudo apt update
sudo apt install docker.io docker-compose openssl curl ufw

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
# (faça logout e login novamente)
```

## 📜 Scripts Disponíveis

| Script | Descrição | Execução |
|--------|-----------|----------|
| `backup_system.sh` | Backup completo do sistema | `./backup_system.sh` |
| `generate_secrets.sh` | Gera segredos seguros | `./generate_secrets.sh` |
| `setup_ssl.sh` | Configura SSL/HTTPS | `./setup_ssl.sh` |
| `setup_firewall.sh` | Configura firewall UFW | `sudo ./setup_firewall.sh` |
| `update_docker_compose.sh` | Atualiza configuração para produção | `./update_docker_compose.sh` |
| `setup_monitoring.sh` | Configura monitoramento | `./setup_monitoring.sh` |
| `deploy_production.sh` | Orquestra todo o deployment | `./deploy_production.sh` |

## ▶️ Ordem de Execução

1. **Backup do sistema atual**
2. **Geração de segredos seguros**
3. **Configuração de SSL/HTTPS**
4. **Configuração do firewall**
5. **Atualização do docker-compose**
6. **Configuração de monitoramento**
7. **Deployment dos containers**

## 📝 Instruções Detalhadas

### 1. Backup do Sistema

```bash
# Executar backup antes de qualquer alteração
./backup_system.sh
```

Este script cria backups de:
- `docker-compose.yml`
- Arquivos `.env`
- Diretório `nginx`
- Banco de dados SQLite (se em uso)
- Configurações do frontend

### 2. Geração de Segredos

```bash
# Gerar segredos seguros automaticamente
./generate_secrets.sh
```

Este script cria:
- `SECRET_KEY` para Flask
- Senha segura para PostgreSQL
- Senha para usuário admin
- JWT secret para autenticação
- Arquivo `.env` com variáveis de ambiente

### 3. Configuração de SSL/HTTPS

```bash
# Configurar certificados SSL
./setup_ssl.sh
```

Opções disponíveis:
1. Certificado autoassinado (para testes)
2. Preparação para Let's Encrypt (para produção)

### 4. Configuração do Firewall

```bash
# Configurar firewall UFW (requer sudo)
sudo ./setup_firewall.sh
```

Regras configuradas:
- SSH (22/tcp): Permitido
- HTTP (80/tcp): Permitido
- HTTPS (443/tcp): Permitido
- Desenvolvimento (7080/tcp): Permitido
- Todas as outras: Bloqueadas

### 5. Atualização do Docker Compose

```bash
# Atualizar docker-compose.yml para produção
./update_docker_compose.sh
```

Configurações aplicadas:
- Uso de secrets seguros
- PostgreSQL como banco de dados de produção
- Redis para cache
- Nginx como reverse proxy
- Volumes persistentes

### 6. Configuração de Monitoramento

```bash
# Configurar monitoramento e logging
./setup_monitoring.sh
```

Este script cria:
- `monitor_health.sh`: Verifica saúde dos serviços
- `log_rotation.sh`: Gerencia rotação de logs
- `auto_backup.sh`: Realiza backups automáticos
- Configura cron jobs para execução automática

### 7. Deployment Completo

```bash
# Executar todo o processo de deployment
./deploy_production.sh
```

Este script orquestra todos os passos acima em ordem.

## 📊 Monitoramento

### Scripts de Monitoramento Automáticos

Os seguintes scripts são configurados para execução automática via cron:

1. **Monitoramento de Saúde** (a cada 30 minutos)
   ```bash
   ./monitor_health.sh
   ```

2. **Rotação de Logs** (diariamente às 02:00)
   ```bash
   ./log_rotation.sh
   ```

3. **Backup Automático** (semanalmente às 01:00 de domingo)
   ```bash
   ./auto_backup.sh
   ```

### Verificação Manual

```bash
# Verificar status dos containers
docker-compose ps

# Verificar logs
docker-compose logs -f

# Verificar saúde dos serviços
./monitor_health.sh
```

## 🔐 Segurança

### Práticas Implementadas

1. **Segredos Seguros**
   - Geração automática de chaves criptograficamente seguras
   - Armazenamento em arquivos com permissões restritas
   - Uso de Docker secrets para variáveis sensíveis

2. **Configurações de Segurança**
   - Headers de segurança no Nginx
   - Cookies seguros (HTTPS only, HttpOnly)
   - Proteção contra CSRF
   - Validação de entrada de dados

3. **Firewall**
   - Apenas portas essenciais abertas
   - Bloqueio padrão de todas as outras conexões
   - Regras específicas para serviços do sistema

4. **SSL/HTTPS**
   - Configuração obrigatória para ambientes de produção
   - Suporte para Let's Encrypt
   - Redirecionamento automático HTTP → HTTPS

### Recomendações Adicionais

1. **Atualizações de Segurança**
   ```bash
   # Manter sistema operacional atualizado
   sudo apt update && sudo apt upgrade
   
   # Atualizar imagens Docker
   docker-compose pull
   docker-compose up -d --build
   ```

2. **Auditoria de Segurança**
   ```bash
   # Verificar portas abertas
   sudo netstat -tlnp
   
   # Verificar regras do firewall
   sudo ufw status numbered
   ```

## 💾 Backup e Recuperação

### Estratégia de Backup

1. **Backup Automático**
   - Banco de dados PostgreSQL (semanalmente)
   - Volumes Docker (semanalmente)
   - Configurações do sistema (diariamente)

2. **Backup Manual**
   ```bash
   # Backup do banco de dados
   docker-compose exec postgres pg_dump -U erp_user erp_oficina > backup.sql
   
   # Backup dos volumes
   docker run --rm -v erp-oficina_backend_data:/data -v $(pwd):/backup alpine tar czf /backup/data_backup.tar.gz /data
   ```

### Recuperação de Backup

1. **Restaurar Banco de Dados**
   ```bash
   # Parar containers
   docker-compose down
   
   # Restaurar backup
   docker-compose up -d postgres
   docker-compose exec -T postgres psql -U erp_user erp_oficina < backup.sql
   
   # Reiniciar todos os containers
   docker-compose up -d
   ```

2. **Restaurar Volumes**
   ```bash
   # Parar containers
   docker-compose down
   
   # Restaurar volume
   docker run --rm -v erp-oficina_backend_data:/data -v $(pwd):/backup alpine tar xzf /backup/data_backup.tar.gz -C /
   
   # Reiniciar containers
   docker-compose up -d
   ```

## 🆘 Troubleshooting

### Problemas Comuns

1. **Permissões Insuficientes**
   ```bash
   # Tornar scripts executáveis
   chmod +x *.sh
   
   # Executar com sudo quando necessário
   sudo ./setup_firewall.sh
   ```

2. **Dependências Faltando**
   ```bash
   # Instalar dependências
   sudo apt install docker.io docker-compose openssl curl ufw
   ```

3. **Portas Ocupadas**
   ```bash
   # Verificar processos nas portas
   sudo netstat -tlnp | grep :80
   sudo netstat -tlnp | grep :443
   
   # Parar processos conflitantes
   sudo kill -9 <PID>
   ```

4. **Problemas com Docker**
   ```bash
   # Reiniciar Docker
   sudo systemctl restart docker
   
   # Verificar status
   sudo systemctl status docker
   ```

### Logs de Erro

```bash
# Logs do sistema
tail -f nginx/logs/*.log

# Logs dos containers
docker-compose logs -f

# Logs de deployment
tail -f nginx/logs/deploy.log
```

## 📞 Suporte

Para problemas não resolvidos com este guia:

1. Verifique os logs de erro
2. Execute os scripts de verificação
3. Consulte a documentação oficial:
   - [Docker Documentation](https://docs.docker.com/)
   - [UFW Documentation](https://help.ubuntu.com/community/UFW)
   - [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

**ERP Oficina Mecânica v1.0**  
Deployment de Produção - Versão 1.0  
Data: $(date +%d/%m/%Y)
