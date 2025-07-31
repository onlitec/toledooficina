# Setup Coolify - ERP Oficina Mecânica

## Arquivos Criados
- `docker-compose.coolify.yml` - Docker Compose específico para Coolify
- `nginx/nginx.coolify.conf` - Configuração do Nginx principal
- `frontend/Dockerfile.coolify` - Dockerfile do frontend para Coolify
- `frontend/nginx.coolify.conf` - Configuração do Nginx do frontend
- `.env.coolify` - Variáveis de ambiente para Coolify

## Configuração no Coolify

1. **Docker Compose File**: `docker-compose.coolify.yml`
2. **Domínio**: `oficina.onlitec.com.br`
3. **SSL**: Habilitado
4. **Porta**: 80 (nginx)

## Variáveis de Ambiente

Copie as variáveis do arquivo `.env.coolify` para o Coolify.

## Verificação Pós-Deploy

- Frontend: https://oficina.onlitec.com.br/
- API: https://oficina.onlitec.com.br/api/health
- Health Check: https://oficina.onlitec.com.br/health

## Troubleshooting

Se o site ainda mostrar o backend:
1. Verifique se o nginx está rodando
2. Verifique se o domínio aponta para a porta 80 do nginx
3. Verifique os logs dos containers
