from marshmallow import Schema, fields, validate, validates, ValidationError
import re

class LoginSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    password = fields.Str(required=True, validate=validate.Length(min=6))
    remember_me = fields.Bool(missing=False)

class UserCreateSchema(Schema):
    username = fields.Str(
        required=True, 
        validate=[
            validate.Length(min=3, max=80),
            validate.Regexp(r'^[a-zA-Z0-9_]+$', error='Username deve conter apenas letras, números e underscore')
        ]
    )
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    nome_completo = fields.Str(validate=validate.Length(max=200))
    role = fields.Str(validate=validate.OneOf(['admin', 'manager', 'user']), missing='user')
    
    @validates('password')
    def validate_password(self, value):
        if not re.search(r'[A-Z]', value):
            raise ValidationError('Senha deve conter pelo menos uma letra maiúscula')
        if not re.search(r'[a-z]', value):
            raise ValidationError('Senha deve conter pelo menos uma letra minúscula')
        if not re.search(r'[0-9]', value):
            raise ValidationError('Senha deve conter pelo menos um número')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValidationError('Senha deve conter pelo menos um caractere especial')

class UserUpdateSchema(Schema):
    email = fields.Email()
    nome_completo = fields.Str(validate=validate.Length(max=200))
    role = fields.Str(validate=validate.OneOf(['admin', 'manager', 'user']))
    ativo = fields.Bool()

class ChangePasswordSchema(Schema):
    current_password = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=8))
    confirm_password = fields.Str(required=True)
    
    @validates('new_password')
    def validate_new_password(self, value):
        if not re.search(r'[A-Z]', value):
            raise ValidationError('Nova senha deve conter pelo menos uma letra maiúscula')
        if not re.search(r'[a-z]', value):
            raise ValidationError('Nova senha deve conter pelo menos uma letra minúscula')
        if not re.search(r'[0-9]', value):
            raise ValidationError('Nova senha deve conter pelo menos um número')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValidationError('Nova senha deve conter pelo menos um caractere especial')
    
    def validate(self, data, **kwargs):
        errors = {}
        if 'new_password' in data and 'confirm_password' in data:
            if data['new_password'] != data['confirm_password']:
                errors['confirm_password'] = ['Nova senha e confirmação não coincidem']
        if errors:
            raise ValidationError(errors)
        return data

class RefreshTokenSchema(Schema):
    refresh_token = fields.Str(required=True, validate=validate.Length(min=10))

class ForgotPasswordSchema(Schema):
    email = fields.Email(required=True)

class ResetPasswordSchema(Schema):
    token = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=8))
    confirm_password = fields.Str(required=True)
    
    @validates('new_password')
    def validate_new_password(self, value):
        if not re.search(r'[A-Z]', value):
            raise ValidationError('Nova senha deve conter pelo menos uma letra maiúscula')
        if not re.search(r'[a-z]', value):
            raise ValidationError('Nova senha deve conter pelo menos uma letra minúscula')
        if not re.search(r'[0-9]', value):
            raise ValidationError('Nova senha deve conter pelo menos um número')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValidationError('Nova senha deve conter pelo menos um caractere especial')
    
    def validate(self, data, **kwargs):
        errors = {}
        if 'new_password' in data and 'confirm_password' in data:
            if data['new_password'] != data['confirm_password']:
                errors['confirm_password'] = ['Nova senha e confirmação não coincidem']
        if errors:
            raise ValidationError(errors)
        return data