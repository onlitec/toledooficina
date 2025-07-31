from flask import Blueprint, jsonify, request, g
from src.models import db
from src.models.user import User
from src.auth import token_required, admin_required, get_current_user
from src.security import rate_limit, log_security_event
from src.schemas.user_schemas import LoginSchema, ChangePasswordSchema, RefreshTokenSchema
from marshmallow import ValidationError
from datetime import datetime
import re

user_bp = Blueprint('user', __name__)

def validate_email(email):
    """Valida formato do email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Valida força da senha"""
    if len(password) < 6:
        return False, "Senha deve ter pelo menos 6 caracteres"
    if not re.search(r'[A-Za-z]', password):
        return False, "Senha deve conter pelo menos uma letra"
    if not re.search(r'[0-9]', password):
        return False, "Senha deve conter pelo menos um número"
    return True, "Senha válida"

@user_bp.route('/auth/login', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=900)  # 15 minutos = 900 segundos
def login():
    """Endpoint de login com rate limiting e validações"""
    try:
        data = request.get_json()
        
        # Validar dados com Marshmallow
        schema = LoginSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return jsonify({'success': False, 'message': 'Dados inválidos', 'errors': err.messages}), 400

        username = validated_data['username'].strip()
        password = validated_data['password']
        remember_me = validated_data.get('remember_me', False)

        # Buscar usuário por username ou email
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()

        if not user:
            log_security_event('login_attempt', {'username': username, 'success': False, 'reason': 'user_not_found'})
            return jsonify({'success': False, 'message': 'Credenciais inválidas'}), 401

        # Verificar se a conta está bloqueada
        if user.is_account_locked():
            log_security_event('login_attempt', {'username': username, 'success': False, 'reason': 'account_locked'})
            return jsonify({'success': False, 'message': 'Conta temporariamente bloqueada devido a muitas tentativas de login'}), 423

        if not user.check_password(password):
            user.increment_failed_login()
            db.session.commit()
            log_security_event('login_attempt', {'username': username, 'success': False, 'reason': 'invalid_password'})
            return jsonify({'success': False, 'message': 'Credenciais inválidas'}), 401

        if not user.ativo:
            log_security_event('login_attempt', {'username': username, 'success': False, 'reason': 'user_inactive'})
            return jsonify({'success': False, 'message': 'Usuário inativo'}), 401

        # Login bem-sucedido - resetar tentativas falhadas
        user.reset_failed_login()
        
        # Gerar tokens
        access_token, refresh_token = user.generate_tokens(remember_me=remember_me)
        
        # Atualizar último login
        user.update_last_login()
        db.session.commit()
        
        log_security_event('login_attempt', {'username': username, 'success': True})

        return jsonify({
            'success': True,
            'message': 'Login realizado com sucesso',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        log_security_event('login_error', {'error': str(e)})
        return jsonify({'success': False, 'message': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/auth/refresh', methods=['POST'])
def refresh_token():
    """Endpoint para renovar access token usando refresh token"""
    try:
        data = request.get_json()
        
        # Validar dados com Marshmallow
        schema = RefreshTokenSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return jsonify({'success': False, 'message': 'Dados inválidos', 'errors': err.messages}), 400

        refresh_token = validated_data['refresh_token']
        
        # Verificar refresh token - buscar todos os usuários e verificar qual tem o token válido
        users = User.query.filter(
            User.refresh_token_hash.isnot(None),
            User.refresh_token_expires.isnot(None)
        ).all()
        
        valid_user = None
        for u in users:
            if u.verify_refresh_token(refresh_token):
                valid_user = u
                break
        
        if not valid_user:
            log_security_event('refresh_token_attempt', {'success': False, 'reason': 'invalid_token'})
            return jsonify({'success': False, 'message': 'Refresh token inválido ou expirado'}), 401
        
        user = valid_user
        
        if not user.ativo:
            log_security_event('refresh_token_attempt', {'user_id': user.id, 'success': False, 'reason': 'user_inactive'})
            return jsonify({'success': False, 'message': 'Usuário inativo'}), 401
        
        # Gerar novo access token
        new_access_token = user.generate_token()
        
        log_security_event('refresh_token_attempt', {'user_id': user.id, 'success': True})
        
        return jsonify({
            'success': True,
            'message': 'Token renovado com sucesso',
            'access_token': new_access_token
        }), 200
        
    except Exception as e:
        log_security_event('refresh_token_error', {'error': str(e)})
        return jsonify({'success': False, 'message': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/auth/logout', methods=['POST'])
@token_required
def logout():
    """Endpoint de logout"""
    try:
        current_user = get_current_user()
        
        # Invalidar refresh token
        current_user.refresh_token_hash = None
        current_user.refresh_token_expires = None
        db.session.commit()
        
        log_security_event('logout', {'user_id': current_user.id})
        
        return jsonify({'success': True, 'message': 'Logout realizado com sucesso'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/auth/me', methods=['GET'])
@token_required
def get_current_user_info():
    """Retorna informações do usuário atual"""
    current_user = get_current_user()
    return jsonify({
        'success': True,
        'user': current_user.to_dict()
    }), 200

@user_bp.route('/auth/change-password', methods=['POST'])
@token_required
def change_password():
    """Alterar senha do usuário atual"""
    try:
        data = request.get_json()
        current_user = get_current_user()
        
        # Validar dados com Marshmallow
        schema = ChangePasswordSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return jsonify({'success': False, 'message': 'Dados inválidos', 'errors': err.messages}), 400

        # Verificar senha atual
        if not current_user.check_password(validated_data['current_password']):
            log_security_event('password_change_attempt', {'user_id': current_user.id, 'success': False, 'reason': 'invalid_current_password'})
            return jsonify({'success': False, 'message': 'Senha atual incorreta'}), 400

        # Atualizar senha
        current_user.set_password(validated_data['new_password'])
        current_user.data_atualizacao = datetime.utcnow()
        
        # Invalidar refresh tokens existentes por segurança
        current_user.refresh_token_hash = None
        current_user.refresh_token_expires = None
        
        db.session.commit()
        
        log_security_event('password_change_attempt', {'user_id': current_user.id, 'success': True})

        return jsonify({
            'success': True,
            'message': 'Senha alterada com sucesso'
        }), 200

    except Exception as e:
        log_security_event('password_change_error', {'user_id': getattr(get_current_user(), 'id', None), 'error': str(e)})
        return jsonify({'success': False, 'message': f'Erro interno: {str(e)}'}), 500

# Rotas de gerenciamento de usuários (requer autenticação)

@user_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_users():
    """Listar todos os usuários (apenas admin)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '', type=str)

        query = User.query

        if search:
            query = query.filter(
                (User.username.contains(search)) |
                (User.email.contains(search)) |
                (User.nome_completo.contains(search))
            )

        users = query.paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'success': True,
            'users': [user.to_dict() for user in users.items],
            'pagination': {
                'page': users.page,
                'pages': users.pages,
                'per_page': users.per_page,
                'total': users.total
            }
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/users', methods=['POST'])
@token_required
@admin_required
def create_user():
    """Criar novo usuário (apenas admin)"""
    try:
        data = request.get_json()

        # Validações obrigatórias
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if not data or not data.get(field):
                return jsonify({'success': False, 'message': f'Campo {field} é obrigatório'}), 400

        # Validar email
        if not validate_email(data['email']):
            return jsonify({'success': False, 'message': 'Email inválido'}), 400

        # Validar senha
        is_valid, message = validate_password(data['password'])
        if not is_valid:
            return jsonify({'success': False, 'message': message}), 400

        # Verificar se username já existe
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'success': False, 'message': 'Username já existe'}), 400

        # Verificar se email já existe
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'message': 'Email já existe'}), 400

        # Criar usuário
        user = User(
            username=data['username'],
            email=data['email'],
            nome_completo=data.get('nome_completo', ''),
            role=data.get('role', 'user'),
            ativo=data.get('ativo', True)
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuário criado com sucesso',
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/users/<int:user_id>', methods=['GET'])
@token_required
@admin_required
def get_user(user_id):
    """Obter usuário por ID (apenas admin)"""
    try:
        user = User.query.get_or_404(user_id)
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@token_required
@admin_required
def update_user(user_id):
    """Atualizar usuário (apenas admin)"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()

        # Verificar se username já existe em outro usuário
        if data.get('username') and data['username'] != user.username:
            if User.query.filter_by(username=data['username']).first():
                return jsonify({'success': False, 'message': 'Username já existe'}), 400

        # Verificar se email já existe em outro usuário
        if data.get('email') and data['email'] != user.email:
            if not validate_email(data['email']):
                return jsonify({'success': False, 'message': 'Email inválido'}), 400
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'success': False, 'message': 'Email já existe'}), 400

        # Atualizar campos
        updatable_fields = ['username', 'email', 'nome_completo', 'role', 'ativo']
        for field in updatable_fields:
            if field in data:
                setattr(user, field, data[field])

        # Atualizar senha se fornecida
        if data.get('password'):
            is_valid, message = validate_password(data['password'])
            if not is_valid:
                return jsonify({'success': False, 'message': message}), 400
            user.set_password(data['password'])

        user.data_atualizacao = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuário atualizado com sucesso',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(user_id):
    """Deletar usuário (apenas admin)"""
    try:
        current_user = get_current_user()

        # Não permitir que o admin delete a si mesmo
        if current_user.id == user_id:
            return jsonify({'success': False, 'message': 'Não é possível deletar seu próprio usuário'}), 400

        user = User.query.get_or_404(user_id)

        # Soft delete - apenas desativar o usuário
        user.ativo = False
        user.data_atualizacao = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuário desativado com sucesso'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Erro interno: {str(e)}'}), 500
