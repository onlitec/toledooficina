# Guia de Troubleshooting - Deploy Coolify

## 🔍 Problemas Identificados e Soluções

### 1. Erro: "The 'Pass' variable is not set"

**Sintoma:**
```
time="2025-08-03T15:18:33Z" level=warning msg="The \"Pass\" variable is not set. Defaulting to a blank string."
```

**Causa:** Variável de ambiente `Pass` não está definida.

**Soluções:**
1. **Adicionar no .env:**
   ```bash
   Pass=your-secure-password-here
   ```

2. **Configurar no Coolify:**
   - Vá em Environment Variables
   - Adicione: `Pass=valor_seguro`

3. **Verificar se é necessária:**
   ```bash
   grep -r "Pass" . --exclude-dir=node_modules
   ```

### 2. Erro: "Bind for 0.0.0.0:80 failed: port is already allocated"

**Sintoma:**
```
Error response from daemon: driver failed programming external connectivity on endpoint nginx-xxx: Bind for 0.0.0.0:80 failed: port is already allocated
```

**Causa:** Porta 80 já está sendo usada por outro serviço.

**Soluções:**

#### Solução 1: Remover mapeamento de porta (Recomendado)
```yaml
# docker-compose.yml
nginx:
  # Remover esta linha:
  # ports:
  #   - "80:80"
  
  # Usar apenas expose:
  expose:
    - "80"
```

#### Solução 2: Verificar e parar serviços conflitantes
```bash
# Verificar o que está usando a porta 80
sudo netstat -tulpn | grep :80
sudo lsof -i :80

# Parar Apache se estiver rodando
sudo systemctl stop apache2
sudo systemctl disable apache2

# Parar Nginx se estiver rodando
sudo systemctl stop nginx
sudo systemctl disable nginx
```

#### Solução 3: Usar porta alternativa
```yaml
nginx:
  ports:
    - "8080:80"  # Usar porta 8080 ao invés de 80
```

### 3. Erro: "No such container"

**Sintoma:**
```
Error response from daemon: No such container: ms0808o8kwgsk84okgswgc0
```

**Causa:** Container foi removido mas o Coolify ainda tenta acessá-lo.

**Soluções:**
```bash
# Limpar todos os containers órfãos
docker system prune -f

# Remover containers específicos do projeto
docker ps -a | grep oficina | awk '{print $1}' | xargs -r docker rm -f

# Limpar redes órfãs
docker network prune -f
```

## 🛠️ Comandos de Diagnóstico

### Verificar Status dos Serviços
```bash
# Verificar containers em execução
docker ps -a

# Verificar logs dos containers
docker-compose logs -f

# Verificar logs específicos
docker logs <container_name>
```

### Verificar Portas
```bash
# Verificar portas em uso
sudo netstat -tulpn | grep -E ':(80|443|5000|3000|7080)'

# Verificar processos usando portas específicas
sudo lsof -i :80
sudo lsof -i :443
```

### Verificar Configuração
```bash
# Validar docker-compose.yml
docker-compose config

# Verificar variáveis de ambiente
docker-compose config | grep -A 10 environment

# Testar conectividade entre containers
docker-compose exec backend ping postgres
docker-compose exec nginx ping backend
```

## 🔧 Correções Automáticas

### Script de Correção Rápida
```bash
# Executar script de correção
./scripts/deploy_coolify.sh
```

### Correções Manuais

#### 1. Atualizar docker-compose.yml
```bash
# Usar versão otimizada
cp docker-compose.coolify.yml docker-compose.yml
```

#### 2. Atualizar variáveis de ambiente
```bash
# Usar .env otimizado
cp .env.coolify .env
```

#### 3. Atualizar configuração do nginx
```bash
# Usar configuração otimizada
cp nginx/nginx.coolify.optimized.conf nginx/nginx.coolify.conf
```

## 🚀 Deploy Limpo

### Processo Completo de Deploy
```bash
# 1. Parar tudo
docker-compose down

# 2. Limpar sistema
docker system prune -f
docker volume prune -f
docker network prune -f

# 3. Aplicar correções
./scripts/deploy_coolify.sh

# 4. Testar localmente
docker-compose up -d

# 5. Verificar saúde
docker-compose ps
curl http://localhost/health

# 6. Commit e push
git add .
git commit -m "fix: correções para deploy Coolify"
git push
```

## 📋 Checklist de Deploy

### Antes do Deploy
- [ ] Backup dos arquivos originais criado
- [ ] Variável `Pass` configurada
- [ ] Porta 80 não mapeada no docker-compose.yml
- [ ] Configuração do nginx otimizada
- [ ] Variáveis de ambiente configuradas
- [ ] docker-compose.yml validado

### Durante o Deploy
- [ ] Monitorar logs do Coolify
- [ ] Verificar se containers sobem corretamente
- [ ] Testar endpoints de saúde
- [ ] Verificar conectividade entre serviços

### Após o Deploy
- [ ] Aplicação acessível via HTTPS
- [ ] API funcionando corretamente
- [ ] Frontend carregando
- [ ] Banco de dados conectado
- [ ] Uploads funcionando

## 🆘 Problemas Comuns

### Frontend não carrega
```bash
# Verificar se o frontend está rodando
docker-compose ps frontend

# Verificar logs do frontend
docker-compose logs frontend

# Verificar configuração do nginx
docker-compose exec nginx nginx -t
```

### API não responde
```bash
# Verificar se o backend está rodando
docker-compose ps backend

# Verificar logs do backend
docker-compose logs backend

# Testar conectividade
docker-compose exec nginx curl http://backend:5000/health
```

### Banco de dados não conecta
```bash
# Verificar se o postgres está rodando
docker-compose ps postgres

# Verificar logs do postgres
docker-compose logs postgres

# Testar conexão
docker-compose exec backend ping postgres
```

## 📞 Suporte

Se os problemas persistirem:

1. **Verificar logs detalhados:**
   ```bash
   docker-compose logs -f --tail=100
   ```

2. **Exportar configuração:**
   ```bash
   docker-compose config > debug-config.yml
   ```

3. **Coletar informações do sistema:**
   ```bash
   docker version
   docker-compose version
   uname -a
   ```

4. **Criar issue com:**
   - Logs completos do erro
   - Configuração exportada
   - Informações do sistema
   - Passos para reproduzir