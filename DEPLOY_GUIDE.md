# 🚀 Guia de Deploy - ERP Oficina Mecânica

## 📋 Pré-requisitos

### Ambiente de Produção
- **Docker Engine** 20.10+
- **Docker Compose** 2.0+
- **Servidor Linux** (Ubuntu 20.04+ recomendado)
- **Memória RAM**: Mínimo 2GB, recomendado 4GB+
- **Armazenamento**: Mínimo 10GB livres
- **Portas**: 80 (HTTP) e 443 (HTTPS) disponíveis

### Ambiente de Desenvolvimento
- **Docker Desktop** ou **Docker Engine**
- **Git** para clonagem do repositório
- **Editor de código** (VS Code recomendado)

## 🔧 Instalação

### 1. Preparar o Ambiente

```bash
# Atualizar sistema (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clonar e Configurar

```bash
# Clonar repositório
git clone <repository-url>
cd erp-oficina

# Verificar integridade do sistema
python3 validate_system.py

# Configurar permissões
chmod +x validate_system.py
```

## 🚀 Deploy

### Ambiente de Desenvolvimento

```bash
# Build e execução
docker compose up --build -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f

# Acessar aplicação
# Frontend: http://localhost
# Backend API: http://localhost/api
```

### Ambiente de Produção

#### 1. Configurar SSL (Opcional)
```bash
# Criar diretório SSL
mkdir -p nginx/ssl

# Copiar certificados
cp seu-certificado.crt nginx/ssl/
cp sua-chave-privada.key nginx/ssl/
```

#### 2. Configurar Variáveis de Ambiente
```bash
# Editar docker-compose.yml
# Alterar senhas padrão do PostgreSQL
# Configurar domínio se necessário
```

#### 3. Deploy com PostgreSQL
```bash
# Deploy completo com PostgreSQL e Redis
docker compose --profile production up -d --build

# Verificar todos os serviços
docker compose --profile production ps

# Monitorar logs
docker compose --profile production logs -f
```

## 🔍 Verificação do Deploy

### Health Checks
```bash
# Verificar backend
curl -f http://localhost/api/users

# Verificar frontend
curl -f http://localhost/

# Status dos containers
docker compose ps
```

### Testes Funcionais
```bash
# Testar API de clientes
curl -X GET http://localhost/api/clientes

# Testar dashboard
curl -X GET http://localhost/api/relatorios/dashboard

# Verificar configurações
curl -X GET http://localhost/api/configuracoes/empresa
```

## 📊 Monitoramento

### Logs
```bash
# Logs em tempo real
docker compose logs -f

# Logs específicos
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Logs do Nginx (produção)
docker compose exec nginx tail -f /var/log/nginx/access.log
```

### Métricas
```bash
# Uso de recursos
docker stats

# Espaço em disco
docker system df

# Informações dos containers
docker compose exec backend ps aux
```

## 🔧 Manutenção

### Backup
```bash
# Backup do banco de dados
docker compose exec postgres pg_dump -U erp_user erp_oficina > backup_$(date +%Y%m%d).sql

# Backup dos volumes
docker run --rm -v erp-oficina_backend_data:/data -v $(pwd):/backup alpine tar czf /backup/backup_data_$(date +%Y%m%d).tar.gz /data
```

### Atualizações
```bash
# Parar serviços
docker compose down

# Atualizar código
git pull

# Rebuild e restart
docker compose up --build -d

# Verificar
docker compose ps
```

### Limpeza
```bash
# Remover containers parados
docker container prune -f

# Remover imagens não utilizadas
docker image prune -f

# Limpeza completa (cuidado!)
docker system prune -a -f
```

## 🛡️ Segurança

### Configurações Recomendadas

#### 1. Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### 2. SSL/TLS
```bash
# Certificado Let's Encrypt (exemplo)
sudo apt install certbot
sudo certbot certonly --standalone -d seu-dominio.com
```

#### 3. Senhas Seguras
- Alterar senhas padrão no docker-compose.yml
- Usar senhas complexas (mínimo 16 caracteres)
- Considerar uso de secrets do Docker

### Headers de Segurança
O sistema já inclui:
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy configurado

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Container não inicia
```bash
# Verificar logs
docker compose logs container-name

# Verificar recursos
docker system df
free -h
```

#### 2. Erro de conexão com banco
```bash
# Verificar status do PostgreSQL
docker compose exec postgres pg_isready -U erp_user

# Resetar banco (desenvolvimento)
docker compose down -v
docker compose up -d
```

#### 3. Frontend não carrega
```bash
# Verificar build do frontend
docker compose logs frontend

# Verificar configuração do Nginx
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
```

#### 4. API não responde
```bash
# Verificar backend
docker compose exec backend curl localhost:5000/api/users

# Verificar proxy do Nginx
docker compose exec frontend curl backend:5000/api/users
```

### Comandos de Diagnóstico
```bash
# Informações do sistema
docker info
docker version

# Rede Docker
docker network ls
docker network inspect erp-oficina_erp-network

# Volumes
docker volume ls
docker volume inspect erp-oficina_backend_data
```

## 📈 Otimização

### Performance
1. **Recursos**: Ajustar limites de CPU/memória no docker-compose.yml
2. **Cache**: Redis configurado para produção
3. **Nginx**: Gzip e cache de assets habilitados
4. **Banco**: PostgreSQL otimizado para produção

### Escalabilidade
```bash
# Escalar serviços
docker compose up -d --scale backend=2

# Load balancer (configuração adicional necessária)
# Considerar Docker Swarm ou Kubernetes para alta disponibilidade
```

## 📞 Suporte

### Informações do Sistema
```bash
# Versão do sistema
curl http://localhost/api/configuracoes/info-sistema

# Status dos serviços
docker compose ps --format table
```

### Logs para Suporte
```bash
# Coletar logs para análise
docker compose logs > logs_$(date +%Y%m%d_%H%M%S).txt

# Informações do ambiente
docker info > docker_info.txt
docker version > docker_version.txt
```

---

## ✅ Checklist de Deploy

### Pré-Deploy
- [ ] Servidor preparado com Docker
- [ ] Portas 80/443 disponíveis
- [ ] Certificados SSL configurados (produção)
- [ ] Backup do ambiente anterior (se aplicável)

### Deploy
- [ ] Código clonado e validado
- [ ] Variáveis de ambiente configuradas
- [ ] Containers buildados sem erro
- [ ] Todos os serviços rodando
- [ ] Health checks passando

### Pós-Deploy
- [ ] Aplicação acessível via browser
- [ ] APIs respondendo corretamente
- [ ] Dados persistindo corretamente
- [ ] Logs sendo gerados
- [ ] Backup configurado
- [ ] Monitoramento ativo

### Produção
- [ ] HTTPS funcionando
- [ ] Firewall configurado
- [ ] Senhas alteradas
- [ ] Domínio apontando corretamente
- [ ] Certificados válidos
- [ ] Performance adequada

---

**Sistema ERP Oficina Mecânica v1.0**  
Deploy Guide - Versão 1.0  
Data: $(date +%d/%m/%Y)

