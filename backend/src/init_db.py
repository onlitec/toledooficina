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
    db_user = os.environ.get('POSTGRES_USER')
    db_password = os.environ.get('POSTGRES_PASSWORD')
    db_host = os.environ.get('POSTGRES_HOST')
    db_name = os.environ.get('POSTGRES_DB')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@{db_host}/{db_name}'
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
        admin_user = User.query.filter_by(username='AdminSuperUser').first()
        if not admin_user:
            print("👤 Criando usuário administrador padrão...")
            admin_user = User(
                username='AdminSuperUser',
                email='admin.super@oficina.com',
                nome_completo='Administrador do Sistema',
                role='admin',
                ativo=True
            )
            admin_user.set_password('AdM!n@2024#Sec$Pass')  # Senha complexa e segura
            db.session.add(admin_user)
            print("   ✅ Usuário admin criado (username: AdminSuperUser, senha: AdM!n@2024#Sec$Pass)")
        else:
            print("   ℹ️ Usuário admin já existe, atualizando senha para o padrão...")
            admin_user.set_password('AdM!n@2024#Sec$Pass')
            db.session.add(admin_user)
        
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
                cep='01234-567'
            )
            db.session.add(config_empresa)
            print("   ✅ Configuração da empresa criada")
        else:
            print("   ℹ️ Configuração da empresa já existe")
        
        # Criar configuração de email se não existir
        config_email = ConfiguracaoEmail.query.first()
        if not config_email:
            print("📧 Criando configuração de email...")
            config_email = ConfiguracaoEmail(
                servidor_smtp='smtp.gmail.com',
                porta_smtp=587,
                usuario_email='seu-email@gmail.com',
                senha_email='sua-senha-app',
                usar_tls=True,
                email_remetente='seu-email@gmail.com',
                nome_remetente='Oficina Mecânica ERP'
            )
            db.session.add(config_email)
            print("   ✅ Configuração de email criada")
        else:
            print("   ℹ️ Configuração de email já existe")
        
        # Criar configuração de notificações se não existir
        config_notif = ConfiguracaoNotificacao.query.first()
        if not config_notif:
            print("🔔 Criando configuração de notificações...")
            config_notif = ConfiguracaoNotificacao(
                notificar_ordem_criada=True,
                notificar_ordem_concluida=True,
                notificar_contas_vencer=True,
                notificar_estoque_baixo=True,
                emails_notificacao='admin@oficina.com'
            )
            db.session.add(config_notif)
            print("   ✅ Configuração de notificações criada")
        else:
            print("   ℹ️ Configuração de notificações já existe")
        
        # Criar configurações do sistema se não existirem
        print("⚙️ Criando configurações do sistema...")
        
        # Verificar e criar configurações individuais
        configs_sistema = [
            {'chave': 'nome_sistema', 'valor': 'ERP Oficina Mecânica', 'tipo': 'string', 'descricao': 'Nome do sistema'},
            {'chave': 'versao', 'valor': '1.0.0', 'tipo': 'string', 'descricao': 'Versão do sistema'},
            {'chave': 'manutencao', 'valor': 'false', 'tipo': 'boolean', 'descricao': 'Sistema em manutenção'},
            {'chave': 'backup_automatico', 'valor': 'true', 'tipo': 'boolean', 'descricao': 'Realizar backup automático'},
            {'chave': 'intervalo_backup', 'valor': '24', 'tipo': 'integer', 'descricao': 'Intervalo de backup em horas'}
        ]
        
        for config in configs_sistema:
            existing_config = ConfiguracaoSistema.query.filter_by(chave=config['chave']).first()
            if not existing_config:
                new_config = ConfiguracaoSistema(
                    chave=config['chave'],
                    valor=config['valor'],
                    tipo=config['tipo'],
                    descricao=config['descricao']
                )
                db.session.add(new_config)
                print(f"   ✅ Configuração '{config['chave']}' criada")
            else:
                print(f"   ℹ️ Configuração '{config['chave']}' já existe")
        
        try:
            db.session.commit()
            print("\n🎉 Banco de dados inicializado com sucesso!")
            print("\n📋 INFORMAÇÕES IMPORTANTES:")
            print("   👤 Usuário Admin: AdminSuperUser / AdM!n@2024#Sec$Pass")
            print("   👤 Usuário Teste: user / user123")
            print("   ⚠️  ALTERE AS SENHAS PADRÃO IMEDIATAMENTE!")
            print("   📧 Configure o SMTP nas configurações de email")
            print("   🏢 Atualize os dados da empresa nas configurações")
            return True
        except Exception as e:
            print(f"❌ Erro ao salvar no banco: {e}")
            db.session.rollback()
            return False

if __name__ == '__main__':
    print("🚀 Inicializando banco de dados do ERP Oficina Mecânica...")
    success = init_database()
    sys.exit(0 if success else 1)
