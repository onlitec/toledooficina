import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { SystemContext } from '../../context/SystemContext'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useContext(SystemContext)
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
      const success = await login(formData)
      if (success) {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Lado Esquerdo - Decorativo */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-8 p-8">
          <div className="relative">
            {/* Círculos decorativos */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
            
            {/* Ícone principal */}
            <div className="relative z-10 w-48 h-48 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">ERP Oficina</h1>
            <p className="text-xl text-gray-600 max-w-md">
              Sistema completo para gestão de oficinas mecânicas
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Seguro</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Confiável</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Moderno</span>
              </span>
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-800">Bem-vindo de volta!</h2>
              <p className="text-gray-600">Faça login para acessar o sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

               <div className="space-y-2">
                 <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username ou Email</Label>
                 <Input
                   id="username"
                   name="username"
                   type="text"
                   value={formData.username}
                   onChange={handleChange}
                   placeholder="Digite seu username ou email"
                   disabled={loading}
                   autoComplete="username"
                   className="h-12 px-4 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</Label>
                 <div className="relative">
                   <Input
                     id="password"
                     name="password"
                     type={showPassword ? 'text' : 'password'}
                     value={formData.password}
                     onChange={handleChange}
                     placeholder="Digite sua senha"
                     disabled={loading}
                     autoComplete="current-password"
                     className="h-12 px-4 pr-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                   <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                     onClick={() => setShowPassword(!showPassword)}
                     disabled={loading}
                   >
                     {showPassword ? (
                       <EyeOff className="h-4 w-4 text-gray-400" />
                     ) : (
                       <Eye className="h-4 w-4 text-gray-400" />
                     )}
                   </Button>
                 </div>
               </div>

               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                   <input
                     id="remember_me"
                     name="remember_me"
                     type="checkbox"
                     checked={formData.remember_me}
                     onChange={handleChange}
                     disabled={loading}
                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                   />
                   <Label htmlFor="remember_me" className="text-sm text-gray-600">
                     Manter-me conectado
                   </Label>
                 </div>
                 <a href="#" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                   Esqueceu a senha?
                 </a>
               </div>

               <Button
                 type="submit"
                 className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                 disabled={loading}
               >
                 {loading ? (
                   <div className="flex items-center space-x-2">
                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     <span>Entrando...</span>
                   </div>
                 ) : (
                   'Entrar'
                 )}
               </Button>
             </form>
           </div>

           {/* Informações do Sistema */}
           <div className="text-center text-sm text-gray-500">
             <p>ERP Oficina Mecânica v1.0</p>
             <p>Sistema completo para gestão de oficinas</p>
           </div>
         </div>
       </div>
     </div>
   )
 }