import { useState, useEffect } from 'react'
import { Settings, Building, Mail, Bell, Database, Save, Upload, Check, X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

export function ConfiguracoesCompletas() {
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
    usuario_smtp: '',
    senha_smtp: '',
    usar_tls: true,
    usar_ssl: false,
    email_remetente: '',
    nome_remetente: ''
  })

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Configure o sistema da sua oficina</p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>

        {/* Aba Empresa */}
        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>Configure os dados da sua oficina</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razao_social">Razão Social *</Label>
                  <Input
                    id="razao_social"
                    value={empresaData.razao_social}
                    onChange={(e) => setEmpresaData(prev => ({...prev, razao_social: e.target.value}))}
                    placeholder="Razão social da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                  <Input
                    id="nome_fantasia"
                    value={empresaData.nome_fantasia}
                    onChange={(e) => setEmpresaData(prev => ({...prev, nome_fantasia: e.target.value}))}
                    placeholder="Nome fantasia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={empresaData.cnpj}
                    onChange={(e) => setEmpresaData(prev => ({...prev, cnpj: e.target.value}))}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                  <Input
                    id="inscricao_estadual"
                    value={empresaData.inscricao_estadual}
                    onChange={(e) => setEmpresaData(prev => ({...prev, inscricao_estadual: e.target.value}))}
                    placeholder="Inscrição estadual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
                  <Input
                    id="inscricao_municipal"
                    value={empresaData.inscricao_municipal}
                    onChange={(e) => setEmpresaData(prev => ({...prev, inscricao_municipal: e.target.value}))}
                    placeholder="Inscrição municipal"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={salvarEmpresa} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Email */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Configurações de E-mail
              </CardTitle>
              <CardDescription>Configure o servidor SMTP para envio de emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servidor_smtp">Servidor SMTP *</Label>
                  <Input
                    id="servidor_smtp"
                    value={emailData.servidor_smtp}
                    onChange={(e) => setEmailData(prev => ({...prev, servidor_smtp: e.target.value}))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="usuario_smtp">Usuário SMTP *</Label>
                  <Input
                    id="usuario_smtp"
                    value={emailData.usuario_smtp}
                    onChange={(e) => setEmailData(prev => ({...prev, usuario_smtp: e.target.value}))}
                    placeholder="seu-email@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha_smtp">Senha SMTP *</Label>
                  <div className="relative">
                    <Input
                      id="senha_smtp"
                      type={showPassword ? "text" : "password"}
                      value={emailData.senha_smtp}
                      onChange={(e) => setEmailData(prev => ({...prev, senha_smtp: e.target.value}))}
                      placeholder="Senha ou token de aplicativo"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => alert('Teste de email')}>
                  Testar Configuração
                </Button>
                <Button onClick={() => alert('Salvar email')}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Notificações */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>Configure quando e como receber notificações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações de Notificações</h3>
                <p className="text-gray-600 mb-4">
                  Configure alertas por email, WhatsApp e outras notificações do sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Sistema */}
        <TabsContent value="sistema">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>Configurações gerais do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações do Sistema</h3>
                <p className="text-gray-600 mb-4">
                  Backup, usuários, permissões e outras configurações do sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
