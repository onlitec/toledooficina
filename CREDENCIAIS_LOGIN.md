# 🔐 Credenciais de Login do Sistema

## Usuário Administrador

**Username:** `AdminSuperUser`  
**Senha:** `AdM!n@2024#Sec$Pass`  
**Email:** `admin.super@oficina.com`  
**Role:** `admin`

## Como fazer login:

1. Acesse o sistema em: http://localhost
2. No campo "Username ou Email", digite: `AdminSuperUser`
3. No campo "Senha", digite: `AdM!n@2024#Sec$Pass`
4. Clique em "Entrar"

## ⚠️ Importante:

- O sistema usa **username** para login, não email
- A senha é case-sensitive (maiúsculas e minúsculas importam)
- Se houver problemas de login, verifique se:
  - O backend está rodando (http://localhost:5000/api/health)
  - O banco de dados está conectado
  - Não há bloqueios de conta por tentativas falhadas

## 🔧 Resolução de Problemas:

Se ainda houver erro de conexão:

1. **Verificar logs do backend:**
   ```bash
   docker-compose logs --tail=50 backend
   ```

2. **Testar API diretamente:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"AdminSuperUser","password":"AdM!n@2024#Sec$Pass"}'
   ```

3. **Resetar usuário admin (se necessário):**
   ```bash
   docker-compose exec backend python init_admin.py
   ```

4. **Verificar status dos containers:**
   ```bash
   docker-compose ps
   ```

## 📱 Acesso ao Sistema:

- **Frontend:** http://localhost
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

---

*Documento gerado em: 03/08/2025*
*Sistema: ERP Oficina Mecânica v1.0*