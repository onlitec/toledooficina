from flask import Blueprint, request, jsonify, send_file
from src.models.user import db
from src.models.cliente import Cliente
from src.models.veiculo import Veiculo
from src.models.ordem_servico import OrdemServico
from src.models.financeiro import ContaReceber, ContaPagar, FluxoCaixa
from datetime import datetime, timedelta
import io
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
import json

relatorios_bp = Blueprint('relatorios', __name__)

@relatorios_bp.route('/relatorios/dashboard', methods=['GET'])
def dashboard_data():
    """Retorna dados para o dashboard"""
    try:
        # Estatísticas básicas
        total_clientes = Cliente.query.filter_by(ativo=True).count()
        total_veiculos = Veiculo.query.filter_by(ativo=True).count()
        ordens_abertas = OrdemServico.query.filter(
            OrdemServico.status.in_(['aberta', 'em_andamento', 'aguardando_peca'])
        ).count()
        
        # Faturamento do mês atual
        inicio_mes = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        faturamento_mes = db.session.query(db.func.sum(ContaReceber.valor_original)).filter(
            ContaReceber.data_emissao >= inicio_mes,
            ContaReceber.status == 'paga'
        ).scalar() or 0
        
        # Dados dos últimos 6 meses para gráfico
        meses_dados = []
        for i in range(6):
            data_inicio = (datetime.now().replace(day=1) - timedelta(days=30*i)).replace(day=1)
            data_fim = (data_inicio + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            faturamento = db.session.query(db.func.sum(ContaReceber.valor_original)).filter(
                ContaReceber.data_emissao >= data_inicio,
                ContaReceber.data_emissao <= data_fim,
                ContaReceber.status == 'paga'
            ).scalar() or 0
            
            ordens_count = OrdemServico.query.filter(
                OrdemServico.data_abertura >= data_inicio,
                OrdemServico.data_abertura <= data_fim
            ).count()
            
            meses_dados.insert(0, {
                'month': data_inicio.strftime('%b'),
                'revenue': float(faturamento),
                'orders': ordens_count
            })
        
        return jsonify({
            'success': True,
            'data': {
                'stats': {
                    'total_clientes': total_clientes,
                    'total_veiculos': total_veiculos,
                    'ordens_abertas': ordens_abertas,
                    'faturamento_mes': float(faturamento_mes)
                },
                'revenue_data': meses_dados,
                'service_types': [
                    {'name': 'Manutenção Preventiva', 'value': 35, 'color': '#3B82F6'},
                    {'name': 'Troca de Óleo', 'value': 25, 'color': '#10B981'},
                    {'name': 'Freios', 'value': 20, 'color': '#F59E0B'},
                    {'name': 'Suspensão', 'value': 12, 'color': '#EF4444'},
                    {'name': 'Outros', 'value': 8, 'color': '#8B5CF6'}
                ]
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@relatorios_bp.route('/relatorios/clientes/pdf', methods=['GET'])
def relatorio_clientes_pdf():
    """Gera relatório de clientes em PDF"""
    try:
        # Buscar clientes
        clientes = Cliente.query.filter_by(ativo=True).all()
        
        # Criar PDF em memória
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1  # Center
        )
        
        # Conteúdo
        story = []
        
        # Título
        title = Paragraph("Relatório de Clientes", title_style)
        story.append(title)
        story.append(Spacer(1, 20))
        
        # Data de geração
        data_geracao = Paragraph(f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal'])
        story.append(data_geracao)
        story.append(Spacer(1, 20))
        
        # Resumo
        resumo = Paragraph(f"Total de clientes ativos: {len(clientes)}", styles['Heading2'])
        story.append(resumo)
        story.append(Spacer(1, 20))
        
        # Tabela de clientes
        data = [['Nome', 'Tipo', 'CPF/CNPJ', 'Telefone', 'E-mail', 'Cidade']]
        
        for cliente in clientes:
            data.append([
                cliente.nome,
                'PF' if cliente.tipo_pessoa == 'fisica' else 'PJ',
                cliente.cpf_cnpj,
                cliente.telefone or '-',
                cliente.email or '-',
                cliente.cidade or '-'
            ])
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        
        # Gerar PDF
        doc.build(story)
        buffer.seek(0)
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f'relatorio_clientes_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@relatorios_bp.route('/relatorios/financeiro', methods=['GET'])
def relatorio_financeiro():
    """Relatório financeiro com filtros"""
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        if not data_inicio or not data_fim:
            # Padrão: mês atual
            inicio_mes = datetime.now().replace(day=1)
            fim_mes = (inicio_mes + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            data_inicio = inicio_mes.strftime('%Y-%m-%d')
            data_fim = fim_mes.strftime('%Y-%m-%d')
        
        data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d').date()
        data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d').date()
        
        # Contas a receber
        contas_receber = ContaReceber.query.filter(
            ContaReceber.data_emissao >= data_inicio_dt,
            ContaReceber.data_emissao <= data_fim_dt
        ).all()
        
        # Contas a pagar
        contas_pagar = ContaPagar.query.filter(
            ContaPagar.data_emissao >= data_inicio_dt,
            ContaPagar.data_emissao <= data_fim_dt
        ).all()
        
        # Resumo
        total_receber = sum(conta.valor_original for conta in contas_receber)
        total_recebido = sum(conta.valor_pago for conta in contas_receber)
        total_pagar = sum(conta.valor_original for conta in contas_pagar)
        total_pago = sum(conta.valor_pago for conta in contas_pagar)
        
        saldo_periodo = total_recebido - total_pago
        
        return jsonify({
            'success': True,
            'data': {
                'periodo': {
                    'inicio': data_inicio,
                    'fim': data_fim
                },
                'resumo': {
                    'total_receber': float(total_receber),
                    'total_recebido': float(total_recebido),
                    'total_pagar': float(total_pagar),
                    'total_pago': float(total_pago),
                    'saldo_periodo': float(saldo_periodo)
                },
                'contas_receber': [conta.to_dict() for conta in contas_receber],
                'contas_pagar': [conta.to_dict() for conta in contas_pagar]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@relatorios_bp.route('/relatorios/estoque/baixo', methods=['GET'])
def relatorio_estoque_baixo():
    """Relatório de peças com estoque baixo"""
    try:
        from src.models.peca import Peca
        
        pecas_baixo_estoque = Peca.query.filter(
            Peca.quantidade_atual <= Peca.quantidade_minima,
            Peca.ativo == True
        ).all()
        
        return jsonify({
            'success': True,
            'data': {
                'total_pecas_baixo_estoque': len(pecas_baixo_estoque),
                'pecas': [peca.to_dict() for peca in pecas_baixo_estoque]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@relatorios_bp.route('/relatorios/ordens-servico', methods=['GET'])
def relatorio_ordens_servico():
    """Relatório de ordens de serviço"""
    try:
        status = request.args.get('status')
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        query = OrdemServico.query
        
        if status:
            query = query.filter(OrdemServico.status == status)
            
        if data_inicio:
            data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d').date()
            query = query.filter(OrdemServico.data_abertura >= data_inicio_dt)
            
        if data_fim:
            data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d').date()
            query = query.filter(OrdemServico.data_abertura <= data_fim_dt)
        
        ordens = query.all()
        
        # Estatísticas
        total_ordens = len(ordens)
        valor_total = sum(ordem.valor_total or 0 for ordem in ordens)
        
        # Agrupamento por status
        status_count = {}
        for ordem in ordens:
            status_count[ordem.status] = status_count.get(ordem.status, 0) + 1
        
        return jsonify({
            'success': True,
            'data': {
                'total_ordens': total_ordens,
                'valor_total': float(valor_total),
                'status_count': status_count,
                'ordens': [ordem.to_dict() for ordem in ordens]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

