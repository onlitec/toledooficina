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

from src.models import db
from src.models.user import User
from src.main import create_app

app = create_app()

with app.app_context():
    # Buscar o usuário Admin
    admin_user = User.query.filter_by(username='Admin').first()
    
    if admin_user:
        print(f"Usuário encontrado: {admin_user.username}")
        print(f"Tentativas de login falhadas: {admin_user.failed_login_attempts}")
        print(f"Conta bloqueada até: {admin_user.account_locked_until}")
        print(f"Conta está bloqueada: {admin_user.is_account_locked()}")
        print(f"Data/hora atual: {datetime.utcnow()}")
        
        # Forçar reset completo
        admin_user.failed_login_attempts = 0
        admin_user.account_locked_until = None
        
        db.session.commit()
        
        print("\n✅ Reset completo realizado!")
        print(f"Novas tentativas: {admin_user.failed_login_attempts}")
        print(f"Nova data de bloqueio: {admin_user.account_locked_until}")
        print(f"Conta ainda bloqueada: {admin_user.is_account_locked()}")
    else:
        print("❌ Usuário Admin não encontrado!")