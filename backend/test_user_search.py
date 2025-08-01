#!/usr/bin/env python3
import sys
sys.path.append('/home/alfreire/toledooficina/backend/src')

from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from models.user import User
from models import db
import os

# Configurar conexão com o banco
DATABASE_URL = "postgresql://erp_user:ErpSecure2024@localhost:5432/erp_oficina"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

print("Testando busca de usuários:")
print()

# Testar busca direta
print("1. Busca direta por username 'Admin':")
user_direct = session.query(User).filter(User.username == 'Admin').first()
if user_direct:
    print(f"   Encontrado: {user_direct.username} (ID: {user_direct.id})")
else:
    print("   Não encontrado")

print()
print("2. Busca case-insensitive por 'admin':")
user_case_insensitive = session.query(User).filter(
    func.lower(User.username) == func.lower('admin')
).first()
if user_case_insensitive:
    print(f"   Encontrado: {user_case_insensitive.username} (ID: {user_case_insensitive.id})")
else:
    print("   Não encontrado")

print()
print("3. Busca case-insensitive por 'Admin':")
user_case_insensitive2 = session.query(User).filter(
    func.lower(User.username) == func.lower('Admin')
).first()
if user_case_insensitive2:
    print(f"   Encontrado: {user_case_insensitive2.username} (ID: {user_case_insensitive2.id})")
else:
    print("   Não encontrado")

print()
print("4. Busca combinada (username ou email):")
username = 'Admin'
user_combined = session.query(User).filter(
    (func.lower(User.username) == func.lower(username)) | 
    (func.lower(User.email) == func.lower(username))
).first()
if user_combined:
    print(f"   Encontrado: {user_combined.username} (ID: {user_combined.id})")
    print(f"   Email: {user_combined.email}")
    print(f"   Ativo: {user_combined.ativo}")
else:
    print("   Não encontrado")

print()
print("5. Listar todos os usuários:")
all_users = session.query(User).all()
for user in all_users:
    print(f"   {user.username} ({user.email}) - Ativo: {user.ativo}")

session.close()