import { useState, useEffect } from 'react'
<<<<<<< HEAD
import {
  Plus,
  Search,
  DollarSign,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard
} from 'lucide-react'
import { useNotify } from '../ui/notification'
import { useConfirm } from '../ui/confirmation-dialog'

export function Financeiro() {
  const notify = useNotify()
  const confirm = useConfirm()
  const [searchTerm, setSearchTerm] = useState('')
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingConta, setEditingConta] = useState(null)

  // Estados para o formulário inline
  const [contaData, setContaData] = useState({
    descricao: '',
    tipo: 'pagar',
    valor: '',
    data_vencimento: '',
    data_pagamento: '',
    categoria: '',
    observacoes: '',
    status: 'pendente',
    cliente_id: '',
    fornecedor: ''
  })

  useEffect(() => {
    loadContas()
  }, [searchTerm])

  const loadContas = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      const response = await fetch(`/api/financeiro/contas?${params}`)
      const result = await response.json()
      if (result.success) {
        setContas(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNovaConta = () => {
    setEditingConta(null)
    setContaData({
      descricao: '',
      tipo: 'pagar',
      valor: '',
      data_vencimento: '',
      data_pagamento: '',
      categoria: '',
      observacoes: '',
      status: 'pendente',
      cliente_id: '',
      fornecedor: ''
    })
    setShowForm(true)
  }

  const handleEditarConta = (conta) => {
    setEditingConta(conta)
    setContaData({
      descricao: conta.descricao || '',
      tipo: conta.tipo || 'pagar',
      valor: conta.valor || '',
      data_vencimento: conta.data_vencimento || '',
      data_pagamento: conta.data_pagamento || '',
      categoria: conta.categoria || '',
      observacoes: conta.observacoes || '',
      status: conta.status || 'pendente',
      cliente_id: conta.cliente_id || '',
      fornecedor: conta.fornecedor || ''
    })
    setShowForm(true)
  }

  const handleContaChange = (field, value) => {
    setContaData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const salvarConta = async () => {
    try {
      setLoading(true)

      // Validações básicas
      if (!contaData.descricao.trim()) {
        notify.error('Descrição é obrigatória')
        return
      }

      if (!contaData.valor) {
        notify.error('Valor é obrigatório')
        return
      }

      if (!contaData.data_vencimento) {
        notify.error('Data de vencimento é obrigatória')
        return
      }

      const url = editingConta?.id
        ? `/api/financeiro/contas/${editingConta.id}`
        : '/api/financeiro/contas'

      const method = editingConta?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contaData)
      })

      const result = await response.json()

      if (result.success) {
        notify.success(editingConta?.id ? 'Conta atualizada com sucesso!' : 'Conta cadastrada com sucesso!')
        setShowForm(false)
        setEditingConta(null)
        loadContas()
      } else {
        throw new Error(result.message)
      }

    } catch (error) {
      notify.error('Erro ao salvar conta: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editingConta?.id ? 'Editar Conta' : 'Nova Conta'}
            </h1>
            <p className="text-gray-600">
              {editingConta?.id ? 'Edite os dados da conta' : 'Cadastre uma nova conta a pagar/receber'}
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

        {/* Formulário da Conta */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Dados da Conta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={contaData.descricao}
                  onChange={(e) => handleContaChange('descricao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição da conta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={contaData.tipo}
                  onChange={(e) => handleContaChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pagar">Conta a Pagar</option>
                  <option value="receber">Conta a Receber</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={contaData.valor}
                  onChange={(e) => handleContaChange('valor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento *
                </label>
                <input
                  type="date"
                  value={contaData.data_vencimento}
                  onChange={(e) => handleContaChange('data_vencimento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Pagamento
                </label>
                <input
                  type="date"
                  value={contaData.data_pagamento}
                  onChange={(e) => handleContaChange('data_pagamento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={contaData.categoria}
                  onChange={(e) => handleContaChange('categoria', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Fornecedores, Serviços, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={contaData.status}
                  onChange={(e) => handleContaChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="vencido">Vencido</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {contaData.tipo === 'pagar' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    value={contaData.fornecedor}
                    onChange={(e) => handleContaChange('fornecedor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do fornecedor"
                  />
                </div>
              )}

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={contaData.observacoes}
                  onChange={(e) => handleContaChange('observacoes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observações sobre a conta"
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
            onClick={salvarConta}
            disabled={loading}
            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 inline mr-2" />
            {loading ? 'Salvando...' : (editingConta?.id ? 'Atualizar Conta' : 'Salvar Conta')}
          </button>
        </div>
      </div>
    )
=======
import { Plus, Search, DollarSign, Edit, Trash2, ArrowRight, ArrowLeft, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Financeiro() {
  const [contasReceber, setContasReceber] = useState([])
  const [contasPagar, setContasPagar] = useState([])
  const [categoriasFinanceiras, setCategoriasFinanceiras] = useState([])
  const [clientes, setClientes] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isContaModalOpen, setIsContaModalOpen] = useState(false)
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false)
  const [currentConta, setCurrentConta] = useState(null)
  const [currentContaType, setCurrentContaType] = useState(null) // 'receber' or 'pagar'
  const [formDataConta, setFormDataConta] = useState({
    cliente_id: '', categoria_financeira_id: '', descricao: '', valor_original: 0,
    data_emissao: '', data_vencimento: '', observacoes: '', fornecedor_id: ''
  })
  const [formDataPagamento, setFormDataPagamento] = useState({
    valor: 0, forma_pagamento: '', data_pagamento: '', numero_documento: '', observacoes: ''
  })

  useEffect(() => {
    fetchContasReceber()
    fetchContasPagar()
    fetchCategoriasFinanceiras()
    fetchClientes()
    fetchFornecedores()
    fetchDashboardData()
  }, [])

  const fetchContasReceber = async () => {
    try {
      const response = await fetch(`/api/contas-receber?search=${searchTerm}`)
      const data = await response.json()
      if (data.success) {
        setContasReceber(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar contas a receber.', variant: 'destructive' })
    }
  }

  const fetchContasPagar = async () => {
    try {
      const response = await fetch(`/api/contas-pagar?search=${searchTerm}`)
      const data = await response.json()
      if (data.success) {
        setContasPagar(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar contas a pagar.', variant: 'destructive' })
    }
  }

  const fetchCategoriasFinanceiras = async () => {
    try {
      const response = await fetch('/api/categorias-financeiras')
      const data = await response.json()
      if (data.success) {
        setCategoriasFinanceiras(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar categorias financeiras.', variant: 'destructive' })
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

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores')
      const data = await response.json()
      if (data.success) {
        setFornecedores(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar fornecedores.', variant: 'destructive' })
    }
  }

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard-financeiro')
      const data = await response.json()
      if (data.success) {
        setDashboardData(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar dados do dashboard financeiro.', variant: 'destructive' })
    }
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormDataConta(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id, value) => {
    setFormDataConta(prev => ({ ...prev, [id]: value }))
  }

  const handleSaveConta = async () => {
    const method = currentConta ? 'PUT' : 'POST'
    const url = currentConta ? `/api/${currentContaType === 'receber' ? 'contas-receber' : 'contas-pagar'}/${currentConta.id}` : `/api/${currentContaType === 'receber' ? 'contas-receber' : 'contas-pagar'}`

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataConta)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        setIsContaModalOpen(false)
        if (currentContaType === 'receber') fetchContasReceber()
        else fetchContasPagar()
        fetchDashboardData()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar conta.', variant: 'destructive' })
    }
  }

  const handleEditConta = (conta, type) => {
    setCurrentConta(conta)
    setCurrentContaType(type)
    setFormDataConta({
      cliente_id: conta.cliente_id || '',
      categoria_financeira_id: conta.categoria_financeira_id || '',
      descricao: conta.descricao || '',
      valor_original: conta.valor_original || 0,
      data_emissao: conta.data_emissao ? new Date(conta.data_emissao).toISOString().split('T')[0] : '',
      data_vencimento: conta.data_vencimento ? new Date(conta.data_vencimento).toISOString().split('T')[0] : '',
      observacoes: conta.observacoes || '',
      fornecedor_id: conta.fornecedor_id || ''
    })
    setIsContaModalOpen(true)
  }

  const handleDeleteConta = async (id, type) => {
    if (!window.confirm(`Tem certeza que deseja desativar esta conta a ${type}?`)) return
    try {
      const response = await fetch(`/api/${type === 'receber' ? 'contas-receber' : 'contas-pagar'}/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        if (type === 'receber') fetchContasReceber()
        else fetchContasPagar()
        fetchDashboardData()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: `Falha ao desativar conta a ${type}.`, variant: 'destructive' })
    }
  }

  const handleNewContaClick = (type) => {
    setCurrentConta(null)
    setCurrentContaType(type)
    setFormDataConta({
      cliente_id: '', categoria_financeira_id: '', descricao: '', valor_original: 0,
      data_emissao: new Date().toISOString().split('T')[0], data_vencimento: '', observacoes: '', fornecedor_id: ''
    })
    setIsContaModalOpen(true)
  }

  const handlePagamentoInputChange = (e) => {
    const { id, value } = e.target
    setFormDataPagamento(prev => ({ ...prev, [id]: value }))
  }

  const handlePagamentoSelectChange = (id, value) => {
    setFormDataPagamento(prev => ({ ...prev, [id]: value }))
  }

  const handlePagarReceberClick = (conta, type) => {
    setCurrentConta(conta)
    setCurrentContaType(type)
    setFormDataPagamento({
      valor: conta.valor_saldo || conta.valor_original,
      forma_pagamento: '',
      data_pagamento: new Date().toISOString().split('T')[0],
      numero_documento: '',
      observacoes: ''
    })
    setIsPagamentoModalOpen(true)
  }

  const handleSavePagamento = async () => {
    if (!currentConta || !currentContaType) return

    const url = `/api/${currentContaType === 'receber' ? 'contas-receber' : 'contas-pagar'}/${currentConta.id}/pagamento`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataPagamento)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        setIsPagamentoModalOpen(false)
        if (currentContaType === 'receber') fetchContasReceber()
        else fetchContasPagar()
        fetchDashboardData()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao registrar pagamento/recebimento.', variant: 'destructive' })
    }
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600">Controle financeiro da oficina</p>
        </div>
<<<<<<< HEAD
        <button
          onClick={handleNovaConta}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Conta
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            placeholder="Buscar contas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabela de Contas */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Contas Financeiras
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando contas...</p>
            </div>
          ) : contas.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conta encontrada</h3>
              <p className="text-gray-600 mb-4">
                Comece cadastrando uma nova conta a pagar ou receber.
              </p>
              <button
                onClick={handleNovaConta}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Nova Conta
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
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
                  {contas.map((conta) => (
                    <tr key={conta.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {conta.descricao}
                        </div>
                        {conta.categoria && (
                          <div className="text-sm text-gray-500">
                            {conta.categoria}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          conta.tipo === 'receber'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {conta.tipo === 'receber' ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {conta.tipo === 'receber' ? 'A Receber' : 'A Pagar'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {parseFloat(conta.valor || 0).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {conta.data_vencimento ? new Date(conta.data_vencimento).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          conta.status === 'pago' ? 'bg-green-100 text-green-800' :
                          conta.status === 'vencido' ? 'bg-red-100 text-red-800' :
                          conta.status === 'cancelado' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {conta.status === 'pago' && <CreditCard className="h-3 w-3 mr-1" />}
                          {conta.status === 'vencido' && <Calendar className="h-3 w-3 mr-1" />}
                          {conta.status === 'pendente' && <Calendar className="h-3 w-3 mr-1" />}
                          {conta.status.charAt(0).toUpperCase() + conta.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditarConta(conta)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            const confirmed = await confirm.confirmDelete(
                              'Tem certeza que deseja excluir esta conta?',
                              'Esta ação não pode ser desfeita.'
                            )
                            if (confirmed) {
                              // Implementar exclusão
                              notify.success('Conta excluída com sucesso!')
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
=======
        <div className="flex space-x-2">
          <Button onClick={() => handleNewContaClick('receber')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta a Receber
          </Button>
          <Button onClick={() => handleNewContaClick('pagar')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta a Pagar
          </Button>
        </div>
      </div>

      {/* Dashboard Financeiro */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas a Receber em Aberto</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {dashboardData.contas_receber_abertas.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total de contas a receber</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas a Pagar em Aberto</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {dashboardData.contas_pagar_abertas.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total de contas a pagar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas a Receber Vencidas</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.contas_receber_vencidas}</div>
              <p className="text-xs text-muted-foreground">Contas vencidas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas a Pagar Vencidas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.contas_pagar_vencidas}</div>
              <p className="text-xs text-muted-foreground">Contas vencidas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="contas-receber" className="w-full">
        <TabsList>
          <TabsTrigger value="contas-receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="contas-pagar">Contas a Pagar</TabsTrigger>
        </TabsList>
        <TabsContent value="contas-receber">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Lista de Contas a Receber
              </CardTitle>
              <CardDescription>
                Gerencie as contas a receber da oficina.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor Original</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasReceber.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="6" className="text-center">Nenhuma conta a receber encontrada.</TableCell>
                    </TableRow>
                  ) : (
                    contasReceber.map(conta => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.descricao}</TableCell>
                        <TableCell>{clientes.find(c => c.id === conta.cliente_id)?.nome || 'N/A'}</TableCell>
                        <TableCell>{conta.data_vencimento}</TableCell>
                        <TableCell>R$ {conta.valor_original.toFixed(2)}</TableCell>
                        <TableCell>{conta.status}</TableCell>
                        <TableCell className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditConta(conta, 'receber')}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {conta.status === 'aberta' && (
                            <Button variant="outline" size="sm" onClick={() => handlePagarReceberClick(conta, 'receber')}>
                              <ArrowLeft className="h-4 w-4" /> Receber
                            </Button>
                          )}
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteConta(conta.id, 'receber')}>
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
        </TabsContent>
        <TabsContent value="contas-pagar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Lista de Contas a Pagar
              </CardTitle>
              <CardDescription>
                Gerencie as contas a pagar da oficina.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor Original</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasPagar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="6" className="text-center">Nenhuma conta a pagar encontrada.</TableCell>
                    </TableRow>
                  ) : (
                    contasPagar.map(conta => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.descricao}</TableCell>
                        <TableCell>{fornecedores.find(f => f.id === conta.fornecedor_id)?.nome || 'N/A'}</TableCell>
                        <TableCell>{conta.data_vencimento}</TableCell>
                        <TableCell>R$ {conta.valor_original.toFixed(2)}</TableCell>
                        <TableCell>{conta.status}</TableCell>
                        <TableCell className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditConta(conta, 'pagar')}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {conta.status === 'aberta' && (
                            <Button variant="outline" size="sm" onClick={() => handlePagarReceberClick(conta, 'pagar')}>
                              <ArrowRight className="h-4 w-4" /> Pagar
                            </Button>
                          )}
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteConta(conta.id, 'pagar')}>
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
        </TabsContent>
      </Tabs>

      {/* Modal de Cadastro/Edição de Conta */}
      <Dialog open={isContaModalOpen} onOpenChange={setIsContaModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentConta ? `Editar Conta a ${currentContaType === 'receber' ? 'Receber' : 'Pagar'}` : `Nova Conta a ${currentContaType === 'receber' ? 'Receber' : 'Pagar'}`}</DialogTitle>
            <DialogDescription>
              Preencha os dados da conta.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {currentContaType === 'receber' && (
              <div className="space-y-2">
                <Label htmlFor="cliente_id">Cliente</Label>
                <Select id="cliente_id" value={formDataConta.cliente_id} onValueChange={(value) => handleSelectChange('cliente_id', value)}>
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
            )}
            {currentContaType === 'pagar' && (
              <div className="space-y-2">
                <Label htmlFor="fornecedor_id">Fornecedor</Label>
                <Select id="fornecedor_id" value={formDataConta.fornecedor_id} onValueChange={(value) => handleSelectChange('fornecedor_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map(fornecedor => (
                      <SelectItem key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="categoria_financeira_id">Categoria Financeira</Label>
              <Select id="categoria_financeira_id" value={formDataConta.categoria_financeira_id} onValueChange={(value) => handleSelectChange('categoria_financeira_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasFinanceiras.filter(cat => cat.tipo === currentContaType).map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" value={formDataConta.descricao} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor_original">Valor Original</Label>
              <Input id="valor_original" type="number" step="0.01" value={formDataConta.valor_original} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_emissao">Data Emissão</Label>
              <Input id="data_emissao" type="date" value={formDataConta.data_emissao} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_vencimento">Data Vencimento</Label>
              <Input id="data_vencimento" type="date" value={formDataConta.data_vencimento} onChange={handleInputChange} required />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input id="observacoes" value={formDataConta.observacoes} onChange={handleInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContaModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveConta}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Pagamento/Recebimento */}
      <Dialog open={isPagamentoModalOpen} onOpenChange={setIsPagamentoModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentContaType === 'receber' ? 'Registrar Recebimento' : 'Registrar Pagamento'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do {currentContaType === 'receber' ? 'recebimento' : 'pagamento'}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Input id="valor" type="number" step="0.01" value={formDataPagamento.valor} onChange={handlePagamentoInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
              <Input id="forma_pagamento" value={formDataPagamento.forma_pagamento} onChange={handlePagamentoInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_pagamento">Data do {currentContaType === 'receber' ? 'Recebimento' : 'Pagamento'}</Label>
              <Input id="data_pagamento" type="date" value={formDataPagamento.data_pagamento} onChange={handlePagamentoInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero_documento">Número do Documento</Label>
              <Input id="numero_documento" value={formDataPagamento.numero_documento} onChange={handlePagamentoInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input id="observacoes" value={formDataPagamento.observacoes} onChange={handlePagamentoInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPagamentoModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePagamento}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
    </div>
  )
}


