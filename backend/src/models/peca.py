from datetime import datetime
from src.models import db

class Categoria(db.Model):
    __tablename__ = 'categorias'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False, unique=True)
    descricao = db.Column(db.Text)
    ativo = db.Column(db.Boolean, default=True)
    
    # Relacionamentos
    pecas = db.relationship('Peca', backref='categoria', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'ativo': self.ativo
        }

class Fornecedor(db.Model):
    __tablename__ = 'fornecedores'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cnpj = db.Column(db.String(20), unique=True)
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    endereco = db.Column(db.String(200))
    contato = db.Column(db.String(100))
    observacoes = db.Column(db.Text)
    ativo = db.Column(db.Boolean, default=True)
    
    # Timestamps
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    pecas = db.relationship('Peca', backref='fornecedor', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cnpj': self.cnpj,
            'telefone': self.telefone,
            'email': self.email,
            'endereco': self.endereco,
            'contato': self.contato,
            'observacoes': self.observacoes,
            'ativo': self.ativo,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }

class Peca(db.Model):
    __tablename__ = 'pecas'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=True)  # Permitir null temporariamente para gerar código
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'))
    fornecedor_id = db.Column(db.Integer, db.ForeignKey('fornecedores.id'))
    
    # Estoque
    quantidade_atual = db.Column(db.Integer, default=0)
    quantidade_minima = db.Column(db.Integer, default=0)
    quantidade_maxima = db.Column(db.Integer, default=0)
    localizacao = db.Column(db.String(50))  # prateleira, gaveta, etc.
    
    # Preços
    preco_custo = db.Column(db.Numeric(10, 2), default=0)
    preco_venda = db.Column(db.Numeric(10, 2), default=0)
    margem_lucro = db.Column(db.Numeric(5, 2), default=0)  # percentual
    
    # Dados técnicos
    unidade_medida = db.Column(db.String(10), default='UN')  # UN, KG, L, M, etc.
    codigo_fabricante = db.Column(db.String(50))
    codigo_original = db.Column(db.String(50))
    aplicacao = db.Column(db.Text)  # veículos compatíveis
    
    # Status
    ativo = db.Column(db.Boolean, default=True)
    
    # Timestamps
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    movimentacoes = db.relationship('MovimentacaoEstoque', backref='peca', lazy=True)
    # itens_ordem = db.relationship('ItemOrdemServico', backref='peca', lazy=True)  # Temporariamente comentado
    
    def __repr__(self):
        return f'<Peca {self.codigo} - {self.nome}>'
    
    @property
    def status_estoque(self):
        if self.quantidade_atual <= self.quantidade_minima:
            return 'baixo'
        elif self.quantidade_atual >= self.quantidade_maxima:
            return 'alto'
        else:
            return 'normal'
    
    def to_dict(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nome': self.nome,
            'descricao': self.descricao,
            'categoria_id': self.categoria_id,
            'fornecedor_id': self.fornecedor_id,
            'quantidade_atual': self.quantidade_atual,
            'quantidade_minima': self.quantidade_minima,
            'quantidade_maxima': self.quantidade_maxima,
            'localizacao': self.localizacao,
            'preco_custo': float(self.preco_custo) if self.preco_custo else 0,
            'preco_venda': float(self.preco_venda) if self.preco_venda else 0,
            'margem_lucro': float(self.margem_lucro) if self.margem_lucro else 0,
            'unidade_medida': self.unidade_medida,
            'codigo_fabricante': self.codigo_fabricante,
            'codigo_original': self.codigo_original,
            'aplicacao': self.aplicacao,
            'ativo': self.ativo,
            'status_estoque': self.status_estoque,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

class MovimentacaoEstoque(db.Model):
    __tablename__ = 'movimentacoes_estoque'
    
    id = db.Column(db.Integer, primary_key=True)
    peca_id = db.Column(db.Integer, db.ForeignKey('pecas.id'), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # 'entrada', 'saida', 'ajuste'
    quantidade = db.Column(db.Integer, nullable=False)
    quantidade_anterior = db.Column(db.Integer, nullable=False)
    quantidade_atual = db.Column(db.Integer, nullable=False)
    motivo = db.Column(db.String(100))
    observacoes = db.Column(db.Text)
    usuario_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Timestamps
    data_movimentacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'peca_id': self.peca_id,
            'tipo': self.tipo,
            'quantidade': self.quantidade,
            'quantidade_anterior': self.quantidade_anterior,
            'quantidade_atual': self.quantidade_atual,
            'motivo': self.motivo,
            'observacoes': self.observacoes,
            'usuario_id': self.usuario_id,
            'data_movimentacao': self.data_movimentacao.isoformat() if self.data_movimentacao else None
        }

