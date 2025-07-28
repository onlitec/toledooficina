from flask import Blueprint, request, jsonify
from datetime import datetime, date
from src.models import db
from src.models.ferramenta import Ferramenta, EmprestimoFerramenta, ManutencaoFerramenta

ferramenta_bp = Blueprint('ferramenta', __name__)

@ferramenta_bp.route('/api/ferramentas', methods=['GET'])
def get_ferramentas():
    try:
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        
        query = Ferramenta.query.filter(Ferramenta.ativo == True)
        
        if search:
            query = query.filter(
                db.or_(
                    Ferramenta.nome.ilike(f'%{search}%'),
                    Ferramenta.codigo.ilike(f'%{search}%'),
                    Ferramenta.marca.ilike(f'%{search}%')
                )
            )
        
        if status:
            query = query.filter(Ferramenta.status == status)
        
        ferramentas = query.order_by(Ferramenta.nome).all()
        
        return jsonify([ferramenta.to_dict() for ferramenta in ferramentas])
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ferramenta_bp.route('/api/ferramentas', methods=['POST'])
def create_ferramenta():
    try:
        data = request.get_json()
        
        # Verificar se o código já existe
        if data.get('codigo'):
            existing = Ferramenta.query.filter_by(codigo=data['codigo']).first()
            if existing:
                return jsonify({'error': 'Código já existe'}), 400
        
        ferramenta = Ferramenta(
            codigo=data.get('codigo'),
            nome=data['nome'],
            descricao=data.get('descricao'),
            marca=data.get('marca'),
            modelo=data.get('modelo'),
            numero_serie=data.get('numero_serie'),
            localizacao=data.get('localizacao'),
            status=data.get('status', 'disponivel'),
            valor_aquisicao=data.get('valor_aquisicao'),
            data_aquisicao=datetime.strptime(data['data_aquisicao'], '%Y-%m-%d').date() if data.get('data_aquisicao') else None,
            fornecedor=data.get('fornecedor'),
            intervalo_manutencao_dias=data.get('intervalo_manutencao_dias'),
            observacoes=data.get('observacoes')
        )
        
        db.session.add(ferramenta)
        db.session.commit()
        
        return jsonify(ferramenta.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ferramenta_bp.route('/api/ferramentas/<int:ferramenta_id>', methods=['GET'])
def get_ferramenta(ferramenta_id):
    try:
        ferramenta = Ferramenta.query.get_or_404(ferramenta_id)
        return jsonify(ferramenta.to_dict())
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ferramenta_bp.route('/api/ferramentas/<int:ferramenta_id>', methods=['PUT'])
def update_ferramenta(ferramenta_id):
    try:
        ferramenta = Ferramenta.query.get_or_404(ferramenta_id)
        data = request.get_json()
        
        # Verificar se o código já existe (exceto para a própria ferramenta)
        if data.get('codigo') and data['codigo'] != ferramenta.codigo:
            existing = Ferramenta.query.filter_by(codigo=data['codigo']).first()
            if existing:
                return jsonify({'error': 'Código já existe'}), 400
        
        # Atualizar campos
        ferramenta.codigo = data.get('codigo', ferramenta.codigo)
        ferramenta.nome = data.get('nome', ferramenta.nome)
        ferramenta.descricao = data.get('descricao', ferramenta.descricao)
        ferramenta.marca = data.get('marca', ferramenta.marca)
        ferramenta.modelo = data.get('modelo', ferramenta.modelo)
        ferramenta.numero_serie = data.get('numero_serie', ferramenta.numero_serie)
        ferramenta.localizacao = data.get('localizacao', ferramenta.localizacao)
        ferramenta.status = data.get('status', ferramenta.status)
        ferramenta.valor_aquisicao = data.get('valor_aquisicao', ferramenta.valor_aquisicao)
        ferramenta.fornecedor = data.get('fornecedor', ferramenta.fornecedor)
        ferramenta.intervalo_manutencao_dias = data.get('intervalo_manutencao_dias', ferramenta.intervalo_manutencao_dias)
        ferramenta.observacoes = data.get('observacoes', ferramenta.observacoes)
        
        if data.get('data_aquisicao'):
            ferramenta.data_aquisicao = datetime.strptime(data['data_aquisicao'], '%Y-%m-%d').date()
        
        ferramenta.data_atualizacao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify(ferramenta.to_dict())
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ferramenta_bp.route('/api/ferramentas/<int:ferramenta_id>', methods=['DELETE'])
def delete_ferramenta(ferramenta_id):
    try:
        ferramenta = Ferramenta.query.get_or_404(ferramenta_id)
        ferramenta.ativo = False
        ferramenta.data_atualizacao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Ferramenta removida com sucesso'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ferramenta_bp.route('/api/ferramentas/<int:ferramenta_id>/emprestimo', methods=['POST'])
def emprestar_ferramenta(ferramenta_id):
    try:
        ferramenta = Ferramenta.query.get_or_404(ferramenta_id)
        data = request.get_json()
        
        if ferramenta.status != 'disponivel':
            return jsonify({'error': 'Ferramenta não está disponível'}), 400
        
        emprestimo = EmprestimoFerramenta(
            ferramenta_id=ferramenta_id,
            responsavel=data['responsavel'],
            data_devolucao_prevista=datetime.strptime(data['data_devolucao_prevista'], '%Y-%m-%d %H:%M:%S') if data.get('data_devolucao_prevista') else None,
            observacoes=data.get('observacoes')
        )
        
        ferramenta.status = 'emprestada'
        ferramenta.responsavel_atual = data['responsavel']
        
        db.session.add(emprestimo)
        db.session.commit()
        
        return jsonify(emprestimo.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ferramenta_bp.route('/api/ferramentas/<int:ferramenta_id>/devolucao', methods=['POST'])
def devolver_ferramenta(ferramenta_id):
    try:
        ferramenta = Ferramenta.query.get_or_404(ferramenta_id)
        
        if ferramenta.status != 'emprestada':
            return jsonify({'error': 'Ferramenta não está emprestada'}), 400
        
        # Encontrar o empréstimo ativo
        emprestimo = EmprestimoFerramenta.query.filter_by(
            ferramenta_id=ferramenta_id,
            status='ativo'
        ).first()
        
        if not emprestimo:
            return jsonify({'error': 'Empréstimo ativo não encontrado'}), 400
        
        emprestimo.data_devolucao_real = datetime.utcnow()
        emprestimo.status = 'devolvido'
        
        ferramenta.status = 'disponivel'
        ferramenta.responsavel_atual = None
        
        db.session.commit()
        
        return jsonify({'message': 'Ferramenta devolvida com sucesso'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ferramenta_bp.route('/api/ferramentas/<int:ferramenta_id>/manutencao', methods=['POST'])
def registrar_manutencao(ferramenta_id):
    try:
        ferramenta = Ferramenta.query.get_or_404(ferramenta_id)
        data = request.get_json()
        
        manutencao = ManutencaoFerramenta(
            ferramenta_id=ferramenta_id,
            tipo=data['tipo'],
            descricao=data['descricao'],
            data_manutencao=datetime.strptime(data['data_manutencao'], '%Y-%m-%d').date(),
            custo=data.get('custo'),
            responsavel=data.get('responsavel'),
            fornecedor_servico=data.get('fornecedor_servico'),
            observacoes=data.get('observacoes')
        )
        
        # Atualizar dados de manutenção da ferramenta
        ferramenta.data_ultima_manutencao = manutencao.data_manutencao
        if ferramenta.intervalo_manutencao_dias:
            from datetime import timedelta
            ferramenta.proxima_manutencao = manutencao.data_manutencao + timedelta(days=ferramenta.intervalo_manutencao_dias)
        
        db.session.add(manutencao)
        db.session.commit()
        
        return jsonify(manutencao.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ferramenta_bp.route('/api/ferramentas/estatisticas', methods=['GET'])
def get_estatisticas():
    try:
        total = Ferramenta.query.filter_by(ativo=True).count()
        disponiveis = Ferramenta.query.filter_by(ativo=True, status='disponivel').count()
        emprestadas = Ferramenta.query.filter_by(ativo=True, status='emprestada').count()
        manutencao = Ferramenta.query.filter_by(ativo=True, status='manutencao').count()
        
        # Ferramentas que precisam de manutenção
        ferramentas_manutencao = Ferramenta.query.filter(
            Ferramenta.ativo == True,
            Ferramenta.proxima_manutencao <= date.today()
        ).count()
        
        return jsonify({
            'total': total,
            'disponiveis': disponiveis,
            'emprestadas': emprestadas,
            'manutencao': manutencao,
            'precisam_manutencao': ferramentas_manutencao
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
