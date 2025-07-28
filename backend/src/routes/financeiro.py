from flask import Blueprint, request, jsonify
from src.models import db
from src.models.financeiro import ContaReceber, ContaPagar, PagamentoRecebimento, FluxoCaixa
from datetime import datetime

financeiro_bp = Blueprint('financeiro', __name__)

@financeiro_bp.route('/financeiro/contas', methods=['GET'])
def listar_contas():
    """Lista todas as contas a pagar e receber"""
    try:
        search = request.args.get('search', '')
        
        # Buscar contas a receber
        contas_receber = ContaReceber.query
        if search:
            contas_receber = contas_receber.filter(
                ContaReceber.descricao.ilike(f'%{search}%')
            )
        contas_receber = contas_receber.all()
        
        # Buscar contas a pagar
        contas_pagar = ContaPagar.query
        if search:
            contas_pagar = contas_pagar.filter(
                ContaPagar.descricao.ilike(f'%{search}%')
            )
        contas_pagar = contas_pagar.all()
        
        # Combinar e formatar as contas
        contas = []
        
        # Adicionar contas a receber
        for conta in contas_receber:
            contas.append({
                'id': f'r_{conta.id}',
                'descricao': conta.descricao or 'Conta a Receber',
                'tipo': 'receber',
                'valor': float(conta.valor_original or 0),
                'data_vencimento': conta.data_vencimento.isoformat() if conta.data_vencimento else None,
                'data_pagamento': conta.data_pagamento.isoformat() if conta.data_pagamento else None,
                'status': conta.status or 'pendente',
                'categoria': 'Receita',
                'cliente_id': conta.cliente_id,
                'created_at': conta.data_emissao.isoformat() if conta.data_emissao else None
            })
        
        # Adicionar contas a pagar
        for conta in contas_pagar:
            contas.append({
                'id': f'p_{conta.id}',
                'descricao': conta.descricao or 'Conta a Pagar',
                'tipo': 'pagar',
                'valor': float(conta.valor_original or 0),
                'data_vencimento': conta.data_vencimento.isoformat() if conta.data_vencimento else None,
                'data_pagamento': conta.data_pagamento.isoformat() if conta.data_pagamento else None,
                'status': conta.status or 'pendente',
                'categoria': 'Despesa',
                'fornecedor': conta.fornecedor or '',
                'created_at': conta.data_emissao.isoformat() if conta.data_emissao else None
            })
        
        # Ordenar por data de vencimento
        contas.sort(key=lambda x: x['data_vencimento'] or '9999-12-31')
        
        return jsonify({
            'success': True,
            'data': contas
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@financeiro_bp.route('/financeiro/contas', methods=['POST'])
def criar_conta():
    """Cria uma nova conta a pagar ou receber"""
    try:
        data = request.get_json()
        
        # Validações básicas
        if not data.get('descricao'):
            return jsonify({'success': False, 'message': 'Descrição é obrigatória'}), 400
            
        if not data.get('valor'):
            return jsonify({'success': False, 'message': 'Valor é obrigatório'}), 400
            
        if not data.get('data_vencimento'):
            return jsonify({'success': False, 'message': 'Data de vencimento é obrigatória'}), 400
        
        tipo = data.get('tipo', 'pagar')
        
        if tipo == 'receber':
            # Criar conta a receber
            conta = ContaReceber(
                descricao=data.get('descricao'),
                valor_original=float(data.get('valor')),
                data_vencimento=datetime.fromisoformat(data.get('data_vencimento')),
                data_emissao=datetime.now(),
                status=data.get('status', 'pendente'),
                cliente_id=data.get('cliente_id') if data.get('cliente_id') else None
            )
            
            if data.get('data_pagamento'):
                conta.data_pagamento = datetime.fromisoformat(data.get('data_pagamento'))
                
        else:
            # Criar conta a pagar
            conta = ContaPagar(
                descricao=data.get('descricao'),
                valor_original=float(data.get('valor')),
                data_vencimento=datetime.fromisoformat(data.get('data_vencimento')),
                data_emissao=datetime.now(),
                status=data.get('status', 'pendente'),
                fornecedor=data.get('fornecedor', '')
            )
            
            if data.get('data_pagamento'):
                conta.data_pagamento = datetime.fromisoformat(data.get('data_pagamento'))
        
        db.session.add(conta)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Conta criada com sucesso!',
            'data': {
                'id': conta.id,
                'tipo': tipo
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@financeiro_bp.route('/financeiro/contas/<conta_id>', methods=['PUT'])
def atualizar_conta(conta_id):
    """Atualiza uma conta existente"""
    try:
        data = request.get_json()
        
        # Determinar se é conta a receber ou pagar pelo prefixo do ID
        if conta_id.startswith('r_'):
            real_id = int(conta_id[2:])
            conta = ContaReceber.query.get_or_404(real_id)
        elif conta_id.startswith('p_'):
            real_id = int(conta_id[2:])
            conta = ContaPagar.query.get_or_404(real_id)
        else:
            return jsonify({'success': False, 'message': 'ID de conta inválido'}), 400
        
        # Atualizar campos
        if 'descricao' in data:
            conta.descricao = data['descricao']
        if 'valor' in data:
            conta.valor_original = float(data['valor'])
        if 'data_vencimento' in data:
            conta.data_vencimento = datetime.fromisoformat(data['data_vencimento'])
        if 'status' in data:
            conta.status = data['status']
        if 'data_pagamento' in data and data['data_pagamento']:
            conta.data_pagamento = datetime.fromisoformat(data['data_pagamento'])
        
        # Campos específicos
        if hasattr(conta, 'fornecedor') and 'fornecedor' in data:
            conta.fornecedor = data['fornecedor']
        if hasattr(conta, 'cliente_id') and 'cliente_id' in data:
            conta.cliente_id = data['cliente_id'] if data['cliente_id'] else None
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Conta atualizada com sucesso!'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@financeiro_bp.route('/financeiro/resumo', methods=['GET'])
def resumo_financeiro():
    """Retorna resumo financeiro"""
    try:
        # Contas a receber pendentes
        receber_pendente = db.session.query(db.func.sum(ContaReceber.valor_original)).filter(
            ContaReceber.status.in_(['pendente', 'vencida'])
        ).scalar() or 0
        
        # Contas a pagar pendentes
        pagar_pendente = db.session.query(db.func.sum(ContaPagar.valor_original)).filter(
            ContaPagar.status.in_(['pendente', 'vencida'])
        ).scalar() or 0
        
        # Receitas do mês
        inicio_mes = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        receitas_mes = db.session.query(db.func.sum(ContaReceber.valor_original)).filter(
            ContaReceber.data_pagamento >= inicio_mes,
            ContaReceber.status == 'paga'
        ).scalar() or 0
        
        # Despesas do mês
        despesas_mes = db.session.query(db.func.sum(ContaPagar.valor_original)).filter(
            ContaPagar.data_pagamento >= inicio_mes,
            ContaPagar.status == 'paga'
        ).scalar() or 0
        
        return jsonify({
            'success': True,
            'data': {
                'contas_receber_pendente': float(receber_pendente),
                'contas_pagar_pendente': float(pagar_pendente),
                'receitas_mes': float(receitas_mes),
                'despesas_mes': float(despesas_mes),
                'saldo_mes': float(receitas_mes - despesas_mes)
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
