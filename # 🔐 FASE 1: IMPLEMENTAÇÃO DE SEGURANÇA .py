# 🔐 FASE 1: IMPLEMENTAÇÃO DE SEGURANÇA E AUTENTICAÇÃO

## 📋 CRONOGRAMA DETALHADO - FASE 1 (3-4 semanas)

### 🎯 **OBJETIVOS DA FASE 1**
- Tornar o sistema seguro para uso em produção
- Implementar autenticação JWT robusta
- Adicionar validações completas
- Configurar headers de segurança
- Implementar rate limiting

---

## 📅 **SEMANA 1-2: SISTEMA DE AUTENTICAÇÃO JWT**

### ✅ **1.1 JWT Tokens Robustos (5 dias)**

#### **Dia 1-2: Melhorar Modelo User**
```python
# backend/src/models/user.py - MELHORIAS
class User(db.Model):
    # Adicionar campos de segurança
    failed_login_attempts = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime)
    password_changed_at = db.Column(db.DateTime, default=datetime.utcnow)
    two_factor_enabled = db.Column(db.Boolean, default=False)
    two_factor_secret = db.Column(db.String(32))
    
    # Tokens de refresh
    refresh_tokens = db.relationship('RefreshToken', backref='user', lazy=True)
```

#### **Dia 3: Implementar RefreshToken**
```python
# backend/src/models/refresh_token.py - NOVO
class RefreshToken(db.Model):
    __tablename__ = 'refresh_tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(255), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    revoked = db.Column(db.Boolean, default=False)
```

#### **Dia 4-5: Melhorar Autenticação**
```python
# backend/src/auth.py - MELHORIAS
def enhanced_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Verificar blacklist de tokens
        # Validar IP do usuário
        # Log de tentativas de acesso
        return f(*args, **kwargs)
    return decorated
```

### ✅ **1.2 Middleware de Autenticação (5 dias)**

#### **Dia 1-2: Sistema de Bloqueio**
```python
# backend/src/utils/security.py - NOVO
class SecurityManager:
    @staticmethod
    def check_account_lockout(user):
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.utcnow() + timedelta(minutes=30)
            
    @staticmethod
    def log_security_event(user_id, event_type, ip_address):
        # Log de eventos de segurança
        pass
```

#### **Dia 3-5: Proteção de Rotas Avançada**
```python
# backend/src/auth.py - MELHORIAS
def ip_whitelist_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        client_ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
        # Verificar whitelist de IPs
        return f(*args, **kwargs)
    return decorated
```

---

## 📅 **SEMANA 3-4: VALIDAÇÕES E SEGURANÇA**

### ✅ **1.3 Validações Robustas Backend (4 dias)**

#### **Dia 1-2: Implementar Marshmallow**
```python
# backend/src/schemas/ - NOVO DIRETÓRIO
# backend/src/schemas/user_schemas.py
from marshmallow import Schema, fields, validate, validates, ValidationError

class UserCreateSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    
    @validates('password')
    def validate_password_strength(self, value):
        if not re.search(r'[A-Z]', value):
            raise ValidationError('Senha deve conter ao menos uma letra maiúscula')
        if not re.search(r'[0-9]', value):
            raise ValidationError('Senha deve conter ao menos um número')
        if not re.search(r'[!@#$%^&*]', value):
            raise ValidationError('Senha deve conter ao menos um caractere especial')
```

#### **Dia 3-4: Sanitização de Dados**
```python
# backend/src/utils/validators.py - NOVO
import bleach
from html import escape

class DataSanitizer:
    @staticmethod
    def sanitize_html(text):
        return bleach.clean(text, tags=[], strip=True)
    
    @staticmethod
    def sanitize_sql_input(text):
        # Prevenir SQL injection
        return escape(text)
```

### ✅ **1.4 Validações Frontend (3 dias)**

#### **Dia 1-2: Validação em Tempo Real**
```javascript
// frontend/src/utils/validators.js - NOVO
export const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) || 'Email inválido'
  },
  
  password: (value) => {
    const errors = []
    if (value.length < 8) errors.push('Mínimo 8 caracteres')
    if (!/[A-Z]/.test(value)) errors.push('Uma letra maiúscula')
    if (!/[0-9]/.test(value)) errors.push('Um número')
    if (!/[!@#$%^&*]/.test(value)) errors.push('Um caractere especial')
    return errors.length === 0 || errors
  }
}
```

#### **Dia 3: Componentes de Validação**
```javascript
// frontend/src/components/forms/ValidatedInput.jsx - NOVO
import { useState, useEffect } from 'react'
import { Input } from '../ui/input'
import { Alert } from '../ui/alert'

export function ValidatedInput({ validator, ...props }) {
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  
  const handleValidation = (value) => {
    if (validator && touched) {
      const result = validator(value)
      setError(result === true ? '' : result)
    }
  }
  
  return (
    <div>
      <Input 
        {...props}
        onBlur={() => setTouched(true)}
        onChange={(e) => {
          props.onChange?.(e)
          handleValidation(e.target.value)
        }}
      />
      {error && <Alert variant="destructive">{error}</Alert>}
    </div>
  )
}
```

### ✅ **1.5 Headers de Segurança (3 dias)**

#### **Dia 1: Implementar Flask-Talisman**
```python
# backend/src/main.py - ADICIONAR
from flask_talisman import Talisman

# Configurar headers de segurança
Talisman(app, {
    'force_https': True,
    'strict_transport_security': True,
    'content_security_policy': {
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline'",
        'style-src': "'self' 'unsafe-inline'",
        'img-src': "'self' data: https:",
    }
})
```

#### **Dia 2: Rate Limiting**
```python
# backend/src/utils/rate_limiter.py - MELHORAR
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Aplicar em rotas sensíveis
@user_bp.route('/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    # Implementação do login
    pass
```

#### **Dia 3: Configuração Nginx**
```nginx
# nginx/nginx.conf - MELHORAR
server {
    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://backend:5000;
    }
}
```

---

## 🧪 **TESTES DE SEGURANÇA**

### **Testes Automatizados**
```python
# backend/tests/test_security.py - NOVO
import pytest
from src.models.user import User

class TestSecurity:
    def test_password_hashing(self):
        user = User(username='test', email='test@test.com')
        user.set_password('TestPass123!')
        assert user.check_password('TestPass123!')
        assert not user.check_password('wrongpass')
    
    def test_account_lockout(self):
        # Testar bloqueio após 5 tentativas
        pass
    
    def test_jwt_token_validation(self):
        # Testar validação de tokens
        pass
```

### **Testes de Penetração**
```bash
# scripts/security_tests.sh - NOVO
#!/bin/bash

echo "🔍 Executando testes de segurança..."

# Teste de SQL Injection
echo "Testing SQL Injection..."
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin'\'' OR 1=1--", "password": "any"}'

# Teste de XSS
echo "Testing XSS..."
curl -X POST http://localhost:5000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome": "<script>alert(\"XSS\")</script>"}'

# Teste de Rate Limiting
echo "Testing Rate Limiting..."
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "wrong"}'
done
```

---

## 📊 **MÉTRICAS DE SUCESSO - FASE 1**

### **Critérios de Aceitação**
- [ ] ✅ Senhas padrão alteradas
- [ ] ✅ JWT com refresh tokens implementado
- [ ] ✅ Validações robustas (backend + frontend)
- [ ] ✅ Headers de segurança configurados
- [ ] ✅ Rate limiting ativo
- [ ] ✅ Logs de auditoria funcionando
- [ ] ✅ Testes de segurança passando
- [ ] ✅ Account lockout implementado

### **Testes de Validação**
```bash
# Checklist de segurança
□ Senhas seguem política de complexidade
□ Tokens JWT expiram corretamente
□ Rate limiting bloqueia ataques
□ Headers de segurança presentes
□ Logs de auditoria funcionando
□ SQL injection bloqueado
□ XSS prevenido
□ CSRF protegido
```

---

## 🚀 **ENTREGÁVEIS DA FASE 1**

### **Código**
1. **Modelos melhorados** - User, RefreshToken
2. **Schemas de validação** - Marshmallow completo
3. **Middleware de segurança** - Auth, Rate limiting
4. **Componentes frontend** - Validação em tempo real
5. **Configurações** - Nginx, Flask-Talisman

### **Documentação**
1. **Guia de segurança** - Políticas e procedimentos
2. **API documentation** - Endpoints seguros
3. **Runbook** - Procedimentos de emergência

### **Scripts**
1. **Testes de segurança** - Automatizados
2. **Deploy seguro** - Scripts de produção
3. **Backup** - Procedimentos de segurança

---

## ⚡ **PRÓXIMOS PASSOS**

Após completar a Fase 1, o sistema estará **SEGURO** para uso em produção. 

**Próxima fase**: FASE 2 - QUALIDADE E TESTES (4-5 semanas)
- Testes unitários (80% cobertura)
- CI/CD Pipeline
- Sistema de logs
- Monitoramento básico

**🎯 Meta da Fase 1**: Sistema com segurança de nível empresarial, pronto para produção com confiança.
