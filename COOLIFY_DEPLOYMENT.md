# Deploy no Coolify - ERP Oficina Mecânica

## Problema Identificado

O site `https://oficina.onlitec.com.br/` estava exibindo a página de teste do backend Flask em vez do frontend React. Isso aconteceu porque:

1. O Coolify estava usando o `docker-compose.yml` padrão
2. O nginx estava configurado com `profiles: - production`, então não era executado
3. O frontend estava exposto na porta 7080, mas o domínio estava apontando para a porta do backend (5000)
4. Não havia proxy reverso configurado corretamente

## Solução

Criamos arquivos específicos para o Coolify:

### 1. docker-compose.coolify.yml

Este arquivo:
- Remove o profile do nginx para que sempre seja executado
- Configura o nginx como proxy reverso principal
- Define as variáveis de ambiente corretas
- Configura o frontend para usar a URL correta da API

### 2. nginx/nginx.coolify.conf

Esta configuração:
- Serve o frontend React na raiz (`/`)
- Faz proxy das rotas `/api/` para o backend
- Faz proxy das rotas `/uploads/` para o backend
- Inclui headers de segurança
- Suporta client-side routing do React
- Inclui configuração SSL opcional

## Configuração no Coolify

### Passo 1: Configurar o Docker Compose

No Coolify, configure para usar o arquivo específico:
```bash
docker-compose.coolify.yml
```

### Passo 2: Variáveis de Ambiente

Configure as seguintes variáveis no Coolify:

```env
SECRET_KEY=sua-chave-secreta-super-segura-aqui
JWT_SECRET_KEY=sua-chave-jwt-super-segura-aqui
VITE_API_URL=https://oficina.onlitec.com.br/api
```

### Passo 3: Configurar Domínio

1. No Coolify, configure o domínio: `oficina.onlitec.com.br`
2. Certifique-se de que o SSL está habilitado
3. O Coolify deve apontar para a porta 80 do container nginx

### Passo 4: Deploy

1. Faça o deploy usando o `docker-compose.coolify.yml`
2. Verifique se todos os serviços estão rodando:
   - postgres (banco de dados)
   - backend (API Flask)
   - frontend (React)
   - nginx (proxy reverso)

## Verificação

Após o deploy, verifique:

1. **Frontend**: `https://oficina.onlitec.com.br/` deve mostrar a interface React
2. **API**: `https://oficina.onlitec.com.br/api/health` deve retornar status da API
3. **Health Check**: `https://oficina.onlitec.com.br/health` deve retornar "healthy"

## Estrutura dos Serviços

```
Nginx (porta 80/443) → Proxy Reverso
├── / → Frontend (React)
├── /api/ → Backend (Flask)
└── /uploads/ → Backend (Flask)
```

## Troubleshooting

### Se ainda mostrar o backend:
1. Verifique se o nginx está rodando
2. Verifique os logs do nginx
3. Confirme que o domínio está apontando para a porta 80 do nginx

### Se a API não funcionar:
1. Verifique se o backend está rodando
2. Verifique se o postgres está conectado
3. Verifique as variáveis de ambiente

### Se o frontend não carregar:
1. Verifique se o frontend foi buildado corretamente
2. Verifique se a variável VITE_API_URL está correta
3. Verifique os logs do container frontend

## Comandos Úteis

```bash
# Verificar status dos containers
docker-compose -f docker-compose.coolify.yml ps

# Ver logs do nginx
docker-compose -f docker-compose.coolify.yml logs nginx

# Ver logs do backend
docker-compose -f docker-compose.coolify.yml logs backend

# Ver logs do frontend
docker-compose -f docker-compose.coolify.yml logs frontend

# Restart dos serviços
docker-compose -f docker-compose.coolify.yml restart
```

## Diferenças do Deploy Local

| Aspecto | Deploy Local | Deploy Coolify |
|---------|--------------|----------------|
| Docker Compose | `docker-compose.yml` | `docker-compose.coolify.yml` |
| Nginx Config | `nginx.production.conf` | `nginx.coolify.conf` |
| SSL | Let's Encrypt manual | Coolify automático |
| Domínio | localhost | oficina.onlitec.com.br |
| Profiles | production profile | sem profiles |
| Portas | 80/443 expostas | proxy do Coolify |

## Próximos Passos

1. Configurar backup automático do banco
2. Configurar monitoramento
3. Configurar logs centralizados
4. Configurar CI/CD automático