import { useState, useEffect } from 'react'
import { Settings, Building, Mail, Bell, Database, Save, Upload, Eye, EyeOff, Phone, MessageCircle, AlertTriangle } from 'lucide-react'

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

  const [notificacoesData, setNotificacoesData] = useState({
    // Notificações por Email
    email_ativo: true,
    email_destinatarios: '',
    notificar_nova_os: true,
    notificar_os_concluida: true,
    notificar_os_cancelada: true,
    notificar_vencimento_os: true,
    notificar_baixo_estoque: true,
    notificar_contas_vencer: true,
    notificar_contas_vencidas: true,
    notificar_backup: true,
    
    // Notificações por WhatsApp
    whatsapp_ativo: false,
    whatsapp_api_url: '',
    whatsapp_token: '',
    whatsapp_numero_destino: '',
    whatsapp_template_nova_os: 'Nova OS #{numero} criada para {cliente}',
    whatsapp_template_os_concluida: 'OS #{numero} concluída. Cliente: {cliente}',
    
    // Configurações de tempo
    dias_aviso_vencimento_os: 3,
    dias_aviso_vencimento_contas: 7,
    nivel_minimo_estoque: 5,
    
    // Horários de envio
    horario_inicio_notificacoes: '08:00',
    horario_fim_notificacoes: '18:00',
    enviar_fins_semana: false
  })

  const [sistemaData, setSistemaData] = useState({
    backup_automatico: true,
    intervalo_backup: 'diario',
    manter_backups: 30,
    debug_ativo: false,
    log_nivel: 'INFO',
    manutencao_ativa: false
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

      // Carregar configuraçeeeees de email
      const emailResponse = await fetch('/api/configuracoes/email')
      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        if (emailResult.success) {
          setEmailData(emailResult.data)
        }
      }

      // Carregar configurações de notificações
      const notifResponse = await fetch('/api/configuracoes/notificacoes')
      if (notifResponse.ok) {
        const notifResult = await notifResponse.json()
        if (notifResult.success) {
          setNotificacoesData(prev => ({...prev, ...notifResult.data}))
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
      alert('Erro ao salvar configurações de email: ' + error.message)
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
        alert('Configurações de notificações salvas com sucesso!')
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      alert('Erro ao salvar configurações de notificações: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testarWhatsApp = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracoes/whatsapp/testar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_url: notificacoesData.whatsapp_api_url,
          token: notificacoesData.whatsapp_token,
          numero_destino: notificacoesData.whatsapp_numero_destino
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('Mensagem de teste enviada via WhatsApp!')
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      alert('Erro ao testar WhatsApp: ' + error.message)
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
