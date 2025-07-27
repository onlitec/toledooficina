import { useState, useEffect } from 'react'
import { Settings, Building, Mail, Bell, Database, Save, Upload, Eye, EyeOff } from 'lucide-react'

export function Configuracoes() {
  const [activeTab, setActiveTab] = useState('empresa')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Estados para cada seção
  const [empresaData, setEmpresaData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    telefone: '',
    celular: '',
    email: '',
    site: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    logotipo_path: ''
  })

  const [emailData, setEmailData] = useState({
    servidor_smtp: '',
    porta_smtp: 587,
    usuario_email: '',
    senha_email: '',
    usar_tls: true,
    email_remetente: '',
    nome_remetente: ''
  })

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarConfiguracoes()
  }, [])

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true)
      
      // Carregar configurações da empresa
      const empresaResponse = await fetch('/api/configuracoes/empresa')
      if (empresaResponse.ok) {
        const empresaResult = await empresaResponse.json()
        if (empresaResult.success) {
          setEmpresaData(empresaResult.data)
        }
      }

      // Carregar configurações de email
      const emailResponse = await fetch('/api/configuracoes/email')
      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        if (emailResult.success) {
          setEmailData(emailResult.data)
        }
      }

    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const salvarEmpresa = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracoes/empresa', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(empresaData)
      })

      const result = await response.json()
      if (result.success) {
        alert('Configurações da empresa salvas com sucesso!')
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      alert('Erro ao salvar configurações da empresa: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const salvarEmail = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracoes/email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      })

      const result = await response.json()
      if (result.success) {
        alert('Configurações de email salvas com sucesso!')
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      alert('Erro ao salvar configuraeeeees de email: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testarEmail = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracoes/email/testar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      })

      const result = await response.json()
      if (result.success) {
        alert('Email de teste enviado com sucesso!')
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      alert('Erro ao testar email: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Configure o sistema da sua oficina</p>
      </div>

      <div className="space-y-6">
        {/* Navegação por abas */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('empresa')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'empresa'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className="h-4 w-4 inline mr-2" />
              Empresa
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'email'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mail className="h-4 w-4 inline mr-2" />
              E-mail
            </button>
            <button
              onClick={() => setActiveTab('notificacoes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notificacoes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="h-4 w-4 inline mr-2" />
              Notificações
            </button>
            <button
              onClick={() => setActiveTab('sistema')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sistema'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="h-4 w-4 inline mr-2" />
              Sistema
            </button>
          </nav>
        </div>

        {/* Aba Empresa */}
        {activeTab === 'empresa' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                <Building className="h-5 w-5 inline mr-2" />
                Dados da Empresa
              </h3>
              <p className="text-sm text-gray-600 mb-6">Configure os dados da sua oficina</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razão Social *
                    </label>
                    <input
                      type="text"
                      value={empresaData.razao_social}
                      onChange={(e) => setEmpresaData(prev => ({...prev, razao_social: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Razão social da empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Fantasia
                    </label>
                    <input
                      type="text"
                      value={empresaData.nome_fantasia}
                      onChange={(e) => setEmpresaData(prev => ({...prev, nome_fantasia: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome fantasia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={empresaData.cnpj}
                      onChange={(e) => setEmpresaData(prev => ({...prev, cnpj: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inscrição Estadual
                    </label>
                    <input
                      type="text"
                      value={empresaData.inscricao_estadual}
                      onChange={(e) => setEmpresaData(prev => ({...prev, inscricao_estadual: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Inscrição estadual"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inscrição Municipal
                    </label>
                    <input
                      type="text"
                      value={empresaData.inscricao_municipal}
                      onChange={(e) => setEmpresaData(prev => ({...prev, inscricao_municipal: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Inscrição municipal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={empresaData.telefone}
                      onChange={(e) => setEmpresaData(prev => ({...prev, telefone: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Celular
                    </label>
                    <input
                      type="text"
                      value={empresaData.celular}
                      onChange={(e) => setEmpresaData(prev => ({...prev, celular: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={empresaData.email}
                      onChange={(e) => setEmpresaData(prev => ({...prev, email: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site
                    </label>
                    <input
                      type="text"
                      value={empresaData.site}
                      onChange={(e) => setEmpresaData(prev => ({...prev, site: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://www.empresa.com"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={salvarEmpresa}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba Email */}
        {activeTab === 'email' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                <Mail className="h-5 w-5 inline mr-2" />
                Configurações de E-mail
              </h3>
              <p className="text-sm text-gray-600 mb-6">Configure o servidor SMTP para envio de emails</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Servidor SMTP *
                    </label>
                    <input
                      type="text"
                      value={emailData.servidor_smtp}
                      onChange={(e) => setEmailData(prev => ({...prev, servidor_smtp: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Porta SMTP *
                    </label>
                    <input
                      type="number"
                      value={emailData.porta_smtp}
                      onChange={(e) => setEmailData(prev => ({...prev, porta_smtp: parseInt(e.target.value)}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usuário SMTP *
                    </label>
                    <input
                      type="text"
                      value={emailData.usuario_email}
                      onChange={(e) => setEmailData(prev => ({...prev, usuario_email: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="seu-email@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha SMTP *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={emailData.senha_email}
                        onChange={(e) => setEmailData(prev => ({...prev, senha_email: e.target.value}))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Senha ou token de aplicativo"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={testarEmail}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Testar Configuração
                  </button>
                  <button
                    onClick={salvarEmail}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba Notificações */}
        {activeTab === 'notificacoes' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                <Bell className="h-5 w-5 inline mr-2" />
                Configurações de Notificaeeeees
              </h3>
              <p className="text-sm text-gray-600 mb-6">Configure quando e como receber notificações</p>
              
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Configuraçeeeees de Notificações</h3>
                <p className="text-gray-600 mb-4">
                  Configure alertas por email, WhatsApp e outras notificaçeeeees do sistema.
                </p>
                <p className="text-sm text-gray-500">Em desenvolvimento...</p>
              </div>
            </div>
          </div>
        )}

        {/* Aba Sistema */}
        {activeTab === 'sistema' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                <Database className="h-5 w-5 inline mr-2" />
                Configurações do Sistema
              </h3>
              <p className="text-sm text-gray-600 mb-6">Configurações gerais do sistema</p>
              
              <div className="text-center py-12">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações do Sistema</h3>
                <p className="text-gray-600 mb-4">
                  Backup, usuários, permissões e outras configurações do sistema.
                </p>
                <p className="text-sm text-gray-500">Em desenvolvimento...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
