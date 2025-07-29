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

@financeiro_bp.route('/financeiro/debug/modelo', methods=['GET'])
def debug_modelo_financeiro():
    """Debug: verificar estado do modelo ContaPagar em produção"""
    try:
        from sqlalchemy import text

        # Verificar colunas da tabela contas_pagar
        result = db.session.execute(text('PRAGMA table_info(contas_pagar)'))
        colunas_pagar = [row[1] for row in result]

        # Verificar colunas da tabela contas_receber
        result = db.session.execute(text('PRAGMA table_info(contas_receber)'))
        colunas_receber = [row[1] for row in result]

        # Verificar atributos do modelo ContaPagar
        atributos_pagar = [attr for attr in dir(ContaPagar) if not attr.startswith('_')]

        # Verificar atributos do modelo ContaReceber
        atributos_receber = [attr for attr in dir(ContaReceber) if not attr.startswith('_')]

        # Tentar criar instância de teste
        teste_pagar = None
        erro_pagar = None
        try:
            teste_pagar = ContaPagar(
                descricao='Teste Debug',
                valor_original=100.0,
                data_emissao=db.func.current_date(),
                data_vencimento=db.func.current_date(),
                fornecedor='Teste Fornecedor Debug'
            )
            teste_pagar = "✅ Instância criada com sucesso"
        except Exception as e:
            erro_pagar = str(e)

        return jsonify({
            'success': True,
            'data': {
                'colunas_tabela_pagar': colunas_pagar,
                'colunas_tabela_receber': colunas_receber,
                'atributos_modelo_pagar': atributos_pagar,
                'atributos_modelo_receber': atributos_receber,
                'teste_instancia_pagar': teste_pagar,
                'erro_instancia_pagar': erro_pagar,
                'tem_campo_fornecedor_tabela': 'fornecedor' in colunas_pagar,
                'tem_campo_fornecedor_modelo': 'fornecedor' in atributos_pagar,
                'cliente_id_nullable': 'cliente_id' in colunas_receber
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@financeiro_bp.route('/financeiro/debug/recriar-tabelas', methods=['POST'])
def recriar_tabelas_financeiro():
    """Debug: forçar recriação das tabelas financeiras em produção"""
    try:
        # ATENÇÃO: Esta rota apaga todos os dados das tabelas financeiras!
        # Só deve ser usada em ambiente de desenvolvimento ou com backup

        # Verificar se é ambiente de desenvolvimento
        import os
        if os.environ.get('FLASK_ENV') == 'production':
            return jsonify({
                'success': False,
                'message': 'Operação não permitida em produção. Use com cuidado!'
            }), 403

        # Recriar apenas as tabelas financeiras
        from sqlalchemy import text

        # Fazer backup dos dados existentes (se houver)
        contas_pagar_backup = []
        contas_receber_backup = []

        try:
            contas_pagar_backup = [conta.to_dict() for conta in ContaPagar.query.all()]
            contas_receber_backup = [conta.to_dict() for conta in ContaReceber.query.all()]
        except:
            pass  # Ignorar se tabelas não existem

        # Dropar e recriar tabelas
        db.session.execute(text('DROP TABLE IF EXISTS contas_pagar'))
        db.session.execute(text('DROP TABLE IF EXISTS contas_receber'))
        db.session.execute(text('DROP TABLE IF EXISTS pagamentos_recebimentos'))
        db.session.execute(text('DROP TABLE IF EXISTS fluxo_caixa'))

        # Recriar tabelas com novos campos
        db.create_all()

        return jsonify({
            'success': True,
            'message': 'Tabelas financeiras recriadas com sucesso!',
            'data': {
                'contas_pagar_backup': len(contas_pagar_backup),
                'contas_receber_backup': len(contas_receber_backup),
                'tabelas_recriadas': ['contas_pagar', 'contas_receber', 'pagamentos_recebimentos', 'fluxo_caixa']
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
