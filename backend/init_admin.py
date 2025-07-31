#!/usr/bin/env python3
"""
Script simples para criar usuário admin no banco SQLite
"""
import os
import sys
import sqlite3
from werkzeug.security import generate_password_hash

# Caminho para o banco SQLite
db_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')

print(f"🔍 Verificando banco de dados: {db_path}")

if not os.path.exists(db_path):
    print("❌ Banco de dados não encontrado!")
    sys.exit(1)

try:
    # Conectar ao banco SQLite
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Verificar se a tabela users existe
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
    if not cursor.fetchone():
        print("❌ Tabela 'users' não encontrada!")
        conn.close()
        sys.exit(1)
    
    # Verificar se usuário Admin já existe (por username ou email)
    cursor.execute("SELECT id, username, email FROM users WHERE username = 'Admin' OR email = 'admin@oficina.com';")
    admin_exists = cursor.fetchone()
    
    # Preparar hash da senha usando bcrypt
    import bcrypt
    password_bytes = 'admin123'.encode('utf-8')
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    if admin_exists:
        print(f"👤 Usuário encontrado (ID: {admin_exists[0]}, Username: {admin_exists[1]}, Email: {admin_exists[2]}). Atualizando...")
        # Atualizar usuário existente
        cursor.execute(
            """UPDATE users SET 
               username = 'Admin', 
               email = 'admin@oficina.com', 
               nome_completo = 'Administrador do Sistema',
               password_hash = ?, 
               role = 'admin',
               ativo = 1, 
               failed_login_attempts = 0,
               account_locked_until = NULL
               WHERE id = ?;""",
            (password_hash, admin_exists[0])
        )
    else:
        print("👤 Criando usuário Admin...")
        # Criar usuário admin
        cursor.execute(
            """INSERT INTO users (username, email, nome_completo, password_hash, role, ativo, data_cadastro, failed_login_attempts) 
               VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 0);""",
            ('Admin', 'admin@oficina.com', 'Administrador do Sistema', password_hash, 'admin', 1)
        )
    
    # Confirmar mudanças
    conn.commit()
    
    # Verificar usuário criado
    cursor.execute("SELECT username, email, role, ativo FROM users WHERE username = 'Admin';")
    admin_user = cursor.fetchone()
    
    if admin_user:
        print("✅ Usuário Admin configurado com sucesso!")
        print(f"   Username: {admin_user[0]}")
        print(f"   Email: {admin_user[1]}")
        print(f"   Role: {admin_user[2]}")
        print(f"   Ativo: {admin_user[3]}")
        print("   Senha: admin123")
        print("\n🔐 IMPORTANTE: Altere a senha padrão após o primeiro login!")
    else:
        print("❌ Erro ao verificar usuário criado")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Erro: {e}")
    sys.exit(1)

print("\n🚀 Agora você pode fazer login com:")
print("   Username: Admin")
print("   Senha: admin123")