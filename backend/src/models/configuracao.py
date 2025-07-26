from datetime import datetime
from src.models.user import db

class ConfiguracaoEmpresa(db.Model):
    __tablename__ = 'configuracao_empresa'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Dados da empresa
    razao_social = db.Column(db.String(200))
    nome_fantasia = db.Column(db.String(200))
    cnpj = db.Column(db.String(20))
    inscricao_estadual = db.Column(db.String(20))
    inscricao_municipal = db.Column(db.String(20))
    
    # Contato
    telefone = db.Column(db.String(20))
    celular = db.Column(db.String(20))
    email = db.Column(db.String(120))
    site = db.Column(db.String(200))
    
    # Endereço
    endereco = db.Column(db.String(200))
    numero = db.Column(db.String(10))
    complemento = db.Column(db.String(50))
    bairro = db.Column(db.String(50))
    cidade = db.Column(db.String(50))
    estado = db.Column(db.String(2))
    cep = db.Column(db.String(10))
    
    # Logotipo
    logotipo_path = db.Column(db.String(500))
    
    # Configurações de sistema
    moeda = db.Column(db.String(10), default='BRL')
    fuso_horario = db.Column(db.String(50), default='America/Sao_Paulo')
    formato_data = db.Column(db.String(20), default='DD/MM/YYYY')
    
    # Timestamps
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'razao_social': self.razao_social,
            'nome_fantasia': self.nome_fantasia,
            'cnpj': self.cnpj,
            'inscricao_estadual': self.inscricao_estadual,
            'inscricao_municipal': self.inscricao_municipal,
            'telefone': self.telefone,
            'celular': self.celular,
            'email': self.email,
            'site': self.site,
            'endereco': self.endereco,
            'numero': self.numero,
            'complemento': self.complemento,
            'bairro': self.bairro,
            'cidade': self.cidade,
            'estado': self.estado,
            'cep': self.cep,
            'logotipo_path': self.logotipo_path,
            'moeda': self.moeda,
            'fuso_horario': self.fuso_horario,
            'formato_data': self.formato_data,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

class ConfiguracaoEmail(db.Model):
    __tablename__ = 'configuracao_email'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Configurações SMTP
    servidor_smtp = db.Column(db.String(100))
    porta_smtp = db.Column(db.Integer, default=587)
    usar_tls = db.Column(db.Boolean, default=True)
    usuario_email = db.Column(db.String(120))
    senha_email = db.Column(db.String(200))  # deve ser criptografada
    email_remetente = db.Column(db.String(120))
    nome_remetente = db.Column(db.String(100))
    
    # Status
    ativo = db.Column(db.Boolean, default=False)
    testado = db.Column(db.Boolean, default=False)
    data_ultimo_teste = db.Column(db.DateTime)
    
    # Timestamps
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'servidor_smtp': self.servidor_smtp,
            'porta_smtp': self.porta_smtp,
            'usar_tls': self.usar_tls,
            'usuario_email': self.usuario_email,
            'email_remetente': self.email_remetente,
            'nome_remetente': self.nome_remetente,
            'ativo': self.ativo,
            'testado': self.testado,
            'data_ultimo_teste': self.data_ultimo_teste.isoformat() if self.data_ultimo_teste else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

class ConfiguracaoNotificacao(db.Model):
    __tablename__ = 'configuracao_notificacao'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Tipos de notificação
    notificar_ordem_criada = db.Column(db.Boolean, default=True)
    notificar_ordem_concluida = db.Column(db.Boolean, default=True)
    notificar_vencimento_documentos = db.Column(db.Boolean, default=True)
    notificar_estoque_baixo = db.Column(db.Boolean, default=True)
    notificar_contas_vencer = db.Column(db.Boolean, default=True)
    notificar_manutencao_ferramentas = db.Column(db.Boolean, default=True)
    
    # Configurações de tempo
    dias_antecedencia_vencimento = db.Column(db.Integer, default=7)
    dias_antecedencia_manutencao = db.Column(db.Integer, default=15)
    
    # Emails para notificação
    emails_notificacao = db.Column(db.Text)  # JSON com lista de emails
    
    # Timestamps
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'notificar_ordem_criada': self.notificar_ordem_criada,
            'notificar_ordem_concluida': self.notificar_ordem_concluida,
            'notificar_vencimento_documentos': self.notificar_vencimento_documentos,
            'notificar_estoque_baixo': self.notificar_estoque_baixo,
            'notificar_contas_vencer': self.notificar_contas_vencer,
            'notificar_manutencao_ferramentas': self.notificar_manutencao_ferramentas,
            'dias_antecedencia_vencimento': self.dias_antecedencia_vencimento,
            'dias_antecedencia_manutencao': self.dias_antecedencia_manutencao,
            'emails_notificacao': self.emails_notificacao,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

class ConfiguracaoSistema(db.Model):
    __tablename__ = 'configuracao_sistema'
    
    id = db.Column(db.Integer, primary_key=True)
    chave = db.Column(db.String(100), unique=True, nullable=False)
    valor = db.Column(db.Text)
    tipo = db.Column(db.String(20), default='string')  # string, integer, boolean, json
    descricao = db.Column(db.String(200))
    
    # Timestamps
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<ConfiguracaoSistema {self.chave}: {self.valor}>'
    
    def get_valor_tipado(self):
        """Retorna o valor convertido para o tipo correto"""
        if self.tipo == 'integer':
            return int(self.valor) if self.valor else 0
        elif self.tipo == 'boolean':
            return self.valor.lower() in ('true', '1', 'yes') if self.valor else False
        elif self.tipo == 'json':
            import json
            return json.loads(self.valor) if self.valor else {}
        else:
            return self.valor
    
    def to_dict(self):
        return {
            'id': self.id,
            'chave': self.chave,
            'valor': self.valor,
            'valor_tipado': self.get_valor_tipado(),
            'tipo': self.tipo,
            'descricao': self.descricao,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

