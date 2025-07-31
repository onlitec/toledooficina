from ..database import db
from datetime import datetime
from sqlalchemy import text

class Veiculo(db.Model):
    __tablename__ = 'veiculos'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    marca = db.Column(db.String(50), nullable=False)
    modelo = db.Column(db.String(50), nullable=False)
    ano_fabricacao = db.Column(db.Integer)
    ano_modelo = db.Column(db.Integer)
    cor = db.Column(db.String(30))
    placa = db.Column(db.String(10), unique=True)
    chassi = db.Column(db.String(30), unique=True)  # Aumentado de 20 para 30
    renavam = db.Column(db.String(20))
    combustivel = db.Column(db.String(20))
    motor = db.Column(db.String(30))
    cambio = db.Column(db.String(20))
    quilometragem = db.Column(db.Integer)
    observacoes = db.Column(db.Text)
    vencimento_ipva = db.Column(db.Date)
    vencimento_licenciamento = db.Column(db.Date)
    vencimento_seguro = db.Column(db.Date)
    ativo = db.Column(db.Boolean, default=True)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    cliente = db.relationship('Cliente', backref='veiculos')
    fotos = db.relationship('VeiculoFoto', backref='veiculo', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'marca': self.marca,
            'modelo': self.modelo,
            'ano_fabricacao': self.ano_fabricacao,
            'ano_modelo': self.ano_modelo,
            'cor': self.cor,
            'placa': self.placa,
            'chassi': self.chassi,
            'renavam': self.renavam,
            'combustivel': self.combustivel,
            'motor': self.motor,
            'cambio': self.cambio,
            'quilometragem': self.quilometragem,
            'observacoes': self.observacoes,
            'vencimento_ipva': self.vencimento_ipva.isoformat() if self.vencimento_ipva else None,
            'vencimento_licenciamento': self.vencimento_licenciamento.isoformat() if self.vencimento_licenciamento else None,
            'vencimento_seguro': self.vencimento_seguro.isoformat() if self.vencimento_seguro else None,
            'ativo': self.ativo,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None,
            'fotos': [foto.to_dict() for foto in self.fotos] if self.fotos else []
        }

class VeiculoFoto(db.Model):
    __tablename__ = 'veiculo_fotos'
    
    id = db.Column(db.Integer, primary_key=True)
    veiculo_id = db.Column(db.Integer, db.ForeignKey('veiculos.id'), nullable=False)
    nome_arquivo = db.Column(db.String(255), nullable=False)
    caminho_arquivo = db.Column(db.String(500), nullable=False)
    tamanho_arquivo = db.Column(db.Integer)
    tipo_mime = db.Column(db.String(100))
    data_upload = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'veiculo_id': self.veiculo_id,
            'nome_arquivo': self.nome_arquivo,
            'caminho_arquivo': self.caminho_arquivo,
            'tamanho_arquivo': self.tamanho_arquivo,
            'tipo_mime': self.tipo_mime,
            'data_upload': self.data_upload.isoformat() if self.data_upload else None
        }