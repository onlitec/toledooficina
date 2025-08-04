from flask import Blueprint, request, jsonify
from src.models import db
from src.models.configuracao import ConfiguracaoEmpresa, ConfiguracaoEmail, ConfiguracaoNotificacao, ConfiguracaoSistema
from src.auth import token_required
from datetime import datetime
import json

configuracao_bp = Blueprint(\'configuracao\', __name__)

# Rotas para Configuração da Empresa
@configuracao_bp.route(\'/configuracao/empresa\', methods=[\'GET\'])
def obter_configuracao_empresa():
    try:
        config = ConfiguracaoEmpresa.query.first()
        if not config:
            return jsonify({\'success\': False, \'message\': \'Configuração da empresa não encontrada\'}), 404
        return jsonify({\'success\': True, \'data\': config.to_dict()})
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@configuracao_bp.route(\'/configuracao/empresa\', methods=[\'POST\', \'PUT\'])
def salvar_configuracao_empresa():
    try:
        data = request.get_json()
        config = ConfiguracaoEmpresa.query.first()
        
        if not config:
            config = ConfiguracaoEmpresa()
            db.session.add(config)
        
        for campo in [\n            \'razao_social\', \'nome_fantasia\', \'cnpj\', \'inscricao_estadual\', \'inscricao_municipal\',
            \'telefone\', \'celular\', \'email\', \'site\',
            \'endereco\', \'numero\', \'complemento\', \'bairro\', \'cidade\', \'estado\', \'cep\',
            \'logotipo_path\', \'moeda\', \'fuso_horario\', \'formato_data\'
        ]:
            if campo in data:
                setattr(config, campo, data[campo])
        
        config.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({\'success\': True, \'message\': \'Configuração da empresa salva com sucesso\', \'data\': config.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

# Rotas para Configuração de Email
@configuracao_bp.route(\'/configuracao/email\', methods=[\'GET\'])
def obter_configuracao_email():
    try:
        config = ConfiguracaoEmail.query.first()
        if not config:
            return jsonify({\'success\': False, \'message\': \'Configuração de email não encontrada\'}), 404
        return jsonify({\'success\': True, \'data\': config.to_dict()})
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@configuracao_bp.route(\'/configuracao/email\', methods=[\'POST\', \'PUT\'])
def salvar_configuracao_email():
    try:
        data = request.get_json()
        config = ConfiguracaoEmail.query.first()
        
        if not config:
            config = ConfiguracaoEmail()
            db.session.add(config)
        
        for campo in [\n            \'servidor_smtp\', \'porta_smtp\', \'usar_tls\', \'usuario_email\', \'senha_email\',
            \'email_remetente\', \'nome_remetente\', \'ativo\', \'testado\'
        ]:
            if campo in data:
                setattr(config, campo, data[campo])
        
        if data.get(\'testado\'):
            config.data_ultimo_teste = datetime.utcnow()

        config.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({\'success\': True, \'message\': \'Configuração de email salva com sucesso\', \'data\': config.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

# Rotas para Configuração de Notificação
@configuracao_bp.route(\'/configuracao/notificacao\', methods=[\'GET\'])
def obter_configuracao_notificacao():
    try:
        config = ConfiguracaoNotificacao.query.first()
        if not config:
            return jsonify({\'success\': False, \'message\': \'Configuração de notificação não encontrada\'}), 404
        return jsonify({\'success\': True, \'data\': config.to_dict()})
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@configuracao_bp.route(\'/configuracao/notificacao\', methods=[\'POST\', \'PUT\'])
def salvar_configuracao_notificacao():
    try:
        data = request.get_json()
        config = ConfiguracaoNotificacao.query.first()
        
        if not config:
            config = ConfiguracaoNotificacao()
            db.session.add(config)
        
        for campo in [\n            \'notificar_ordem_criada\', \'notificar_ordem_concluida\', \'notificar_vencimento_documentos\',
            \'notificar_estoque_baixo\', \'notificar_contas_vencer\', \'notificar_manutencao_ferramentas\',
            \'dias_antecedencia_vencimento\', \'dias_antecedencia_manutencao\'
        ]:
            if campo in data:
                setattr(config, campo, data[campo])
        
        if \'emails_notificacao\' in data:
            config.emails_notificacao = json.dumps(data[\'emails_notificacao\'])

        config.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({\'success\': True, \'message\': \'Configuração de notificação salva com sucesso\', \'data\': config.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

# Rotas para Configuração de Sistema (Chave/Valor)
@configuracao_bp.route(\'/configuracao/sistema\', methods=[\'GET\'])
def listar_configuracoes_sistema():
    try:
        configs = ConfiguracaoSistema.query.all()
        return jsonify({\'success\': True, \'data\': [c.to_dict() for c in configs]})
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@configuracao_bp.route(\'/configuracao/sistema\', methods=[\'POST\'])
def criar_configuracao_sistema():
    try:
        data = request.get_json()
        
        if not data.get(\'chave\'):
            return jsonify({\'success\': False, \'message\': \'Chave é obrigatória\'}), 400
        if ConfiguracaoSistema.query.filter_by(chave=data[\'chave\']).first():
            return jsonify({\'success\': False, \'message\': \'Chave já existe\'}), 400
        
        config = ConfiguracaoSistema(
            chave=data[\'chave\'],
            valor=data.get(\'valor\'),
            tipo=data.get(\'tipo\', \'string\'),
            descricao=data.get(\'descricao\')
        )
        
        db.session.add(config)
        db.session.commit()
        
        return jsonify({\'success\': True, \'message\': \'Configuração de sistema criada com sucesso\', \'data\': config.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@configuracao_bp.route(\'/configuracao/sistema/<int:config_id>\', methods=[\'PUT\'])
def atualizar_configuracao_sistema(config_id):
    try:
        config = ConfiguracaoSistema.query.get_or_404(config_id)
        data = request.get_json()
        
        for campo in [\'valor\', \'tipo\', \'descricao\']:
            if campo in data:
                setattr(config, campo, data[campo])
        
        config.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({\'success\': True, \'message\': \'Configuração de sistema atualizada com sucesso\', \'data\': config.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@configuracao_bp.route(\'/configuracao/sistema/<int:config_id>\', methods=[\'DELETE\'])
def deletar_configuracao_sistema(config_id):
    try:
        config = ConfiguracaoSistema.query.get_or_404(config_id)
        db.session.delete(config)
        db.session.commit()
        
        return jsonify({\'success\': True, \'message\': \'Configuração de sistema deletada com sucesso\'}) 
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500



@configuracao_bp.route('/configuracoes/sistema/titulo', methods=['GET'])
def obter_titulo_empresa():
    """Obtém o título da empresa"""
    try:
        config = ConfiguracaoSistema.query.filter_by(chave='titulo_empresa').first()
        
        if not config:
            # Criar configuração padrão se não existir
            config = ConfiguracaoSistema(
                chave='titulo_empresa',
                valor='ERP Oficina Mecânica',
                tipo='string',
                descricao='Título da empresa que aparece no cabeçalho'
            )
            db.session.add(config)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'titulo': config.valor
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/sistema/titulo', methods=['PUT'])
def atualizar_titulo_empresa():
    """Atualiza o título da empresa"""
    try:
        data = request.get_json()
        titulo = data.get('titulo', '').strip()
        
        if not titulo:
            return jsonify({'success': False, 'message': 'Título não pode estar vazio'}), 400
        
        config = ConfiguracaoSistema.query.filter_by(chave='titulo_empresa').first()
        
        if not config:
            config = ConfiguracaoSistema(
                chave='titulo_empresa',
                valor=titulo,
                tipo='string',
                descricao='Título da empresa que aparece no cabeçalho'
            )
            db.session.add(config)
        else:
            config.valor = titulo
            config.data_atualizacao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Título da empresa atualizado com sucesso',
            'data': {
                'titulo': config.valor
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/sistema/logotipo', methods=['GET'])
def obter_logotipo_empresa():
    """Obtém informações do logotipo da empresa"""
    try:
        config = ConfiguracaoSistema.query.filter_by(chave='logotipo_empresa').first()
        
        logotipo_info = {
            'tem_logotipo': False,
            'url_logotipo': None,
            'nome_arquivo': None
        }
        
        if config and config.valor:
            logotipo_path = config.valor
            file_path = os.path.join('uploads', logotipo_path)
            if os.path.exists(file_path):
                logotipo_info = {
                    'tem_logotipo': True,
                    'url_logotipo': f'/static/uploads/{logotipo_path}',
                    'nome_arquivo': logotipo_path
                }
            else:
                # Arquivo configurado não existe, limpar configuração
                config.valor = ''
                config.data_atualizacao = datetime.utcnow()
                db.session.commit()
        
        return jsonify({
            'success': True,
            'data': logotipo_info
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/sistema/logotipo', methods=['POST'])
def upload_logotipo_empresa():
    """Faz upload do logotipo da empresa"""
    try:
        if 'logotipo' not in request.files:
            return jsonify({'success': False, 'message': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['logotipo']
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'Nenhum arquivo selecionado'}), 400
        
        # Verificar tipo de arquivo
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'success': False, 'message': 'Tipo de arquivo não permitido. Use PNG, JPG, GIF ou WEBP'}), 400
        
        # Verificar tamanho do arquivo (2MB máximo)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > 2 * 1024 * 1024:  # 2MB
            return jsonify({'success': False, 'message': 'Arquivo muito grande. Máximo 2MB'}), 400
        
        # Criar diretório se não existir
        upload_dir = 'uploads'
        os.makedirs(upload_dir, exist_ok=True)
        
        # Gerar nome único para o arquivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"logotipo_{timestamp}{ext}"
        
        # Salvar arquivo
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Remover logotipo anterior se existir
        config = ConfiguracaoSistema.query.filter_by(chave='logotipo_empresa').first()
        if config and config.valor:
            old_file_path = os.path.join('uploads', config.valor)
            if os.path.exists(old_file_path):
                try:
                    os.remove(old_file_path)
                except:
                    pass  # Ignorar erro se não conseguir remover
        
        # Atualizar configuração
        if not config:
            config = ConfiguracaoSistema(
                chave='logotipo_empresa',
                valor=unique_filename,
                tipo='string',
                descricao='Nome do arquivo do logotipo da empresa'
            )
            db.session.add(config)
        else:
            config.valor = unique_filename
            config.data_atualizacao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Logotipo enviado com sucesso',
            'data': {
                'nome_arquivo': unique_filename,
                'url_logotipo': f'/static/uploads/{unique_filename}',
                'tamanho': file_size
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/sistema/logotipo', methods=['DELETE'])
def remover_logotipo_empresa():
    """Remove o logotipo da empresa"""
    try:
        config = ConfiguracaoSistema.query.filter_by(chave='logotipo_empresa').first()
        
        if config and config.valor:
            # Remover arquivo físico
            file_path = os.path.join('uploads', config.valor)
            if os.path.exists(file_path):
                os.remove(file_path)
            
            # Limpar configuração
            config.valor = ''
            config.data_atualizacao = datetime.utcnow()
            db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Logotipo removido com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@configuracao_bp.route('/configuracoes/debug/uploads', methods=['GET'])
def debug_uploads():
    """Debug: verificar arquivos no diretório uploads"""
    try:
        import os

        # Verificar configuração do logotipo
        config = ConfiguracaoSistema.query.filter_by(chave='logotipo_empresa').first()
        logotipo_configurado = config.valor if config else None

        # Listar arquivos no diretório uploads
        uploads_dir = 'uploads'
        arquivos_existentes = []

        if os.path.exists(uploads_dir):
            arquivos_existentes = os.listdir(uploads_dir)

        return jsonify({
            'success': True,
            'data': {
                'logotipo_configurado': logotipo_configurado,
                'url_configurada': f'/static/uploads/{logotipo_configurado}' if logotipo_configurado else None,
                'diretorio_uploads': uploads_dir,
                'diretorio_existe': os.path.exists(uploads_dir),
                'arquivos_existentes': arquivos_existentes,
                'total_arquivos': len(arquivos_existentes)
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
