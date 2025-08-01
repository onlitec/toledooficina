#!/usr/bin/env python3
import os
import sys
import requests
import json

# Configurar variáveis de ambiente
os.environ['DATABASE_URL'] = 'postgresql://erp_user:"ErpSecure2024"@postgres:5432/erp_oficina'
os.environ['SECRET_KEY'] = 'dev-secret-key-change-in-production'
os.environ['FLASK_ENV'] = 'development'

# Adicionar o diretório src ao path
sys.path.insert(0, '/app/src')

from flask import Flask
from src.models import db
from src.models.user import User
from src.routes.user import user_bp
from sqlalchemy import func

def create_test_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://erp_user:"ErpSecure2024"@postgres:5432/erp_oficina'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    app.register_blueprint(user_bp, url_prefix='/api')
    
    return app

app = create_test_app()

with app.app_context():
    print("Testando busca de usuário diretamente:")
    
    # Buscar usuário como no código de login
    username = 'Admin'
    user = User.query.filter(
        (func.lower(User.username) == func.lower(username)) | 
        (func.lower(User.email) == func.lower(username))
    ).first()
    
    if user:
        print(f"Usuário encontrado: {user.username} (ID: {user.id})")
        print(f"Email: {user.email}")
        print(f"Ativo: {user.ativo}")
        print(f"Bloqueado: {user.is_account_locked()}")
        print(f"Tentativas de login: {user.failed_login_attempts}")
        
        # Testar senha
        password = 'admin123'
        password_valid = user.check_password(password)
        print(f"Senha '{password}' válida: {password_valid}")
        
        if password_valid and user.ativo and not user.is_account_locked():
            print("✅ Login deveria funcionar!")
        else:
            print("❌ Login falhou por:")
            if not password_valid:
                print("  - Senha inválida")
            if not user.ativo:
                print("  - Usuário inativo")
            if user.is_account_locked():
                print("  - Usuário bloqueado")
    else:
        print("❌ Usuário não encontrado")
        
    # Listar todos os usuários
    print("\nTodos os usuários:")
    users = User.query.all()
    for u in users:
        print(f"  {u.username} ({u.email}) - Ativo: {u.ativo}, Bloqueado: {u.is_account_locked()}")