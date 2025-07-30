from flask import request, jsonify, g
from functools import wraps
from datetime import datetime, timedelta
from collections import defaultdict
import time
import logging

# Rate limiting storage (em produção usar Redis)
rate_limit_storage = defaultdict(list)
logger = logging.getLogger(__name__)

def rate_limit(max_requests=60, window_seconds=60, per='ip'):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Identificar cliente
            if per == 'ip':
                identifier = request.remote_addr
            elif per == 'user' and hasattr(g, 'current_user'):
                identifier = f"user_{g.current_user.id}"
            else:
                identifier = request.remote_addr
            
            now = time.time()
            window_start = now - window_seconds
            
            # Limpar requests antigos
            rate_limit_storage[identifier] = [
                req_time for req_time in rate_limit_storage[identifier]
                if req_time > window_start
            ]
            
            # Verificar limite
            if len(rate_limit_storage[identifier]) >= max_requests:
                logger.warning(f'Rate limit exceeded for {identifier}')
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'message': f'Máximo {max_requests} requests por {window_seconds} segundos'
                }), 429
            
            # Adicionar request atual
            rate_limit_storage[identifier].append(now)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def security_headers(response):
    """Adiciona headers de segurança"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob:; "
        "font-src 'self'; "
        "connect-src 'self'; "
        "frame-ancestors 'none';"
    )
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob:; "
        "font-src 'self'; "
        "connect-src 'self'; "
        "frame-ancestors 'none';"
    )
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    return response

def sanitize_input(data):
    """Sanitiza dados de entrada"""
    if isinstance(data, str):
        # Remove caracteres perigosos
        dangerous_chars = ['<', '>', '"', "'", '&', ';']
        for char in dangerous_chars:
            data = data.replace(char, '')
        return data.strip()
    elif isinstance(data, dict):
        return {key: sanitize_input(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    return data

def validate_ip_address(ip):
    """Valida endereço IP"""
    import ipaddress
    try:
        ipaddress.ip_address(ip)
        return True
    except ValueError:
        return False

def log_security_event(event_type, user_id=None, ip_address=None, details=None):
    """Log de eventos de segurança"""
    logger.warning(f'SECURITY_EVENT: {event_type} | User: {user_id} | IP: {ip_address} | Details: {details}')

class SecurityMiddleware:
    """Middleware de segurança"""
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        app.before_request(self.before_request)
        app.after_request(self.after_request)
    
    def before_request(self):
        # Validar IP
        if not validate_ip_address(request.remote_addr):
            log_security_event('INVALID_IP', ip_address=request.remote_addr)
            return jsonify({'error': 'Invalid request'}), 400
        
        # Verificar tamanho do payload
        if request.content_length and request.content_length > 10 * 1024 * 1024:  # 10MB
            log_security_event('LARGE_PAYLOAD', ip_address=request.remote_addr)
            return jsonify({'error': 'Payload too large'}), 413
    
    def after_request(self, response):
        return security_headers(response)