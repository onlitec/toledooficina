#!/usr/bin/env python3
"""
Migração para aumentar o tamanho do campo chassi de 20 para 30 caracteres
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Adicionar o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def migrate_chassi_field():
    """Migra o campo chassi para VARCHAR(30)"""
    
    # Configuração do banco de dados
    postgres_host = os.getenv('POSTGRES_HOST', 'postgres')
    postgres_db = os.getenv('POSTGRES_DB', 'erp_oficina')
    postgres_user = os.getenv('POSTGRES_USER', 'erp_user')
    postgres_password = os.getenv('POSTGRES_PASSWORD', 'erp_password_2024')
    
    database_url = f'postgresql://{postgres_user}:{postgres_password}@{postgres_host}:5432/{postgres_db}'
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Verificar se estamos usando SQLite ou PostgreSQL
            if 'sqlite' in database_url:
                print("Detectado SQLite - executando migração...")
                
                # Para SQLite, precisamos recriar a tabela
                migration_sql = """
                -- Criar tabela temporária com nova estrutura
                CREATE TABLE veiculos_temp (
                    id INTEGER PRIMARY KEY,
                    cliente_id INTEGER NOT NULL,
                    marca VARCHAR(50) NOT NULL,
                    modelo VARCHAR(50) NOT NULL,
                    ano_fabricacao INTEGER,
                    ano_modelo INTEGER,
                    cor VARCHAR(30),
                    placa VARCHAR(10) UNIQUE NOT NULL,
                    chassi VARCHAR(30) UNIQUE,
                    renavam VARCHAR(15),
                    combustivel VARCHAR(20),
                    motor VARCHAR(50),
                    cambio VARCHAR(20),
                    quilometragem INTEGER DEFAULT 0,
                    vencimento_ipva DATE,
                    vencimento_seguro DATE,
                    vencimento_licenciamento DATE,
                    observacoes TEXT,
                    fotos JSON,
                    ativo BOOLEAN DEFAULT 1,
                    data_cadastro DATETIME,
                    data_atualizacao DATETIME,
                    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
                );
                
                -- Copiar dados da tabela original
                INSERT INTO veiculos_temp SELECT * FROM veiculos;
                
                -- Remover tabela original
                DROP TABLE veiculos;
                
                -- Renomear tabela temporária
                ALTER TABLE veiculos_temp RENAME TO veiculos;
                """
                
            else:
                print("Detectado PostgreSQL - executando migração...")
                
                # Para PostgreSQL, podemos alterar diretamente
                migration_sql = """
                ALTER TABLE veiculos ALTER COLUMN chassi TYPE VARCHAR(30);
                """
            
            # Executar migração
            for statement in migration_sql.split(';'):
                statement = statement.strip()
                if statement:
                    print(f"Executando: {statement[:50]}...")
                    conn.execute(text(statement))
            
            conn.commit()
            print("✅ Migração do campo chassi concluída com sucesso!")
            
    except SQLAlchemyError as e:
        print(f"❌ Erro durante a migração: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False
    
    return True

if __name__ == '__main__':
    print("=== MIGRAÇÃO DO CAMPO CHASSI ===")
    print("Aumentando tamanho do campo chassi de VARCHAR(20) para VARCHAR(30)")
    print()
    
    success = migrate_chassi_field()
    
    if success:
        print("\n🎉 Migração concluída! O campo chassi agora suporta até 30 caracteres.")
    else:
        print("\n💥 Falha na migração. Verifique os logs acima.")
        sys.exit(1)