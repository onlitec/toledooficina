# Guia de Configuração do Redirecionamento Nginx

## Visão Geral

Este guia explica como configurar o nginx para redirecionar todo o tráfego da porta 80 (HTTP) e 443 (HTTPS) para o sistema ERP rodando no IP `172.20.120.44:7080`.

## Configuração Implementada

### Arquivos Criados/Modificados:

1. **`nginx/nginx.conf`** - Configuração principal do nginx
2. **`docker-compose.yml`** - Adicionada porta 80 ao serviço nginx
3. **`setup_nginx_redirect.sh`** - Script automatizado para deploy

### Funcionalidades:

- ✅ **Redirecionamento HTTP (porta 80)** → `172.20.120.44:7080`
- ✅ **Redirecionamento HTTPS (porta 443)** → `172.20.120.44:7080`
- ✅ **Rate limiting** para proteção contra ataques
- ✅ **Headers de segurança** configurados
- ✅ **Compressão gzip** habilitada
- ✅ **Certificados SSL** auto-assinados

## Como Usar

### Método 1: Script Automatizado (Recomendado)

```bash
# Executar o script de configuração
./setup_nginx_redirect.sh
```

### Método 2: Manual

```bash
# 1. Parar nginx se estiver rodando
docker-compose --profile production stop nginx

# 2. Remover container antigo
docker-compose --profile production rm -f nginx

# 3. Criar diretórios necessários
mkdir -p nginx/logs nginx/ssl

# 4. Gerar certificados SSL (se necessário)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/server.key \
    -out nginx/ssl/server.crt \
    -subj "/C=BR/ST=State/L=City/O=Organization/CN=localhost"

# 5. Iniciar nginx
docker-compose --profile production up -d nginx
```

## Verificação

### Verificar Status do Container:
```bash
docker-compose --profile production ps nginx
```

### Verificar Logs:
```bash
docker-compose --profile production logs nginx
```

### Testar Redirecionamento:
```bash
# Teste HTTP
curl -I http://seu-servidor

# Teste HTTPS (ignorar certificado auto-assinado)
curl -I -k https://seu-servidor
```

## Configuração de Rede

### Portas Expostas:
- **80** (HTTP) → Redireciona para `172.20.120.44:7080`
- **443** (HTTPS) → Redireciona para `172.20.120.44:7080`

### Rate Limiting:
- **API geral**: 10 requisições/segundo
- **Login**: 5 tentativas/minuto
- **Burst**: Permite rajadas controladas

## Segurança

### Headers Configurados:
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer-when-downgrade`
- `Content-Security-Policy`
- `Strict-Transport-Security` (HTTPS)

### Proteções:
- Rate limiting por IP
- Compressão gzip
- Certificados SSL/TLS
- Proxy headers seguros

## Troubleshooting

### Problema: Nginx não inicia
```bash
# Verificar logs detalhados
docker-compose --profile production logs nginx

# Verificar configuração
docker run --rm -v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf nginx:alpine nginx -t
```

### Problema: Redirecionamento não funciona
```bash
# Verificar se o ERP está rodando no IP de destino
curl -I http://172.20.120.44:7080

# Verificar conectividade de rede
ping 172.20.120.44
```

### Problema: Certificado SSL
```bash
# Regenerar certificados
rm -f nginx/ssl/server.*
./setup_nginx_redirect.sh
```

## Personalização

### Alterar IP de Destino:
Edite o arquivo `nginx/nginx.conf` e substitua `172.20.120.44:7080` pelo novo endereço.

### Adicionar Domínio Específico:
Substitua `server_name _;` por `server_name seu-dominio.com;`

### Certificados Próprios:
Substitua os arquivos em `nginx/ssl/` pelos seus certificados válidos.

## Monitoramento

### Logs de Acesso:
```bash
tail -f nginx/logs/access.log
```

### Logs de Erro:
```bash
tail -f nginx/logs/error.log
```

### Status em Tempo Real:
```bash
watch 'docker-compose --profile production ps nginx'
```

---

**Nota**: Esta configuração redireciona TODO o tráfego HTTP/HTTPS para o ERP. Certifique-se de que o sistema ERP no IP `172.20.120.44:7080` esteja funcionando corretamente antes de ativar o redirecionamento.