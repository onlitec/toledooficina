from flask import Blueprint, request, jsonify
<<<<<<< HEAD
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
=======
from src.models import db
from src.models.ordem_servico import OrdemServico, ItemOrdemServico, ServicoOrdem, TipoServico
from src.models.cliente import Cliente
from src.models.veiculo import Veiculo
from datetime import datetime

ordem_servico_bp = Blueprint(\'ordem_servico\', __name__)

@ordem_servico_bp.route(\'/ordens-servico\', methods=[\'GET\'])
def listar_ordens_servico():
    try:
        page = request.args.get(\'page\', 1, type=int)
        per_page = request.args.get(\'per_page\', 10, type=int)
        search = request.args.get(\'search\', \'\')
        status = request.args.get(\'status\')
        cliente_id = request.args.get(\'cliente_id\', type=int)
        
        query = OrdemServico.query
        
        if search:
            query = query.filter(OrdemServico.numero.contains(search))
        
        if status:
            query = query.filter_by(status=status)
        
        if cliente_id:
            query = query.filter_by(cliente_id=cliente_id)
        
        ordens = query.order_by(OrdemServico.data_abertura.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            \'success\': True,
            \'data\': [ordem.to_dict() for ordem in ordens.items],
            \'pagination\': {
                \'page\': page,
                \'per_page\': per_page,
                \'total\': ordens.total,
                \'pages\': ordens.pages
            }
        })
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@ordem_servico_bp.route(\'/ordens-servico\', methods=[\'POST\'])
def criar_ordem_servico():
    try:
        data = request.get_json()
        
        if not data.get(\'cliente_id\'):
            return jsonify({\'success\': False, \'message\': \'Cliente é obrigatório\'}), 400
        if not Cliente.query.get(data[\'cliente_id\']):
            return jsonify({\'success\': False, \'message\': \'Cliente não encontrado\'}), 404
        if not data.get(\'veiculo_id\'):
            return jsonify({\'success\': False, \'message\': \'Veículo é obrigatório\'}), 400
        if not Veiculo.query.get(data[\'veiculo_id\']):
            return jsonify({\'success\': False, \'message\': \'Veículo não encontrado\'}), 404
        if not data.get(\'descricao_problema_servico_solicitado\'):
            return jsonify({\'success\': False, \'message\': \'Descrição do problema/serviço é obrigatória\'}), 400
        
        # Gerar número da OS
        ultimo_numero = db.session.query(db.func.max(OrdemServico.numero)).scalar()
        if ultimo_numero:
            proximo_numero = str(int(ultimo_numero) + 1).zfill(6)
        else:
            proximo_numero = \'000001\'
        
        ordem = OrdemServico(
            numero=proximo_numero,
            cliente_id=data[\'cliente_id\'],
            veiculo_id=data[\'veiculo_id\'],
            descricao_problema_servico_solicitado=data[\'descricao_problema_servico_solicitado\'],
            data_conclusao_prevista=datetime.strptime(data[\'data_conclusao_prevista\'], \'%Y-%m-%d %H:%M:%S\') if data.get(\'data_conclusao_prevista\') else None,
            diagnostico=data.get(\'diagnostico\'),
            observacoes_internas=data.get(\'observacoes_internas\')
        )
        
        db.session.add(ordem)
        db.session.commit()
        
        return jsonify({
            \'success\': True,
            \'message\': \'Ordem de serviço criada com sucesso\',
            \'data\': ordem.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@ordem_servico_bp.route(\'/ordens-servico/<int:ordem_id>\', methods=[\'PUT\'])
def atualizar_ordem_servico(ordem_id):
    try:
        ordem = OrdemServico.query.get_or_404(ordem_id)
        data = request.get_json()
        
        for campo in [\'status\', \'descricao_problema_servico_solicitado\', \'diagnostico\', 
                     \'servicos_executados\', \'observacoes_internas\']:
            if campo in data:
                setattr(ordem, campo, data[campo])
        
        if data.get(\'data_conclusao_prevista\'):
            ordem.data_conclusao_prevista = datetime.strptime(data[\'data_conclusao_prevista\'], \'%Y-%m-%d %H:%M:%S\')
        
        if data.get(\'data_conclusao_real\'):
            ordem.data_conclusao_real = datetime.strptime(data[\'data_conclusao_real\'], \'%Y-%m-%d %H:%M:%S\')
        
        if data.get(\'aprovado_cliente\') is not None:
            ordem.aprovado_cliente = data[\'aprovado_cliente\']
            if data[\'aprovado_cliente\']:
                ordem.data_aprovacao = datetime.utcnow()
        
        # Recalcular totais
        ordem.calcular_totais()
        ordem.data_atualizacao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            \'success\': True,
            \'message\': \'Ordem de serviço atualizada com sucesso\',
            \'data\': ordem.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@ordem_servico_bp.route(\'/ordens-servico/<int:ordem_id>/itens\', methods=[\'POST\'])
def adicionar_item_ordem(ordem_id):
    try:
        ordem = OrdemServico.query.get_or_404(ordem_id)
        data = request.get_json()
        
        if not data.get(\'peca_id\'):
            return jsonify({\'success\': False, \'message\': \'Peça é obrigatória\'}), 400
        if not data.get(\'quantidade\'):
            return jsonify({\'success\': False, \'message\': \'Quantidade é obrigatória\'}), 400
        if not data.get(\'valor_unitario\'):
            return jsonify({\'success\': False, \'message\': \'Valor unitário é obrigatório\'}), 400
        
        item = ItemOrdemServico(
            ordem_servico_id=ordem_id,
            peca_id=data[\'peca_id\'],
            quantidade=data[\'quantidade\'],
            valor_unitario=data[\'valor_unitario\'],
            valor_total=data[\'quantidade\'] * data[\'valor_unitario\'],
            desconto=data.get(\'desconto\', 0)
        )
        
        db.session.add(item)
        ordem.calcular_totais()
        db.session.commit()
        
        return jsonify({
            \'success\': True,
            \'message\': \'Item adicionado com sucesso\',
            \'data\': item.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@ordem_servico_bp.route(\'/ordens-servico/<int:ordem_id>/servicos\', methods=[\'POST\'])
def adicionar_servico_ordem(ordem_id):
    try:
        ordem = OrdemServico.query.get_or_404(ordem_id)
        data = request.get_json()
        
        if not data.get(\'tipo_servico_id\'):
            return jsonify({\'success\': False, \'message\': \'Tipo de serviço é obrigatório\'}), 400
        if not data.get(\'valor_hora\'):
            return jsonify({\'success\': False, \'message\': \'Valor da hora é obrigatório\'}), 400
        
        servico = ServicoOrdem(
            ordem_servico_id=ordem_id,
            tipo_servico_id=data[\'tipo_servico_id\'],
            descricao=data.get(\'descricao\'),
            quantidade_horas=data.get(\'quantidade_horas\', 1),
            valor_hora=data[\'valor_hora\'],
            valor_total=data.get(\'quantidade_horas\', 1) * data[\'valor_hora\'],
            desconto=data.get(\'desconto\', 0),
            mecanico=data.get(\'mecanico\')
        )
        
        db.session.add(servico)
        ordem.calcular_totais()
        db.session.commit()
        
        return jsonify({
            \'success\': True,
            \'message\': \'Serviço adicionado com sucesso\',
            \'data\': servico.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

# Rotas para Tipos de Serviço
@ordem_servico_bp.route(\'/tipos-servico\', methods=[\'GET\'])
def listar_tipos_servico():
    try:
        tipos = TipoServico.query.filter_by(ativo=True).all()
        return jsonify({
            \'success\': True,
            \'data\': [tipo.to_dict() for tipo in tipos]
        })
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@ordem_servico_bp.route(\'/tipos-servico\', methods=[\'POST\'])
def criar_tipo_servico():
    try:
        data = request.get_json()
        
        if not data.get(\'nome\'):
            return jsonify({\'success\': False, \'message\': \'Nome é obrigatório\'}), 400
        
        tipo = TipoServico(
            nome=data[\'nome\'],
            descricao=data.get(\'descricao\'),
            valor_padrao=data.get(\'valor_padrao\'),
            tempo_estimado_horas=data.get(\'tempo_estimado_horas\')
        )
        
        db.session.add(tipo)
        db.session.commit()
        
        return jsonify({
            \'success\': True,
            \'message\': \'Tipo de serviço criado com sucesso\',
            \'data\': tipo.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500


>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
