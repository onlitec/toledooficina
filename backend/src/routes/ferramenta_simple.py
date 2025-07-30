from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models import db
from src.models.ferramenta import Ferramenta

ferramenta_bp = Blueprint('ferramenta', __name__)

@ferramenta_bp.route('/ferramentas', methods=['GET'])
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
                    Ferramenta.marca.ilike(f'%{search}%'),
                    Ferramenta.modelo.ilike(f'%{search}%')
                )
            )
        
        if status:
            query = query.filter(Ferramenta.status == status)
        
        ferramentas = query.all()
        return jsonify([ferramenta.to_dict() for ferramenta in ferramentas])
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ferramenta_bp.route('/ferramentas', methods=['POST'])
def create_ferramenta():
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data.get('nome'):
            return jsonify({'success': False, 'message': 'Nome é obrigatório'}), 400

        # Gerar código automaticamente se não fornecido
        codigo = data.get('codigo')
        if not codigo or codigo.strip() == '':
            # Buscar o último código FER-XXXX
            ultima_ferramenta = Ferramenta.query.filter(Ferramenta.codigo.like('FER-%')).order_by(Ferramenta.codigo.desc()).first()
            if ultima_ferramenta:
                try:
                    ultimo_numero = int(ultima_ferramenta.codigo.split('-')[1])
                    proximo_numero = ultimo_numero + 1
                except (ValueError, IndexError):
                    proximo_numero = 1
            else:
                proximo_numero = 1
            codigo = f'FER-{proximo_numero:04d}'
        else:
            # Verificar se o código já existe (apenas se foi fornecido)
            existing = Ferramenta.query.filter_by(codigo=codigo).first()
            if existing:
                return jsonify({'success': False, 'message': 'Código já existe'}), 400

        # Processar data de aquisição
        data_aquisicao = None
        if data.get('data_aquisicao'):
            try:
                data_aquisicao = datetime.strptime(data['data_aquisicao'], '%Y-%m-%d').date()
            except ValueError:
                pass  # Ignorar se formato inválido

        # Processar valor de aquisição
        valor_aquisicao = None
        if data.get('valor_aquisicao'):
            try:
                valor_aquisicao = float(data['valor_aquisicao'])
            except (ValueError, TypeError):
                pass  # Ignorar se valor inválido

        # Processar intervalo de manutenção
        intervalo_manutencao = None
        if data.get('intervalo_manutencao_dias'):
            try:
                intervalo_manutencao = int(data['intervalo_manutencao_dias'])
            except (ValueError, TypeError):
                pass  # Ignorar se valor inválido

        ferramenta = Ferramenta(
            codigo=codigo,
            nome=data['nome'],
            descricao=data.get('descricao'),
            marca=data.get('marca'),
            modelo=data.get('modelo'),
            numero_serie=data.get('numero_serie'),
            localizacao=data.get('localizacao'),
            status=data.get('status', 'disponivel'),
            valor_aquisicao=valor_aquisicao,
            data_aquisicao=data_aquisicao,
            fornecedor=data.get('fornecedor'),
            intervalo_manutencao_dias=intervalo_manutencao,
            observacoes=data.get('observacoes')
        )
        
        db.session.add(ferramenta)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ferramenta cadastrada com sucesso!',
            'data': ferramenta.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@ferramenta_bp.route('/ferramentas/<int:ferramenta_id>', methods=['GET'])
def get_ferramenta(ferramenta_id):
    try:
        ferramenta = Ferramenta.query.get_or_404(ferramenta_id)
        return jsonify(ferramenta.to_dict())
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ferramenta_bp.route('/ferramentas/<int:ferramenta_id>', methods=['PUT'])
def update_ferramenta(ferramenta_id):
    try:
        ferramenta = Ferramenta.query.get_or_404(ferramenta_id)
        data = request.get_json()
        
        # Atualizar campos
        if 'nome' in data:
            ferramenta.nome = data['nome']
        if 'descricao' in data:
            ferramenta.descricao = data['descricao']
        if 'marca' in data:
            ferramenta.marca = data['marca']
        if 'modelo' in data:
            ferramenta.modelo = data['modelo']
        if 'numero_serie' in data:
            ferramenta.numero_serie = data['numero_serie']
        if 'localizacao' in data:
            ferramenta.localizacao = data['localizacao']
        if 'status' in data:
            ferramenta.status = data['status']
        if 'fornecedor' in data:
            ferramenta.fornecedor = data['fornecedor']
        if 'observacoes' in data:
            ferramenta.observacoes = data['observacoes']
        
        # Processar data de aquisição
        if 'data_aquisicao' in data and data['data_aquisicao']:
            try:
                ferramenta.data_aquisicao = datetime.strptime(data['data_aquisicao'], '%Y-%m-%d').date()
            except ValueError:
                pass
        
        # Processar valor de aquisição
        if 'valor_aquisicao' in data and data['valor_aquisicao']:
            try:
                ferramenta.valor_aquisicao = float(data['valor_aquisicao'])
            except (ValueError, TypeError):
                pass
        
        # Processar intervalo de manutenção
        if 'intervalo_manutencao_dias' in data and data['intervalo_manutencao_dias']:
            try:
                ferramenta.intervalo_manutencao_dias = int(data['intervalo_manutencao_dias'])
            except (ValueError, TypeError):
                pass
        
        ferramenta.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ferramenta atualizada com sucesso!',
            'data': ferramenta.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@ferramenta_bp.route('/ferramentas/<int:ferramenta_id>', methods=['DELETE'])
def delete_ferramenta(ferramenta_id):
    try:
        ferramenta = Ferramenta.query.get_or_404(ferramenta_id)
        ferramenta.ativo = False
        ferramenta.data_atualizacao = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ferramenta removida com sucesso!'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@ferramenta_bp.route('/ferramentas/estatisticas', methods=['GET'])
def get_estatisticas():
    try:
        total = Ferramenta.query.filter_by(ativo=True).count()
        disponiveis = Ferramenta.query.filter_by(ativo=True, status='disponivel').count()
        emprestadas = Ferramenta.query.filter_by(ativo=True, status='emprestada').count()
        manutencao = Ferramenta.query.filter_by(ativo=True, status='manutencao').count()
        
        return jsonify({
            'total': total,
            'disponiveis': disponiveis,
            'emprestadas': emprestadas,
            'manutencao': manutencao
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
