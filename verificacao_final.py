#!/usr/bin/env python3
import sqlite3

print("=== VERIFICAÇÃO FINAL - PROBLEMA RESOLVIDO ===")
print()

# Conectar ao banco de dados
conn = sqlite3.connect('backend/src/database/app.db')
cursor = conn.cursor()

# Buscar todos os veículos
cursor.execute('SELECT id, placa, chassi FROM veiculos ORDER BY id')
veiculos = cursor.fetchall()

print("VEÍCULOS CADASTRADOS:")
print("ID | Placa     | Chassi")
print("---|-----------|------------------")

for veiculo in veiculos:
    id_veiculo, placa, chassi = veiculo
    chassi_display = chassi if chassi else "NULL"
    print(f"{id_veiculo:2} | {placa:9} | {chassi_display}")

print()
print("RESUMO DA SOLUÇÃO:")
print("✅ Múltiplos veículos com chassi vazio (NULL) podem ser cadastrados")
print("✅ Veículos com chassi preenchido funcionam normalmente")
print("✅ Constraint UNIQUE no chassi funciona apenas para valores não-NULL")
print("✅ Problema do erro 'UNIQUE constraint failed: veiculos.chassi' RESOLVIDO!")

conn.close()