from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models import db
from src.models.ordem_servico import OrdemServico, ItemOrdemServico, ServicoOrdem
from src.models.cliente import Cliente
from src.models.veiculo import Veiculo

ordem_servico_bp = Blueprint('ordem_servico', __name__)

@ordem_servico_bp.route('/ordens-servico', methods=['GET'])
def listar_ordens_servico():
    try:
        search = request.args.get('search')
        status = request.args.get('status')
        query = OrdemServico.query
        if search:
            query = query.filter(OrdemServico.numero.contains(search))
        if status:
            query = query.filter_by(status=status)
        ordens = query.all()
        # Enriquecer dados com nome de cliente e placa do veículo
        result_list = []
        for os_item in ordens:
            d = os_item.to_dict()
            cliente = Cliente.query.get(os_item.cliente_id)
            veiculo = Veiculo.query.get(os_item.veiculo_id)
            d['cliente_nome'] = cliente.nome if cliente else None
            d['veiculo_placa'] = veiculo.placa if veiculo else None
            result_list.append(d)
        return jsonify({'success': True, 'data': result_list})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@ordem_servico_bp.route('/ordens-servico/<int:os_id>', methods=['GET'])
def obter_ordem_servico(os_id):
    try:
        os_item = OrdemServico.query.get(os_id)
        if not os_item:
            return jsonify({'success': False, 'message': 'Ordem de serviço não encontrada'}), 404
        data = os_item.to_dict()
        data['itens'] = [item.to_dict() for item in os_item.itens]
        data['servicos'] = [serv.to_dict() for serv in os_item.servicos]
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@ordem_servico_bp.route('/ordens-servico', methods=['POST'])
def criar_ordem_servico():
    try:
        data = request.get_json()
        required_fields = ['cliente_id', 'veiculo_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'Campo {field} é obrigatório'}), 400

        # Geração automática do número da ordem de serviço
        numero = data.get('numero')
        if not numero:
            current_year = datetime.utcnow().year
            count = OrdemServico.query.filter(OrdemServico.numero.startswith(f"{current_year}-")).count()
            numero = f"{current_year}-{count:04d}"

        cliente = Cliente.query.get(data['cliente_id'])
        if not cliente:
            return jsonify({'success': False, 'message': 'Cliente não encontrado'}), 404

        veiculo = Veiculo.query.get(data['veiculo_id'])
        if not veiculo:
            return jsonify({'success': False, 'message': 'Veículo não encontrado'}), 404

        os_item = OrdemServico(
            numero=numero, 
            cliente_id=data['cliente_id'],
            veiculo_id=data['veiculo_id'],
            data_previsao=datetime.fromisoformat(data.get('data_previsao')) if data.get('data_previsao') else None,
            prioridade=data.get('prioridade'),
            problema_relatado=data.get('problema_relatado'),
            observacoes=data.get('observacoes')
        )
        db.session.add(os_item)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Ordem de serviço criada com sucesso', 'data': os_item.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@ordem_servico_bp.route('/ordens-servico/<int:os_id>', methods=['PUT'])
def atualizar_ordem_servico(os_id):
    try:
        data = request.get_json()
        os_item = OrdemServico.query.get(os_id)
        if not os_item:
            return jsonify({'success': False, 'message': 'Ordem de serviço não encontrada'}), 404

        # Atualizar campos permitidos
        for field in ['data_previsao', 'data_conclusao', 'status', 'prioridade', 'problema_relatado', 'diagnostico', 'servicos_executados', 'observacoes', 'km_entrada', 'km_saida', 'mecanico_responsavel', 'consultor_responsavel', 'valor_desconto', 'aprovada_cliente']:
            if field in data:
                setattr(os_item, field, data[field])

        os_item.data_atualizacao = datetime.utcnow()
        os_item.calcular_totais()
        db.session.commit()
        return jsonify({'success': True, 'message': 'Ordem de serviço atualizada com sucesso', 'data': os_item.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@ordem_servico_bp.route('/ordens-servico/<int:os_id>', methods=['DELETE'])
def cancelar_ordem_servico(os_id):
    try:
        os_item = OrdemServico.query.get(os_id)
        if not os_item:
            return jsonify({'success': False, 'message': 'Ordem de serviço não encontrada'}), 404

        os_item.status = 'cancelada'
        os_item.data_atualizacao = datetime.utcnow()
        db.session.commit()
        return jsonify({'success': True, 'message': 'Ordem de serviço cancelada com sucesso'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
