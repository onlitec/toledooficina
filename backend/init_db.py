#!/usr/bin/env python3
from src.models import db
from src.main import app

with app.app_context():
    db.create_all()
    print('Banco de dados inicializado com sucesso!')
    
    # Verificar tabelas criadas
    import sqlite3
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tabelas = cursor.fetchall()
    print('Tabelas criadas:', [t[0] for t in tabelas])
    
    # Verificar schema da tabela veículos
    cursor.execute("PRAGMA table_info(veiculos)")
    colunas = cursor.fetchall()
    print('\nColunas da tabela veículos:')
    for col in colunas:
        print(f"  {col[1]} {col[2]} {'NOT NULL' if col[3] else ''} {'PRIMARY KEY' if col[5] else ''}")
    
    # Verificar índices únicos
    cursor.execute("PRAGMA index_list(veiculos)")
    indices = cursor.fetchall()
    print('\nÍndices únicos:')
    for idx in indices:
        if idx[2]:  # Se é único
            print(f"  {idx[1]}")
            cursor.execute(f"PRAGMA index_info({idx[1]})")
            info = cursor.fetchall()
            for i in info:
                print(f"    Coluna: {i[2]}")
    
    conn.close()