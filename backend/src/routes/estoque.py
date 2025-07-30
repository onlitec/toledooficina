from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models import db
from src.models.peca import Peca, Categoria, Fornecedor, MovimentacaoEstoque

estoque_bp = Blueprint('estoque', __name__)

# ===== ROTAS DE PEÇAS =====

@estoque_bp.route('/pecas', methods=['GET'])
def listar_pecas():
    """Lista todas as peças"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search', '')
        categoria_id = request.args.get('categoria_id', type=int)
        status_estoque = request.args.get('status_estoque', '')
        
        query = Peca.query.filter_by(ativo=True)
        
        if search:
            query = query.filter(
                (Peca.codigo.contains(search)) |
                (Peca.nome.contains(search)) |
                (Peca.codigo_fabricante.contains(search))
            )
        
        if categoria_id:
            query = query.filter_by(categoria_id=categoria_id)
        
        pecas = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Filtrar por status de estoque após a paginação se necessário
        items = []
        for peca in pecas.items:
            peca_dict = peca.to_dict()
            if not status_estoque or peca_dict['status_estoque'] == status_estoque:
                items.append(peca_dict)
        
        return jsonify({
            'success': True,
            'data': items,
            'pagination': {
                'page': page,
                'pages': pecas.pages,
                'per_page': per_page,
                'total': pecas.total
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@estoque_bp.route('/pecas', methods=['POST'])
def criar_peca():
    """Cria uma nova peça"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data.get('nome'):
            return jsonify({'success': False, 'message': 'Campo nome é obrigatório'}), 400

        print(f"DEBUG: Dados recebidos: {data}")
        print(f"DEBUG: Código recebido: '{data.get('codigo')}'")
        print(f"DEBUG: Código é None: {data.get('codigo') is None}")
        print(f"DEBUG: Código é vazio: {data.get('codigo') == ''}")
        
        # Verificar se o código já existe (apenas se foi fornecido)
        if data.get('codigo') and data['codigo'].strip():
            peca_existente = Peca.query.filter_by(codigo=data['codigo']).first()
            if peca_existente:
                return jsonify({'success': False, 'message': 'Código já cadastrado'}), 400
        


        # Gerar código automaticamente se não fornecido
        codigo = data.get('codigo')
        if not codigo or codigo.strip() == '':
            # Buscar o último código CP-XXXX
            ultima_peca = Peca.query.filter(Peca.codigo.like('CP-%')).order_by(Peca.codigo.desc()).first()
            if ultima_peca:
                try:
                    ultimo_numero = int(ultima_peca.codigo.split('-')[1])
                    proximo_numero = ultimo_numero + 1
                except (ValueError, IndexError):
                    proximo_numero = 1
            else:
                proximo_numero = 1
            codigo = f'CP-{proximo_numero:04d}'

        # Criar nova peça
        peca = Peca(
            codigo=codigo,
            nome=data['nome'],
            descricao=data.get('descricao'),
            categoria_id=data.get('categoria_id') if data.get('categoria_id') else None,
            fornecedor_id=data.get('fornecedor_id'),
            quantidade_atual=data.get('quantidade_atual', 0),
            quantidade_minima=data.get('quantidade_minima', 0),
            quantidade_maxima=data.get('quantidade_maxima', 0),
            localizacao=data.get('localizacao'),
            preco_custo=data.get('preco_custo', 0),
            preco_venda=data.get('preco_venda', 0),
            margem_lucro=data.get('margem_lucro', 0),
            unidade_medida=data.get('unidade_medida', 'UN'),
            codigo_fabricante=data.get('codigo_fabricante'),
            codigo_original=data.get('codigo_original'),
            aplicacao=data.get('aplicacao')
        )
        
        db.session.add(peca)
        db.session.commit()

        # Recarregar a peça do banco para ter certeza dos valores
        db.session.refresh(peca)
        
        # Registrar movimentação inicial se quantidade > 0
        if peca.quantidade_atual > 0:
            movimentacao = MovimentacaoEstoque(
                peca_id=peca.id,
                tipo='entrada',
                quantidade=peca.quantidade_atual,
                quantidade_anterior=0,
                quantidade_atual=peca.quantidade_atual,
                motivo='Estoque inicial',
                usuario_id=1  # TODO: pegar do usuário logado
            )
            db.session.add(movimentacao)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Peça cadastrada com sucesso',
            'data': peca.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== ROTAS DE CATEGORIAS =====

@estoque_bp.route('/categorias', methods=['GET'])
def listar_categorias():
    """Lista todas as categorias"""
    try:
        categorias = Categoria.query.filter_by(ativo=True).all()
        return jsonify({
            'success': True,
            'data': [categoria.to_dict() for categoria in categorias]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@estoque_bp.route('/categorias', methods=['POST'])
def criar_categoria():
    """Cria uma nova categoria"""
    try:
        data = request.get_json()
        
        if not data.get('nome'):
            return jsonify({'success': False, 'message': 'Nome é obrigatório'}), 400
        
        # Verificar se já existe
        categoria_existente = Categoria.query.filter_by(nome=data['nome']).first()
        if categoria_existente:
            return jsonify({'success': False, 'message': 'Categoria já existe'}), 400
        
        categoria = Categoria(
            nome=data['nome'],
            descricao=data.get('descricao')
        )
        
        db.session.add(categoria)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Categoria criada com sucesso',
            'data': categoria.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@estoque_bp.route('/categorias/<int:categoria_id>', methods=['PUT'])
def atualizar_categoria(categoria_id):
    """Atualiza uma categoria"""
    try:
        categoria = Categoria.query.get_or_404(categoria_id)
        data = request.get_json()

        if not data.get('nome'):
            return jsonify({'success': False, 'message': 'Nome é obrigatório'}), 400

        # Verificar se já existe outra categoria com o mesmo nome
        categoria_existente = Categoria.query.filter(
            Categoria.nome == data['nome'],
            Categoria.id != categoria_id
        ).first()
        if categoria_existente:
            return jsonify({'success': False, 'message': 'Categoria já existe'}), 400

        categoria.nome = data['nome']
        categoria.descricao = data.get('descricao')

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Categoria atualizada com sucesso',
            'data': categoria.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@estoque_bp.route('/categorias/<int:categoria_id>', methods=['DELETE'])
def excluir_categoria(categoria_id):
    """Exclui uma categoria"""
    try:
        categoria = Categoria.query.get_or_404(categoria_id)

        # Verificar se há peças usando esta categoria
        pecas_usando = Peca.query.filter_by(categoria_id=categoria_id).count()
        if pecas_usando > 0:
            return jsonify({
                'success': False,
                'message': f'Não é possível excluir. Existem {pecas_usando} peças usando esta categoria.'
            }), 400

        db.session.delete(categoria)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Categoria excluída com sucesso'
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== ROTAS DE FORNECEDORES =====

@estoque_bp.route('/fornecedores', methods=['GET'])
def listar_fornecedores():
    """Lista todos os fornecedores"""
    try:
        fornecedores = Fornecedor.query.filter_by(ativo=True).all()
        return jsonify({
            'success': True,
            'data': [fornecedor.to_dict() for fornecedor in fornecedores]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@estoque_bp.route('/fornecedores', methods=['POST'])
def criar_fornecedor():
    """Cria um novo fornecedor"""
    try:
        data = request.get_json()
        
        if not data.get('nome'):
            return jsonify({'success': False, 'message': 'Nome é obrigatório'}), 400
        
        fornecedor = Fornecedor(
            nome=data['nome'],
            cnpj=data.get('cnpj'),
            telefone=data.get('telefone'),
            email=data.get('email'),
            endereco=data.get('endereco'),
            contato=data.get('contato'),
            observacoes=data.get('observacoes')
        )
        
        db.session.add(fornecedor)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fornecedor criado com sucesso',
            'data': fornecedor.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== ROTAS DE RELATÓRIOS =====

@estoque_bp.route('/relatorios/resumo', methods=['GET'])
def relatorio_resumo():
    """Resumo geral do estoque"""
    try:
        total_pecas = Peca.query.filter_by(ativo=True).count()
        estoque_baixo = Peca.query.filter(
            Peca.ativo == True,
            Peca.quantidade_atual <= Peca.quantidade_minima
        ).count()
        
        valor_total = db.session.query(
            db.func.sum(Peca.quantidade_atual * Peca.preco_custo)
        ).filter_by(ativo=True).scalar() or 0
        
        return jsonify({
            'success': True,
            'data': {
                'total_pecas': total_pecas,
                'estoque_baixo': estoque_baixo,
                'valor_total_estoque': float(valor_total),
                'total_categorias': Categoria.query.filter_by(ativo=True).count(),
                'total_fornecedores': Fornecedor.query.filter_by(ativo=True).count()
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
