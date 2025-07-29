import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models import db
from src.routes.user import user_bp
from src.routes.cliente import cliente_bp
from src.routes.relatorios import relatorios_bp
from src.routes.configuracao import configuracao_bp
from src.routes.veiculo import veiculo_bp
from src.routes.estoque import estoque_bp
from src.routes.ferramenta import ferramenta_bp
from src.routes.ordem_servico import ordem_servico_bp
from src.routes.financeiro import financeiro_bp

# Importar todos os modelos para criar as tabelas
from src.models.cliente import Cliente
from src.models.veiculo import Veiculo
from src.models.peca import Peca, Categoria, Fornecedor, MovimentacaoEstoque
from src.models.ferramenta import Ferramenta, EmprestimoFerramenta, ManutencaoFerramenta
from src.models.ordem_servico import OrdemServico, ItemOrdemServico, TipoServico, ServicoOrdem
from src.models.financeiro import ContaReceber, ContaPagar, PagamentoRecebimento, FluxoCaixa
from src.models.configuracao import ConfiguracaoEmpresa, ConfiguracaoEmail, ConfiguracaoNotificacao, ConfiguracaoSistema

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
# Configurar SECRET_KEY a partir do arquivo secret ou variável de ambiente
try:
    with open('/run/secrets/secret_key', 'r') as f:
        app.config['SECRET_KEY'] = f.read().strip()
except FileNotFoundError:
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')

# Habilitar CORS para todas as rotas
CORS(app, origins=['http://localhost:7080', 'http://127.0.0.1:7080'], supports_credentials=True)

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(cliente_bp, url_prefix='/api')
app.register_blueprint(relatorios_bp, url_prefix='/api')
app.register_blueprint(configuracao_bp, url_prefix='/api')
app.register_blueprint(veiculo_bp, url_prefix="/api")
app.register_blueprint(estoque_bp, url_prefix="/api")
app.register_blueprint(ferramenta_bp, url_prefix="/api")
app.register_blueprint(ordem_servico_bp, url_prefix="/api")
app.register_blueprint(financeiro_bp, url_prefix="/api")

# Configuração do banco de dados
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route("/static/uploads/<path:filename>")
def serve_uploads(filename):
    """Serve uploaded files"""
    # Caminho absoluto para o diretório uploads
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')

    # Verificar se o arquivo existe
    file_path = os.path.join(uploads_dir, filename)
    if not os.path.exists(file_path):
        # Se o arquivo não existe, retornar erro 404 com resposta JSON
        from flask import Response
        response = Response(
            response=f'{{"error": "Arquivo não encontrado", "filename": "{filename}", "message": "O arquivo solicitado não existe no servidor"}}',
            status=404,
            mimetype='application/json'
        )
        return response

    return send_from_directory(uploads_dir, filename)

@app.route("/api/debug/uploads")
def debug_uploads():
    """Debug: listar arquivos no diretório uploads"""
    try:
        uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')

        if not os.path.exists(uploads_dir):
            return jsonify({
                'error': 'Diretório uploads não existe',
                'path': uploads_dir
            }), 404

        files = os.listdir(uploads_dir)
        return jsonify({
            'uploads_dir': uploads_dir,
            'files': files,
            'total': len(files)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/api/debug/versao")
def debug_versao():
    """Debug: verificar versão do código em produção"""
    try:
        import datetime

        # Verificar se o campo fornecedor existe no modelo
        from src.models.financeiro import ContaPagar
        atributos_modelo = [attr for attr in dir(ContaPagar) if not attr.startswith('_')]
        tem_campo_fornecedor = 'fornecedor' in atributos_modelo

        # Informações da versão
        versao_info = {
            'timestamp_verificacao': datetime.datetime.now().isoformat(),
            'campo_fornecedor_no_modelo': tem_campo_fornecedor,
            'atributos_modelo_contapagar': atributos_modelo,
            'versao_codigo': 'v2025.07.29-financeiro-fix',
            'commit_esperado': 'ac1024c',
            'status_deploy': 'Verificando se código foi atualizado...'
        }

        if tem_campo_fornecedor:
            versao_info['status_deploy'] = '✅ Código atualizado - Campo fornecedor presente'
        else:
            versao_info['status_deploy'] = '❌ Código desatualizado - Campo fornecedor ausente'

        return jsonify({
            'success': True,
            'data': versao_info
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro ao verificar versão - possível problema de deploy'
        }), 500

@app.route("/")
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
