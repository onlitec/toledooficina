#!/usr/bin/env python3
from src.models import db
from src.models.user import User
from src.main import create_app

app = create_app()
with app.app_context():
    # Verificar se já existe um usuário admin
    existing_admin = User.query.filter_by(username='admin').first()
    if existing_admin:
        print('Usuário admin já existe!')
    else:
        # Criar usuário admin
        user = User(
            username='admin',
            email='admin@oficina.com',
            nome_completo='Administrador',
            role='admin',
            ativo=True
        )
        user.set_password('123456')
        db.session.add(user)
        db.session.commit()
        print('Usuário admin criado com sucesso!')
        print('Username: admin')
        print('Senha: 123456')