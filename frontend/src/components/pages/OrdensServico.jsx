import { useState, useEffect } from 'react'
<<<<<<< HEAD
import { Plus, Search, Edit, Trash2, ArrowLeft, Save, FileText, User, Calendar, DollarSign } from 'lucide-react'
import { useNotify } from '@/components/ui/notification'
import { useConfirm } from '@/components/ui/confirmation-dialog'

export function OrdensServico() {
  const notify = useNotify()
  const confirm = useConfirm()
  const [searchTerm, setSearchTerm] = useState('')
  const [osList, setOsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingOs, setEditingOs] = useState(null)
  const [clientes, setClientes] = useState([])
  const [veiculos, setVeiculos] = useState([])

  // Estados para o formulário inline
  const [osData, setOsData] = useState({
    cliente_id: '',
    veiculo_id: '',
    data_abertura: new Date().toISOString().split('T')[0],
    data_prevista: '',
    descricao_problema: '',
    observacoes: '',
    status: 'aberta',
    prioridade: 'media',
    valor_total: '',
    desconto: '',
    servicos: [],
    pecas: []
  })

  useEffect(() => {
    loadOs()
    loadClientes()
  }, [searchTerm])

  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      const result = await response.json()
      if (result.success) {
        setClientes(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }

  const loadVeiculos = async (clienteId) => {
    // Validar se clienteId é válido antes de fazer a chamada
    if (!clienteId || clienteId === '' || clienteId === null || clienteId === undefined) {
      setVeiculos([])
      return
    }
    
    try {
      const response = await fetch(`/api/veiculos?cliente_id=${clienteId}`)
      const result = await response.json()
      if (result.success) {
        setVeiculos(result.data)
      } else {
        setVeiculos([])
      }
    } catch (error) {
      console.error('Erro ao carregar veículos:', error)
      setVeiculos([])
    }
  }

  const loadOs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      const response = await fetch(`/api/ordens-servico?${params}`)
      const json = await response.json()
      if (json.success) setOsList(json.data)
    } catch (error) {
      console.error('Erro ao carregar ordens de serviço:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNovaOs = () => {
    setEditingOs(null)
    setOsData({
      cliente_id: '',
      veiculo_id: '',
      data_abertura: new Date().toISOString().split('T')[0],
      data_prevista: '',
      descricao_problema: '',
      observacoes: '',
      status: 'aberta',
      prioridade: 'media',
      valor_total: '',
      desconto: '',
      servicos: [],
      pecas: []
    })
    setVeiculos([])
    setShowForm(true)
  }

  const handleEditarOs = (os) => {
    setEditingOs(os)
    setOsData({
      cliente_id: os.cliente_id || '',
      veiculo_id: os.veiculo_id || '',
      data_abertura: os.data_abertura || new Date().toISOString().split('T')[0],
      data_prevista: os.data_prevista || '',
      descricao_problema: os.descricao_problema || '',
      observacoes: os.observacoes || '',
      status: os.status || 'aberta',
      prioridade: os.prioridade || 'media',
      valor_total: os.valor_total || '',
      desconto: os.desconto || '',
      servicos: os.servicos || [],
      pecas: os.pecas || []
    })
    if (os.cliente_id) {
      loadVeiculos(os.cliente_id)
    }
    setShowForm(true)
  }

  const handleOsChange = (field, value) => {
    setOsData(prev => ({
      ...prev,
      [field]: value
    }))

    // Se mudou o cliente, carregar os veículos
    if (field === 'cliente_id') {
      setOsData(prev => ({ ...prev, veiculo_id: '' }))
      if (value) {
        loadVeiculos(value)
      } else {
        setVeiculos([])
      }
    }
  }

  const salvarOs = async () => {
    try {
      setLoading(true)

      // Validações básicas
      if (!osData.cliente_id) {
        notify.error('Cliente é obrigatório')
        return
      }

      if (!osData.descricao_problema.trim()) {
        notify.error('Descrição do problema é obrigatória')
        return
      }

      const url = editingOs?.id
        ? `/api/ordens-servico/${editingOs.id}`
        : '/api/ordens-servico'

      const method = editingOs?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(osData)
      })

      const result = await response.json()

      if (result.success) {
        notify.success(editingOs?.id ? 'Ordem de serviço atualizada com sucesso!' : 'Ordem de serviço criada com sucesso!')
        setShowForm(false)
        setEditingOs(null)
        loadOs()
      } else {
        throw new Error(result.message)
      }

    } catch (error) {
      notify.error('Erro ao salvar ordem de serviço: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await confirm.confirmDelete('Deseja cancelar esta ordem de serviço? Esta ação não pode ser desfeita.')
    if (!confirmed) return
    try {
      const response = await fetch(`http://localhost:5000/api/ordens-servico/${id}`, { method: 'DELETE' })
      const json = await response.json()
      if (json.success) {
        notify.success('Ordem de serviço cancelada com sucesso!')
        loadOs()
      } else {
        notify.error(json.message || 'Erro ao cancelar ordem de serviço')
      }
    } catch (error) {
      console.error('Erro ao cancelar ordem de serviço:', error)
      notify.error('Erro ao cancelar ordem de serviço')
    }
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editingOs?.id ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </h1>
            <p className="text-gray-600">
              {editingOs?.id ? 'Edite os dados da ordem de serviço' : 'Crie uma nova ordem de serviço'}
            </p>
          </div>
          <button
            onClick={() => setShowForm(false)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </button>
        </div>

        {/* Formulário da Ordem de Serviço */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Dados da Ordem de Serviço
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  value={osData.cliente_id}
                  onChange={(e) => handleOsChange('cliente_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veículo
                </label>
                <select
                  value={osData.veiculo_id}
                  onChange={(e) => handleOsChange('veiculo_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!osData.cliente_id}
                >
                  <option value="">Selecione um veículo</option>
                  {veiculos.map(veiculo => (
                    <option key={veiculo.id} value={veiculo.id}>
                      {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Abertura
                </label>
                <input
                  type="date"
                  value={osData.data_abertura}
                  onChange={(e) => handleOsChange('data_abertura', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Prevista
                </label>
                <input
                  type="date"
                  value={osData.data_prevista}
                  onChange={(e) => handleOsChange('data_prevista', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={osData.status}
                  onChange={(e) => handleOsChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="aberta">Aberta</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="aguardando_peca">Aguardando Peça</option>
                  <option value="aguardando_cliente">Aguardando Cliente</option>
                  <option value="finalizada">Finalizada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  value={osData.prioridade}
                  onChange={(e) => handleOsChange('prioridade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={osData.valor_total}
                  onChange={(e) => handleOsChange('valor_total', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desconto
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={osData.desconto}
                  onChange={(e) => handleOsChange('desconto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição do Problema *
                </label>
                <textarea
                  value={osData.descricao_problema}
                  onChange={(e) => handleOsChange('descricao_problema', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva o problema relatado pelo cliente"
                />
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={osData.observacoes}
                  onChange={(e) => handleOsChange('observacoes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observações adicionais"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowForm(false)}
            className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={salvarOs}
            disabled={loading}
            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 inline mr-2" />
            {loading ? 'Salvando...' : (editingOs?.id ? 'Atualizar OS' : 'Criar OS')}
          </button>
        </div>
      </div>
    )
=======
import { Plus, Search, FileText, Edit, Trash2, Eye, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

export function OrdensServico() {
  const [ordens, setOrdens] = useState([])
  const [clientes, setClientes] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [tiposServico, setTiposServico] = useState([])
  const [pecas, setPecas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isItemServicoModalOpen, setIsItemServicoModalOpen] = useState(false)
  const [currentItemServicoType, setCurrentItemServicoType] = useState(null) // 'item' or 'servico'
  const [currentOrdem, setCurrentOrdem] = useState(null)
  const [formData, setFormData] = useState({
    cliente_id: '', veiculo_id: '', descricao_problema_servico_solicitado: '',
    data_conclusao_prevista: '', diagnostico: '', observacoes_internas: '',
    status: 'aberta', aprovado_cliente: false
  })
  const [formDataItemServico, setFormDataItemServico] = useState({
    peca_id: '', quantidade: 0, valor_unitario: 0, desconto: 0,
    tipo_servico_id: '', descricao: '', quantidade_horas: 0, valor_hora: 0, mecanico: ''
  })

  useEffect(() => {
    fetchOrdens()
    fetchClientes()
    fetchVeiculos()
    fetchTiposServico()
    fetchPecas()
  }, [])

  const fetchOrdens = async () => {
    try {
      const response = await fetch(`/api/ordens-servico?search=${searchTerm}`)
      const data = await response.json()
      if (data.success) {
        setOrdens(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar ordens de serviço.', variant: 'destructive' })
    }
  }

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      const data = await response.json()
      if (data.success) {
        setClientes(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar clientes.', variant: 'destructive' })
    }
  }

  const fetchVeiculos = async () => {
    try {
      const response = await fetch('/api/veiculos')
      const data = await response.json()
      if (data.success) {
        setVeiculos(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar veículos.', variant: 'destructive' })
    }
  }

  const fetchTiposServico = async () => {
    try {
      const response = await fetch('/api/tipos-servico')
      const data = await response.json()
      if (data.success) {
        setTiposServico(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar tipos de serviço.', variant: 'destructive' })
    }
  }

  const fetchPecas = async () => {
    try {
      const response = await fetch('/api/pecas')
      const data = await response.json()
      if (data.success) {
        setPecas(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar peças.', variant: 'destructive' })
    }
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSaveOrdem = async () => {
    const method = currentOrdem ? 'PUT' : 'POST'
    const url = currentOrdem ? `/api/ordens-servico/${currentOrdem.id}` : '/api/ordens-servico'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        setIsModalOpen(false)
        fetchOrdens()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar ordem de serviço.', variant: 'destructive' })
    }
  }

  const handleEditOrdem = (ordem) => {
    setCurrentOrdem(ordem)
    setFormData({
      cliente_id: ordem.cliente_id,
      veiculo_id: ordem.veiculo_id,
      descricao_problema_servico_solicitado: ordem.descricao_problema_servico_solicitado,
      data_conclusao_prevista: ordem.data_conclusao_prevista ? new Date(ordem.data_conclusao_prevista).toISOString().slice(0, 16) : '',
      diagnostico: ordem.diagnostico || '',
      observacoes_internas: ordem.observacoes_internas || '',
      status: ordem.status,
      aprovado_cliente: ordem.aprovado_cliente
    })
    setIsModalOpen(true)
  }

  const handleDeleteOrdem = async (id) => {
    if (!window.confirm('Tem certeza que deseja desativar esta ordem de serviço?')) return
    try {
      const response = await fetch(`/api/ordens-servico/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        fetchOrdens()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao desativar ordem de serviço.', variant: 'destructive' })
    }
  }

  const handleNewOrdemClick = () => {
    setCurrentOrdem(null)
    setFormData({
      cliente_id: '', veiculo_id: '', descricao_problema_servico_solicitado: '',
      data_conclusao_prevista: '', diagnostico: '', observacoes_internas: '',
      status: 'aberta', aprovado_cliente: false
    })
    setIsModalOpen(true)
  }

  const handleAddItemServicoClick = (ordem, type) => {
    setCurrentOrdem(ordem)
    setCurrentItemServicoType(type)
    setFormDataItemServico({
      peca_id: '', quantidade: 0, valor_unitario: 0, desconto: 0,
      tipo_servico_id: '', descricao: '', quantidade_horas: 0, valor_hora: 0, mecanico: ''
    })
    setIsItemServicoModalOpen(true)
  }

  const handleItemServicoInputChange = (e) => {
    const { id, value } = e.target
    setFormDataItemServico(prev => ({ ...prev, [id]: value }))
  }

  const handleItemServicoSelectChange = (id, value) => {
    setFormDataItemServico(prev => ({ ...prev, [id]: value }))
  }

  const handleSaveItemServico = async () => {
    if (!currentOrdem || !currentItemServicoType) return

    let url = ''
    let payload = {}

    if (currentItemServicoType === 'item') {
      url = `/api/ordens-servico/${currentOrdem.id}/itens`
      payload = {
        peca_id: formDataItemServico.peca_id,
        quantidade: parseFloat(formDataItemServico.quantidade),
        valor_unitario: parseFloat(formDataItemServico.valor_unitario),
        desconto: parseFloat(formDataItemServico.desconto)
      }
    } else if (currentItemServicoType === 'servico') {
      url = `/api/ordens-servico/${currentOrdem.id}/servicos`
      payload = {
        tipo_servico_id: formDataItemServico.tipo_servico_id,
        descricao: formDataItemServico.descricao,
        quantidade_horas: parseFloat(formDataItemServico.quantidade_horas),
        valor_hora: parseFloat(formDataItemServico.valor_hora),
        desconto: parseFloat(formDataItemServico.desconto),
        mecanico: formDataItemServico.mecanico
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        setIsItemServicoModalOpen(false)
        fetchOrdens() // Refresh ordens to show updated totals
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao adicionar item/serviço.', variant: 'destructive' })
    }
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="text-gray-600">Gerencie as ordens de serviço da oficina</p>
        </div>
<<<<<<< HEAD
        <button
          onClick={handleNovaOs}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
=======
        <Button onClick={handleNewOrdemClick}>
          <Plus className="h-4 w-4 mr-2" />
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
          Nova Ordem
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
<<<<<<< HEAD
          <input
            placeholder="Buscar ordens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
=======
          <Input
            placeholder="Buscar por número da OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchOrdens() }}
            className="pl-10"
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
          />
        </div>
        <Button onClick={fetchOrdens}>Buscar</Button>
      </div>

<<<<<<< HEAD
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veículo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Previsão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : osList.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Nenhuma ordem encontrada
                </td>
              </tr>
            ) : (
              osList.map((os) => (
                <tr key={os.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {os.numero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {os.cliente_nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {os.veiculo_placa}
                  </td>
                  <td className="px-6 py-4 whitenoise-nowrap text-sm text-gray-900">
                    {os.data_previsao ? os.data_previsao.split('T')[0] : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {os.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditarOs(os)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(os.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Cancelar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
=======
      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Lista de Ordens de Serviço
          </CardTitle>
          <CardDescription>
            Visualize e gerencie as ordens de serviço.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="6" className="text-center">Nenhuma ordem de serviço encontrada.</TableCell>
                </TableRow>
              ) : (
                ordens.map(ordem => (
                  <TableRow key={ordem.id}>
                    <TableCell className="font-medium">{ordem.numero}</TableCell>
                    <TableCell>{clientes.find(c => c.id === ordem.cliente_id)?.nome || 'N/A'}</TableCell>
                    <TableCell>{veiculos.find(v => v.id === ordem.veiculo_id)?.placa || 'N/A'}</TableCell>
                    <TableCell>{ordem.status}</TableCell>
                    <TableCell>R$ {ordem.valor_total_os?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditOrdem(ordem)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddItemServicoClick(ordem, 'item')}>
                        <Plus className="h-4 w-4" /> Item
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddItemServicoClick(ordem, 'servico')}>
                        <Plus className="h-4 w-4" /> Serviço
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteOrdem(ordem.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Cadastro/Edição de Ordem de Serviço */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{currentOrdem ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</DialogTitle>
            <DialogDescription>
              Preencha os dados da ordem de serviço.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente</Label>
              <Select id="cliente_id" value={formData.cliente_id} onValueChange={(value) => handleSelectChange('cliente_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="veiculo_id">Veículo</Label>
              <Select id="veiculo_id" value={formData.veiculo_id} onValueChange={(value) => handleSelectChange('veiculo_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {veiculos.filter(v => v.cliente_id === formData.cliente_id).map(veiculo => (
                    <SelectItem key={veiculo.id} value={veiculo.id}>{veiculo.placa} - {veiculo.modelo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="descricao_problema_servico_solicitado">Problema/Serviço Solicitado</Label>
              <Textarea id="descricao_problema_servico_solicitado" value={formData.descricao_problema_servico_solicitado} onChange={handleInputChange} required />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="diagnostico">Diagnóstico</Label>
              <Textarea id="diagnostico" value={formData.diagnostico} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_conclusao_prevista">Data Conclusão Prevista</Label>
              <Input id="data_conclusao_prevista" type="datetime-local" value={formData.data_conclusao_prevista} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="aguardando_aprovacao">Aguardando Aprovação</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex items-center gap-2">
              <Input id="aprovado_cliente" type="checkbox" checked={formData.aprovado_cliente} onChange={(e) => setFormData(prev => ({ ...prev, aprovado_cliente: e.target.checked }))} className="w-4 h-4" />
              <Label htmlFor="aprovado_cliente">Aprovado pelo Cliente</Label>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="observacoes_internas">Observações Internas</Label>
              <Textarea id="observacoes_internas" value={formData.observacoes_internas} onChange={handleInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveOrdem}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Item/Serviço */}
      <Dialog open={isItemServicoModalOpen} onOpenChange={setIsItemServicoModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentItemServicoType === 'item' ? 'Adicionar Peça à OS' : 'Adicionar Serviço à OS'}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes do {currentItemServicoType === 'item' ? 'item' : 'serviço'}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {currentItemServicoType === 'item' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="peca_id">Peça</Label>
                  <Select id="peca_id" value={formDataItemServico.peca_id} onValueChange={(value) => handleItemServicoSelectChange('peca_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma peça" />
                    </SelectTrigger>
                    <SelectContent>
                      {pecas.map(peca => (
                        <SelectItem key={peca.id} value={peca.id}>{peca.nome} ({peca.codigo})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input id="quantidade" type="number" value={formDataItemServico.quantidade} onChange={handleItemServicoInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_unitario">Valor Unitário</Label>
                  <Input id="valor_unitario" type="number" step="0.01" value={formDataItemServico.valor_unitario} onChange={handleItemServicoInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desconto">Desconto (%)</Label>
                  <Input id="desconto" type="number" step="0.01" value={formDataItemServico.desconto} onChange={handleItemServicoInputChange} />
                </div>
              </>
            )}
            {currentItemServicoType === 'servico' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tipo_servico_id">Tipo de Serviço</Label>
                  <Select id="tipo_servico_id" value={formDataItemServico.tipo_servico_id} onValueChange={(value) => handleItemServicoSelectChange('tipo_servico_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposServico.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id}>{tipo.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input id="descricao" value={formDataItemServico.descricao} onChange={handleItemServicoInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade_horas">Qtd. Horas</Label>
                  <Input id="quantidade_horas" type="number" value={formDataItemServico.quantidade_horas} onChange={handleItemServicoInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_hora">Valor Hora</Label>
                  <Input id="valor_hora" type="number" step="0.01" value={formDataItemServico.valor_hora} onChange={handleItemServicoInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desconto">Desconto (%)</Label>
                  <Input id="desconto" type="number" step="0.01" value={formDataItemServico.desconto} onChange={handleItemServicoInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mecanico">Mecânico</Label>
                  <Input id="mecanico" value={formDataItemServico.mecanico} onChange={handleItemServicoInputChange} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemServicoModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveItemServico}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
    </div>
  )
}


