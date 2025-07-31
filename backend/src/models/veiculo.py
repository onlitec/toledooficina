from datetime import datetime
from . import db

class Veiculo(db.Model):
    __tablename__ = 'veiculos'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    
    # Dados básicos
    marca = db.Column(db.String(50), nullable=False)
    modelo = db.Column(db.String(50), nullable=False)
    ano_fabricacao = db.Column(db.Integer)
    ano_modelo = db.Column(db.Integer)
    cor = db.Column(db.String(30))
    placa = db.Column(db.String(10), unique=True, nullable=False)
    chassi = db.Column(db.String(30), unique=True)
    renavam = db.Column(db.String(15))
    
    # Dados técnicos
    combustivel = db.Column(db.String(20))  # gasolina, etanol, diesel, flex, gnv
    motor = db.Column(db.String(50))
    cambio = db.Column(db.String(20))  # manual, automatico
    quilometragem = db.Column(db.Integer, default=0)
    
    # Documentação
    vencimento_ipva = db.Column(db.Date)
    vencimento_seguro = db.Column(db.Date)
    vencimento_licenciamento = db.Column(db.Date)
    
    # Dados adicionais
    observacoes = db.Column(db.Text)
    fotos = db.Column(db.JSON)  # Lista de nomes dos arquivos de fotos
    ativo = db.Column(db.Boolean, default=True)
    
    # Timestamps
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    ordens_servico = db.relationship('OrdemServico', backref='veiculo', lazy=True)
    
    def __repr__(self):
        return f'<Veiculo {self.marca} {self.modelo} - {self.placa}>'
    
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
            'vencimento_ipva': self.vencimento_ipva.isoformat() if self.vencimento_ipva else None,
            'vencimento_seguro': self.vencimento_seguro.isoformat() if self.vencimento_seguro else None,
            'vencimento_licenciamento': self.vencimento_licenciamento.isoformat() if self.vencimento_licenciamento else None,
            'observacoes': self.observacoes,
            'fotos': self.fotos or [],
            'ativo': self.ativo,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }
