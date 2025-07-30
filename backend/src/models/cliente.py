from datetime import datetime
from . import db

class Cliente(db.Model):
    __tablename__ = 'clientes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    tipo_pessoa = db.Column(db.String(20), nullable=False)  # 'fisica' ou 'juridica'
    cpf_cnpj = db.Column(db.String(20), unique=True, nullable=False)
    rg_ie = db.Column(db.String(20))
    telefone = db.Column(db.String(20))
    celular = db.Column(db.String(20))
    email = db.Column(db.String(120))
    
    # Endereço
    endereco = db.Column(db.String(200))
    numero = db.Column(db.String(10))
    complemento = db.Column(db.String(50))
    bairro = db.Column(db.String(50))
    cidade = db.Column(db.String(50))
    estado = db.Column(db.String(2))
    cep = db.Column(db.String(10))
    
    # Dados adicionais
    data_nascimento = db.Column(db.Date)
    observacoes = db.Column(db.Text)
    ativo = db.Column(db.Boolean, default=True)
    
    # Timestamps
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    veiculos = db.relationship('Veiculo', backref='cliente', lazy=True, cascade='all, delete-orphan')
    ordens_servico = db.relationship('OrdemServico', backref='cliente', lazy=True)
    
    def __repr__(self):
        return f'<Cliente {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'tipo_pessoa': self.tipo_pessoa,
            'cpf_cnpj': self.cpf_cnpj,
            'rg_ie': self.rg_ie,
            'telefone': self.telefone,
            'celular': self.celular,
            'email': self.email,
            'endereco': self.endereco,
            'numero': self.numero,
            'complemento': self.complemento,
            'bairro': self.bairro,
            'cidade': self.cidade,
            'estado': self.estado,
            'cep': self.cep,
            'data_nascimento': self.data_nascimento.isoformat() if self.data_nascimento else None,
            'observacoes': self.observacoes,
            'ativo': self.ativo,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

