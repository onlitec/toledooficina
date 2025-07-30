from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models import db
from src.models.veiculo import Veiculo
from src.models.cliente import Cliente
import os
from werkzeug.utils import secure_filename

veiculo_bp = Blueprint('veiculo', __name__)

@veiculo_bp.route('/veiculos', methods=['GET'])
def listar_veiculos():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        cliente_id = request.args.get('cliente_id', type=int)

        # Fazer join com a tabela de clientes para obter o nome
        query = db.session.query(Veiculo, Cliente).join(Cliente, Veiculo.cliente_id == Cliente.id)

        if cliente_id:
            query = query.filter(Veiculo.cliente_id == cliente_id)

        # Filtrar apenas veículos ativos
        query = query.filter(Veiculo.ativo == True)

        # Aplicar paginação
        veiculos_result = query.paginate(
            page=page, per_page=per_page, error_out=False
        )

        # Preparar dados com informações do cliente
        veiculos_data = []
        for veiculo, cliente in veiculos_result.items:
            veiculo_dict = veiculo.to_dict()
            veiculo_dict['cliente_nome'] = cliente.nome
            veiculo_dict['cliente_telefone'] = cliente.telefone
            veiculo_dict['cliente_email'] = cliente.email
            veiculos_data.append(veiculo_dict)

        return jsonify({
            'success': True,
            'data': veiculos_data,
            'pagination': {
                'page': page,
                'pages': veiculos_result.pages,
                'per_page': per_page,
                'total': veiculos_result.total
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@veiculo_bp.route('/veiculos', methods=['POST'])
def criar_veiculo():
    try:
        data = request.get_json()
        
        required_fields = ['cliente_id', 'marca', 'modelo', 'placa']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'Campo {field} e obrigatorio'}), 400
        
        cliente = Cliente.query.get(data['cliente_id'])
        if not cliente:
            return jsonify({'success': False, 'message': 'Cliente nao encontrado'}), 404
        
        veiculo_existente = Veiculo.query.filter_by(placa=data['placa']).first()
        if veiculo_existente:
            return jsonify({'success': False, 'message': 'Placa ja cadastrada'}), 400
        
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
        )
        
        db.session.add(veiculo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Veiculo cadastrado com sucesso',
            'data': veiculo.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@veiculo_bp.route('/veiculos/<int:veiculo_id>/fotos', methods=['POST'])
def upload_foto_veiculo(veiculo_id):
    """Upload de foto para um veículo"""
    try:
        veiculo = Veiculo.query.get(veiculo_id)
        if not veiculo:
            return jsonify({'success': False, 'message': 'Veiculo nao encontrado'}), 404
        
        if 'foto' not in request.files:
            return jsonify({'success': False, 'message': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['foto']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'Nenhum arquivo selecionado'}), 400
        
        # Verificar tipo de arquivo
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'success': False, 'message': 'Tipo de arquivo nao permitido. Use PNG, JPG, GIF ou WEBP'}), 400
        
        # Verificar tamanho do arquivo (5MB máximo)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            return jsonify({'success': False, 'message': 'Arquivo muito grande. Maximo 5MB'}), 400
        
        # Criar diretório se não existir
        upload_dir = os.path.join('uploads', 'veiculos')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Gerar nome único para o arquivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"veiculo_{veiculo_id}_{timestamp}{ext}"
        
        # Salvar arquivo
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Atualizar lista de fotos do veículo
        if veiculo.fotos is None:
            veiculo.fotos = []
        
        veiculo.fotos.append(unique_filename)
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

@veiculo_bp.route('/veiculos/<int:veiculo_id>/fotos/<string:nome_foto>', methods=['DELETE'])
def remover_foto_veiculo(veiculo_id, nome_foto):
    """Remove uma foto de um veículo"""
    try:
        veiculo = Veiculo.query.get(veiculo_id)
        if not veiculo:
            return jsonify({'success': False, 'message': 'Veiculo nao encontrado'}), 404
        
        if not veiculo.fotos or nome_foto not in veiculo.fotos:
            return jsonify({'success': False, 'message': 'Foto nao encontrada'}), 404
        
        # Remover arquivo do sistema de arquivos
        file_path = os.path.join('uploads', 'veiculos', nome_foto)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass  # Ignorar erro se não conseguir remover
        
        # Remover da lista de fotos do veículo
        veiculo.fotos.remove(nome_foto)
        veiculo.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Foto removida com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@veiculo_bp.route('/veiculos/<int:veiculo_id>', methods=['PUT'])
def atualizar_veiculo(veiculo_id):
    try:
        veiculo = Veiculo.query.get(veiculo_id)
        if not veiculo:
            return jsonify({'success': False, 'message': 'Veiculo nao encontrado'}), 404
        
        data = request.get_json()
        
        # Verificar se a placa já existe (exceto para o próprio veículo)
        if data.get('placa') and data['placa'] != veiculo.placa:
            veiculo_existente = Veiculo.query.filter_by(placa=data['placa']).first()
            if veiculo_existente:
                return jsonify({'success': False, 'message': 'Placa ja cadastrada'}), 400
        
        # Atualizar campos
        if 'marca' in data:
            veiculo.marca = data['marca']
        if 'modelo' in data:
            veiculo.modelo = data['modelo']
        if 'ano_fabricacao' in data:
            veiculo.ano_fabricacao = data['ano_fabricacao']
        if 'ano_modelo' in data:
            veiculo.ano_modelo = data['ano_modelo']
        if 'cor' in data:
            veiculo.cor = data['cor']
        if 'placa' in data:
            veiculo.placa = data['placa']
        if 'chassi' in data:
            veiculo.chassi = data['chassi']
        if 'renavam' in data:
            veiculo.renavam = data['renavam']
        if 'combustivel' in data:
            veiculo.combustivel = data['combustivel']
        if 'motor' in data:
            veiculo.motor = data['motor']
        if 'cambio' in data:
            veiculo.cambio = data['cambio']
        if 'quilometragem' in data:
            veiculo.quilometragem = data['quilometragem']
        if 'observacoes' in data:
            veiculo.observacoes = data['observacoes']
        
        veiculo.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Veiculo atualizado com sucesso',
            'data': veiculo.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@veiculo_bp.route('/veiculos/<int:veiculo_id>', methods=['DELETE'])
def excluir_veiculo(veiculo_id):
    try:
        veiculo = Veiculo.query.get(veiculo_id)
        if not veiculo:
            return jsonify({'success': False, 'message': 'Veiculo nao encontrado'}), 404
        
        veiculo.ativo = False
        veiculo.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Veiculo excluido com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
