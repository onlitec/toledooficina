import { useState, useEffect } from 'react'
import { useSystem } from '@/contexts/SystemContext'
import { User, Save, Eye, EyeOff, Lock, Mail, Phone, Calendar, Shield } from 'lucide-react'
import { useNotify } from '../ui/notification'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Perfil() {
  const notify = useNotify()
  const { user } = useSystem()
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estados para dados do perfil
  const [perfilData, setPerfilData] = useState({
    nome: '',
    email: '',
    telefone: '',
    username: ''
  })

  // Estados para alteração de senha
  const [senhaData, setSenhaData] = useState({
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: ''
  })

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setPerfilData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        username: user.username || ''
      })
    }
  }, [user])

  const handlePerfilSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(perfilData)
      })

      if (response.ok) {
        notify.success('Perfil atualizado com sucesso!')
      } else {
        const error = await response.json()
        notify.error(error.detail || 'Erro ao atualizar perfil')
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      notify.error('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSenhaSubmit = async (e) => {
    e.preventDefault()
    
    if (senhaData.nova_senha !== senhaData.confirmar_senha) {
      notify.error('As senhas não coincidem')
      return
    }

    if (senhaData.nova_senha.length < 6) {
      notify.error('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/alterar-senha', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          senha_atual: senhaData.senha_atual,
          nova_senha: senhaData.nova_senha
        })
      })

      if (response.ok) {
        notify.success('Senha alterada com sucesso!')
        setSenhaData({
          senha_atual: '',
          nova_senha: '',
          confirmar_senha: ''
        })
      } else {
        const error = await response.json()
        notify.error(error.detail || 'Erro ao alterar senha')
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      notify.error('Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'manager': return 'Gerente'
      default: return 'Usuário'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('pt-BR')
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais e configurações de conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Usuário */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-medium">{user?.nome || 'Usuário'}</h3>
                <p className="text-gray-600">@{user?.username}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nível de Acesso:</span>
                  <Badge className={getRoleColor(user?.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleLabel(user?.role)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Membro desde:</span>
                  <span className="text-sm">{formatDate(user?.created_at)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Último acesso:</span>
                  <span className="text-sm">{formatDate(user?.last_login)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulários */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Atualize suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePerfilSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={perfilData.nome}
                      onChange={(e) => setPerfilData(prev => ({...prev, nome: e.target.value}))}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <Input
                      id="username"
                      value={perfilData.username}
                      onChange={(e) => setPerfilData(prev => ({...prev, username: e.target.value}))}
                      placeholder="Seu nome de usuário"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={perfilData.email}
                        onChange={(e) => setPerfilData(prev => ({...prev, email: e.target.value}))}
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="telefone"
                        className="pl-10"
                        value={perfilData.telefone}
                        onChange={(e) => setPerfilData(prev => ({...prev, telefone: e.target.value}))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSenhaSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senha_atual">Senha Atual</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="senha_atual"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="pl-10 pr-10"
                      value={senhaData.senha_atual}
                      onChange={(e) => setSenhaData(prev => ({...prev, senha_atual: e.target.value}))}
                      placeholder="Digite sua senha atual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nova_senha">Nova Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="nova_senha"
                        type={showNewPassword ? 'text' : 'password'}
                        className="pl-10 pr-10"
                        value={senhaData.nova_senha}
                        onChange={(e) => setSenhaData(prev => ({...prev, nova_senha: e.target.value}))}
                        placeholder="Digite a nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmar_senha">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="confirmar_senha"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="pl-10 pr-10"
                        value={senhaData.confirmar_senha}
                        onChange={(e) => setSenhaData(prev => ({...prev, confirmar_senha: e.target.value}))}
                        placeholder="Confirme a nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>A senha deve ter pelo menos 6 caracteres.</p>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    <Lock className="h-4 w-4 mr-2" />
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}