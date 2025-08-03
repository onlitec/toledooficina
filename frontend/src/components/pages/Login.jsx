import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Eye, EyeOff, Settings, Shield, Zap, Users, BarChart3, Wrench, Car, Clock, TrendingUp, Award, Lock, Mail } from 'lucide-react'
import { useSystem } from '../../contexts/SystemContext'
import { apiPost } from '../../utils/api'

export function Login() {
  const navigate = useNavigate()
  const { login } = useSystem()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember_me: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Limpar erro quando usuário começar a digitar
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validações básicas
      if (!formData.username.trim()) {
        setError('Username é obrigatório')
        return
      }
      if (!formData.password) {
        setError('Senha é obrigatória')
        return
      }

      const response = await apiPost('/auth/login', {
        username: formData.username.trim(),
        password: formData.password,
        remember_me: formData.remember_me
      })

      const data = await response.json()

      if (data.success) {
        // Atualizar contexto com access token e refresh token
        login(data.user, data.access_token, data.refresh_token)
        
        // Redirecionar para dashboard
        navigate('/dashboard')
      } else {
        setError(data.message || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
      
      <div className="relative min-h-screen flex">
        {/* Lado Esquerdo - Branding e Informações */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white relative">
          {/* Decorative Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl"></div>
          
          <div className="max-w-lg text-center space-y-8 z-10">
            {/* Logo Principal */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Car className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* Título e Descrição */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                ERP Oficina
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Transforme sua oficina com tecnologia de ponta
              </p>
              <p className="text-blue-200/80">
                Gestão completa, controle total, resultados excepcionais
              </p>
            </div>
             
             {/* Features Grid */}
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                 <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center mb-3">
                   <Clock className="w-5 h-5 text-blue-300" />
                 </div>
                 <h3 className="font-semibold text-white mb-1">Gestão Ágil</h3>
                 <p className="text-xs text-blue-200">Processos otimizados</p>
               </div>
               
               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                 <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center mb-3">
                   <TrendingUp className="w-5 h-5 text-green-300" />
                 </div>
                 <h3 className="font-semibold text-white mb-1">Crescimento</h3>
                 <p className="text-xs text-blue-200">Resultados comprovados</p>
               </div>
               
               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                 <div className="w-10 h-10 bg-purple-400/20 rounded-lg flex items-center justify-center mb-3">
                   <Award className="w-5 h-5 text-purple-300" />
                 </div>
                 <h3 className="font-semibold text-white mb-1">Qualidade</h3>
                 <p className="text-xs text-blue-200">Padrão premium</p>
               </div>
               
               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                 <div className="w-10 h-10 bg-orange-400/20 rounded-lg flex items-center justify-center mb-3">
                   <Shield className="w-5 h-5 text-orange-300" />
                 </div>
                 <h3 className="font-semibold text-white mb-1">Segurança</h3>
                 <p className="text-xs text-blue-200">Dados protegidos</p>
               </div>
             </div>
             
             {/* Stats */}
             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
               <div className="grid grid-cols-3 gap-4 text-center">
                 <div>
                   <div className="text-2xl font-bold text-white">1000+</div>
                   <div className="text-xs text-blue-200">Oficinas</div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-white">99.9%</div>
                   <div className="text-xs text-blue-200">Uptime</div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-white">24/7</div>
                   <div className="text-xs text-blue-200">Suporte</div>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* Lado Direito - Formulário de Login */}
        <div className="lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Header Mobile */}
            <div className="text-center mb-8 lg:hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl mx-auto flex items-center justify-center mb-4">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">ERP Oficina</h1>
              <p className="text-blue-200 mt-1">Sistema de Gestão</p>
            </div>

            {/* Card do Formulário */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8 space-y-6">
              {/* Header do Formulário */}
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Acesso ao Sistema</h2>
                <p className="text-gray-600">Entre com suas credenciais</p>
              </div>
            
            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
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
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
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
                    className="h-12 px-4 bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 text-gray-800 placeholder-gray-500"
                    placeholder="Digite seu username ou email"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
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
                    className="h-12 px-4 pr-12 bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 text-gray-800 placeholder-gray-500"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Opções */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    checked={formData.remember_me}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="remember_me" className="text-sm text-gray-600">
                    Lembrar-me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <Car className="w-5 h-5" />
                    <span>Entrar no Sistema</span>
                  </>
                )}
              </Button>
            </form>

            {/* Footer do Card */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Suporte técnico disponível 24/7
                </p>
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 mt-2">
                  <span>v2.0</span>
                  <span>•</span>
                  <span>Seguro</span>
                  <span>•</span>
                  <span>Confiável</span>
                </div>
              </div>
            </div>
           </div>

           {/* Informações do Sistema */}
           <div className="text-center text-xs text-white/70 mt-6">
             <p>ERP Oficina Mecânica</p>
             <p>Sistema completo para gestão de oficinas</p>
           </div>
         </div>
       </div>
     </div>
   </div>
  )
}
