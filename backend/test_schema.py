#!/usr/bin/env python3
import os
import sys

# Configurar variáveis de ambiente
os.environ['DATABASE_URL'] = 'postgresql://erp_user:"ErpSecure2024"@postgres:5432/erp_oficina'
os.environ['SECRET_KEY'] = 'dev-secret-key-change-in-production'
os.environ['FLASK_ENV'] = 'development'

# Adicionar o diretório src ao path
sys.path.insert(0, '/app/src')

from src.schemas.user_schemas import LoginSchema
from marshmallow import ValidationError

print("Testando validação do schema de login:")

schema = LoginSchema()
data = {
    'username': 'Admin',
    'password': 'admin123'
}

try:
    validated_data = schema.load(data)
    print(f"✅ Dados validados com sucesso: {validated_data}")
except ValidationError as err:
    print(f"❌ Erro de validação: {err.messages}")

# Testar com diferentes variações
test_cases = [
    {'username': 'admin', 'password': 'admin123'},
    {'username': 'ADMIN', 'password': 'admin123'},
    {'username': 'Admin', 'password': 'ADMIN123'},
    {'username': 'admin@oficina.com', 'password': 'admin123'}
]

for i, test_data in enumerate(test_cases, 1):
    print(f"\nTeste {i}: {test_data}")
    try:
        validated = schema.load(test_data)
        print(f"  ✅ Validado: {validated}")
    except ValidationError as err:
        print(f"  ❌ Erro: {err.messages}")