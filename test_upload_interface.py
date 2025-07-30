#!/usr/bin/env python3
import requests
import json
import sys
import os
from io import BytesIO
from PIL import Image

# Adicionar o caminho do backend ao sys.path
sys.path.append('backend')
from src.models import db
from src.models.veiculo import Veiculo
from src.main import app

def test_upload_completo():
    print("=== TESTE COMPLETO DE UPLOAD DE FOTOS ===")
    
    # 1. Primeiro, criar um novo veículo
    print("\n1. Criando novo veículo...")
    veiculo_data = {
        "cliente_id": 1,
        "marca": "TESTE",
        "modelo": "UPLOAD",
        "placa": "TST-9999",
        "chassi": "TESTE123456789",
        "ano_fabricacao": 2023,
        "ano_modelo": 2023,
        "cor": "Azul",
        "combustivel": "flex",
        "cambio": "manual"
    }
    
    response = requests.post('http://localhost:5000/api/veiculos', 
                           headers={'Content-Type': 'application/json'},
                           data=json.dumps(veiculo_data))
    
    print(f"Status criação veículo: {response.status_code}")
    if response.status_code == 201:
        result = response.json()
        veiculo_id = result['data']['id']
        print(f"Veículo criado com ID: {veiculo_id}")
    else:
        print(f"Erro ao criar veículo: {response.text}")
        return
    
    # 2. Criar múltiplas fotos de teste
    print(f"\n2. Fazendo upload de fotos para veículo {veiculo_id}...")
    
    for i in range(3):
        # Criar imagem de teste
        colors = ['red', 'green', 'blue']
        img = Image.new('RGB', (200, 200), color=colors[i])
        img_buffer = BytesIO()
        img.save(img_buffer, format='JPEG')
        img_buffer.seek(0)
        
        files = {'foto': (f'test_foto_{i+1}.jpg', img_buffer, 'image/jpeg')}
        
        response = requests.post(f'http://localhost:5000/api/veiculos/{veiculo_id}/fotos', files=files)
        print(f"  Foto {i+1} - Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"    Arquivo salvo: {result['data']['nome_arquivo']}")
        else:
            print(f"    Erro: {response.text}")
    
    # 3. Verificar no banco de dados
    print(f"\n3. Verificando no banco de dados...")
    with app.app_context():
        veiculo = db.session.get(Veiculo, veiculo_id)
        if veiculo:
            print(f"Veículo: {veiculo.marca} {veiculo.modelo} - {veiculo.placa}")
            print(f"Fotos registradas: {veiculo.fotos}")
            
            if veiculo.fotos:
                print(f"Total de fotos: {len(veiculo.fotos)}")
                for i, foto in enumerate(veiculo.fotos):
                    foto_path = os.path.join('backend/uploads/veiculos', foto)
                    exists = os.path.exists(foto_path)
                    print(f"  {i+1}. {foto} - {'✓ Existe' if exists else '✗ Não existe'}")
            else:
                print("❌ PROBLEMA: Nenhuma foto encontrada no banco!")
        else:
            print(f"❌ Veículo {veiculo_id} não encontrado!")
    
    # 4. Testar busca do veículo via API
    print(f"\n4. Verificando via API...")
    response = requests.get(f'http://localhost:5000/api/veiculos/{veiculo_id}')
    if response.status_code == 200:
        result = response.json()
        veiculo_api = result['data']
        print(f"Fotos via API: {veiculo_api.get('fotos', [])}")
    else:
        print(f"Erro ao buscar veículo via API: {response.text}")
    
    print("\n=== FIM DO TESTE ===")

if __name__ == '__main__':
    test_upload_completo()