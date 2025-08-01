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
from sqlalchemy import func

app = create_app()

with app.app_context():
    print("=== VERIFICAÇÃO COMPLETA DE USUÁRIOS ===\n")
    
    # Buscar todos os usuários com username similar a Admin
    users = User.query.filter(
        func.lower(User.username).like('%admin%')
    ).all()
    
    print(f"Usuários encontrados com 'admin': {len(users)}")
    
    for user in users:
        print(f"\n--- Usuário: {user.username} (ID: {user.id}) ---")
        print(f"Email: {user.email}")
        print(f"Ativo: {user.ativo}")
        print(f"Role: {user.role}")
        print(f"Tentativas falhadas: {user.failed_login_attempts}")
        print(f"Bloqueado até: {user.account_locked_until}")
        print(f"Está bloqueado: {user.is_account_locked()}")
        print(f"Data atual: {datetime.utcnow()}")
        
        # Testar senha
        password_ok = user.check_password('admin123')
        print(f"Senha 'admin123' válida: {password_ok}")
        
        # Forçar desbloqueio
        user.failed_login_attempts = 0
        user.account_locked_until = None
        
    db.session.commit()
    print("\n✅ Todos os usuários foram desbloqueados!")