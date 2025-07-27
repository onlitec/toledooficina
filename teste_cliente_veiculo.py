#!/usr/bin/env python3
import json

# Dados de teste para cliente com veículo
dados_teste = {
    "nome": "João Silva",
    "tipo_pessoa": "fisica",
    "cpf_cnpj": "12345678902",
    "telefone": "(11) 1234-5678",
    "celular": "(11) 98765-4321",
    "email": "joao@teste.com",
    "endereco": "Rua das Flores, 123",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567",
    "veiculos": [
        {
            "marca": "Toyota",
            "modelo": "Corolla",
            "ano_fabricacao": 2020,
            "ano_modelo": 2021,
            "cor": "Prata",
            "placa": "ABC-1234",
            "chassi": "9BWZZZ377VT004251",
            "renavam": "12345678901",
            "combustivel": "flex",
            "motor": "1.8",
            "cambio": "automatico",
            "quilometragem": 50000,
            "observacoes": "Veículo em bom estado"
        },
        {
            "marca": "Honda",
            "modelo": "Civic",
            "ano_fabricacao": 2019,
            "ano_modelo": 2019,
            "cor": "Branco",
            "placa": "XYZ-9876",
            "chassi": "9BWZZZ377VT004252",
            "renavam": "12345678902",
            "combustivel": "gasolina",
            "motor": "2.0",
            "cambio": "manual",
            "quilometragem": 75000,
            "observacoes": "Segundo veículo do cliente"
        }
    ]
}

# Salvar dados em arquivo JSON para teste
with open('dados_teste.json', 'w') as f:
    json.dump(dados_teste, f, indent=2, ensure_ascii=False)

print("Dados de teste salvos em dados_teste.json")
print("Para testar, execute:")
print("wget --post-data=\"$(cat dados_teste.json)\" --header=\"Content-Type: application/json\" -qO- http://localhost:7080/api/clientes/com-veiculos")
