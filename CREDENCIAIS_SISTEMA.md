# Credenciais do Sistema - ERP Oficina Mecânica

## Usuário Administrador

### Credenciais Padrão
- **Username:** `AdminSuperUser`
- **Email:** `admin.super@oficina.com`
- **Senha:** `AdM!n@2024#Sec$Pass`
- **Role:** `admin`

### Características da Senha
- ✅ Contém letras maiúsculas e minúsculas
- ✅ Contém números
- ✅ Contém caracteres especiais (!@#$)
- ✅ Possui 20 caracteres
- ✅ Não contém palavras do dicionário

## Usuário de Teste
- **Username:** `user`
- **Email:** `user@oficina.com`
- **Senha:** `user123`
- **Role:** `user`

## Banco de Dados PostgreSQL

### Credenciais de Produção
- **Host:** `erp-oficina-postgres`
- **Database:** `erp_oficina_db`
- **Username:** `erp_admin_user`
- **Senha:** `ErP@2024!Sec#DB$Pass`

### Características da Senha do BD
- ✅ Contém letras maiúsculas e minúsculas
- ✅ Contém números
- ✅ Contém caracteres especiais (!@#$)
- ✅ Possui 21 caracteres
- ✅ Não contém palavras do dicionário

## Recomendações de Segurança

### ⚠️ IMPORTANTE
1. **ALTERE TODAS AS SENHAS PADRÃO** após o primeiro login
2. Use senhas únicas para cada ambiente (desenvolvimento, teste, produção)
3. Implemente rotação de senhas periodicamente
4. Use autenticação de dois fatores quando possível
5. Monitore tentativas de login falhadas

### Política de Senhas Recomendada
- Mínimo de 12 caracteres
- Combinação de letras maiúsculas, minúsculas, números e símbolos
- Não reutilizar as últimas 5 senhas
- Alteração obrigatória a cada 90 dias
- Bloqueio após 5 tentativas de login falhadas

### Arquivos Atualizados
- `backend/init_admin.py` - Script de inicialização do admin
- `backend/src/init_db.py` - Script de inicialização do banco
- `migrate_sqlite_to_postgres.py` - Script de migração
- `.env.coolify` - Variáveis de ambiente do Coolify
- `docker-compose.yml` - Configuração local
- `docker-compose.coolify.yml` - Configuração do Coolify

## Logs de Auditoria

### Data da Alteração
- **Data:** $(date '+%Y-%m-%d %H:%M:%S')
- **Responsável:** Sistema Automatizado
- **Motivo:** Implementação de credenciais complexas e seguras
- **Arquivos Modificados:** 6 arquivos

---

**Nota:** Este arquivo contém informações sensíveis. Mantenha-o seguro e não o compartilhe publicamente.
