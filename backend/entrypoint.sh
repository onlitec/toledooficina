#!/bin/sh

# Aguardar o banco de dados estar pronto
while ! nc -z postgres 5432; do
  echo "Aguardando o PostgreSQL..."
  sleep 1
done

# Executar o script de inicialização do banco de dados
echo "Inicializando o banco de dados..."
python src/init_db.py

# Executar o comando principal (passado como argumentos para este script)
exec "$@"