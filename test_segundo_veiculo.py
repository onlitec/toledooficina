#!/usr/bin/env python3
import requests
import json

# Dados do segundo veículo para teste (também com chassi vazio)
veiculo_data = {
    "cliente_id": 2,
    "marca": "VOLKSWAGEN",
    "modelo": "GOL",
    "ano_fabricacao": 2019,
    "ano_modelo": 2019,
    "cor": "Prata",
    "placa": "ABC-1111",
    "chassi": "",
    "renavam": "98765432109",
    "combustivel": "flex",
    "motor": "1.6",
    "cambio": "manual",
    "quilometragem": 25000,
    "observacoes": "Segundo veículo teste"
}

print("=== TESTE DE SEGUNDO VEÍCULO COM CHASSI VAZIO ===")
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
        print("\n✅ Segundo veículo cadastrado com sucesso!")
        print("✅ Problema do UNIQUE constraint resolvido!")
    else:
        print(f"\n❌ Erro no cadastro: {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("❌ Erro: Não foi possível conectar ao servidor backend")
except Exception as e:
    print(f"❌ Erro inesperado: {e}")

print("\n=== FIM DO TESTE ===")