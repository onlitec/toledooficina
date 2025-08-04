from flask import Blueprint, request, jsonify
from src.models import db
<<<<<<< HEAD
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
=======
from src.models.financeiro import ContaReceber, ContaPagar, PagamentoRecebimento, FluxoCaixa, CategoriaFinanceira
from datetime import datetime, date

financeiro_bp = Blueprint(\'financeiro\', __name__)

# Rotas para Categorias Financeiras
@financeiro_bp.route(\'/categorias-financeiras\', methods=[\'GET\'])
def listar_categorias_financeiras():
    try:
        tipo = request.args.get(\'tipo\')  # receita ou despesa
        query = CategoriaFinanceira.query.filter_by(ativo=True)
        
        if tipo:
            query = query.filter_by(tipo=tipo)
        
        categorias = query.all()
        return jsonify({
            \'success\': True,
            \'data\': [categoria.to_dict() for categoria in categorias]
        })
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@financeiro_bp.route(\'/categorias-financeiras\', methods=[\'POST\'])
def criar_categoria_financeira():
    try:
        data = request.get_json()
        
        if not data.get(\'nome\'):
            return jsonify({\'success\': False, \'message\': \'Nome é obrigatório\'}), 400
        if not data.get(\'tipo\') or data[\'tipo\'] not in [\'receita\', \'despesa\']:
            return jsonify({\'success\': False, \'message\': \'Tipo deve ser receita ou despesa\'}), 400
        
        categoria = CategoriaFinanceira(
            nome=data[\'nome\'],
            tipo=data[\'tipo\'],
            descricao=data.get(\'descricao\')
        )
        
        db.session.add(categoria)
        db.session.commit()
        
        return jsonify({
            \'success\': True,
            \'message\': \'Categoria criada com sucesso\',
            \'data\': categoria.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

# Rotas para Contas a Receber
@financeiro_bp.route(\'/contas-receber\', methods=[\'GET\'])
def listar_contas_receber():
    try:
        page = request.args.get(\'page\', 1, type=int)
        per_page = request.args.get(\'per_page\', 10, type=int)
        status = request.args.get(\'status\')
        vencidas = request.args.get(\'vencidas\', type=bool)
        
        query = ContaReceber.query
        
        if status:
            query = query.filter_by(status=status)
        
        if vencidas:
            query = query.filter(ContaReceber.data_vencimento < date.today())
        
        contas = query.order_by(ContaReceber.data_vencimento.asc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            \'success\': True,
            \'data\': [conta.to_dict() for conta in contas.items],
            \'pagination\': {
                \'page\': page,
                \'per_page\': per_page,
                \'total\': contas.total,
                \'pages\': contas.pages
            }
        })
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@financeiro_bp.route(\'/contas-receber\', methods=[\'POST\'])
def criar_conta_receber():
    try:
        data = request.get_json()
        
        if not data.get(\'cliente_id\'):
            return jsonify({\'success\': False, \'message\': \'Cliente é obrigatório\'}), 400
        if not data.get(\'categoria_financeira_id\'):
            return jsonify({\'success\': False, \'message\': \'Categoria financeira é obrigatória\'}), 400
        if not data.get(\'descricao\'):
            return jsonify({\'success\': False, \'message\': \'Descrição é obrigatória\'}), 400
        if not data.get(\'valor_original\'):
            return jsonify({\'success\': False, \'message\': \'Valor é obrigatório\'}), 400
        if not data.get(\'data_vencimento\'):
            return jsonify({\'success\': False, \'message\': \'Data de vencimento é obrigatória\'}), 400
        
        conta = ContaReceber(
            cliente_id=data[\'cliente_id\'],
            categoria_financeira_id=data[\'categoria_financeira_id\'],
            ordem_servico_id=data.get(\'ordem_servico_id\'),
            descricao=data[\'descricao\'],
            valor_original=data[\'valor_original\'],
            data_emissao=datetime.strptime(data.get(\'data_emissao\', datetime.now().strftime(\'%Y-%m-%d\')), \'%Y-%m-%d\').date(),
            data_vencimento=datetime.strptime(data[\'data_vencimento\'], \'%Y-%m-%d\').date(),
            observacoes=data.get(\'observacoes\')
        )
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
        
        db.session.add(conta)
        db.session.commit()
        
        return jsonify({
<<<<<<< HEAD
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
=======
            \'success\': True,
            \'message\': \'Conta a receber criada com sucesso\',
            \'data\': conta.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@financeiro_bp.route(\'/contas-receber/<int:conta_id>/pagamento\', methods=[\'POST\'])
def receber_pagamento(conta_id):
    try:
        conta = ContaReceber.query.get_or_404(conta_id)
        data = request.get_json()
        
        if not data.get(\'valor\'):
            return jsonify({\'success\': False, \'message\': \'Valor é obrigatório\'}), 400
        if not data.get(\'forma_pagamento\'):
            return jsonify({\'success\': False, \'message\': \'Forma de pagamento é obrigatória\'}), 400
        
        valor_pagamento = float(data[\'valor\'])
        
        if valor_pagamento > conta.valor_saldo:
            return jsonify({\'success\': False, \'message\': \'Valor do pagamento superior ao saldo da conta\'}), 400
        
        pagamento = PagamentoRecebimento(
            conta_receber_id=conta_id,
            valor=valor_pagamento,
            data_pagamento=datetime.strptime(data.get(\'data_pagamento\', datetime.now().strftime(\'%Y-%m-%d\')), \'%Y-%m-%d\').date(),
            forma_pagamento=data[\'forma_pagamento\'],
            numero_documento=data.get(\'numero_documento\'),
            observacoes=data.get(\'observacoes\')
        )
        
        conta.valor_pago += valor_pagamento
        
        if conta.valor_saldo <= 0:
            conta.status = \'paga\'
            conta.data_pagamento = pagamento.data_pagamento
        
        # Registrar no fluxo de caixa
        fluxo = FluxoCaixa(
            data=pagamento.data_pagamento,
            tipo=\'entrada\',
            categoria_financeira_id=conta.categoria_financeira_id,
            descricao=f\'Recebimento - {conta.descricao}\',
            valor=valor_pagamento,
            forma_pagamento=data[\'forma_pagamento\'],
            conta_receber_id=conta_id,
            ordem_servico_id=conta.ordem_servico_id
        )
        
        db.session.add(pagamento)
        db.session.add(fluxo)
        db.session.commit()
        
        return jsonify({
            \'success\': True,
            \'message\': \'Pagamento registrado com sucesso\',
            \'data\': {
                \'pagamento\': pagamento.to_dict(),
                \'conta\': conta.to_dict()
            }
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
        })
        
    except Exception as e:
        db.session.rollback()
<<<<<<< HEAD
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
=======
        return jsonify({\'success\': False, \'message\': str(e)}), 500

# Rotas para Contas a Pagar
@financeiro_bp.route(\'/contas-pagar\', methods=[\'GET\'])
def listar_contas_pagar():
    try:
        page = request.args.get(\'page\', 1, type=int)
        per_page = request.args.get(\'per_page\', 10, type=int)
        status = request.args.get(\'status\')
        vencidas = request.args.get(\'vencidas\', type=bool)
        
        query = ContaPagar.query
        
        if status:
            query = query.filter_by(status=status)
        
        if vencidas:
            query = query.filter(ContaPagar.data_vencimento < date.today())
        
        contas = query.order_by(ContaPagar.data_vencimento.asc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            \'success\': True,
            \'data\': [conta.to_dict() for conta in contas.items],
            \'pagination\': {
                \'page\': page,
                \'per_page\': per_page,
                \'total\': contas.total,
                \'pages\': contas.pages
            }
        })
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@financeiro_bp.route(\'/contas-pagar\', methods=[\'POST\'])
def criar_conta_pagar():
    try:
        data = request.get_json()
        
        if not data.get(\'categoria_financeira_id\'):
            return jsonify({\'success\': False, \'message\': \'Categoria financeira é obrigatória\'}), 400
        if not data.get(\'descricao\'):
            return jsonify({\'success\': False, \'message\': \'Descrição é obrigatória\'}), 400
        if not data.get(\'valor_original\'):
            return jsonify({\'success\': False, \'message\': \'Valor é obrigatório\'}), 400
        if not data.get(\'data_vencimento\'):
            return jsonify({\'success\': False, \'message\': \'Data de vencimento é obrigatória\'}), 400
        
        conta = ContaPagar(
            fornecedor_id=data.get(\'fornecedor_id\'),
            categoria_financeira_id=data[\'categoria_financeira_id\'],
            descricao=data[\'descricao\'],
            valor_original=data[\'valor_original\'],
            data_emissao=datetime.strptime(data.get(\'data_emissao\', datetime.now().strftime(\'%Y-%m-%d\')), \'%Y-%m-%d\').date(),
            data_vencimento=datetime.strptime(data[\'data_vencimento\'], \'%Y-%m-%d\').date(),
            observacoes=data.get(\'observacoes\')
        )
        
        db.session.add(conta)
        db.session.commit()
        
        return jsonify({
            \'success\': True,
            \'message\': \'Conta a pagar criada com sucesso\',
            \'data\': conta.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@financeiro_bp.route(\'/fluxo-caixa\', methods=[\'GET\'])
def listar_fluxo_caixa():
    try:
        data_inicio = request.args.get(\'data_inicio\')
        data_fim = request.args.get(\'data_fim\')
        tipo = request.args.get(\'tipo\')
        
        query = FluxoCaixa.query
        
        if data_inicio:
            query = query.filter(FluxoCaixa.data >= datetime.strptime(data_inicio, \'%Y-%m-%d\').date())
        
        if data_fim:
            query = query.filter(FluxoCaixa.data <= datetime.strptime(data_fim, \'%Y-%m-%d\').date())
        
        if tipo:
            query = query.filter_by(tipo=tipo)
        
        movimentacoes = query.order_by(FluxoCaixa.data.desc()).all()
        
        return jsonify({
            \'success\': True,
            \'data\': [mov.to_dict() for mov in movimentacoes]
        })
        
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@financeiro_bp.route(\'/dashboard-financeiro\', methods=[\'GET\'])
def dashboard_financeiro():
    try:
        hoje = date.today()
        
        # Contas a receber em aberto
        contas_receber_abertas = db.session.query(db.func.sum(ContaReceber.valor_original - ContaReceber.valor_pago)).filter(
            ContaReceber.status == \'aberta\'
        ).scalar() or 0
        
        # Contas a pagar em aberto
        contas_pagar_abertas = db.session.query(db.func.sum(ContaPagar.valor_original - ContaPagar.valor_pago)).filter(
            ContaPagar.status == \'aberta\'
        ).scalar() or 0
        
        # Contas vencidas
        contas_receber_vencidas = ContaReceber.query.filter(
            ContaReceber.data_vencimento < hoje,
            ContaReceber.status == \'aberta\'
        ).count()
        
        contas_pagar_vencidas = ContaPagar.query.filter(
            ContaPagar.data_vencimento < hoje,
            ContaPagar.status == \'aberta\'
        ).count()
        
        return jsonify({
            \'success\': True,
            \'data\': {
                \'contas_receber_abertas\': float(contas_receber_abertas),
                \'contas_pagar_abertas\': float(contas_pagar_abertas),
                \'contas_receber_vencidas\': contas_receber_vencidas,
                \'contas_pagar_vencidas\': contas_pagar_vencidas,
                \'saldo_liquido\': float(contas_receber_abertas - contas_pagar_abertas)
            }
        })
        
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
