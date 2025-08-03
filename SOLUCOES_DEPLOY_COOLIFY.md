# Análise dos Erros de Deploy no Coolify

## Problemas Identificados

### 1. Variável "Pass" não definida
**Erro:** `The "Pass" variable is not set. Defaulting to a blank string.`

**Causa:** O Coolify está tentando acessar uma variável de ambiente chamada "Pass" que não está definida.

**Solução:**
- Adicionar a variável `Pass` no arquivo `.env` ou nas configurações do Coolify
- Verificar se esta variável é necessária para autenticação de algum serviço

### 2. Conflito de Porta 80
**Erro:** `Bind for 0.0.0.0:80 failed: port is already allocated`

**Causa:** A porta 80 já está sendo usada por outro serviço no servidor.

**Soluções:**
1. **Remover o mapeamento da porta 80 do nginx** (recomendado para Coolify)
2. **Usar uma porta diferente** (ex: 8080)
3. **Parar o serviço que está usando a porta 80**

### 3. Container não encontrado
**Erro:** `No such container: ms0808o8kwgsk84okgswgc0`

**Causa:** O Coolify está tentando remover um container que não existe mais.

**Solução:** Este é um erro secundário que será resolvido quando os outros problemas forem corrigidos.

## Soluções Implementadas

### 1. Correção do docker-compose.yml para Coolify

**Problemas no arquivo atual:**
- Mapeamento desnecessário da porta 80 no nginx
- Container name fixo para nginx pode causar conflitos
- Configuração de healthcheck inadequada para ambiente Coolify

### 2. Configuração de Variáveis de Ambiente

**Variáveis necessárias para o Coolify:**
- `COOLIFY_CONTAINER_NAME`: Nome único do container
- `COOLIFY_FQDN`: Domínio configurado no Coolify
- `Pass`: Variável de autenticação (se necessária)

### 3. Configuração do Nginx

**Ajustes necessários:**
- Remover mapeamento de porta externa
- Configurar proxy reverso adequadamente
- Usar labels do Traefik corretamente

## Próximos Passos

1. **Atualizar docker-compose.yml** - Remover porta 80 do nginx
2. **Verificar configuração do nginx** - Ajustar nginx.coolify.conf
3. **Adicionar variáveis faltantes** - Incluir variável "Pass" se necessária
4. **Testar deploy** - Fazer novo deploy após correções
5. **Monitorar logs** - Verificar se os erros foram resolvidos

## Comandos Úteis para Debug

```bash
# Verificar portas em uso
sudo netstat -tulpn | grep :80

# Verificar containers em execução
docker ps -a

# Verificar logs do Coolify
docker logs <container_name>

# Limpar containers órfãos
docker system prune -f
```

## Configuração Recomendada para Coolify

### docker-compose.yml otimizado:
- Remover mapeamentos de porta desnecessários
- Usar variáveis de ambiente do Coolify
- Configurar labels do Traefik corretamente
- Ajustar healthchecks para ambiente de produção

### Variáveis de ambiente necessárias:
- Todas as variáveis de banco de dados
- JWT_SECRET_KEY seguro
- Configurações específicas do Coolify
- URLs corretas para produção