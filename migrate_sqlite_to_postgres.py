#!/usr/bin/env python3
"""
Script para migrar dados do SQLite para PostgreSQL
Mantém a estrutura e dados existentes
"""

import os
import sys
import sqlite3
import psycopg2
from datetime import datetime
import json

def migrate_data():
    """Migrar dados do SQLite para PostgreSQL"""
    
    # Configurações do SQLite
    sqlite_db = 'backend/instance/erp_oficina.db'
    
    # Configurações do PostgreSQL
    pg_config = {
        'host': os.environ.get('POSTGRES_HOST', 'localhost'),
        'database': os.environ.get('POSTGRES_DB', 'erp_oficina'),
        'user': os.environ.get('POSTGRES_USER', 'erp_user'),
        'password': os.environ.get('POSTGRES_PASSWORD', 'erp_password')
    }
    
    print("🔄 Iniciando migração SQLite → PostgreSQL...")
    
    try:
        # Conectar aos bancos
        print("📁 Conectando ao SQLite...")
        sqlite_conn = sqlite3.connect(sqlite_db)
        sqlite_conn.row_factory = sqlite3.Row
        
        print("🐘 Conectando ao PostgreSQL...")
        pg_conn = psycopg2.connect(**pg_config)
        pg_conn.autocommit = False
        
        # Obter cursors
        sqlite_cursor = sqlite_conn.cursor()
        pg_cursor = pg_conn.cursor()
        
        # Listar tabelas do SQLite
        sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables = [row[0] for row in sqlite_cursor.fetchall()]
        
        print(f"📊 Encontradas {len(tables)} tabelas para migrar: {', '.join(tables)}")
        
        # Migrar cada tabela
        for table in tables:
            print(f"\n📋 Migrando tabela: {table}")
            
            # Verificar se a tabela existe no PostgreSQL
            pg_cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = %s
                );
            """, (table,))
            
            if not pg_cursor.fetchone()[0]:
                print(f"   ⚠️ Tabela {table} não existe no PostgreSQL, pulando...")
                continue
            
            # Obter dados do SQLite
            sqlite_cursor.execute(f"SELECT * FROM {table}")
            rows = sqlite_cursor.fetchall()
            
            if not rows:
                print(f"   ℹ️ Tabela {table} está vazia")
                continue
            
            # Obter nomes das colunas
            columns = [description[0] for description in sqlite_cursor.description]
            
            # Limpar tabela no PostgreSQL
            pg_cursor.execute(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;")
            
            # Inserir dados
            placeholders = ', '.join(['%s'] * len(columns))
            insert_sql = f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders})"
            
            migrated_count = 0
            for row in rows:
                try:
                    # Converter dados se necessário
                    row_data = []
                    for value in row:
                        if isinstance(value, str) and value.startswith('{') and value.endswith('}'):
                            # Tentar converter JSON
                            try:
                                row_data.append(json.loads(value))
                            except:
                                row_data.append(value)
                        else:
                            row_data.append(value)
                    
                    pg_cursor.execute(insert_sql, row_data)
                    migrated_count += 1
                except Exception as e:
                    print(f"   ⚠️ Erro ao inserir linha em {table}: {e}")
                    continue
            
            print(f"   ✅ {migrated_count}/{len(rows)} registros migrados")
        
        # Commit das alterações
        pg_conn.commit()
        
        # Fechar conexões
        sqlite_cursor.close()
        sqlite_conn.close()
        pg_cursor.close()
        pg_conn.close()
        
        print("\n🎉 Migração concluída com sucesso!")
        print("\n📋 PRÓXIMOS PASSOS:")
        print("   1. Verificar se todos os dados foram migrados corretamente")
        print("   2. Testar o login com AdminSuperUser/AdM!n@2024#Sec$Pass")
        print("   3. Verificar funcionalidades de cadastro")
        print("   4. Alterar senhas padrão")
        print("   5. Configurar backup do PostgreSQL")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Erro no SQLite: {e}")
        return False
    except psycopg2.Error as e:
        print(f"❌ Erro no PostgreSQL: {e}")
        if 'pg_conn' in locals():
            pg_conn.rollback()
        return False
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Iniciando migração de dados...")
    success = migrate_data()
    sys.exit(0 if success else 1)
