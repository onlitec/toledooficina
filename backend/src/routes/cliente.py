from flask import Blueprint, request, jsonify, current_app
from src.models import db
from src.models.veiculo import Veiculo
from src.models.cliente import Cliente
from datetime import datetime

cliente_bp = Blueprint('cliente', __name__)

@cliente_bp.route('/clientes', methods=['GET'])
def listar_clientes():
    """Lista todos os clientes"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        
        query = Cliente.query.filter(Cliente.ativo == True)
        
        if search:
            query = query.filter(
                Cliente.nome.contains(search) |
                Cliente.cpf_cnpj.contains(search) |
                Cliente.email.contains(search)
            )
        
        clientes = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': [cliente.to_dict() for cliente in clientes.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': clientes.total,
                'pages': clientes.pages
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@cliente_bp.route('/clientes/<int:cliente_id>', methods=['GET'])
def obter_cliente(cliente_id):
    """Obtém um cliente específico"""
    try:
        cliente = Cliente.query.filter(Cliente.id == cliente_id, Cliente.ativo == True).first()
        if not cliente:
            return jsonify({'success': False, 'message': 'Cliente não encontrado'}), 404
        return jsonify({
            'success': True,
            'data': cliente.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@cliente_bp.route('/clientes', methods=['POST'])
def criar_cliente():
    """Cria um novo cliente"""
    try:
        data = request.get_json()
        
        # Validações básicas
        if not data.get('nome'):
            return jsonify({'success': False, 'message': 'Nome é obrigatório'}), 400
        
        if not data.get('cpf_cnpj'):
            return jsonify({'success': False, 'message': 'CPF/CNPJ é obrigatório'}), 400
        
        # Verificar se CPF/CNPJ já existe entre clientes ativos
        cliente_existente = Cliente.query.filter_by(cpf_cnpj=data['cpf_cnpj'], ativo=True).first()
        if cliente_existente:
            return jsonify({'success': False, 'message': 'CPF/CNPJ já cadastrado'}), 400
        
        # Criar novo cliente
        cliente = Cliente(
            nome=data['nome'],
            tipo_pessoa=data.get('tipo_pessoa', 'fisica'),
            cpf_cnpj=data['cpf_cnpj'],
            rg_ie=data.get('rg_ie'),
            telefone=data.get('telefone'),
            celular=data.get('celular'),
            email=data.get('email'),
            endereco=data.get('endereco'),
            numero=data.get('numero'),
            complemento=data.get('complemento'),
            bairro=data.get('bairro'),
            cidade=data.get('cidade'),
            estado=data.get('estado'),
            cep=data.get('cep'),
            observacoes=data.get('observacoes')
        )
        
        # Converter data de nascimento se fornecida
        if data.get('data_nascimento'):
            try:
                cliente.data_nascimento = datetime.strptime(data['data_nascimento'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'success': False, 'message': 'Formato de data inválido'}), 400
        
        db.session.add(cliente)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Cliente criado com sucesso',
            'data': cliente.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@cliente_bp.route('/clientes/<int:cliente_id>', methods=['PUT'])
def atualizar_cliente(cliente_id):
    """Atualiza um cliente existente"""
    try:
        cliente = Cliente.query.get_or_404(cliente_id)
        data = request.get_json()
        
        # Verificar se CPF/CNPJ já existe em outro cliente
        if data.get('cpf_cnpj') and data['cpf_cnpj'] != cliente.cpf_cnpj:
            cliente_existente = Cliente.query.filter_by(cpf_cnpj=data['cpf_cnpj']).first()
            if cliente_existente:
                return jsonify({'success': False, 'message': 'CPF/CNPJ já cadastrado'}), 400
        
        # Atualizar campos
        for campo in ['nome', 'tipo_pessoa', 'cpf_cnpj', 'rg_ie', 'telefone', 'celular', 
                     'email', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 
                     'estado', 'cep', 'observacoes']:
            if campo in data:
                setattr(cliente, campo, data[campo])
        
        # Atualizar data de nascimento se fornecida
        if data.get('data_nascimento'):
            try:
                cliente.data_nascimento = datetime.strptime(data['data_nascimento'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'success': False, 'message': 'Formato de data inválido'}), 400
        
        cliente.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Cliente atualizado com sucesso',
            'data': cliente.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@cliente_bp.route('/clientes/<int:cliente_id>', methods=['DELETE'])
def deletar_cliente(cliente_id):
    """Deleta um cliente (soft delete)"""
    try:
        cliente = Cliente.query.get_or_404(cliente_id)
        cliente.ativo = False
        cliente.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Cliente desativado com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@cliente_bp.route('/clientes/<int:cliente_id>/veiculos', methods=['GET'])
def listar_veiculos_cliente(cliente_id):
    """Lista veículos de um cliente"""
    try:
        cliente = Cliente.query.filter(Cliente.id == cliente_id, Cliente.ativo == True).first()
        if not cliente:
            return jsonify({'success': False, 'message': 'Cliente não encontrado'}), 404
        veiculos = [veiculo.to_dict() for veiculo in cliente.veiculos if veiculo.ativo]
        
        return jsonify({
            'success': True,
            'data': veiculos
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@cliente_bp.route('/clientes/com-veiculos', methods=['POST'])
def criar_cliente_com_veiculos():
    """Cria um cliente junto com seus veículos"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios do cliente
        required_fields = ['nome', 'tipo_pessoa', 'cpf_cnpj']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'Campo {field} é obrigatório'}), 400
        
        # Verificar se CPF/CNPJ já existe entre clientes ativos
        cliente_existente = Cliente.query.filter_by(cpf_cnpj=data['cpf_cnpj'], ativo=True).first()
        if cliente_existente:
            return jsonify({'success': False, 'message': 'CPF/CNPJ já cadastrado'}), 400
        
        # Criar cliente
        cliente = Cliente(
            nome=data['nome'],
            tipo_pessoa=data['tipo_pessoa'],
            cpf_cnpj=data['cpf_cnpj'],
            rg_ie=data.get('rg_ie'),
            telefone=data.get('telefone'),
            celular=data.get('celular'),
            email=data.get('email'),
            endereco=data.get('endereco'),
            numero=data.get('numero'),
            complemento=data.get('complemento'),
            bairro=data.get('bairro'),
            cidade=data.get('cidade'),
            estado=data.get('estado'),
            cep=data.get('cep'),
            observacoes=data.get('observacoes')
        )
        
        # Processar data de nascimento
        if data.get('data_nascimento'):
            cliente.data_nascimento = datetime.strptime(data['data_nascimento'], '%Y-%m-%d').date()
        
        db.session.add(cliente)
        db.session.flush()  # Para obter o ID do cliente
        
        # Criar veículos se fornecidos
        veiculos_criados = []
        if data.get('veiculos'):
            for veiculo_data in data['veiculos']:
                # Validar dados obrigatórios do veículo
                if not veiculo_data.get('marca') or not veiculo_data.get('modelo') or not veiculo_data.get('placa'):
                    return jsonify({'success': False, 'message': 'Marca, modelo e placa são obrigatórios para o veículo'}), 400
                
                # Verificar se a placa já existe
                veiculo_existente = Veiculo.query.filter_by(placa=veiculo_data['placa']).first()
                if veiculo_existente:
                    return jsonify({'success': False, 'message': f'Placa {veiculo_data["placa"]} já cadastrada'}), 400
                
                # Tratar chassi vazio como NULL e verificar duplicatas
                chassi = veiculo_data.get('chassi')
                if chassi and chassi.strip():  # Se chassi não está vazio
                    chassi_existente = Veiculo.query.filter_by(chassi=chassi.strip()).first()
                    if chassi_existente:
                        return jsonify({'success': False, 'message': f'Chassi {chassi.strip()} já cadastrado'}), 400
                else:
                    chassi = None  # Converter string vazia para NULL
                
                veiculo = Veiculo(
                    cliente_id=cliente.id,
                    marca=veiculo_data['marca'],
                    modelo=veiculo_data['modelo'],
                    ano_fabricacao=veiculo_data.get('ano_fabricacao'),
                    ano_modelo=veiculo_data.get('ano_modelo'),
                    cor=veiculo_data.get('cor'),
                    placa=veiculo_data['placa'],
                    chassi=chassi,
                    renavam=veiculo_data.get('renavam'),
                    combustivel=veiculo_data.get('combustivel'),
                    motor=veiculo_data.get('motor'),
                    cambio=veiculo_data.get('cambio'),
                    quilometragem=veiculo_data.get('quilometragem', 0),
                    observacoes=veiculo_data.get('observacoes'),
                )
                
                # Processar datas de vencimento do veículo
                if veiculo_data.get('vencimento_ipva'):
                    veiculo.vencimento_ipva = datetime.strptime(veiculo_data['vencimento_ipva'], '%Y-%m-%d').date()
                if veiculo_data.get('vencimento_seguro'):
                    veiculo.vencimento_seguro = datetime.strptime(veiculo_data['vencimento_seguro'], '%Y-%m-%d').date()
                if veiculo_data.get('vencimento_licenciamento'):
                    veiculo.vencimento_licenciamento = datetime.strptime(veiculo_data['vencimento_licenciamento'], '%Y-%m-%d').date()
                
                db.session.add(veiculo)
                veiculos_criados.append(veiculo)
        
        db.session.commit()
        
        # Preparar resposta
        cliente_dict = cliente.to_dict()
        cliente_dict['veiculos'] = [veiculo.to_dict() for veiculo in veiculos_criados]
        
        return jsonify({
            'success': True,
            'message': f'Cliente cadastrado com sucesso{" junto com " + str(len(veiculos_criados)) + " veículo(s)" if veiculos_criados else ""}',
            'data': cliente_dict
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro ao criar cliente: {str(e)}'
        }), 500
