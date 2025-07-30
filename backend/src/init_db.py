#!/usr/bin/env python3
"""
Script para inicializar o banco de dados com dados básicos
"""
import os
import sys

# Adicionar o diretório pai ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models import db
from src.models.user import User
from src.models.cliente import Cliente
from src.models.veiculo import Veiculo
from src.models.peca import Peca, Categoria, Fornecedor
from src.models.ferramenta import Ferramenta
from src.models.ordem_servico import OrdemServico, TipoServico
from src.models.financeiro import ContaReceber, ContaPagar, FluxoCaixa
from src.models.configuracao import ConfiguracaoEmpresa, ConfiguracaoEmail, ConfiguracaoNotificacao, ConfiguracaoSistema
from flask import Flask

def create_app():
    """Criar aplicação Flask para inicialização"""
    app = Flask(__name__)
    
    # Configurar SECRET_KEY
    try:
        with open('/run/secrets/secret_key', 'r') as f:
            app.config['SECRET_KEY'] = f.read().strip()
    except FileNotFoundError:
        app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
    
    # Configuração do banco de dados
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    db.init_app(app)
    return app

def init_database():
    """Inicializar banco de dados com dados básicos"""
    app = create_app()
    
    with app.app_context():
        print("🗄️ Criando tabelas do banco de dados...")
        db.create_all()
        
        # Verificar se já existe usuário admin
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            print("👤 Criando usuário administrador padrão...")
            admin_user = User(
                username='admin',
                email='admin@oficina.com',
                nome_completo='Administrador do Sistema',
                role='admin',
                ativo=True
            )
            admin_user.set_password('admin123')  # Senha padrão - DEVE SER ALTERADA
            db.session.add(admin_user)
            print("   ✅ Usuário admin criado (username: admin, senha: admin123)")
        else:
            print("   ℹ️ Usuário admin já existe")
        
        # Criar usuário de teste
        test_user = User.query.filter_by(username='user').first()
        if not test_user:
            print("👤 Criando usuário de teste...")
            test_user = User(
                username='user',
                email='user@oficina.com',
                nome_completo='Usuário de Teste',
                role='user',
                ativo=True
            )
            test_user.set_password('user123')
            db.session.add(test_user)
            print("   ✅ Usuário de teste criado (username: user, senha: user123)")
        else:
            print("   ℹ️ Usuário de teste já existe")
        
        # Criar configuração da empresa se não existir
        config_empresa = ConfiguracaoEmpresa.query.first()
        if not config_empresa:
            print("🏢 Criando configuração da empresa...")
            config_empresa = ConfiguracaoEmpresa(
                razao_social='Oficina Mecânica ERP Ltda',
                nome_fantasia='Oficina Mecânica ERP',
                cnpj='00.000.000/0001-00',
                telefone='(11) 99999-9999',
                email='contato@oficina.com',
                endereco='Rua das Oficinas, 123',
                cidade='São Paulo',
                estado='SP',
                cep='01000-000'
            )
            db.session.add(config_empresa)
            print("   ✅ Configuração da empresa criada")
        else:
            print("   ℹ️ Configuração da empresa já existe")
        
        # Criar algumas categorias básicas
        categorias_basicas = [
            ('Motor', 'Peças relacionadas ao motor'),
            ('Freios', 'Sistema de freios'),
            ('Suspensão', 'Sistema de suspensão'),
            ('Elétrica', 'Sistema elétrico'),
            ('Filtros', 'Filtros diversos'),
            ('Óleos', 'Óleos e lubrificantes')
        ]
        
        print("📦 Criando categorias básicas...")
        for nome, descricao in categorias_basicas:
            categoria = Categoria.query.filter_by(nome=nome).first()
            if not categoria:
                categoria = Categoria(nome=nome, descricao=descricao)
                db.session.add(categoria)
                print(f"   ✅ Categoria '{nome}' criada")
        
        # Criar alguns tipos de serviço básicos
        tipos_servico_basicos = [
            ('Troca de Óleo', 'Troca de óleo do motor', 50.00, 1.0),
            ('Alinhamento', 'Alinhamento de direção', 80.00, 1.5),
            ('Balanceamento', 'Balanceamento de rodas', 60.00, 1.0),
            ('Revisão Geral', 'Revisão completa do veículo', 200.00, 4.0),
            ('Troca de Pastilhas', 'Troca de pastilhas de freio', 120.00, 2.0)
        ]
        
        print("🔧 Criando tipos de serviço básicos...")
        for nome, descricao, valor, tempo in tipos_servico_basicos:
            tipo_servico = TipoServico.query.filter_by(nome=nome).first()
            if not tipo_servico:
                tipo_servico = TipoServico(
                    nome=nome,
                    descricao=descricao,
                    valor_padrao=valor,
                    tempo_estimado_horas=tempo
                )
                db.session.add(tipo_servico)
                print(f"   ✅ Tipo de serviço '{nome}' criado")
        
        try:
            db.session.commit()
            print("\n🎉 Banco de dados inicializado com sucesso!")
            print("\n📋 INFORMAÇÕES IMPORTANTES:")
            print("   👤 Usuário Admin: admin / admin123")
            print("   👤 Usuário Teste: user / user123")
            print("   ⚠️  ALTERE AS SENHAS PADRÃO IMEDIATAMENTE!")
            print("\n🚀 Sistema pronto para uso!")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Erro ao inicializar banco de dados: {str(e)}")
            return False
    
    return True

if __name__ == '__main__':
    print("🚀 Inicializando banco de dados do ERP Oficina Mecânica...")
    success = init_database()
    sys.exit(0 if success else 1)
