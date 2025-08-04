#!/usr/bin/env python3
"""
Script para inicializar usuário administrador no banco de dados
Compatível com PostgreSQL e SQLite
"""

import os
import sys
import psycopg2
import sqlite3
from pathlib import Path

def init_admin_user():
    """Inicializar usuário administrador"""
    
    # Detectar tipo de banco de dados
    postgres_host = os.environ.get('POSTGRES_HOST')
    
    if postgres_host:
        print("🐘 Conectando ao PostgreSQL...")
        return init_admin_postgresql()
    else:
        print("📁 Conectando ao SQLite...")
        return init_admin_sqlite()

def init_admin_postgresql():
    """Inicializar admin no PostgreSQL"""
    try:
        # Conectar ao PostgreSQL
        conn = psycopg2.connect(
            host=os.environ.get('POSTGRES_HOST', 'localhost'),
            database=os.environ.get('POSTGRES_DB', 'erp_oficina'),
            user=os.environ.get('POSTGRES_USER', 'erp_user'),
            password=os.environ.get('POSTGRES_PASSWORD', 'erp_password')
        )
        cursor = conn.cursor()
        
        # Verificar se usuário Admin já existe (por username ou email)
        cursor.execute("SELECT id, username, email FROM users WHERE username = 'AdminSuperUser' OR email = 'admin.super@oficina.com';")
        admin_exists = cursor.fetchone()
        
        # Preparar hash da senha usando bcrypt
        import bcrypt
        password_bytes = 'AdM!n@2024#Sec$Pass'.encode('utf-8')
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        if admin_exists:
            print(f"👤 Atualizando usuário Admin existente (ID: {admin_exists[0]})...")
            # Atualizar usuário existente
            cursor.execute(
                """UPDATE users SET 
                   username = 'AdminSuperUser', 
                   email = 'admin.super@oficina.com', 
                   nome_completo = 'Administrador do Sistema',
                   password_hash = %s, 
                   role = 'admin', 
                   ativo = 1,
                   failed_login_attempts = 0
                   WHERE id = %s;""",
                (password_hash, admin_exists[0])
            )
        else:
            print("👤 Criando usuário Admin...")
            # Inserir usuário Admin
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, role, is_active, created_at, updated_at)
                VALUES ('AdminSuperUser', 'admin.super@oficina.com', %s, 'admin', true, NOW(), NOW())
            """, (password_hash,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ Usuário Admin inicializado com sucesso!")
        print("   Username: AdminSuperUser")
        print("   Email: admin.super@oficina.com")
        print("   Senha: AdM!n@2024#Sec$Pass")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao inicializar admin no PostgreSQL: {e}")
        return False

def init_admin_sqlite():
    """Inicializar admin no SQLite"""
    try:
        # Caminho do banco SQLite
        db_path = Path(__file__).parent / 'instance' / 'erp_oficina.db'
        db_path.parent.mkdir(exist_ok=True)
        
        # Conectar ao SQLite
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Verificar se usuário Admin já existe
        cursor.execute("SELECT id, username, email FROM users WHERE username = 'AdminSuperUser' OR email = 'admin.super@oficina.com';")
        admin_exists = cursor.fetchone()
        
        # Preparar hash da senha usando bcrypt
        import bcrypt
        password_bytes = 'AdM!n@2024#Sec$Pass'.encode('utf-8')
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        if admin_exists:
            print(f"👤 Atualizando usuário Admin existente (ID: {admin_exists[0]})...")
            # Atualizar usuário existente
            cursor.execute(
                """UPDATE users SET 
                   username = ?, 
                   email = ?, 
                   nome_completo = ?,
                   password_hash = ?, 
                   role = ?, 
                   ativo = ?,
                   failed_login_attempts = 0
                   WHERE id = ?;""",
                ('AdminSuperUser', 'admin.super@oficina.com', 'Administrador do Sistema', password_hash, 'admin', 1, admin_exists[0])
            )
        else:
            print("👤 Criando usuário Admin...")
            # Inserir usuário Admin
            cursor.execute(
                """INSERT INTO users (username, email, nome_completo, password_hash, role, ativo, data_cadastro, failed_login_attempts) 
                   VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 0);""",
                ('AdminSuperUser', 'admin.super@oficina.com', 'Administrador do Sistema', password_hash, 'admin', 1)
            )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ Usuário Admin inicializado com sucesso!")
        print("   Username: AdminSuperUser")
        print("   Email: admin.super@oficina.com")
        print("   Senha: AdM!n@2024#Sec$Pass")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao inicializar admin no SQLite: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Inicializando usuário administrador...")
    success = init_admin_user()
    sys.exit(0 if success else 1)
