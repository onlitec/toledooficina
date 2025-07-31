# Solução para PostgreSQL no Coolify

## Problema Identificado

O contêiner PostgreSQL não estava sendo criado durante o deploy no Coolify porque:

1. O Coolify trata bancos de dados marcados com `coolify.type=database` de forma especial
2. Estes serviços não são criados via Docker Compose, mas sim através da interface do Coolify
3. O arquivo `docker-compose.coolify.yml` foi atualizado para remover o serviço PostgreSQL

## Solução Implementada

### 1. Alterações no docker-compose.coolify.yml

- ✅ Removido o serviço `postgres` completamente
- ✅ Removida a dependência `depends_on: postgres` do backend
- ✅ Atualizada a configuração de rede para usar a rede padrão do Coolify
- ✅ Removido o volume `postgres_data`

### 2. Configuração do PostgreSQL no Coolify

**Passos para criar o PostgreSQL separadamente:**

1. **Acesse o painel do Coolify**
2. **Vá para "Databases" → "+ New Database"**
3. **Selecione "PostgreSQL"**
4. **Configure os seguintes parâmetros:**
   ```
   Name: erp-oficina-postgres
   Database Name: erp_oficina
   Username: erp_user
   Password: erp_password_2024
   Version: 15
   ```

5. **Após criar o banco, configure as variáveis de ambiente no seu projeto:**
   ```
   POSTGRES_HOST=erp-oficina-postgres
   POSTGRES_DB=erp_oficina
   POSTGRES_USER=erp_user
   POSTGRES_PASSWORD=erp_password_2024
   ```

### 3. Configuração de Rede

- O PostgreSQL criado pelo Coolify automaticamente estará na mesma rede (`coolify`)
- O backend poderá se conectar usando o nome do contêiner como hostname

### 4. Verificação Pós-Deploy

**Para verificar se tudo está funcionando:**

```bash
# Verificar se o PostgreSQL está rodando
docker ps | grep postgres

# Verificar logs do backend
docker logs erp-oficina-backend

# Testar conexão com o banco
docker exec -it erp-oficina-postgres psql -U erp_user -d erp_oficina
```

## Vantagens desta Abordagem

1. **Gerenciamento Centralizado**: O PostgreSQL é gerenciado diretamente pelo Coolify
2. **Backups Automáticos**: O Coolify pode configurar backups automáticos
3. **Monitoramento**: Melhor visibilidade do status do banco de dados
4. **Escalabilidade**: Facilita futuras configurações de alta disponibilidade
5. **Segurança**: Isolamento adequado entre aplicação e banco de dados

## Próximos Passos

1. ✅ Deploy do projeto atualizado no Coolify
2. ⏳ Criar o PostgreSQL via interface do Coolify
3. ⏳ Configurar as variáveis de ambiente
4. ⏳ Verificar conectividade entre backend e PostgreSQL
5. ⏳ Testar funcionalidades da aplicação

## Arquivos Modificados

- `docker-compose.coolify.yml` - Removido serviço PostgreSQL
- `COOLIFY_POSTGRESQL_ISSUE.md` - Documentação do problema
- `COOLIFY_POSTGRESQL_SOLUTION.md` - Este arquivo com a solução

---

**Status**: ✅ Solução implementada e commitada
**Data**: 31/01/2025
**Responsável**: Assistente AI