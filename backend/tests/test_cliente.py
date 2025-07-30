import pytest
from ..src.models import db
from src.models.cliente import Cliente
from src.main import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_criar_cliente(client):
    response = client.post('/api/clientes', json={
        'nome': 'Teste Cliente',
        'cpf_cnpj': '12345678901',
        'tipo_pessoa': 'fisica'
    })
    assert response.status_code == 201
    assert response.json['success'] == True