#!/usr/bin/env python3
import requests
import json

try:
    response = requests.get('http://localhost:5000/api/veiculos/3')
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(f"Erro: {response.text}")
except Exception as e:
    print(f"Erro na requisição: {e}")