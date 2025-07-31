# Troubleshooting - Coolify Docker Compose

## Problema Identificado

O Coolify está lendo uma versão diferente do `docker-compose.coolify.yml` do que está no repositório.

### Diferenças Encontradas:

**No arquivo local (correto):**
```yaml
environment:
  - VITE_API_URL=https://oficina.onlitec.com.br/api
```

**No Coolify (incorreto):**
```yaml
environment:
  - VITE_API_URL=`https://oficina.onlitec.com.br/api`
```

## Soluções para Tentar:

### 1. Limpar Cache do Coolify
- No painel do Coolify, vá em "Settings" > "Advanced"
- Clique em "Clear Build Cache"
- Tente fazer o deploy novamente

### 2. Verificar o Caminho do Docker Compose
- Certifique-se de que o caminho está definido como: `/docker-compose.coolify.yml`
- Não deve ter espaços ou caracteres especiais

### 3. Recriar o Projeto no Coolify
- Delete o projeto atual no Coolify
- Crie um novo projeto
- Configure novamente com:
  - Repository: `https://github.com/onlitec/toledooficina.git`
  - Branch: `main`
  - Build Pack: `Docker Compose`
  - Docker Compose Location: `/docker-compose.coolify.yml`

### 4. Verificar Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas no Coolify:

```
SECRET_KEY=sua-chave-secreta-aqui
JWT_SECRET_KEY=sua-jwt-chave-aqui
VITE_API_URL=https://oficina.onlitec.com.br/api
POSTGRES_DB=erp_oficina
POSTGRES_USER=erp_user
POSTGRES_PASSWORD=erp_password_2024
FLASK_ENV=production
FLASK_DEBUG=0
ENVIRONMENT=production
```

### 5. Verificar Logs do Build

- No Coolify, vá na aba "Deployments"
- Clique no último deployment
- Verifique os logs de build para identificar erros

## Arquivo Correto Atual

O arquivo `docker-compose.coolify.yml` no repositório está correto. Última atualização: commit `a098ade`

## Próximos Passos

1. Tente a solução 1 (limpar cache)
2. Se não funcionar, tente a solução 3 (recriar projeto)
3. Se ainda houver problemas, verifique os logs detalhadamente

## Contato

Se o problema persistir, verifique:
- Se o repositório GitHub está acessível
- Se a branch `main` está atualizada
- Se não há problemas de conectividade entre Coolify e GitHub