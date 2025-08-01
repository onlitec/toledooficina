#!/usr/bin/env python3
import sys
import os
sys.path.append('/home/alfreire/toledooficina/backend/src')

# Configurar variáveis de ambiente
os.environ['DATABASE_URL'] = 'postgresql://erp_user:"ErpSecure2024"@postgres:5432/erp_oficina'
os.environ['SECRET_KEY'] = 'dev-secret-key-change-in-production'
os.environ['FLASK_ENV'] = 'development'

from flask import Flask
from sqlalchemy import func
from src.models import db
from src.models.user import User

# Criar app Flask
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ['SECRET_KEY']

# Inicializar banco
db.init_app(app)

with app.app_context():
    print("Testando busca de usuários no contexto da aplicação:")
    print()
    
    # Testar busca direta
    print("1. Busca direta por username 'Admin':")
    user_direct = User.query.filter(User.username == 'Admin').first()
    if user_direct:
        print(f"   Encontrado: {user_direct.username} (ID: {user_direct.id})")
        print(f"   Email: {user_direct.email}")
        print(f"   Ativo: {user_direct.ativo}")
        print(f"   Hash: {user_direct.password_hash[:50]}...")
    else:
        print("   Não encontrado")
    
    print()
    print("2. Busca case-insensitive por 'admin':")
    user_case_insensitive = User.query.filter(
        func.lower(User.username) == func.lower('admin')
    ).first()
    if user_case_insensitive:
        print(f"   Encontrado: {user_case_insensitive.username} (ID: {user_case_insensitive.id})")
    else:
        print("   Não encontrado")
    
    print()
    print("3. Busca combinada (como no código de login):")
    username = 'Admin'
    user_combined = User.query.filter(
        (func.lower(User.username) == func.lower(username)) | 
        (func.lower(User.email) == func.lower(username))
    ).first()
    if user_combined:
        print(f"   Encontrado: {user_combined.username} (ID: {user_combined.id})")
        print(f"   Testando senha 'admin123':")
        password_check = user_combined.check_password('admin123')
        print(f"   Senha válida: {password_check}")
    else:
        print("   Não encontrado")
    
    print()
    print("4. Listar todos os usuários:")
    all_users = User.query.all()
    for user in all_users:
        print(f"   {user.username} ({user.email}) - Ativo: {user.ativo}")