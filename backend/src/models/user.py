from datetime import datetime, timedelta
import jwt
import bcrypt
from src.models import db
from flask import current_app

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    # Campos adicionais
    nome_completo = db.Column(db.String(200))
    ativo = db.Column(db.Boolean, default=True)
    role = db.Column(db.String(50), default='user')  # admin, manager, user

    # Timestamps
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ultimo_login = db.Column(db.DateTime)

    # Novos campos para refresh tokens
    refresh_token_hash = db.Column(db.String(255))
    refresh_token_expires = db.Column(db.DateTime)
    failed_login_attempts = db.Column(db.Integer, default=0)
    account_locked_until = db.Column(db.DateTime)
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        """Hash e armazena a senha"""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')

    def check_password(self, password):
        """Verifica se a senha está correta"""
        password_bytes = password.encode('utf-8')
        hash_bytes = self.password_hash.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)

    def generate_token(self, expires_in=3600):
        """Gera um token JWT"""
        payload = {
            'user_id': self.id,
            'username': self.username,
            'role': self.role,
            'exp': datetime.utcnow() + timedelta(seconds=expires_in),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

    @staticmethod
    def verify_token(token):
        """Verifica e decodifica um token JWT"""
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            return User.query.get(payload['user_id'])
        except jwt.ExpiredSignatureError:
            return None  # Token expirado
        except jwt.InvalidTokenError:
            return None  # Token inválido

    def update_last_login(self):
        """Atualiza o timestamp do último login"""
        self.ultimo_login = datetime.utcnow()
        db.session.commit()

    def to_dict(self, include_sensitive=False):
        """Converte para dicionário, opcionalmente incluindo dados sensíveis"""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'nome_completo': self.nome_completo,
            'ativo': self.ativo,
            'role': self.role,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None,
            'ultimo_login': self.ultimo_login.isoformat() if self.ultimo_login else None
        }

        if include_sensitive:
            data['password_hash'] = self.password_hash

        return data

    def generate_tokens(self):
        """Gera access token e refresh token"""
        access_token = self.generate_token(expires_in=900)  # 15 minutos
        refresh_token = self.generate_refresh_token()
        return access_token, refresh_token
    
    def generate_refresh_token(self, expires_in=604800):  # 7 dias
        """Gera refresh token"""
        import secrets
        token = secrets.token_urlsafe(32)
        self.refresh_token_hash = bcrypt.hashpw(token.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        self.refresh_token_expires = datetime.utcnow() + timedelta(seconds=expires_in)
        db.session.commit()
        return token
    
    def verify_refresh_token(self, token):
        """Verifica refresh token"""
        if not self.refresh_token_hash or not self.refresh_token_expires:
            return False
        if datetime.utcnow() > self.refresh_token_expires:
            return False
        return bcrypt.checkpw(token.encode('utf-8'), self.refresh_token_hash.encode('utf-8'))
    
    def is_account_locked(self):
        """Verifica se a conta está bloqueada"""
        if self.account_locked_until and datetime.utcnow() < self.account_locked_until:
            return True
        return False
    
    def increment_failed_login(self):
        """Incrementa tentativas de login falhadas"""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.account_locked_until = datetime.utcnow() + timedelta(minutes=30)
        db.session.commit()
    
    def reset_failed_login(self):
        """Reseta tentativas de login falhadas"""
        self.failed_login_attempts = 0
        self.account_locked_until = None
        db.session.commit()
