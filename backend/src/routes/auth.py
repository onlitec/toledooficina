from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from src.models import db
from src.models.user import User
from src.schemas.user_schemas import LoginSchema, ChangePasswordSchema, RefreshTokenSchema, ForgotPasswordSchema, ResetPasswordSchema
from src.security import rate_limit
from src.auth import token_required
import logging
import secrets
import hashlib
from datetime import datetime, timedelta
import uuid

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/auth/login', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=300)  # 5 tentativas por 5 minutos
def login():
    """Endpoint de login com rate limiting e validações"""
    try:
        # Validar dados de entrada
        schema = LoginSchema()
        data = schema.load(request.get_json())
        
        username = data['username'].strip().lower()
        password = data['password']
        remember_me = data.get('remember_me', False)
        
        # Buscar usuário
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user:
            logger.warning(f'Tentativa de login com usuário inexistente: {username}')
            return jsonify({
                'success': False, 
                'message': 'Credenciais inválidas'
            }), 401
        
        # Verificar se conta está bloqueada
        if user.is_account_locked():
            logger.warning(f'Tentativa de login em conta bloqueada: {username}')
            return jsonify({
                'success': False,
                'message': 'Conta temporariamente bloqueada devido a múltiplas tentativas de login falhadas'
            }), 423
        
        # Verificar senha
        if not user.check_password(password):
            user.increment_failed_login()
            logger.warning(f'Tentativa de login com senha incorreta: {username}')
            return jsonify({
                'success': False,
                'message': 'Credenciais inválidas'
            }), 401
        
        # Verificar se usuário está ativo
        if not user.ativo:
            logger.warning(f'Tentativa de login com usuário inativo: {username}')
            return jsonify({
                'success': False,
                'message': 'Usuário inativo'
            }), 401
        
        # Login bem-sucedido
        user.reset_failed_login()
        access_token, refresh_token = user.generate_tokens()
        user.update_last_login()
        
        logger.info(f'Login bem-sucedido: {username}')
        
        response_data = {
            'success': True,
            'message': 'Login realizado com sucesso',
            'access_token': access_token,
            'user': user.to_dict()
        }
        
        if remember_me:
            response_data['refresh_token'] = refresh_token
        
        return jsonify(response_data), 200
        
    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Dados inválidos',
            'errors': e.messages
        }), 400
    except Exception as e:
        logger.error(f'Erro no login: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@auth_bp.route('/auth/refresh', methods=['POST'])
@rate_limit(max_requests=10, window_seconds=60)
def refresh_token():
    """Renovar access token usando refresh token"""
    try:
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({
                'success': False,
                'message': 'Refresh token requerido'
            }), 400
        
        # Buscar usuário pelo refresh token
        user = User.query.filter(
            User.refresh_token_hash.isnot(None)
        ).all()
        
        valid_user = None
        for u in user:
            if u.verify_refresh_token(refresh_token):
                valid_user = u
                break
        
        if not valid_user or not valid_user.ativo:
            return jsonify({
                'success': False,
                'message': 'Refresh token inválido'
            }), 401
        
        # Gerar novo access token
        new_access_token = valid_user.generate_token()
        
        return jsonify({
            'success': True,
            'access_token': new_access_token
        }), 200
        
    except Exception as e:
        logger.error(f'Erro no refresh token: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500


@auth_bp.route('/forgot-password', methods=['POST'])
@rate_limit(max_requests=3, window_seconds=900)  # Máximo 3 tentativas por 15 minutos (900 segundos)
def forgot_password():
    """Solicitar redefinição de senha"""
    try:
        # Validar dados de entrada
        schema = ForgotPasswordSchema()
        validated_data = schema.load(request.get_json())
        
        email = validated_data['email']
        
        # Buscar usuário por email
        user = User.query.filter_by(email=email).first()
        
        if user and user.ativo:
            # Gerar token de redefinição
            reset_token = str(uuid.uuid4())
            reset_expires = datetime.utcnow() + timedelta(hours=1)  # Token válido por 1 hora
            
            # Salvar token no usuário
            user.reset_token = hashlib.sha256(reset_token.encode()).hexdigest()
            user.reset_token_expires = reset_expires
            db.session.commit()
            
            # Log do evento
            logger.info(f'Password reset requested for email: {email}')
            
            # TODO: Enviar email com o token (implementar quando configurar SMTP)
            # Por enquanto, retornar o token para desenvolvimento
            return jsonify({
                'success': True,
                'message': 'Se o email existir, você receberá instruções para redefinir sua senha',
                'reset_token': reset_token  # Remover em produção
            }), 200
        else:
            # Mesmo se usuário não existir, retornar sucesso para não vazar informações
            logger.warning(f'Password reset requested for invalid email: {email}')
            
        return jsonify({
            'success': True,
            'message': 'Se o email existir, você receberá instruções para redefinir sua senha'
        }), 200
        
    except ValidationError as e:
        return jsonify({'success': False, 'message': 'Dados inválidos', 'errors': e.messages}), 400
    except Exception as e:
        logger.error(f'Erro no forgot password: {str(e)}')
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500


@auth_bp.route('/reset-password', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=900)  # Máximo 5 tentativas por 15 minutos (900 segundos)
def reset_password():
    """Redefinir senha com token"""
    try:
        # Validar dados de entrada
        schema = ResetPasswordSchema()
        validated_data = schema.load(request.get_json())
        
        token = validated_data['token']
        new_password = validated_data['new_password']
        
        # Hash do token para comparação
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        # Buscar usuário pelo token
        user = User.query.filter_by(reset_token=token_hash).first()
        
        if not user:
            logger.warning(f'Password reset attempted with invalid token')
            return jsonify({'success': False, 'message': 'Token inválido ou expirado'}), 400
        
        # Verificar se token não expirou
        if user.reset_token_expires < datetime.utcnow():
            logger.warning(f'Password reset attempted with expired token for user: {user.id}')
            return jsonify({'success': False, 'message': 'Token inválido ou expirado'}), 400
        
        # Verificar se usuário está ativo
        if not user.ativo:
            logger.warning(f'Password reset attempted for inactive user: {user.id}')
            return jsonify({'success': False, 'message': 'Usuário inativo'}), 400
        
        # Atualizar senha
        user.set_password(new_password)
        
        # Limpar token de redefinição
        user.reset_token = None
        user.reset_token_expires = None
        
        # Invalidar todos os refresh tokens existentes por segurança
        user.refresh_token_hash = None
        user.refresh_token_expires = None
        
        # Resetar tentativas de login falhadas
        user.failed_login_attempts = 0
        user.account_locked_until = None
        
        db.session.commit()
        
        # Log do evento
        logger.info(f'Password reset successful for user: {user.id}')
        
        return jsonify({
            'success': True,
            'message': 'Senha redefinida com sucesso. Faça login com sua nova senha.'
        }), 200
        
    except ValidationError as e:
        return jsonify({'success': False, 'message': 'Dados inválidos', 'errors': e.messages}), 400
    except Exception as e:
        logger.error(f'Erro no reset password: {str(e)}')
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500