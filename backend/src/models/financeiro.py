from datetime import datetime
from . import db

class ContaReceber(db.Model):
    __tablename__ = 'contas_receber'
    
    id = db.Column(db.Integer, primary_key=True)
    ordem_servico_id = db.Column(db.Integer, db.ForeignKey('ordens_servico.id'))
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=True)
    
    # Dados da conta
    numero_documento = db.Column(db.String(50))
    descricao = db.Column(db.String(200), nullable=False)
    valor_original = db.Column(db.Numeric(10, 2), nullable=False)
    valor_pago = db.Column(db.Numeric(10, 2), default=0)
    valor_desconto = db.Column(db.Numeric(10, 2), default=0)
    valor_juros = db.Column(db.Numeric(10, 2), default=0)
    valor_multa = db.Column(db.Numeric(10, 2), default=0)
    
    # Datas
    data_emissao = db.Column(db.Date, nullable=False)
    data_vencimento = db.Column(db.Date, nullable=False)
    data_pagamento = db.Column(db.Date)
    
    # Status
    status = db.Column(db.String(20), default='aberta')  # aberta, paga, vencida, cancelada
    forma_pagamento = db.Column(db.String(50))  # dinheiro, cartao, pix, boleto, etc.
    
    # Observações
    observacoes = db.Column(db.Text)
    
    # Timestamps
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    pagamentos = db.relationship('PagamentoRecebimento', backref='conta_receber', lazy=True)
    
    def __repr__(self):
        return f'<ContaReceber {self.numero_documento} - {self.descricao}>'
    
    @property
    def valor_saldo(self):
        return self.valor_original + (self.valor_juros or 0) + (self.valor_multa or 0) - (self.valor_desconto or 0) - (self.valor_pago or 0)
    
    @property
    def esta_vencida(self):
        if self.status == 'paga':
            return False
        return datetime.now().date() > self.data_vencimento
    
    def to_dict(self):
        return {
            'id': self.id,
            'ordem_servico_id': self.ordem_servico_id,
            'cliente_id': self.cliente_id,
            'numero_documento': self.numero_documento,
            'descricao': self.descricao,
            'valor_original': float(self.valor_original),
            'valor_pago': float(self.valor_pago) if self.valor_pago else 0,
            'valor_desconto': float(self.valor_desconto) if self.valor_desconto else 0,
            'valor_juros': float(self.valor_juros) if self.valor_juros else 0,
            'valor_multa': float(self.valor_multa) if self.valor_multa else 0,
            'valor_saldo': float(self.valor_saldo),
            'data_emissao': self.data_emissao.isoformat() if self.data_emissao else None,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None,
            'data_pagamento': self.data_pagamento.isoformat() if self.data_pagamento else None,
            'status': self.status,
            'forma_pagamento': self.forma_pagamento,
            'esta_vencida': self.esta_vencida,
            'observacoes': self.observacoes,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

class ContaPagar(db.Model):
    __tablename__ = 'contas_pagar'
    
    id = db.Column(db.Integer, primary_key=True)
    fornecedor_id = db.Column(db.Integer, db.ForeignKey('fornecedores.id'))
    fornecedor = db.Column(db.String(100))  # Nome do fornecedor (alternativa ao fornecedor_id)

    # Dados da conta
    numero_documento = db.Column(db.String(50))
    descricao = db.Column(db.String(200), nullable=False)
    categoria = db.Column(db.String(50))  # aluguel, energia, telefone, compra_pecas, etc.
    valor_original = db.Column(db.Numeric(10, 2), nullable=False)
    valor_pago = db.Column(db.Numeric(10, 2), default=0)
    valor_desconto = db.Column(db.Numeric(10, 2), default=0)
    valor_juros = db.Column(db.Numeric(10, 2), default=0)
    valor_multa = db.Column(db.Numeric(10, 2), default=0)
    
    # Datas
    data_emissao = db.Column(db.Date, nullable=False)
    data_vencimento = db.Column(db.Date, nullable=False)
    data_pagamento = db.Column(db.Date)
    
    # Status
    status = db.Column(db.String(20), default='aberta')  # aberta, paga, vencida, cancelada
    forma_pagamento = db.Column(db.String(50))
    
    # Observações
    observacoes = db.Column(db.Text)
    
    # Timestamps
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    pagamentos = db.relationship('PagamentoRecebimento', backref='conta_pagar', lazy=True)
    
    def __repr__(self):
        return f'<ContaPagar {self.numero_documento} - {self.descricao}>'
    
    @property
    def valor_saldo(self):
        return self.valor_original + (self.valor_juros or 0) + (self.valor_multa or 0) - (self.valor_desconto or 0) - (self.valor_pago or 0)
    
    @property
    def esta_vencida(self):
        if self.status == 'paga':
            return False
        return datetime.now().date() > self.data_vencimento
    
    def to_dict(self):
        return {
            'id': self.id,
            'fornecedor_id': self.fornecedor_id,
            'fornecedor': self.fornecedor,
            'numero_documento': self.numero_documento,
            'descricao': self.descricao,
            'categoria': self.categoria,
            'valor_original': float(self.valor_original),
            'valor_pago': float(self.valor_pago) if self.valor_pago else 0,
            'valor_desconto': float(self.valor_desconto) if self.valor_desconto else 0,
            'valor_juros': float(self.valor_juros) if self.valor_juros else 0,
            'valor_multa': float(self.valor_multa) if self.valor_multa else 0,
            'valor_saldo': float(self.valor_saldo),
            'data_emissao': self.data_emissao.isoformat() if self.data_emissao else None,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None,
            'data_pagamento': self.data_pagamento.isoformat() if self.data_pagamento else None,
            'status': self.status,
            'forma_pagamento': self.forma_pagamento,
            'esta_vencida': self.esta_vencida,
            'observacoes': self.observacoes,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

class PagamentoRecebimento(db.Model):
    __tablename__ = 'pagamentos_recebimentos'
    
    id = db.Column(db.Integer, primary_key=True)
    conta_receber_id = db.Column(db.Integer, db.ForeignKey('contas_receber.id'))
    conta_pagar_id = db.Column(db.Integer, db.ForeignKey('contas_pagar.id'))
    
    # Dados do pagamento
    valor = db.Column(db.Numeric(10, 2), nullable=False)
    data_pagamento = db.Column(db.Date, nullable=False)
    forma_pagamento = db.Column(db.String(50), nullable=False)
    numero_documento = db.Column(db.String(50))  # número do cheque, comprovante, etc.
    
    # Observações
    observacoes = db.Column(db.Text)
    
    # Timestamps
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<PagamentoRecebimento {self.valor} - {self.data_pagamento}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'conta_receber_id': self.conta_receber_id,
            'conta_pagar_id': self.conta_pagar_id,
            'valor': float(self.valor),
            'data_pagamento': self.data_pagamento.isoformat() if self.data_pagamento else None,
            'forma_pagamento': self.forma_pagamento,
            'numero_documento': self.numero_documento,
            'observacoes': self.observacoes,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }

class FluxoCaixa(db.Model):
    __tablename__ = 'fluxo_caixa'
    
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.Date, nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # entrada, saida
    categoria = db.Column(db.String(50), nullable=False)
    descricao = db.Column(db.String(200), nullable=False)
    valor = db.Column(db.Numeric(10, 2), nullable=False)
    forma_pagamento = db.Column(db.String(50))
    
    # Referências
    conta_receber_id = db.Column(db.Integer, db.ForeignKey('contas_receber.id'))
    conta_pagar_id = db.Column(db.Integer, db.ForeignKey('contas_pagar.id'))
    ordem_servico_id = db.Column(db.Integer, db.ForeignKey('ordens_servico.id'))
    
    # Observações
    observacoes = db.Column(db.Text)
    
    # Timestamps
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<FluxoCaixa {self.tipo} - {self.valor} - {self.data}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'data': self.data.isoformat() if self.data else None,
            'tipo': self.tipo,
            'categoria': self.categoria,
            'descricao': self.descricao,
            'valor': float(self.valor),
            'forma_pagamento': self.forma_pagamento,
            'conta_receber_id': self.conta_receber_id,
            'conta_pagar_id': self.conta_pagar_id,
            'ordem_servico_id': self.ordem_servico_id,
            'observacoes': self.observacoes,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }

