#!/usr/bin/env python3
import requests
import json

# Dados do veículo com chassi preenchido
veiculo_data = {
    "cliente_id": 2,
    "marca": "HONDA",
    "modelo": "CIVIC",
    "ano_fabricacao": 2021,
    "ano_modelo": 2021,
    "cor": "Preto",
    "placa": "HND-2021",
    "chassi": "9BWZZZ377VT004251",
    "renavam": "11122334455",
    "combustivel": "flex",
    "motor": "2.0",
    "cambio": "automatico",
    "quilometragem": 5000,
    "observacoes": "Veículo com chassi preenchido"
}

print("=== TESTE DE VEÍCULO COM CHASSI PREENCHIDO ===")
print(f"Dados: {json.dumps(veiculo_data, indent=2)}")
print()

try:
    response = requests.post(
        'http://localhost:5000/api/veiculos',
        json=veiculo_data,
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        print("\n✅ Veículo com chassi cadastrado com sucesso!")
    else:
        print(f"\n❌ Erro no cadastro: {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("❌ Erro: Não foi possível conectar ao servidor backend")
except Exception as e:
    print(f"❌ Erro inesperado: {e}")

print("\n=== FIM DO TESTE ===")