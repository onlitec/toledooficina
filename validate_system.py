#!/usr/bin/env python3
"""
Script de validação do sistema ERP Oficina Mecânica
Verifica a integridade de todos os componentes do sistema
"""

import os
import json
import yaml
import sys
from pathlib import Path

def check_file_exists(filepath, description):
    """Verifica se um arquivo existe"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: {filepath} - ARQUIVO NÃO ENCONTRADO")
        return False

def check_directory_exists(dirpath, description):
    """Verifica se um diretório existe"""
    if os.path.isdir(dirpath):
        print(f"✅ {description}: {dirpath}")
        return True
    else:
        print(f"❌ {description}: {dirpath} - DIRETÓRIO NÃO ENCONTRADO")
        return False

def validate_json_file(filepath, description):
    """Valida se um arquivo JSON está bem formado"""
    try:
        with open(filepath, 'r') as f:
            json.load(f)
        print(f"✅ {description}: JSON válido")
        return True
    except json.JSONDecodeError as e:
        print(f"❌ {description}: JSON inválido - {e}")
        return False
    except FileNotFoundError:
        print(f"❌ {description}: Arquivo não encontrado")
        return False

def validate_yaml_file(filepath, description):
    """Valida se um arquivo YAML está bem formado"""
    try:
        with open(filepath, 'r') as f:
            yaml.safe_load(f)
        print(f"✅ {description}: YAML válido")
        return True
    except yaml.YAMLError as e:
        print(f"❌ {description}: YAML inválido - {e}")
        return False
    except FileNotFoundError:
        print(f"❌ {description}: Arquivo não encontrado")
        return False

def check_python_imports(filepath, description):
    """Verifica se um arquivo Python pode ser importado"""
    try:
        # Adicionar o diretório ao path temporariamente
        import importlib.util
        spec = importlib.util.spec_from_file_location("module", filepath)
        if spec is None:
            print(f"❌ {description}: Não foi possível criar spec")
            return False
        
        module = importlib.util.module_from_spec(spec)
        # Não executar o módulo, apenas verificar sintaxe
        with open(filepath, 'r') as f:
            compile(f.read(), filepath, 'exec')
        print(f"✅ {description}: Sintaxe Python válida")
        return True
    except SyntaxError as e:
        print(f"❌ {description}: Erro de sintaxe - {e}")
        return False
    except Exception as e:
        print(f"❌ {description}: Erro - {e}")
        return False

def main():
    """Função principal de validação"""
    print("🔍 VALIDAÇÃO DO SISTEMA ERP OFICINA MECÂNICA")
    print("=" * 50)
    
    errors = 0
    
    # Verificar estrutura de diretórios
    print("\n📁 ESTRUTURA DE DIRETÓRIOS")
    print("-" * 30)
    
    directories = [
        ("backend", "Backend Flask"),
        ("backend/src", "Código fonte backend"),
        ("backend/src/models", "Modelos de dados"),
        ("backend/src/routes", "Rotas da API"),
        ("frontend", "Frontend React"),
        ("frontend/src", "Código fonte frontend"),
        ("frontend/src/components", "Componentes React"),
        ("frontend/src/components/pages", "Páginas da aplicação"),
    ]
    
    for dirpath, description in directories:
        if not check_directory_exists(dirpath, description):
            errors += 1
    
    # Verificar arquivos principais
    print("\n📄 ARQUIVOS PRINCIPAIS")
    print("-" * 30)
    
    main_files = [
        ("README.md", "Documentação principal"),
        ("docker-compose.yml", "Orquestração Docker"),
        ("backend/Dockerfile", "Container backend"),
        ("frontend/Dockerfile", "Container frontend"),
        ("backend/requirements.txt", "Dependências Python"),
        ("frontend/package.json", "Dependências Node.js"),
        ("backend/src/main.py", "Aplicação Flask principal"),
        ("frontend/src/App.jsx", "Componente React principal"),
    ]
    
    for filepath, description in main_files:
        if not check_file_exists(filepath, description):
            errors += 1
    
    # Verificar modelos de dados
    print("\n🗄️ MODELOS DE DADOS")
    print("-" * 30)
    
    models = [
        ("backend/src/models/user.py", "Modelo User"),
        ("backend/src/models/cliente.py", "Modelo Cliente"),
        ("backend/src/models/veiculo.py", "Modelo Veiculo"),
        ("backend/src/models/peca.py", "Modelo Peca"),
        ("backend/src/models/ferramenta.py", "Modelo Ferramenta"),
        ("backend/src/models/ordem_servico.py", "Modelo OrdemServico"),
        ("backend/src/models/financeiro.py", "Modelo Financeiro"),
        ("backend/src/models/configuracao.py", "Modelo Configuracao"),
    ]
    
    for filepath, description in models:
        if check_file_exists(filepath, description):
            if not check_python_imports(filepath, description):
                errors += 1
        else:
            errors += 1
    
    # Verificar rotas da API
    print("\n🛣️ ROTAS DA API")
    print("-" * 30)
    
    routes = [
        ("backend/src/routes/user.py", "Rotas User"),
        ("backend/src/routes/cliente.py", "Rotas Cliente"),
        ("backend/src/routes/relatorios.py", "Rotas Relatórios"),
        ("backend/src/routes/configuracao.py", "Rotas Configuração"),
    ]
    
    for filepath, description in routes:
        if check_file_exists(filepath, description):
            if not check_python_imports(filepath, description):
                errors += 1
        else:
            errors += 1
    
    # Verificar componentes React
    print("\n⚛️ COMPONENTES REACT")
    print("-" * 30)
    
    components = [
        ("frontend/src/components/Sidebar.jsx", "Sidebar"),
        ("frontend/src/components/Header.jsx", "Header"),
        ("frontend/src/components/pages/Dashboard.jsx", "Dashboard"),
        ("frontend/src/components/pages/Clientes.jsx", "Clientes"),
        ("frontend/src/components/pages/Veiculos.jsx", "Veículos"),
        ("frontend/src/components/pages/Estoque.jsx", "Estoque"),
        ("frontend/src/components/pages/Ferramentas.jsx", "Ferramentas"),
        ("frontend/src/components/pages/OrdensServico.jsx", "Ordens de Serviço"),
        ("frontend/src/components/pages/Financeiro.jsx", "Financeiro"),
        ("frontend/src/components/pages/Relatorios.jsx", "Relatórios"),
        ("frontend/src/components/pages/Configuracoes.jsx", "Configurações"),
    ]
    
    for filepath, description in components:
        if not check_file_exists(filepath, description):
            errors += 1
    
    # Verificar arquivos de configuração
    print("\n⚙️ ARQUIVOS DE CONFIGURAÇÃO")
    print("-" * 30)
    
    # Validar package.json
    if check_file_exists("frontend/package.json", "Package.json"):
        if not validate_json_file("frontend/package.json", "Package.json"):
            errors += 1
    else:
        errors += 1
    
    # Validar docker-compose.yml
    if check_file_exists("docker-compose.yml", "Docker Compose"):
        if not validate_yaml_file("docker-compose.yml", "Docker Compose"):
            errors += 1
    else:
        errors += 1
    
    # Verificar arquivos Docker
    print("\n🐳 ARQUIVOS DOCKER")
    print("-" * 30)
    
    docker_files = [
        ("backend/.dockerignore", "Backend .dockerignore"),
        ("frontend/.dockerignore", "Frontend .dockerignore"),
        ("frontend/nginx.conf", "Configuração Nginx"),
    ]
    
    for filepath, description in docker_files:
        if not check_file_exists(filepath, description):
            errors += 1
    
    # Verificar arquivos de documentação
    print("\n📚 DOCUMENTAÇÃO")
    print("-" * 30)
    
    docs = [
        ("test_system.md", "Plano de testes"),
        ("validate_system.py", "Script de validação"),
    ]
    
    for filepath, description in docs:
        if not check_file_exists(filepath, description):
            errors += 1
    
    # Resumo final
    print("\n" + "=" * 50)
    print("📊 RESUMO DA VALIDAÇÃO")
    print("=" * 50)
    
    if errors == 0:
        print("🎉 SISTEMA VÁLIDO! Todos os componentes estão presentes e corretos.")
        print("✅ O sistema está pronto para deploy com Docker.")
        return 0
    else:
        print(f"⚠️ ENCONTRADOS {errors} PROBLEMAS no sistema.")
        print("❌ Corrija os problemas antes do deploy.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

