from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid
from src.models import db
from src.models.veiculo import Veiculo
from src.models.cliente import Cliente

veiculo_bp = Blueprint('veiculo', __name__)

@veiculo_bp.route('/veiculos', methods=['GET'])
def listar_veiculos():
    """Lista todos os veículos"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        cliente_id = request.args.get('cliente_id', type=int)
        
        query = Veiculo.query
        
        if cliente_id:
            query = query.filter_by(cliente_id=cliente_id)
        
        veiculos = query.filter_by(ativo=True).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': [veiculo.to_dict() for veiculo in veiculos.items],
            'pagination': {
                'page': page,
                'pages': veiculos.pages,
                'per_page': per_page,
                'total': veiculos.total
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@veiculo_bp.route('/veiculos', methods=['POST'])
def criar_veiculo():
    """Cria um novo veículo"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['cliente_id', 'marca', 'modelo', 'placa']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'Campo {field} é obrigatório'}), 400
        
        # Verificar se o cliente existe
        cliente = Cliente.query.get(data['cliente_id'])
        if not cliente:
#            return jsonify({'success': False, 'message': 'Cliente n
o encontrado'}), 404
        
        # Verificar se a placa já existe
        veiculo_existente = Veiculo.query.filter_by(placa=data['placa']).first()
        if veiculo_existente:
            return jsonify({'success': False, 'message': 'Placa já cadastrada'}), 400
        
        # Criar novo veículo
        veiculo = Veiculo(
            cliente_id=data['cliente_id'],
            marca=data['marca'],
            modelo=data['modelo'],
            ano_fabricacao=data.get('ano_fabricacao'),
            ano_modelo=data.get('ano_modelo'),
            cor=data.get('cor'),
            placa=data['placa'],
            chassi=data.get('chassi'),
            renavam=data.get('renavam'),
            combustivel=data.get('combustivel'),
            motor=data.get('motor'),
            cambio=data.get('cambio'),
            quilometragem=data.get('quilometragem', 0),
            observacoes=data.get('observacoes'),
            fotos=data.get('fotos', [])
        )
        
        # Processar datas de vencimento
        if data.get('vencimento_ipva'):
            veiculo.vencimento_ipva = datetime.strptime(data['vencimento_ipva'], '%Y-%m-%d').date()
        if data.get('vencimento_seguro'):
            veiculo.vencimento_seguro = datetime.strptime(data['vencimento_seguro'], '%Y-%m-%d').date()
        if data.get('vencimento_licenciamento'):
            veiculo.vencimento_licenciamento = datetime.strptime(data['vencimento_licenciamento'], '%Y-%m-%d').date()
        
        db.session.add(veiculo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Veículo cadastrado com sucesso',
            'data': veiculo.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@veiculo_bp.route('/veiculos/<int:veiculo_id>/fotos', methods=['POST'])
def upload_foto_veiculo(veiculo_id):
    """Faz upload de fotos do veículo"""
    try:
        veiculo = Veiculo.query.get(veiculo_id)
        if not veiculo:
#            return jsonify({'success': False, 'message': 'Veículo n
o encontrado'}), 404
        
        if 'foto' not in request.files:
            return jsonify({'success': False, 'message': 'Nenhuma foto enviada'}), 400
        
        file = request.files['foto']
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'Nenhuma foto selecionada'}), 400
        
        # Verificar tipo de arquivo
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'success': False, 'message': 'Tipo de arquivo não permitido'}), 400
        
        # Verificar tamanho do arquivo (5MB máximo)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            return jsonify({'success': False, 'message': 'Arquivo muito grande. Máximo 5MB'}), 400
        
        # Criar diretório se não existir
        upload_dir = 'static/uploads/veiculos'
        os.makedirs(upload_dir, exist_ok=True)
        
        # Gerar nome único para o arquivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = str(uuid.uuid4())[:8]
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"veiculo_{veiculo_id}_{timestamp}_{unique_id}{ext}"
        
        # Salvar arquivo
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Atualizar lista de fotos do veículo
        fotos_atuais = veiculo.fotos or []
        fotos_atuais.append(unique_filename)
        veiculo.fotos = fotos_atuais
        veiculo.data_atualizacao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Foto enviada com sucesso',
            'data': {
                'nome_arquivo': unique_filename,
                'url_foto': f'/static/uploads/veiculos/{unique_filename}',
                'tamanho': file_size
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
