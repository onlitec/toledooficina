#!/usr/bin/env python3
import sys
sys.path.append('/app/src')

from models.veiculo import Veiculo
from database import db
from sqlalchemy.ext.mutable import flag_modified
from datetime import datetime
import os

# Criar arquivo de teste
os.makedirs('/app/uploads/veiculos', exist_ok=True)
with open('/app/uploads/veiculos/teste_exclusao.jpg', 'w') as f:
    f.write('fake image content for testing')

# Adicionar foto ao veículo
veiculo = Veiculo.query.get(2)
if veiculo:
    if not veiculo.fotos:
        veiculo.fotos = []
    veiculo.fotos.append('teste_exclusao.jpg')
    flag_modified(veiculo, 'fotos')
    veiculo.data_atualizacao = datetime.utcnow()
    db.session.commit()
    print('Foto teste_exclusao.jpg adicionada ao veículo 2')
    print(f'Fotos do veículo: {veiculo.fotos}')
else:
    print('Veículo 2 não encontrado')