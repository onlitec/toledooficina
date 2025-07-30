#!/usr/bin/env python3
import requests
import json

# Dados do veículo para teste
veiculo_data = {
    "cliente_id": 2,
    "marca": "FIAT",
    "modelo": "UNO",
    "ano_fabricacao": 2020,
    "ano_modelo": 2020,
    "cor": "Branco",
    "placa": "XYZ-9999",
    "chassi": "",
    "renavam": "12345678901",
    "combustivel": "flex",
    "motor": "1.0",
    "cambio": "manual",
    "quilometragem": 15000,
    "observacoes": "Veículo em bom estado"
}

print("=== TESTE DE CADASTRO DE VEÍCULO ===")
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
        print("\n✅ Veículo cadastrado com sucesso!")
    else:
        print(f"\n❌ Erro no cadastro: {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("❌ Erro: Não foi possível conectar ao servidor backend")
except Exception as e:
    print(f"❌ Erro inesperado: {e}")

print("\n=== FIM DO TESTE ===")