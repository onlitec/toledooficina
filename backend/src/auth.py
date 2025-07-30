from functools import wraps
from flask import request, jsonify, g
from src.models.user import User

def token_required(f):
    """Decorator para rotas que requerem autenticação"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Verificar se o token está no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Token malformado'}), 401
        
        if not token:
            return jsonify({'message': 'Token de acesso requerido'}), 401
        
        try:
            # Verificar e decodificar o token
            current_user = User.verify_token(token)
            if current_user is None:
                return jsonify({'message': 'Token inválido ou expirado'}), 401
            
            if not current_user.ativo:
                return jsonify({'message': 'Usuário inativo'}), 401
                
            # Disponibilizar o usuário atual para a rota
            g.current_user = current_user
            
        except Exception as e:
            return jsonify({'message': 'Token inválido'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorator para rotas que requerem privilégios de administrador"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'current_user') or g.current_user.role != 'admin':
            return jsonify({'message': 'Acesso negado. Privilégios de administrador requeridos'}), 403
        return f(*args, **kwargs)
    
    return decorated

def manager_required(f):
    """Decorator para rotas que requerem privilégios de gerente ou superior"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'current_user') or g.current_user.role not in ['admin', 'manager']:
            return jsonify({'message': 'Acesso negado. Privilégios de gerente requeridos'}), 403
        return f(*args, **kwargs)
    
    return decorated

def get_current_user():
    """Retorna o usuário atual da requisição"""
    return getattr(g, 'current_user', None)

def is_authenticated():
    """Verifica se há um usuário autenticado na requisição atual"""
    return hasattr(g, 'current_user') and g.current_user is not None

def has_role(role):
    """Verifica se o usuário atual tem uma role específica"""
    current_user = get_current_user()
    return current_user and current_user.role == role

def has_permission(permission):
    """Verifica se o usuário atual tem uma permissão específica"""
    current_user = get_current_user()
    if not current_user:
        return False
    
    # Definir hierarquia de permissões
    role_permissions = {
        'admin': ['read', 'write', 'delete', 'manage_users', 'manage_system'],
        'manager': ['read', 'write', 'delete'],
        'user': ['read', 'write']
    }
    
    user_permissions = role_permissions.get(current_user.role, [])
    return permission in user_permissions
