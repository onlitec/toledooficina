#!/usr/bin/env python3
import os
import sys
from datetime import datetime

# Configurar variáveis de ambiente
os.environ['DATABASE_URL'] = 'postgresql://erp_user:"ErpSecure2024"@postgres:5432/erp_oficina'
os.environ['SECRET_KEY'] = 'dev-secret-key-change-in-production'
os.environ['FLASK_ENV'] = 'development'

# Adicionar o diretório src ao path
sys.path.insert(0, '/app/src')

from src.security import rate_limit_storage
from src.main import create_app

app = create_app()

with app.app_context():
    print("=== LIMPEZA DO RATE LIMITING ===\n")
    
    print(f"Rate limit storage antes: {dict(rate_limit_storage)}")
    
    # Limpar todo o cache de rate limiting
    rate_limit_storage.clear()
    
    print(f"Rate limit storage depois: {dict(rate_limit_storage)}")
    print("\n✅ Cache de rate limiting limpo com sucesso!")