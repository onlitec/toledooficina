#!/usr/bin/env python3
"""
Script para configurar o backend do ERP para produção
Configura PostgreSQL, Redis, variáveis de ambiente e otimizações
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('production_setup.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def run_command(command, check=True):
    """Executa um comando e retorna o resultado"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=check,
            capture_output=True,
            text=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        logger.error(f"Erro ao executar comando '{command}': {e}")
        logger.error(f"Stderr: {e.stderr}")
        if check:
            raise
        return None

def create_production_requirements():
    """Cria requirements.txt otimizado para produção"""
    logger.info("Criando requirements.txt para produção...")
    
    production_requirements = """
# Dependências principais
Flask==2.3.3
Flask-SQLAlchemy==3.0.5
Flask-Migrate==4.0.5
Flask-CORS==4.0.0
Flask-JWT-Extended==4.5.3
Flask-Limiter==3.5.0
Flask-Caching==2.1.0
Flask-Mail==0.9.1
Flask-WTF==1.1.1

# Banco de dados
psycopg2-binary==2.9.7
SQLAlchemy==2.0.21
redis==5.0.1

# Segurança
bcrypt==4.0.1
cryptography==41.0.4
PyJWT==2.8.0
Werkzeug==2.3.7

# Validação e serialização
marshmallow==3.20.1
WTForms==3.0.1

# Utilitários
Pillow==10.0.1
python-dotenv==1.0.0
click==8.1.7

# Servidor WSGI para produção
gunicorn==21.2.0
gevent==23.7.0

# Monitoramento e logging
psutil==5.9.5
structlog==23.1.0

# Desenvolvimento (apenas se necessário)
# pytest==7.4.2
# pytest-cov==4.1.0
# black==23.7.0
# flake8==6.0.0
"""
    
    with open('../backend/requirements.txt', 'w') as f:
        f.write(production_requirements.strip())
    
    logger.info("Requirements.txt criado com sucesso")

def create_production_config():
    """Cria arquivo de configuração para produção"""
    logger.info("Criando configuração de produção...")
    
    config_content = """
import os
from datetime import timedelta

class Config:
    """Configuração base"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_RECORD_QUERIES = True
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_timeout': 20,
        'max_overflow': 0
    }
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']
    
    # Upload Configuration
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', '/app/uploads')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB
    
    # Security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(seconds=int(os.environ.get('SESSION_TIMEOUT', 3600)))
    
    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
    
    # Rate Limiting
    RATELIMIT_STORAGE_URL = os.environ.get('RATE_LIMIT_STORAGE_URL')
    RATELIMIT_DEFAULT = os.environ.get('RATE_LIMIT_PER_MINUTE', '60/minute')
    
    # Cache
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'redis')
    CACHE_REDIS_URL = os.environ.get('REDIS_URL')
    CACHE_DEFAULT_TIMEOUT = int(os.environ.get('CACHE_DEFAULT_TIMEOUT', 300))
    
    # Mail
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')

class DevelopmentConfig(Config):
    """Configuração de desenvolvimento"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SESSION_COOKIE_SECURE = False

class ProductionConfig(Config):
    """Configuração de produção"""
    DEBUG = False
    TESTING = False
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError("DATABASE_URL deve ser definida em produção")
    
    # Enhanced security for production
    SQLALCHEMY_ENGINE_OPTIONS = {
        **Config.SQLALCHEMY_ENGINE_OPTIONS,
        'pool_size': 10,
        'max_overflow': 20,
        'pool_pre_ping': True,
        'pool_recycle': 3600
    }
    
    # Security headers
    SECURITY_HEADERS = {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = '/app/logs/app.log'
    
class TestingConfig(Config):
    """Configuração de testes"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    SESSION_COOKIE_SECURE = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
"""
    
    config_dir = Path('../backend/src/config')
    config_dir.mkdir(exist_ok=True)
    
    with open(config_dir / 'config.py', 'w') as f:
        f.write(config_content)
    
    # Criar __init__.py
    with open(config_dir / '__init__.py', 'w') as f:
        f.write('# Configuration package\n')
    
    logger.info("Configuração de produção criada")

def create_gunicorn_config():
    """Cria configuração do Gunicorn para produção"""
    logger.info("Criando configuração do Gunicorn...")
    
    gunicorn_config = """
import multiprocessing
import os

# Server socket
bind = "0.0.0.0:5000"
backlog = 2048

# Worker processes
workers = int(os.environ.get('WORKER_PROCESSES', multiprocessing.cpu_count() * 2 + 1))
worker_class = "gevent"
worker_connections = int(os.environ.get('WORKER_CONNECTIONS', 1000))
max_requests = int(os.environ.get('MAX_REQUESTS_PER_WORKER', 1000))
max_requests_jitter = 50
timeout = int(os.environ.get('WORKER_TIMEOUT', 30))
keepalive = 2

# Restart workers after this many requests, to help prevent memory leaks
preload_app = True

# Logging
accesslog = "/app/logs/gunicorn_access.log"
errorlog = "/app/logs/gunicorn_error.log"
loglevel = os.environ.get('LOG_LEVEL', 'info').lower()
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = 'erp_oficina_backend'

# Server mechanics
daemon = False
pidfile = '/tmp/gunicorn.pid'
user = None
group = None
tmp_upload_dir = None

# SSL (if needed)
# keyfile = '/path/to/keyfile'
# certfile = '/path/to/certfile'

def when_ready(server):
    server.log.info("Server is ready. Spawning workers")

def worker_int(worker):
    worker.log.info("worker received INT or QUIT signal")

def pre_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def post_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def post_worker_init(worker):
    worker.log.info("Worker initialized (pid: %s)", worker.pid)

def worker_abort(worker):
    worker.log.info("Worker aborted (pid: %s)", worker.pid)
"""
    
    with open('../backend/gunicorn.conf.py', 'w') as f:
        f.write(gunicorn_config)
    
    logger.info("Configuração do Gunicorn criada")

def create_production_dockerfile():
    """Cria Dockerfile otimizado para produção"""
    logger.info("Criando Dockerfile de produção...")
    
    dockerfile_content = """
# Multi-stage build para produção
FROM python:3.11-slim as builder

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root
RUN useradd --create-home --shell /bin/bash app

# Configurar diretório de trabalho
WORKDIR /app

# Copiar requirements e instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Estágio de produção
FROM python:3.11-slim

# Instalar dependências de runtime
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Criar usuário não-root
RUN useradd --create-home --shell /bin/bash app

# Configurar diretório de trabalho
WORKDIR /app

# Copiar dependências do estágio builder
COPY --from=builder /root/.local /home/app/.local

# Copiar código da aplicação
COPY --chown=app:app . .

# Criar diretórios necessários
RUN mkdir -p /app/logs /app/uploads /app/backups && \
    chown -R app:app /app

# Configurar PATH
ENV PATH=/home/app/.local/bin:$PATH

# Configurar variáveis de ambiente
ENV FLASK_APP=src.main:app
ENV FLASK_ENV=production
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Expor porta
EXPOSE 5000

# Mudar para usuário não-root
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Comando padrão
CMD ["gunicorn", "--config", "gunicorn.conf.py", "src.main:app"]
"""
    
    with open('../backend/Dockerfile.production', 'w') as f:
        f.write(dockerfile_content.strip())
    
    logger.info("Dockerfile de produção criado")

def create_health_check_endpoint():
    """Cria endpoint de health check"""
    logger.info("Criando endpoint de health check...")
    
    health_check_content = """
from flask import Blueprint, jsonify, current_app
from sqlalchemy import text
from src.models import db
import redis
import os

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Endpoint de verificação de saúde do sistema"""
    try:
        # Verificar conexão com banco de dados
        db.session.execute(text('SELECT 1'))
        db_status = 'healthy'
    except Exception as e:
        current_app.logger.error(f"Database health check failed: {e}")
        db_status = 'unhealthy'
    
    # Verificar Redis (se configurado)
    redis_status = 'not_configured'
    if os.environ.get('REDIS_URL'):
        try:
            r = redis.from_url(os.environ.get('REDIS_URL'))
            r.ping()
            redis_status = 'healthy'
        except Exception as e:
            current_app.logger.error(f"Redis health check failed: {e}")
            redis_status = 'unhealthy'
    
    # Status geral
    overall_status = 'healthy' if db_status == 'healthy' and redis_status in ['healthy', 'not_configured'] else 'unhealthy'
    
    response = {
        'status': overall_status,
        'timestamp': current_app.config.get('STARTUP_TIME', 'unknown'),
        'version': '1.0.0',
        'services': {
            'database': db_status,
            'redis': redis_status
        }
    }
    
    status_code = 200 if overall_status == 'healthy' else 503
    return jsonify(response), status_code

@health_bp.route('/ready', methods=['GET'])
def readiness_check():
    """Endpoint de verificação de prontidão"""
    try:
        # Verificar se a aplicação está pronta para receber tráfego
        db.session.execute(text('SELECT 1'))
        return jsonify({'status': 'ready'}), 200
    except Exception as e:
        current_app.logger.error(f"Readiness check failed: {e}")
        return jsonify({'status': 'not_ready', 'error': str(e)}), 503

@health_bp.route('/live', methods=['GET'])
def liveness_check():
    """Endpoint de verificação de vida"""
    # Verificação simples se a aplicação está viva
    return jsonify({'status': 'alive'}), 200
"""
    
    health_dir = Path('../backend/src/routes')
    with open(health_dir / 'health.py', 'w') as f:
        f.write(health_check_content)
    
    logger.info("Endpoint de health check criado")

def update_main_app():
    """Atualiza o arquivo principal da aplicação"""
    logger.info("Atualizando arquivo principal da aplicação...")
    
    # Ler o arquivo atual
    main_file = Path('../backend/src/main.py')
    if not main_file.exists():
        logger.error("Arquivo main.py não encontrado")
        return
    
    with open(main_file, 'r') as f:
        content = f.read()
    
    # Adicionar importações e configurações de produção
    additions = """
# Importações para produção
from src.routes.health import health_bp
from src.config.config import config
import logging
from logging.handlers import RotatingFileHandler
import os
from datetime import datetime
"""
    
    # Verificar se as adições já existem
    if 'from src.routes.health import health_bp' not in content:
        # Adicionar no início do arquivo, após as importações existentes
        lines = content.split('\n')
        import_end = 0
        for i, line in enumerate(lines):
            if line.startswith('from ') or line.startswith('import '):
                import_end = i + 1
        
        lines.insert(import_end, additions)
        content = '\n'.join(lines)
    
    # Adicionar registro do blueprint de health
    if 'app.register_blueprint(health_bp' not in content:
        content = content.replace(
            'app.register_blueprint(cliente_bp, url_prefix="/api")',
            'app.register_blueprint(cliente_bp, url_prefix="/api")\n    app.register_blueprint(health_bp, url_prefix="/api")'
        )
    
    # Adicionar configuração de logging para produção
    logging_config = """
    # Configurar logging para produção
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        file_handler = RotatingFileHandler(
            'logs/app.log', 
            maxBytes=10240000, 
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('ERP Oficina startup')
        
        # Salvar tempo de inicialização
        app.config['STARTUP_TIME'] = datetime.utcnow().isoformat()
"""
    
    if 'ERP Oficina startup' not in content:
        # Adicionar antes do return app
        content = content.replace(
            'return app',
            f'{logging_config}\n    return app'
        )
    
    # Salvar arquivo atualizado
    with open(main_file, 'w') as f:
        f.write(content)
    
    logger.info("Arquivo principal atualizado")

def main():
    """Função principal"""
    logger.info("Iniciando configuração do backend para produção...")
    
    try:
        create_production_requirements()
        create_production_config()
        create_gunicorn_config()
        create_production_dockerfile()
        create_health_check_endpoint()
        update_main_app()
        
        logger.info("✅ Configuração de produção concluída com sucesso!")
        logger.info("")
        logger.info("Próximos passos:")
        logger.info("1. Revisar as configurações em backend/src/config/config.py")
        logger.info("2. Ajustar gunicorn.conf.py conforme necessário")
        logger.info("3. Construir a imagem Docker: docker build -f Dockerfile.production -t erp-backend:prod .")
        logger.info("4. Testar o health check: curl http://localhost:5000/api/health")
        
    except Exception as e:
        logger.error(f"Erro durante a configuração: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()