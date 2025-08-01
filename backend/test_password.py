#!/usr/bin/env python3
import bcrypt

# Hash do banco de dados
hash_from_db = "$2b$12$hPPeS/bCzHRng7OG70f53.gsgp1Lh3Lm7Tjn6ElOuR0Zjjp1IHyhm"

# Senhas para testar
passwords_to_test = [
    "admin123",
    "AdM!n@2024#Sec$Pass",
    "Admin123",
    "ADMIN123"
]

print("Testando verificação de senhas:")
print(f"Hash do banco: {hash_from_db}")
print()

for password in passwords_to_test:
    try:
        password_bytes = password.encode('utf-8')
        hash_bytes = hash_from_db.encode('utf-8')
        result = bcrypt.checkpw(password_bytes, hash_bytes)
        print(f"Senha '{password}': {'✓ VÁLIDA' if result else '✗ INVÁLIDA'}")
    except Exception as e:
        print(f"Senha '{password}': ERRO - {e}")

print()
print("Testando criação de novo hash para 'admin123':")
password = "admin123"
password_bytes = password.encode('utf-8')
salt = bcrypt.gensalt()
new_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
print(f"Novo hash: {new_hash}")

# Verificar se o novo hash funciona
result = bcrypt.checkpw(password_bytes, new_hash.encode('utf-8'))
print(f"Verificação do novo hash: {'✓ VÁLIDA' if result else '✗ INVÁLIDA'}")