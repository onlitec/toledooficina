import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Eye, EyeOff, Car, Users, Wrench, BarChart3, Mail, Lock, Shield, Phone } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password, formData.rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex">
      {/* Left Side - Branding and Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background with subtle pattern */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo and Brand */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mr-4">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">ERP Oficina</h1>
                <p className="text-blue-100 text-lg">Sistema de Gestão Automotiva</p>
              </div>
            </div>
            <p className="text-xl text-blue-50 leading-relaxed">
              Gerencie sua oficina com eficiência e profissionalismo. 
              Controle completo de clientes, veículos e serviços.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-3">
                <Users className="h-6 w-6 text-blue-200 mr-3" />
                <h3 className="text-lg font-semibold">Gestão de Clientes</h3>
              </div>
              <p className="text-blue-100">Cadastro completo e histórico detalhado de todos os seus clientes</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-3">
                <Wrench className="h-6 w-6 text-blue-200 mr-3" />
                <h3 className="text-lg font-semibold">Controle de Serviços</h3>
              </div>
              <p className="text-blue-100">Acompanhe orçamentos, serviços em andamento e histórico completo</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-3">
                <BarChart3 className="h-6 w-6 text-blue-200 mr-3" />
                <h3 className="text-lg font-semibold">Relatórios Avançados</h3>
              </div>
              <p className="text-blue-100">Análises detalhadas para tomada de decisões estratégicas</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-blue-200 text-sm">Clientes Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">1.2k+</div>
              <div className="text-blue-200 text-sm">Serviços Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">98%</div>
              <div className="text-blue-200 text-sm">Satisfação</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-600 rounded-2xl p-3 mr-3">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ERP Oficina</h1>
                <p className="text-gray-600">Sistema de Gestão</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Bem-vindo de volta</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Faça login para acessar o sistema
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 font-medium">
                    Usuário ou Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/70"
                      placeholder="Digite seu usuário ou email"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/70"
                      placeholder="Digite sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                      Lembrar de mim
                    </Label>
                  </div>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Esqueceu a senha?
                  </a>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <Car className="mr-2 h-5 w-5" />
                      Entrar no Sistema
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <div className="px-6 pb-6">
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      <span>Seguro</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>Suporte 24h</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    v2.1.0
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;