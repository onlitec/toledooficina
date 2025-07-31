# Troubleshooting PostgreSQL no Coolify

## 🔍 Problema Identificado

O container PostgreSQL foi criado (`postgres-lkcckwk8cc00cw04kggckkwo-163748728166`) mas não aparece na interface do Coolify.

## 🛠️ Diagnóstico e Soluções

### 1. Verificar Status do Container

```bash
# Verificar se o container está rodando
docker ps | grep postgres

# Verificar todos os containers (incluindo parados)
docker ps -a | grep postgres

# Verificar logs do container específico
docker logs postgres-lkcckwk8cc00cw04kggckkwo-163748728166
```

### 2. Verificar na Interface do Coolify

#### Locais para Procurar:
1. **Dashboard Principal** → Seção "Databases"
2. **Projeto Específico** → Aba "Resources" → "Databases"
3. **Server** → "Resources" → "Databases"
4. **Menu Lateral** → "Databases"

#### Possíveis Causas:
- Container criado em projeto diferente
- Container criado em servidor diferente
- Interface não atualizou (cache)
- Container criado fora do contexto do Coolify

### 3. Soluções Recomendadas

#### Solução 1: Atualizar Interface
```bash
# Recarregar a página do Coolify
# Pressionar Ctrl+F5 para limpar cache
```

#### Solução 2: Verificar Projeto Correto
1. Acesse o projeto `toledooficina`
2. Vá em "Resources" → "Databases"
3. Procure por `postgres-lkcckwk8cc00cw04kggckkwo-163748728166`

#### Solução 3: Criar Novo PostgreSQL via Interface
1. **Acesse o Coolify Dashboard**
2. **Vá para o projeto `toledooficina`**
3. **Clique em "+ New Resource"**
4. **Selecione "Database"**
5. **Escolha "PostgreSQL"**
6. **Configure:**
   - **Name:** `erp-oficina-postgres`
   - **Database Name:** `erp_oficina_db`
   - **Username:** `erp_admin_user`
   - **Password:** `ErP@2024!Sec#DB$Pass`
   - **Version:** `15` (recomendado)

#### Solução 4: Remover Container Órfão e Recriar
```bash
# Parar o container órfão
docker stop postgres-lkcckwk8cc00cw04kggckkwo-163748728166

# Remover o container órfão
docker rm postgres-lkcckwk8cc00cw04kggckkwo-163748728166

# Remover volume se necessário
docker volume ls | grep postgres
docker volume rm <volume_name>
```

### 4. Configuração das Variáveis de Ambiente

Após criar o PostgreSQL corretamente no Coolify:

```bash
# Variáveis que devem ser configuradas no projeto
POSTGRES_HOST=erp-oficina-postgres
POSTGRES_DB=erp_oficina_db
POSTGRES_USER=erp_admin_user
POSTGRES_PASSWORD=ErP@2024!Sec#DB$Pass
POSTGRES_PORT=5432
```

### 5. Verificação Pós-Criação

```bash
# Testar conexão com o banco
psql -h erp-oficina-postgres -U erp_admin_user -d erp_oficina_db

# Ou via Docker
docker exec -it <postgres_container_name> psql -U erp_admin_user -d erp_oficina_db
```

### 6. Comandos de Debug

```bash
# Listar todos os containers do Coolify
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Verificar redes Docker
docker network ls | grep coolify

# Verificar volumes
docker volume ls | grep postgres

# Logs do Coolify (se necessário)
docker logs coolify
```

## 🎯 Solução Recomendada

**Opção Mais Segura:**
1. Remover o container órfão atual
2. Criar novo PostgreSQL via interface do Coolify
3. Configurar as variáveis de ambiente no projeto
4. Fazer deploy do projeto

**Vantagens:**
- ✅ Gerenciamento completo pelo Coolify
- ✅ Backup automático
- ✅ Monitoramento integrado
- ✅ Logs centralizados
- ✅ Configuração de rede automática

## 📋 Checklist de Verificação

- [ ] Container PostgreSQL visível na interface do Coolify
- [ ] Variáveis de ambiente configuradas no projeto
- [ ] Conexão de rede entre aplicação e banco funcionando
- [ ] Logs do PostgreSQL sem erros
- [ ] Aplicação consegue conectar ao banco
- [ ] Backup configurado (se necessário)

## 🚨 Troubleshooting Adicional

Se o problema persistir:

1. **Verificar logs do Coolify:**
   ```bash
   docker logs coolify
   ```

2. **Reiniciar o Coolify:**
   ```bash
   docker restart coolify
   ```

3. **Verificar permissões:**
   ```bash
   docker exec -it coolify ls -la /data
   ```

4. **Contatar suporte do Coolify** com:
   - ID do container: `postgres-lkcckwk8cc00cw04kggckkwo-163748728166`
   - Logs relevantes
   - Screenshots da interface

---

**Nota:** Este problema é comum quando containers são criados fora do contexto do Coolify ou quando há problemas de sincronização na interface.
