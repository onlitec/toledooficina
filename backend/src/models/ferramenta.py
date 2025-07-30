from datetime import datetime
from . import db

class Ferramenta(db.Model):
    __tablename__ = 'ferramentas'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=True)  # Permitir null temporariamente para gerar código
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text)
    marca = db.Column(db.String(50))
    modelo = db.Column(db.String(50))
    numero_serie = db.Column(db.String(50))
    
    # Localização e status
    localizacao = db.Column(db.String(100))  # bancada, armário, etc.
    status = db.Column(db.String(20), default='disponivel')  # disponivel, emprestada, manutencao, perdida
    responsavel_atual = db.Column(db.String(100))
    
    # Dados financeiros
    valor_aquisicao = db.Column(db.Numeric(10, 2))
    data_aquisicao = db.Column(db.Date)
    fornecedor = db.Column(db.String(100))
    
    # Manutenção
    data_ultima_manutencao = db.Column(db.Date)
    proxima_manutencao = db.Column(db.Date)
    intervalo_manutencao_dias = db.Column(db.Integer)  # dias entre manutenções
    
    # Dados adicionais
    observacoes = db.Column(db.Text)
    ativo = db.Column(db.Boolean, default=True)
    
    # Timestamps
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    emprestimos = db.relationship('EmprestimoFerramenta', backref='ferramenta', lazy=True)
    manutencoes = db.relationship('ManutencaoFerramenta', backref='ferramenta', lazy=True)
    
    def __repr__(self):
        return f'<Ferramenta {self.codigo} - {self.nome}>'
    
    @property
    def precisa_manutencao(self):
        if not self.proxima_manutencao:
            return False
        return datetime.now().date() >= self.proxima_manutencao
    
    def to_dict(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nome': self.nome,
            'descricao': self.descricao,
            'marca': self.marca,
            'modelo': self.modelo,
            'numero_serie': self.numero_serie,
            'localizacao': self.localizacao,
            'status': self.status,
            'responsavel_atual': self.responsavel_atual,
            'valor_aquisicao': float(self.valor_aquisicao) if self.valor_aquisicao else 0,
            'data_aquisicao': self.data_aquisicao.isoformat() if self.data_aquisicao else None,
            'fornecedor': self.fornecedor,
            'data_ultima_manutencao': self.data_ultima_manutencao.isoformat() if self.data_ultima_manutencao else None,
            'proxima_manutencao': self.proxima_manutencao.isoformat() if self.proxima_manutencao else None,
            'intervalo_manutencao_dias': self.intervalo_manutencao_dias,
            'precisa_manutencao': self.precisa_manutencao,
            'observacoes': self.observacoes,
            'ativo': self.ativo,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

class EmprestimoFerramenta(db.Model):
    __tablename__ = 'emprestimos_ferramentas'
    
    id = db.Column(db.Integer, primary_key=True)
    ferramenta_id = db.Column(db.Integer, db.ForeignKey('ferramentas.id'), nullable=False)
    responsavel = db.Column(db.String(100), nullable=False)
    data_emprestimo = db.Column(db.DateTime, default=datetime.utcnow)
    data_devolucao_prevista = db.Column(db.DateTime)
    data_devolucao_real = db.Column(db.DateTime)
    observacoes = db.Column(db.Text)
    status = db.Column(db.String(20), default='ativo')  # ativo, devolvido, atrasado
    
    def __repr__(self):
        return f'<EmprestimoFerramenta {self.ferramenta_id} - {self.responsavel}>'
    
    @property
    def esta_atrasado(self):
        if self.data_devolucao_real or not self.data_devolucao_prevista:
            return False
        return datetime.utcnow() > self.data_devolucao_prevista
    
    def to_dict(self):
        return {
            'id': self.id,
            'ferramenta_id': self.ferramenta_id,
            'responsavel': self.responsavel,
            'data_emprestimo': self.data_emprestimo.isoformat() if self.data_emprestimo else None,
            'data_devolucao_prevista': self.data_devolucao_prevista.isoformat() if self.data_devolucao_prevista else None,
            'data_devolucao_real': self.data_devolucao_real.isoformat() if self.data_devolucao_real else None,
            'observacoes': self.observacoes,
            'status': self.status,
            'esta_atrasado': self.esta_atrasado
        }

class ManutencaoFerramenta(db.Model):
    __tablename__ = 'manutencoes_ferramentas'
    
    id = db.Column(db.Integer, primary_key=True)
    ferramenta_id = db.Column(db.Integer, db.ForeignKey('ferramentas.id'), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # preventiva, corretiva, calibracao
    descricao = db.Column(db.Text, nullable=False)
    data_manutencao = db.Column(db.Date, nullable=False)
    custo = db.Column(db.Numeric(10, 2))
    responsavel = db.Column(db.String(100))
    fornecedor_servico = db.Column(db.String(100))
    observacoes = db.Column(db.Text)
    
    # Timestamps
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'ferramenta_id': self.ferramenta_id,
            'tipo': self.tipo,
            'descricao': self.descricao,
            'data_manutencao': self.data_manutencao.isoformat() if self.data_manutencao else None,
            'custo': float(self.custo) if self.custo else 0,
            'responsavel': self.responsavel,
            'fornecedor_servico': self.fornecedor_servico,
            'observacoes': self.observacoes,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }

