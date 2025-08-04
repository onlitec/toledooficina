from datetime import datetime
from . import db

class OrdemServico(db.Model):
    __tablename__ = 'ordens_servico'
    
    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.String(20), unique=True, nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    veiculo_id = db.Column(db.Integer, db.ForeignKey('veiculos.id'), nullable=False)
    
    # Dados da ordem
    data_abertura = db.Column(db.DateTime, default=datetime.utcnow)
    data_conclusao_prevista = db.Column(db.DateTime)
    data_conclusao_real = db.Column(db.DateTime)
    status = db.Column(db.String(20), default=\'aberta\')  # aberta, em_andamento, aguardando_peca, concluida, cancelada
    
    # Descrição do problema/serviço
    descricao_problema_servico_solicitado = db.Column(db.Text, nullable=False)
    diagnostico = db.Column(db.Text)
    servicos_executados = db.Column(db.Text)
    observacoes_internas = db.Column(db.Text)
    
    # Valores
    valor_total_pecas = db.Column(db.Numeric(10, 2), default=0)
    valor_total_servicos = db.Column(db.Numeric(10, 2), default=0)
    valor_total_mao_obra = db.Column(db.Numeric(10, 2), default=0)
    valor_total_os = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    desconto = db.Column(db.Numeric(10, 2), default=0)
    valor_final = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    
    # Aprovação do cliente
    aprovado_cliente = db.Column(db.Boolean, default=False)
    data_aprovacao = db.Column(db.DateTime)
    
    # Timestamps
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    itens = db.relationship('ItemOrdemServico', backref='ordem_servico', lazy=True, cascade='all, delete-orphan')
    servicos = db.relationship('ServicoOrdem', backref='ordem_servico', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<OrdemServico {self.numero}>'
    
    def calcular_totais(self):
        """Calcula os totais da ordem de serviço"""
        self.valor_pecas = sum(item.valor_total for item in self.itens)
        self.valor_mao_obra = sum(servico.valor_total for servico in self.servicos)
        self.valor_total = self.valor_pecas + self.valor_mao_obra - (self.valor_desconto or 0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'numero': self.numero,
            'cliente_id': self.cliente_id,
            'veiculo_id': self.veiculo_id,
            'data_abertura': self.data_abertura.isoformat() if self.data_abertura else None,
            'data_previsao': self.data_previsao.isoformat() if self.data_previsao else None,
            'data_conclusao': self.data_conclusao.isoformat() if self.data_conclusao else None,
            'status': self.status,
            'prioridade': self.prioridade,
            'problema_relatado': self.problema_relatado,
            'diagnostico': self.diagnostico,
            'servicos_executados': self.servicos_executados,
            'observacoes': self.observacoes,
            'km_entrada': self.km_entrada,
            'km_saida': self.km_saida,
            'mecanico_responsavel': self.mecanico_responsavel,
            'consultor_responsavel': self.consultor_responsavel,
            'valor_mao_obra': float(self.valor_mao_obra) if self.valor_mao_obra else 0,
            'valor_pecas': float(self.valor_pecas) if self.valor_pecas else 0,
            'valor_desconto': float(self.valor_desconto) if self.valor_desconto else 0,
            'valor_total': float(self.valor_total) if self.valor_total else 0,
            'aprovada_cliente': self.aprovada_cliente,
            'data_aprovacao': self.data_aprovacao.isoformat() if self.data_aprovacao else None,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

class ItemOrdemServico(db.Model):
    __tablename__ = 'itens_ordem_servico'
    
    id = db.Column(db.Integer, primary_key=True)
    ordem_servico_id = db.Column(db.Integer, db.ForeignKey('ordens_servico.id'), nullable=False)
    peca_id = db.Column(db.Integer, db.ForeignKey('pecas.id'), nullable=False)
    
    quantidade = db.Column(db.Integer, nullable=False)
    valor_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    valor_total = db.Column(db.Numeric(10, 2), nullable=False)
    desconto = db.Column(db.Numeric(10, 2), default=0)
    
    def __repr__(self):
        return f'<ItemOrdemServico OS:{self.ordem_servico_id} Peça:{self.peca_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'ordem_servico_id': self.ordem_servico_id,
            'peca_id': self.peca_id,
            'quantidade': self.quantidade,
            'valor_unitario': float(self.valor_unitario),
            'valor_total': float(self.valor_total),
            'desconto': float(self.desconto) if self.desconto else 0
        }

class TipoServico(db.Model):
    __tablename__ = 'tipos_servico'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    descricao = db.Column(db.Text)
    valor_padrao = db.Column(db.Numeric(10, 2))
    tempo_estimado_horas = db.Column(db.Numeric(4, 2))  # tempo em horas
    ativo = db.Column(db.Boolean, default=True)
    
    # Relacionamentos
    servicos = db.relationship('ServicoOrdem', backref='tipo_servico', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'valor_padrao': float(self.valor_padrao) if self.valor_padrao else 0,
            'tempo_estimado_horas': float(self.tempo_estimado_horas) if self.tempo_estimado_horas else 0,
            'ativo': self.ativo
        }

class ServicoOrdem(db.Model):
    __tablename__ = 'servicos_ordem'
    
    id = db.Column(db.Integer, primary_key=True)
    ordem_servico_id = db.Column(db.Integer, db.ForeignKey('ordens_servico.id'), nullable=False)
    tipo_servico_id = db.Column(db.Integer, db.ForeignKey('tipos_servico.id'), nullable=False)
    
    descricao = db.Column(db.Text)
    quantidade_horas = db.Column(db.Numeric(4, 2), default=1)
    valor_hora = db.Column(db.Numeric(10, 2), nullable=False)
    valor_total = db.Column(db.Numeric(10, 2), nullable=False)
    desconto = db.Column(db.Numeric(10, 2), default=0)
    
    mecanico = db.Column(db.String(100))
    data_inicio = db.Column(db.DateTime)
    data_fim = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='pendente')  # pendente, em_andamento, concluido
    
    def __repr__(self):
        return f'<ServicoOrdem OS:{self.ordem_servico_id} Tipo:{self.tipo_servico_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'ordem_servico_id': self.ordem_servico_id,
            'tipo_servico_id': self.tipo_servico_id,
            'descricao': self.descricao,
            'quantidade_horas': float(self.quantidade_horas) if self.quantidade_horas else 0,
            'valor_hora': float(self.valor_hora),
            'valor_total': float(self.valor_total),
            'desconto': float(self.desconto) if self.desconto else 0,
            'mecanico': self.mecanico,
            'data_inicio': self.data_inicio.isoformat() if self.data_inicio else None,
            'data_fim': self.data_fim.isoformat() if self.data_fim else None,
            'status': self.status
        }

