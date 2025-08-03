import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Eye, EyeOff, Settings, Shield, Zap, Users, BarChart3, Wrench } from 'lucide-react'
import { useSystem } from '../../contexts/SystemContext'
import { apiPost } from '../../utils/api'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useSystem()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember_me: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiPost('/auth/login', {
        username: formData.username,
        password: formData.password,
        remember_me: formData.remember_me
      })

      if (response.success) {
        // Armazenar dados do usuário
        const userData = {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          role: response.user.role,
          permissions: response.user.permissions || []
        }
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Armazenar token
        if (response.token) {
          localStorage.setItem('token', response.token)
        }
        
        // Redirecionar para dashboard
        navigate('/dashboard')
      } else {
        setError(response.message || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Lado Esquerdo - Branding e Recursos */}
        <div className="hidden lg:block space-y-8">
          {/* Logo e Título Principal */}
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl mx-auto flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Wrench className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4">
                ERP Oficina
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                Sistema Completo de Gestão para Oficinas Mecânicas
              </p>
            </div>
          </div>

          {/* Cards de Recursos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Gestão de Clientes</h3>
              <p className="text-sm text-gray-600">Controle completo de clientes e histórico de serviços</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Ordens de Serviço</h3>
              <p className="text-sm text-gray-600">Acompanhe todos os serviços em andamento</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Relatórios</h3>
              <p className="text-sm text-gray-600">Análises detalhadas e insights financeiros</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Automação</h3>
              <p className="text-sm text-gray-600">Processos automatizados para maior eficiência</p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Oficinas Ativas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">Suporte</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário de Login */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Header Mobile */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">ERP Oficina</h1>
            <p className="text-gray-600 mt-2">Sistema de Gestão para Oficinas</p>
          </div>

          {/* Card do Formulário */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6">
            {/* Header do Formulário */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-800">Bem-vindo!</h2>
              <p className="text-gray-600">Faça login para acessar sua conta</p>
            </div>
            
            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-red-800 font-medium">Erro de autenticação</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Username */}
              <div className="space-y-3">
                <Label htmlFor="username" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Username ou Email</span>
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="h-14 px-4 bg-gray-50/50 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl transition-all duration-200 text-gray-800 placeholder-gray-400"
                    placeholder="Digite seu username ou email"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Senha</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="h-14 px-4 pr-14 bg-gray-50/50 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl transition-all duration-200 text-gray-800 placeholder-gray-400"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Opções */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    checked={formData.remember_me}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-300 rounded-lg transition-colors"
                  />
                  <Label htmlFor="remember_me" className="text-sm text-gray-600 font-medium">
                    Lembrar por 30 dias
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-5 h-5" />
                    <span>Entrar no Sistema</span>
                  </>
                )}
              </Button>
            </form>

            {/* Footer do Card */}
            <div className="pt-6 border-t border-gray-100">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-500">
                  Precisa de ajuda? Entre em contato com o suporte
                </p>
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                  <span>Versão 2.0</span>
                  <span>•</span>
                  <span>Seguro & Confiável</span>
                  <span>•</span>
                  <span>24/7 Suporte</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}