from flask import Blueprint, request, jsonify
from src.models import db
from src.models.configuracao import ConfiguracaoEmpresa, ConfiguracaoEmail, ConfiguracaoNotificacao, ConfiguracaoSistema
from datetime import datetime
import os
from werkzeug.utils import secure_filename
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

configuracao_bp = Blueprint('configuracao', __name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@configuracao_bp.route('/configuracoes/empresa', methods=['GET'])
def obter_configuracao_empresa():
    """Obtém configurações da empresa"""
    try:
        config = ConfiguracaoEmpresa.query.first()
        if not config:
            # Criar configuração padrão
            config = ConfiguracaoEmpresa()
            db.session.add(config)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'data': config.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/empresa', methods=['PUT'])
def atualizar_configuracao_empresa():
    """Atualiza configurações da empresa"""
    try:
        data = request.get_json()
        
        config = ConfiguracaoEmpresa.query.first()
        if not config:
            config = ConfiguracaoEmpresa()
            db.session.add(config)
        
        # Atualizar campos
        for campo in ['razao_social', 'nome_fantasia', 'cnpj', 'inscricao_estadual', 
                     'inscricao_municipal', 'telefone', 'celular', 'email', 'site',
                     'endereco', 'numero', 'complemento', 'bairro', 'cidade', 
                     'estado', 'cep', 'moeda', 'fuso_horario', 'formato_data']:
            if campo in data:
                setattr(config, campo, data[campo])
        
        config.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Configurações da empresa atualizadas com sucesso',
            'data': config.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/empresa/logotipo', methods=['POST'])
def upload_logotipo():
    """Upload do logotipo da empresa"""
    try:
        if 'logotipo' not in request.files:
            return jsonify({'success': False, 'message': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['logotipo']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'Nenhum arquivo selecionado'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            filename = timestamp + filename
            
            # Criar diretório se não existir
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Atualizar configuração
            config = ConfiguracaoEmpresa.query.first()
            if not config:
                config = ConfiguracaoEmpresa()
                db.session.add(config)
            
            config.logotipo_path = filepath
            config.data_atualizacao = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Logotipo enviado com sucesso',
                'data': {'logotipo_path': filepath}
            })
        
        return jsonify({'success': False, 'message': 'Tipo de arquivo não permitido'}), 400
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/email', methods=['GET'])
def obter_configuracao_email():
    """Obtém configurações de email"""
    try:
        config = ConfiguracaoEmail.query.first()
        if not config:
            config = ConfiguracaoEmail()
            db.session.add(config)
            db.session.commit()
        
        # Não retornar senha por segurança
        data = config.to_dict()
        data['senha_email'] = '***' if config.senha_email else ''
        
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/email', methods=['PUT'])
def atualizar_configuracao_email():
    """Atualiza configurações de email"""
    try:
        data = request.get_json()
        
        config = ConfiguracaoEmail.query.first()
        if not config:
            config = ConfiguracaoEmail()
            db.session.add(config)
        
        # Atualizar campos
        for campo in ['servidor_smtp', 'porta_smtp', 'usar_tls', 'usuario_email',
                     'email_remetente', 'nome_remetente']:
            if campo in data:
                setattr(config, campo, data[campo])
        
        # Senha apenas se fornecida
        if data.get('senha_email') and data['senha_email'] != '***':
            config.senha_email = data['senha_email']  # Em produção, criptografar
        
        config.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Configurações de email atualizadas com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/email/teste', methods=['POST'])
def testar_configuracao_email():
    """Testa configurações de email"""
    try:
        data = request.get_json()
        email_destino = data.get('email_destino')
        
        if not email_destino:
            return jsonify({'success': False, 'message': 'Email de destino é obrigatório'}), 400
        
        config = ConfiguracaoEmail.query.first()
        if not config or not config.ativo:
            return jsonify({'success': False, 'message': 'Configurações de email não encontradas'}), 400
        
        # Criar mensagem de teste
        msg = MIMEMultipart()
        msg['From'] = config.email_remetente
        msg['To'] = email_destino
        msg['Subject'] = 'Teste de Configuração - ERP Oficina'
        
        corpo = """
        Este é um email de teste do sistema ERP Oficina.
        
        Se você recebeu este email, as configurações estão funcionando corretamente.
        
        Data/Hora: {}
        """.format(datetime.now().strftime('%d/%m/%Y %H:%M:%S'))
        
        msg.attach(MIMEText(corpo, 'plain'))
        
        # Enviar email
        server = smtplib.SMTP(config.servidor_smtp, config.porta_smtp)
        if config.usar_tls:
            server.starttls()
        server.login(config.usuario_email, config.senha_email)
        server.send_message(msg)
        server.quit()
        
        # Atualizar status do teste
        config.testado = True
        config.data_ultimo_teste = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Email de teste enviado com sucesso'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro ao enviar email: {str(e)}'}), 500

@configuracao_bp.route('/configuracoes/notificacoes', methods=['GET'])
def obter_configuracao_notificacoes():
    """Obtém configurações de notificações"""
    try:
        config = ConfiguracaoNotificacao.query.first()
        if not config:
            config = ConfiguracaoNotificacao()
            db.session.add(config)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'data': config.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/notificacoes', methods=['PUT'])
def atualizar_configuracao_notificacoes():
    """Atualiza configurações de notificações"""
    try:
        data = request.get_json()
        
        config = ConfiguracaoNotificacao.query.first()
        if not config:
            config = ConfiguracaoNotificacao()
            db.session.add(config)
        
        # Atualizar campos
        for campo in ['notificar_ordem_criada', 'notificar_ordem_concluida',
                     'notificar_vencimento_documentos', 'notificar_estoque_baixo',
                     'notificar_contas_vencer', 'notificar_manutencao_ferramentas',
                     'dias_antecedencia_vencimento', 'dias_antecedencia_manutencao',
                     'emails_notificacao']:
            if campo in data:
                setattr(config, campo, data[campo])
        
        config.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Configurações de notificações atualizadas com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/sistema', methods=['GET'])
def listar_configuracoes_sistema():
    """Lista todas as configurações do sistema"""
    try:
        configs = ConfiguracaoSistema.query.all()
        
        return jsonify({
            'success': True,
            'data': [config.to_dict() for config in configs]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/sistema', methods=['POST'])
def criar_configuracao_sistema():
    """Cria nova configuração do sistema"""
    try:
        data = request.get_json()
        
        # Verificar se já existe
        config_existente = ConfiguracaoSistema.query.filter_by(chave=data['chave']).first()
        if config_existente:
            return jsonify({'success': False, 'message': 'Configuração já existe'}), 400
        
        config = ConfiguracaoSistema(
            chave=data['chave'],
            valor=data['valor'],
            tipo=data.get('tipo', 'string'),
            descricao=data.get('descricao')
        )
        
        db.session.add(config)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Configuração criada com sucesso',
            'data': config.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/sistema/<int:config_id>', methods=['PUT'])
def atualizar_configuracao_sistema(config_id):
    """Atualiza configuração do sistema"""
    try:
        config = ConfiguracaoSistema.query.get_or_404(config_id)
        data = request.get_json()
        
        config.valor = data['valor']
        if 'tipo' in data:
            config.tipo = data['tipo']
        if 'descricao' in data:
            config.descricao = data['descricao']
        
        config.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Configuração atualizada com sucesso',
            'data': config.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/backup', methods=['POST'])
def criar_backup():
    """Cria backup do banco de dados"""
    try:
        import shutil
        from datetime import datetime
        
        # Nome do arquivo de backup
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'backup_erp_oficina_{timestamp}.db'
        backup_path = os.path.join('backups', backup_filename)
        
        # Criar diretório de backup se não existir
        os.makedirs('backups', exist_ok=True)
        
        # Copiar banco de dados
        db_path = os.path.join('src', 'database', 'app.db')
        shutil.copy2(db_path, backup_path)
        
        return jsonify({
            'success': True,
            'message': 'Backup criado com sucesso',
            'data': {
                'backup_filename': backup_filename,
                'backup_path': backup_path,
                'data_criacao': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/info-sistema', methods=['GET'])
def info_sistema():
    """Retorna informações do sistema"""
    try:
        import platform
        import psutil
        
        info = {
            'versao_sistema': '1.0.0',
            'python_version': platform.python_version(),
            'sistema_operacional': platform.system(),
            'arquitetura': platform.architecture()[0],
            'memoria_total': psutil.virtual_memory().total,
            'memoria_disponivel': psutil.virtual_memory().available,
            'uso_cpu': psutil.cpu_percent(),
            'data_hora_servidor': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': info
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

