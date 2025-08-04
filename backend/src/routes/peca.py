from flask import Blueprint, request, jsonify
from src.models import db
from src.models.peca import Peca, Categoria, Fornecedor, MovimentacaoEstoque
from datetime import datetime

peca_bp = Blueprint(\'peca\', __name__)

# Rotas para Categorias
@peca_bp.route(\'/categorias\', methods=[\'GET\'])
def listar_categorias():
    try:
        categorias = Categoria.query.filter_by(ativo=True).all()
        return jsonify({
            \'success\': True,
            \'data\': [categoria.to_dict() for categoria in categorias]
        })
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@peca_bp.route(\'/categorias\', methods=[\'POST\'])
def criar_categoria():
    try:
        data = request.get_json()
        
        if not data.get(\'nome\'):
            return jsonify({\'success\': False, \'message\': \'Nome é obrigatório\'}), 400
        
        categoria = Categoria(
            nome=data[\'nome\'],
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

# Rotas para Fornecedores
@peca_bp.route(\'/fornecedores\', methods=[\'GET\'])
def listar_fornecedores():
    try:
        page = request.args.get(\'page\', 1, type=int)
        per_page = request.args.get(\'per_page\', 10, type=int)
        search = request.args.get(\'search\', \'\')
        
        query = Fornecedor.query.filter_by(ativo=True)
        
        if search:
            query = query.filter(
                Fornecedor.nome.contains(search) |
                Fornecedor.cnpj.contains(search)
            )
        
        fornecedores = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            \'success\': True,
            \'data\': [fornecedor.to_dict() for fornecedor in fornecedores.items],
            \'pagination\': {
                \'page\': page,
                \'per_page\': per_page,
                \'total\': fornecedores.total,
                \'pages\': fornecedores.pages
            }
        })
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@peca_bp.route(\'/fornecedores\', methods=[\'POST\'])
def criar_fornecedor():
    try:
        data = request.get_json()
        
        if not data.get(\'nome\'):
            return jsonify({\'success\': False, \'message\': \'Nome é obrigatório\'}), 400
        
        fornecedor = Fornecedor(
            nome=data[\'nome\'],
            cnpj=data.get(\'cnpj\'),
            telefone=data.get(\'telefone\'),
            email=data.get(\'email\'),
            endereco=data.get(\'endereco\'),
            contato=data.get(\'contato\'),
            observacoes=data.get(\'observacoes\')
        )
        
        db.session.add(fornecedor)
        db.session.commit()
        
        return jsonify({
            \'success\': True,
            \'message\': \'Fornecedor criado com sucesso\',
            \'data\': fornecedor.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

# Rotas para Peças
@peca_bp.route(\'/pecas\', methods=[\'GET\'])
def listar_pecas():
    try:
        page = request.args.get(\'page\', 1, type=int)
        per_page = request.args.get(\'per_page\', 10, type=int)
        search = request.args.get(\'search\', \'\')
        categoria_id = request.args.get(\'categoria_id\', type=int)
        status_estoque = request.args.get(\'status_estoque\')
        
        query = Peca.query.filter_by(ativo=True)
        
        if search:
            query = query.filter(
                Peca.codigo.contains(search) |
                Peca.nome.contains(search) |
                Peca.descricao.contains(search)
            )
        
        if categoria_id:
            query = query.filter_by(categoria_id=categoria_id)
        
        pecas = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        data = []
        for peca in pecas.items:
            peca_dict = peca.to_dict()
            if status_estoque and peca_dict[\'status_estoque\'] != status_estoque:
                continue
            data.append(peca_dict)
        
        return jsonify({
            \'success\': True,
            \'data\': data,
            \'pagination\': {
                \'page\': page,
                \'per_page\': per_page,
                \'total\': pecas.total,
                \'pages\': pecas.pages
            }
        })
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@peca_bp.route(\'/pecas\', methods=[\'POST\'])
def criar_peca():
    try:
        data = request.get_json()
        
        if not data.get(\'codigo\'):
            return jsonify({\'success\': False, \'message\': \'Código é obrigatório\'}), 400
        if not data.get(\'nome\'):
            return jsonify({\'success\': False, \'message\': \'Nome é obrigatório\'}), 400
        if Peca.query.filter_by(codigo=data[\'codigo\']).first():
            return jsonify({\'success\': False, \'message\': \'Código já cadastrado\'}), 400
        
        peca = Peca(
            codigo=data[\'codigo\'],
            nome=data[\'nome\'],
            descricao=data.get(\'descricao\'),
            categoria_id=data.get(\'categoria_id\'),
            fornecedor_id=data.get(\'fornecedor_id\'),
            quantidade_atual=data.get(\'quantidade_atual\', 0),
            quantidade_minima=data.get(\'quantidade_minima\', 0),
            quantidade_maxima=data.get(\'quantidade_maxima\', 0),
            localizacao=data.get(\'localizacao\'),
            preco_custo=data.get(\'preco_custo\', 0),
            preco_venda=data.get(\'preco_venda\', 0),
            margem_lucro=data.get(\'margem_lucro\', 0),
            unidade_medida=data.get(\'unidade_medida\', \'UN\'),
            codigo_fabricante=data.get(\'codigo_fabricante\'),
            codigo_original=data.get(\'codigo_original\'),
            aplicacao=data.get(\'aplicacao\')
        )
        
        db.session.add(peca)
        db.session.commit()
        
        return jsonify({
            \'success\': True,
            \'message\': \'Peça criada com sucesso\',
            \'data\': peca.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@peca_bp.route(\'/pecas/<int:peca_id>/movimentacao\', methods=[\'POST\'])
def movimentar_estoque(peca_id):
    try:
        peca = Peca.query.get_or_404(peca_id)
        data = request.get_json()
        
        if not data.get(\'tipo\') or data[\'tipo\'] not in [\'entrada\', \'saida\', \'ajuste\']:
            return jsonify({\'success\': False, \'message\': \'Tipo de movimentação inválido\'}), 400
        if not data.get(\'quantidade\'):
            return jsonify({\'success\': False, \'message\': \'Quantidade é obrigatória\'}), 400
        
        quantidade_anterior = peca.quantidade_atual
        quantidade = int(data[\'quantidade\'])
        
        if data[\'tipo\'] == \'entrada\':
            nova_quantidade = quantidade_anterior + quantidade
        elif data[\'tipo\'] == \'saida\':
            if quantidade > quantidade_anterior:
                return jsonify({\'success\': False, \'message\': \'Quantidade insuficiente em estoque\'}), 400
            nova_quantidade = quantidade_anterior - quantidade
        else:  # ajuste
            nova_quantidade = quantidade
        
        # Criar movimentação
        movimentacao = MovimentacaoEstoque(
            peca_id=peca_id,
            tipo=data[\'tipo\'],
            quantidade=quantidade,
            quantidade_anterior=quantidade_anterior,
            quantidade_atual=nova_quantidade,
            motivo=data.get(\'motivo\'),
            observacoes=data.get(\'observacoes\'),
            usuario_id=data.get(\'usuario_id\')
        )
        
        # Atualizar estoque da peça
        peca.quantidade_atual = nova_quantidade
        peca.data_atualizacao = datetime.utcnow()
        
        db.session.add(movimentacao)
        db.session.commit()
        
        return jsonify({
            \'success\': True,
            \'message\': \'Movimentação realizada com sucesso\',
            \'data\': {
                \'peca\': peca.to_dict(),
                \'movimentacao\': movimentacao.to_dict()
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@peca_bp.route(\'/pecas/<int:peca_id>/movimentacoes\', methods=[\'GET\'])
def listar_movimentacoes_peca(peca_id):
    try:
        movimentacoes = MovimentacaoEstoque.query.filter_by(peca_id=peca_id).order_by(MovimentacaoEstoque.data_movimentacao.desc()).all()
        
        return jsonify({
            \'success\': True,
            \'data\': [mov.to_dict() for mov in movimentacoes]
        })
        
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500

@peca_bp.route(\'/estoque/alertas\', methods=[\'GET\'])
def alertas_estoque():
    try:
        pecas_baixo_estoque = Peca.query.filter(
            Peca.quantidade_atual <= Peca.quantidade_minima,
            Peca.ativo == True
        ).all()
        
        return jsonify({
            \'success\': True,
            \'data\': [peca.to_dict() for peca in pecas_baixo_estoque]
        })
        
    except Exception as e:
        return jsonify({\'success\': False, \'message\': str(e)}), 500


