#!/usr/bin/env python3
import sqlite3
import os

# Conectar ao banco de dados
db_path = 'src/database/app.db'
if not os.path.exists(db_path):
    print(f"Banco de dados não encontrado: {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=== CORRIGINDO CHASSI VAZIO ===")
print()

# Verificar veículos com chassi vazio
print("1. Veículos com chassi vazio antes da correção:")
cursor.execute("SELECT id, marca, modelo, placa, chassi FROM veiculos WHERE chassi = ''")
veiculos_vazios = cursor.fetchall()
for veiculo in veiculos_vazios:
    print(f"   ID: {veiculo[0]}, {veiculo[1]} {veiculo[2]}, Placa: {veiculo[3]}, Chassi: '{veiculo[4]}'")
print()

# Corrigir chassi vazio para NULL
print("2. Corrigindo chassi vazio para NULL...")
cursor.execute("UPDATE veiculos SET chassi = NULL WHERE chassi = ''")
rows_affected = cursor.rowcount
print(f"   {rows_affected} veículo(s) corrigido(s)")
print()

# Verificar após correção
print("3. Verificando após correção:")
cursor.execute("SELECT COUNT(*) FROM veiculos WHERE chassi IS NULL")
null_count = cursor.fetchone()[0]
cursor.execute("SELECT COUNT(*) FROM veiculos WHERE chassi = ''")
empty_count = cursor.fetchone()[0]
print(f"   Chassi NULL: {null_count}")
print(f"   Chassi vazio: {empty_count}")
print()

# Salvar mudanças
conn.commit()
print("4. Mudanças salvas no banco de dados")

conn.close()
print("\n=== CORREÇÃO CONCLUÍDA ===")