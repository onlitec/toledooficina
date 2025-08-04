
import { useState, useEffect } from 'react'
<<<<<<< HEAD
import { useSystem } from '@/contexts/SystemContext'
import { Settings, Building, Mail, Bell, Database, Save, Upload, Eye, EyeOff, MessageCircle, AlertTriangle, Users } from 'lucide-react'
import { UsersAdmin } from './UsersAdmin'
import { useNotify } from '../ui/notification'
=======
import { Settings, Building, Mail, Bell, Database, Save, Upload, Eye, EyeOff, MessageCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)

export function Configuracoes() {
  const notify = useNotify()
  const [activeTab, setActiveTab] = useState('empresa')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { systemConfig, atualizarTituloEmpresa, atualizarLogotipo, carregarConfiguracoesDoSistema } = useSystem()

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

<<<<<<< HEAD
  const [sistemaData, setSistemaData] = useState({
    titulo_empresa: systemConfig.titulo_empresa,
    logotipo_arquivo: null,
    logotipo_info: systemConfig.logotipo_info
  })

  // Sincronizar com o contexto global
  useEffect(() => {
    setSistemaData(prev => ({
      ...prev,
      titulo_empresa: systemConfig.titulo_empresa,
      logotipo_info: systemConfig.logotipo_info
    }))
  }, [systemConfig])
=======
  const [notificacoesData, setNotificacoesData] = useState({
    notificar_nova_os: true,
    notificar_os_concluida: true,
    notificar_estoque_baixo: true,
    notificar_aniversario_cliente: false,
    notificar_manutencao_ferramenta: true,
    email_notificacoes: ''
  })

  const [sistemaData, setSistemaData] = useState({
    modo_producao: false,
    backup_automatico: true,
    frequencia_backup_dias: 7,
    caminho_backup: '/var/lib/erp_oficina/backups'
  })
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)

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
          // Garantir que todos os campos tenham valores string para evitar warnings do React
          setEmpresaData({
            razao_social: empresaResult.data.razao_social || '',
            nome_fantasia: empresaResult.data.nome_fantasia || '',
            cnpj: empresaResult.data.cnpj || '',
            inscricao_estadual: empresaResult.data.inscricao_estadual || '',
            inscricao_municipal: empresaResult.data.inscricao_municipal || '',
            telefone: empresaResult.data.telefone || '',
            celular: empresaResult.data.celular || '',
            email: empresaResult.data.email || '',
            site: empresaResult.data.site || '',
            endereco: empresaResult.data.endereco || '',
            numero: empresaResult.data.numero || '',
            complemento: empresaResult.data.complemento || '',
            bairro: empresaResult.data.bairro || '',
            cidade: empresaResult.data.cidade || '',
            estado: empresaResult.data.estado || '',
            cep: empresaResult.data.cep || '',
            logotipo_path: empresaResult.data.logotipo_path || ''
          })
        }
      }

      // Carregar configurações de email
      const emailResponse = await fetch('/api/configuracoes/email')
      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        if (emailResult.success) {
          // Garantir que todos os campos tenham valores apropriados para evitar warnings do React
          setEmailData({
            servidor_smtp: emailResult.data.servidor_smtp || '',
            porta_smtp: emailResult.data.porta_smtp || 587,
            usuario_email: emailResult.data.usuario_email || '',
            senha_email: emailResult.data.senha_email || '',
            usar_tls: emailResult.data.usar_tls !== undefined ? emailResult.data.usar_tls : true,
            email_remetente: emailResult.data.email_remetente || '',
            nome_remetente: emailResult.data.nome_remetente || ''
          })
        }
      }

<<<<<<< HEAD
      // Carregar configurações do sistema
      await carregarSistema()
=======
      // Carregar configurações de notificações
      const notificacoesResponse = await fetch('/api/configuracoes/notificacoes')
      if (notificacoesResponse.ok) {
        const notificacoesResult = await notificacoesResponse.json()
        if (notificacoesResult.success) {
          setNotificacoesData(notificacoesResult.data)
        }
      }

      // Carregar configurações do sistema
      const sistemaResponse = await fetch('/api/configuracoes/sistema')
      if (sistemaResponse.ok) {
        const sistemaResult = await sistemaResponse.json()
        if (sistemaResult.success) {
          setSistemaData(sistemaResult.data)
        }
      }
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)

    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar configurações.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const carregarSistema = async () => {
    try {
      // Carregar título da empresa
      const tituloResponse = await fetch('/api/configuracoes/sistema/titulo')
      if (tituloResponse.ok) {
        const tituloResult = await tituloResponse.json()
        if (tituloResult.success) {
          setSistemaData(prev => ({
            ...prev,
            titulo_empresa: tituloResult.data.titulo
          }))
        }
      }

      // Carregar informações do logotipo
      const logoResponse = await fetch('/api/configuracoes/sistema/logotipo')
      if (logoResponse.ok) {
        const logoResult = await logoResponse.json()
        if (logoResult.success) {
          setSistemaData(prev => ({
            ...prev,
            logotipo_info: logoResult.data
          }))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do sistema:', error)
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
<<<<<<< HEAD
        notify.success('Configurações da empresa salvas com sucesso!')
=======
        toast({ title: 'Sucesso', description: 'Configurações da empresa salvas com sucesso!' })
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
      } else {
        toast({ title: 'Erro', description: result.message, variant: 'destructive' })
      }
    } catch (error) {
<<<<<<< HEAD
      notify.error('Erro ao salvar configurações da empresa: ' + error.message)
=======
      toast({ title: 'Erro', description: 'Erro ao salvar configurações da empresa.', variant: 'destructive' })
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
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
<<<<<<< HEAD
        notify.success('Configurações de email salvas com sucesso!')
=======
        toast({ title: 'Sucesso', description: 'Configurações de email salvas com sucesso!' })
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
      } else {
        toast({ title: 'Erro', description: result.message, variant: 'destructive' })
      }
    } catch (error) {
<<<<<<< HEAD
      notify.error('Erro ao salvar configurações de email: ' + error.message)
=======
      toast({ title: 'Erro', description: 'Erro ao salvar configurações de email.', variant: 'destructive' })
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
    } finally {
      setLoading(false)
    }
  }

  const testarEmail = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracoes/email/teste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      })

      const result = await response.json()
      if (result.success) {
<<<<<<< HEAD
        notify.success('Email de teste enviado com sucesso!')
=======
        toast({ title: 'Sucesso', description: 'Email de teste enviado com sucesso!' })
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
      } else {
        toast({ title: 'Erro', description: result.message, variant: 'destructive' })
      }
    } catch (error) {
<<<<<<< HEAD
      notify.error('Erro ao testar email: ' + error.message)
=======
      toast({ title: 'Erro', description: 'Erro ao testar email.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const salvarNotificacoes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracoes/notificacoes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificacoesData)
      })

      const result = await response.json()
      if (result.success) {
        toast({ title: 'Sucesso', description: 'Configurações de notificações salvas com sucesso!' })
      } else {
        toast({ title: 'Erro', description: result.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar configurações de notificações.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const salvarSistema = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracoes/sistema', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sistemaData)
      })

      const result = await response.json()
      if (result.success) {
        toast({ title: 'Sucesso', description: 'Configurações do sistema salvas com sucesso!' })
      } else {
        toast({ title: 'Erro', description: result.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar configurações do sistema.', variant: 'destructive' })
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
    } finally {
      setLoading(false)
    }
  }

  const salvarSistema = async () => {
    try {
      setLoading(true)

      // Salvar título da empresa
      const response = await fetch("/api/configuracoes/sistema/titulo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ titulo: sistemaData.titulo_empresa })
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message)
      }

      notify.success("Configurações do sistema salvas com sucesso!")

      // Atualizar contexto global
      atualizarTituloEmpresa(sistemaData.titulo_empresa)

      // Recarregar configurações para atualizar outros componentes
      await carregarConfiguracoesDoSistema()
    } catch (error) {
      notify.error("Erro ao salvar configurações do sistema: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const uploadLogotipo = async (file) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('logotipo', file)

      const response = await fetch('/api/configuracoes/sistema/logotipo', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        notify.success('Logotipo enviado com sucesso!')
        // Atualizar informações do logotipo
        const logoInfo = {
          tem_logotipo: true,
          url_logotipo: result.data.url_logotipo,
          nome_arquivo: result.data.nome_arquivo
        }
        setSistemaData(prev => ({
          ...prev,
          logotipo_info: logoInfo
        }))
        // Atualizar contexto global
        atualizarLogotipo(logoInfo)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      notify.error('Erro ao enviar logotipo: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const removerLogotipo = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracoes/sistema/logotipo', {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        notify.success('Logotipo removido com sucesso!')
        // Limpar informações do logotipo
        const logoInfo = {
          tem_logotipo: false,
          url_logotipo: null,
          nome_arquivo: null
        }
        setSistemaData(prev => ({
          ...prev,
          logotipo_info: logoInfo
        }))
        // Atualizar contexto global
        atualizarLogotipo(logoInfo)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      notify.error('Erro ao remover logotipo: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Verificar tamanho do arquivo
      if (file.size > 2 * 1024 * 1024) {
        notify.error('Arquivo muito grande. Máximo 2MB.')
        return
      }

      // Verificar tipo do arquivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        notify.error('Tipo de arquivo não permitido. Use PNG, JPG, GIF ou WebP.')
        return
      }

      uploadLogotipo(file)
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
              onClick={() => setActiveTab('usuarios')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'usuarios'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Usuários
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
                    <Label htmlFor="razao_social">Razão Social *</Label>
                    <Input
                      id="razao_social"
                      type="text"
                      value={empresaData.razao_social}
                      onChange={(e) => setEmpresaData(prev => ({...prev, razao_social: e.target.value}))}
                      placeholder="Razão social da empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                    <Input
                      id="nome_fantasia"
                      type="text"
                      value={empresaData.nome_fantasia}
                      onChange={(e) => setEmpresaData(prev => ({...prev, nome_fantasia: e.target.value}))}
                      placeholder="Nome fantasia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      type="text"
                      value={empresaData.cnpj}
                      onChange={(e) => setEmpresaData(prev => ({...prev, cnpj: e.target.value}))}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
=======
                    <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                    <Input
                      id="inscricao_estadual"
                      type="text"
                      value={empresaData.inscricao_estadual}
                      onChange={(e) => setEmpresaData(prev => ({...prev, inscricao_estadual: e.target.value}))}
                      placeholder="Inscrição estadual"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
                    <Input
                      id="inscricao_municipal"
                      type="text"
                      value={empresaData.inscricao_municipal}
                      onChange={(e) => setEmpresaData(prev => ({...prev, inscricao_municipal: e.target.value}))}
                      placeholder="Inscrição municipal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
                      type="text"
                      value={empresaData.telefone}
                      onChange={(e) => setEmpresaData(prev => ({...prev, telefone: e.target.value}))}
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
=======
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      type="text"
                      value={empresaData.celular}
                      onChange={(e) => setEmpresaData(prev => ({...prev, celular: e.target.value}))}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
                      type="email"
                      value={empresaData.email}
                      onChange={(e) => setEmpresaData(prev => ({...prev, email: e.target.value}))}
                      placeholder="contato@empresa.com"
                    />
                  </div>
<<<<<<< HEAD
=======
                  <div>
                    <Label htmlFor="site">Site</Label>
                    <Input
                      id="site"
                      type="text"
                      value={empresaData.site}
                      onChange={(e) => setEmpresaData(prev => ({...prev, site: e.target.value}))}
                      placeholder="https://www.empresa.com"
                    />
                  </div>
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      type="text"
                      value={empresaData.endereco}
                      onChange={(e) => setEmpresaData(prev => ({...prev, endereco: e.target.value}))}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      type="text"
                      value={empresaData.numero}
                      onChange={(e) => setEmpresaData(prev => ({...prev, numero: e.target.value}))}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      type="text"
                      value={empresaData.complemento}
                      onChange={(e) => setEmpresaData(prev => ({...prev, complemento: e.target.value}))}
                      placeholder="Apto, Sala, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      type="text"
                      value={empresaData.bairro}
                      onChange={(e) => setEmpresaData(prev => ({...prev, bairro: e.target.value}))}
                      placeholder="Centro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      type="text"
                      value={empresaData.cidade}
                      onChange={(e) => setEmpresaData(prev => ({...prev, cidade: e.target.value}))}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      type="text"
                      value={empresaData.estado}
                      onChange={(e) => setEmpresaData(prev => ({...prev, estado: e.target.value}))}
                      placeholder="SP"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      type="text"
                      value={empresaData.cep}
                      onChange={(e) => setEmpresaData(prev => ({...prev, cep: e.target.value}))}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logotipo_path">Logotipo (URL)</Label>
                  <Input
                    id="logotipo_path"
                    type="text"
                    value={empresaData.logotipo_path}
                    onChange={(e) => setEmpresaData(prev => ({...prev, logotipo_path: e.target.value}))}
                    placeholder="https://seusite.com/logo.png"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={salvarEmpresa}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
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
                    <Label htmlFor="servidor_smtp">Servidor SMTP *</Label>
                    <Input
                      id="servidor_smtp"
                      type="text"
                      value={emailData.servidor_smtp}
                      onChange={(e) => setEmailData(prev => ({...prev, servidor_smtp: e.target.value}))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="porta_smtp">Porta SMTP *</Label>
                    <Input
                      id="porta_smtp"
                      type="number"
                      value={emailData.porta_smtp}
                      onChange={(e) => setEmailData(prev => ({...prev, porta_smtp: parseInt(e.target.value)}))}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="usuario_email">Usuário SMTP *</Label>
                    <Input
                      id="usuario_email"
                      type="text"
                      value={emailData.usuario_email}
                      onChange={(e) => setEmailData(prev => ({...prev, usuario_email: e.target.value}))}
                      placeholder="seu-email@gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="senha_email">Senha SMTP *</Label>
                    <div className="relative">
                      <Input
                        id="senha_email"
                        type={showPassword ? "text" : "password"}
                        value={emailData.senha_email}
                        onChange={(e) => setEmailData(prev => ({...prev, senha_email: e.target.value}))}
                        placeholder="Sua senha de email"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="usar_tls"
                      checked={emailData.usar_tls}
                      onCheckedChange={(checked) => setEmailData(prev => ({...prev, usar_tls: checked}))}
                    />
                    <Label htmlFor="usar_tls">Usar TLS/SSL</Label>
                  </div>
                  <div>
                    <Label htmlFor="email_remetente">Email Remetente</Label>
                    <Input
                      id="email_remetente"
                      type="email"
                      value={emailData.email_remetente}
                      onChange={(e) => setEmailData(prev => ({...prev, email_remetente: e.target.value}))}
                      placeholder="email-de-envio@empresa.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_remetente">Nome Remetente</Label>
                  <Input
                    id="nome_remetente"
                    type="text"
                    value={emailData.nome_remetente}
                    onChange={(e) => setEmailData(prev => ({...prev, nome_remetente: e.target.value}))}
                    placeholder="Nome da sua Oficina"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={testarEmail}
                    disabled={loading}
                    variant="outline"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {loading ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                  <Button
                    onClick={salvarEmail}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
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
                Configurações de Notificações
              </h3>
              <p className="text-sm text-gray-600 mb-6">Configure quais eventos devem gerar notificações</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificar_nova_os"
                      checked={notificacoesData.notificar_nova_os}
                      onCheckedChange={(checked) => setNotificacoesData(prev => ({...prev, notificar_nova_os: checked}))}
                    />
                    <Label htmlFor="notificar_nova_os">Notificar Nova Ordem de Serviço</Label>
                  </div>
<<<<<<< HEAD
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-mails para notificações (separados por vírgula)
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="admin@oficina.com, gerente@oficina.com"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900">Eventos de OS</h5>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                          <span className="ml-2 text-sm text-gray-700">Nova OS criada</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                          <span className="ml-2 text-sm text-gray-700">OS concluída</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                          <span className="ml-2 text-sm text-gray-700">Estoque baixo</span>
                        </label>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900">WhatsApp</h5>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
                          <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="https://api.whatsapp.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                          <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Token da API" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                          <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="+5511999999999" />
                        </div>
                      </div>
                    </div>
=======
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificar_os_concluida"
                      checked={notificacoesData.notificar_os_concluida}
                      onCheckedChange={(checked) => setNotificacoesData(prev => ({...prev, notificar_os_concluida: checked}))}
                    />
                    <Label htmlFor="notificar_os_concluida">Notificar OS Concluída</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificar_estoque_baixo"
                      checked={notificacoesData.notificar_estoque_baixo}
                      onCheckedChange={(checked) => setNotificacoesData(prev => ({...prev, notificar_estoque_baixo: checked}))}
                    />
                    <Label htmlFor="notificar_estoque_baixo">Notificar Estoque Baixo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificar_aniversario_cliente"
                      checked={notificacoesData.notificar_aniversario_cliente}
                      onCheckedChange={(checked) => setNotificacoesData(prev => ({...prev, notificar_aniversario_cliente: checked}))}
                    />
                    <Label htmlFor="notificar_aniversario_cliente">Notificar Aniversário de Cliente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificar_manutencao_ferramenta"
                      checked={notificacoesData.notificar_manutencao_ferramenta}
                      onCheckedChange={(checked) => setNotificacoesData(prev => ({...prev, notificar_manutencao_ferramenta: checked}))}
                    />
                    <Label htmlFor="notificar_manutencao_ferramenta">Notificar Manutenção de Ferramenta</Label>
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_notificacoes">Enviar Notificações para o E-mail</Label>
                  <Input
                    id="email_notificacoes"
                    type="email"
                    value={notificacoesData.email_notificacoes}
                    onChange={(e) => setNotificacoesData(prev => ({...prev, email_notificacoes: e.target.value}))}
                    placeholder="email-para-notificacoes@empresa.com"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={salvarNotificacoes}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </div>
              </div>
<<<<<<< HEAD
            </div>
          </div>
        )}

        {/* Aba Usuários */}
        {activeTab === 'usuarios' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                <Users className="h-5 w-5 inline mr-2" />
                Gerenciamento de Usuários
              </h3>
              <p className="text-sm text-gray-600 mb-6">Cadastre, edite e gerencie usuários do sistema</p>
              
              <UsersAdmin />
=======
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
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
<<<<<<< HEAD
              <p className="text-sm text-gray-600 mb-6">Configure título da empresa e logotipo</p>
              
              <div className="space-y-8">
#                {/* Seç
o Identidade Visual */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center mb-4">
                    <Building className="h-5 w-5 text-purple-500 mr-2" />
                    <h4 className="text-lg font-medium text-gray-900">Identidade Visual</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título da Empresa (aparece ao lado do logotipo)
                      </label>
                      <input
                        type="text"
                        value={sistemaData.titulo_empresa}
                        onChange={(e) => setSistemaData(prev => ({...prev, titulo_empresa: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ex: Oficina Toledo - Mecânica Automotiva"
                      />
                      <p className="text-xs text-gray-500 mt-1">Este título aparecerá no cabeçalho do sistema ao lado do logotipo</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logotipo da Empresa
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                              <span>Fazer upload de arquivo</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={loading}
                              />
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF até 2MB</p>
                        </div>
                      </div>

                      {/* Preview do logotipo atual */}
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Logotipo atual:</p>
                        <div className="w-32 h-32 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                          {sistemaData.logotipo_info?.tem_logotipo ? (
                            <div className="relative w-full h-full">
                              <img
                                src={sistemaData.logotipo_info.url_logotipo}
                                alt="Logotipo da empresa"
                                className="w-full h-full object-contain"
                              />
                              <button
                                onClick={removerLogotipo}
                                disabled={loading}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                title="Remover logotipo"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Nenhum logotipo</span>
                          )}
                        </div>
                        {sistemaData.logotipo_info?.nome_arquivo && (
                          <p className="text-xs text-gray-500 mt-1">
                            Arquivo: {sistemaData.logotipo_info.nome_arquivo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={salvarSistema}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
=======
              <p className="text-sm text-gray-600 mb-6">Configurações gerais do sistema e banco de dados</p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="modo_producao"
                    checked={sistemaData.modo_producao}
                    onCheckedChange={(checked) => setSistemaData(prev => ({...prev, modo_producao: checked}))}
                  />
                  <Label htmlFor="modo_producao">Modo de Produção (Ativar para ambiente de produção)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="backup_automatico"
                    checked={sistemaData.backup_automatico}
                    onCheckedChange={(checked) => setSistemaData(prev => ({...prev, backup_automatico: checked}))}
                  />
                  <Label htmlFor="backup_automatico">Backup Automático do Banco de Dados</Label>
                </div>
                {sistemaData.backup_automatico && (
                  <div className="space-y-2">
                    <Label htmlFor="frequencia_backup_dias">Frequência de Backup (dias)</Label>
                    <Input
                      id="frequencia_backup_dias"
                      type="number"
                      value={sistemaData.frequencia_backup_dias}
                      onChange={(e) => setSistemaData(prev => ({...prev, frequencia_backup_dias: parseInt(e.target.value)}))}
                      placeholder="7"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="caminho_backup">Caminho do Backup</Label>
                  <Input
                    id="caminho_backup"
                    type="text"
                    value={sistemaData.caminho_backup}
                    onChange={(e) => setSistemaData(prev => ({...prev, caminho_backup: e.target.value}))}
                    placeholder="/var/lib/erp_oficina/backups"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={salvarSistema}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


