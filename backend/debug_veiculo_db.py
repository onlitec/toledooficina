#!/usr/bin/env python3
import sqlite3
import os

# Conectar ao banco de dados correto
db_path = 'src/database/app.db'
if not os.path.exists(db_path):
    print(f"Banco de dados não encontrado: {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=== INVESTIGAÇÃO DO ERRO DE CONSTRAINT UNIQUE EM VEÍCULOS ===")
print()

# Verificar tabelas existentes
print("1. Tabelas no banco:")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tabelas = cursor.fetchall()
for tabela in tabelas:
    print(f"   {tabela[0]}")
print()

# Verificar schema da tabela veículos
print("2. Schema da tabela veículos:")
cursor.execute("PRAGMA table_info(veiculos)")
columns = cursor.fetchall()
for col in columns:
    print(f"   {col[1]} {col[2]} {'NOT NULL' if col[3] else ''} {'PRIMARY KEY' if col[5] else ''}")
print()

# Verificar índices únicos
print("3. Índices únicos na tabela veículos:")
cursor.execute("PRAGMA index_list(veiculos)")
indexes = cursor.fetchall()
for idx in indexes:
    if idx[2]:  # Se é único
        print(f"   Índice único: {idx[1]}")
        cursor.execute(f"PRAGMA index_info({idx[1]})")
        index_info = cursor.fetchall()
        for info in index_info:
            print(f"     Coluna: {info[2]}")
print()

# Verificar veículos existentes
print("4. Veículos cadastrados:")
cursor.execute("SELECT id, marca, modelo, placa, chassi, ativo FROM veiculos ORDER BY id")
veiculos = cursor.fetchall()
for veiculo in veiculos:
    print(f"   ID: {veiculo[0]}, {veiculo[1]} {veiculo[2]}, Placa: {veiculo[3]}, Chassi: {veiculo[4]}, Ativo: {veiculo[5]}")
print()

# Verificar duplicatas de chassi
print("5. Verificando duplicatas de chassi:")
cursor.execute("""
    SELECT chassi, COUNT(*) as count 
    FROM veiculos 
    WHERE chassi IS NOT NULL AND chassi != '' 
    GROUP BY chassi 
    HAVING COUNT(*) > 1
""")
duplicatas = cursor.fetchall()
if duplicatas:
    print("   DUPLICATAS ENCONTRADAS:")
    for dup in duplicatas:
        print(f"     Chassi: {dup[0]} - {dup[1]} veículos")
        cursor.execute("SELECT id, marca, modelo, placa, ativo FROM veiculos WHERE chassi = ?", (dup[0],))
        veiculos_dup = cursor.fetchall()
        for v in veiculos_dup:
            print(f"       ID: {v[0]}, {v[1]} {v[2]}, Placa: {v[3]}, Ativo: {v[4]}")
else:
    print("   Nenhuma duplicata de chassi encontrada")
print()

# Verificar duplicatas de placa
print("6. Verificando duplicatas de placa:")
cursor.execute("""
    SELECT placa, COUNT(*) as count 
    FROM veiculos 
    GROUP BY placa 
    HAVING COUNT(*) > 1
""")
duplicatas_placa = cursor.fetchall()
if duplicatas_placa:
    print("   DUPLICATAS DE PLACA ENCONTRADAS:")
    for dup in duplicatas_placa:
        print(f"     Placa: {dup[0]} - {dup[1]} veículos")
else:
    print("   Nenhuma duplicata de placa encontrada")
print()

# Verificar valores NULL ou vazios no chassi
print("7. Verificando valores NULL ou vazios no chassi:")
cursor.execute("SELECT COUNT(*) FROM veiculos WHERE chassi IS NULL")
null_count = cursor.fetchone()[0]
cursor.execute("SELECT COUNT(*) FROM veiculos WHERE chassi = ''")
empty_count = cursor.fetchone()[0]
print(f"   Chassi NULL: {null_count}")
print(f"   Chassi vazio: {empty_count}")

conn.close()
print("\n=== FIM DA INVESTIGAÇÃO ===")