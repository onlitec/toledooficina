#!/usr/bin/env python3
"""
Script para migrar dados do SQLite para PostgreSQL
"""
import os
import sys
import sqlite3
import psycopg2
from datetime import datetime

# Configurações do PostgreSQL
POSTGRES_CONFIG = {
    'host': '172.100.0.2',
    'port': 5432,
    'database': 'erp_oficina',
    'user': 'erp_user',
    'password': 'erp_password_2024'
}

# Caminho do banco SQLite
SQLITE_DB_PATH = '/home/alfreire/toledooficina/backend/backup_app_db_20250730_190313.db'

def connect_sqlite():
    """Conectar ao banco SQLite"""
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row  # Para acessar colunas por nome
        return conn
    except Exception as e:
        print(f"❌ Erro ao conectar ao SQLite: {e}")
        return None

def connect_postgres():
    """Conectar ao banco PostgreSQL"""
    try:
        conn = psycopg2.connect(**POSTGRES_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ Erro ao conectar ao PostgreSQL: {e}")
        return None

def migrate_table(sqlite_conn, postgres_conn, table_name, columns_mapping=None):
    """Migrar uma tabela específica"""
    try:
        sqlite_cursor = sqlite_conn.cursor()
        postgres_cursor = postgres_conn.cursor()
        
        # Buscar dados do SQLite
        sqlite_cursor.execute(f"SELECT * FROM {table_name}")
        rows = sqlite_cursor.fetchall()
        
        if not rows:
            print(f"   ℹ️ Tabela {table_name} está vazia")
            return True
        
        # Obter nomes das colunas
        column_names = [description[0] for description in sqlite_cursor.description]
        
        # Aplicar mapeamento de colunas se fornecido
        if columns_mapping:
            column_names = [columns_mapping.get(col, col) for col in column_names]
        
        # Preparar query de inserção
        placeholders = ', '.join(['%s'] * len(column_names))
        columns_str = ', '.join(column_names)
        insert_query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
        
        # Inserir dados no PostgreSQL
        for row in rows:
            try:
                postgres_cursor.execute(insert_query, tuple(row))
            except Exception as e:
                print(f"   ⚠️ Erro ao inserir linha em {table_name}: {e}")
                continue
        
        postgres_conn.commit()
        print(f"   ✅ Tabela {table_name} migrada com sucesso ({len(rows)} registros)")
        return True
        
    except Exception as e:
        print(f"   ❌ Erro ao migrar tabela {table_name}: {e}")
        postgres_conn.rollback()
        return False

def main():
    """Função principal de migração"""
    print("🚀 Iniciando migração do SQLite para PostgreSQL...")
    
    # Verificar se o arquivo SQLite existe
    if not os.path.exists(SQLITE_DB_PATH):
        print(f"❌ Arquivo SQLite não encontrado: {SQLITE_DB_PATH}")
        return False
    
    # Conectar aos bancos
    sqlite_conn = connect_sqlite()
    if not sqlite_conn:
        return False
    
    postgres_conn = connect_postgres()
    if not postgres_conn:
        sqlite_conn.close()
        return False
    
    try:
        # Lista de tabelas para migrar (em ordem de dependência)
        tables_to_migrate = [
            'users',
            'configuracao_empresa',
            'categorias',
            'tipos_servico',
            'clientes',
            'veiculos',
            'pecas',
            'fornecedores'
        ]
        
        print("📊 Migrando tabelas...")
        
        for table in tables_to_migrate:
            print(f"📋 Migrando tabela: {table}")
            success = migrate_table(sqlite_conn, postgres_conn, table)
            if not success:
                print(f"❌ Falha na migração da tabela {table}")
                return False
        
        print("\n🎉 Migração concluída com sucesso!")
        print("\n📋 PRÓXIMOS PASSOS:")
        print("   1. Verificar se todos os dados foram migrados corretamente")
        print("   2. Testar o login com Admin/admin123")
        print("   3. Verificar funcionalidades de cadastro")
        print("   4. Alterar senhas padrão")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante a migração: {e}")
        return False
        
    finally:
        sqlite_conn.close()
        postgres_conn.close()

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)