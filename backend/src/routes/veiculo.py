from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models import db
from src.models.veiculo import Veiculo
from src.models.cliente import Cliente

veiculo_bp = Blueprint('veiculo', __name__)

@veiculo_bp.route('/veiculos', methods=['GET'])
def listar_veiculos():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
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
