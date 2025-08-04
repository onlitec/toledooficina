import { useState, useEffect } from 'react'
<<<<<<< HEAD
import {
  Plus,
  Search,
  Wrench,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  Filter,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  UserCheck,
  Calendar,
  ArrowLeft,
  Save
} from 'lucide-react'
import { useNotify } from '@/components/ui/notification'
import { useConfirm } from '@/components/ui/confirmation-dialog'
import { apiGet, apiPost, apiPut, apiDelete } from '@/utils/api'

export function Ferramentas() {
  const notify = useNotify()
  const confirm = useConfirm()
  const [searchTerm, setSearchTerm] = useState('')
  const [ferramentas, setFerramentas] = useState([])
  const [estatisticas, setEstatisticas] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showEmprestimoForm, setShowEmprestimoForm] = useState(false)
  const [showManutencaoForm, setShowManutencaoForm] = useState(false)
  const [editingFerramenta, setEditingFerramenta] = useState(null)
  const [selectedFerramenta, setSelectedFerramenta] = useState(null)
  const [filtroStatus, setFiltroStatus] = useState('')

  // Estados para o formulário inline
  const [ferramentaData, setFerramentaData] = useState({
    nome: '',
    codigo: '',
    categoria: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    data_aquisicao: '',
    valor_aquisicao: '',
    localizacao: '',
    status: 'disponivel',
    observacoes: ''
  })

  useEffect(() => {
    loadFerramentas()
    loadEstatisticas()
  }, [])

  const loadFerramentas = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filtroStatus) params.append('status', filtroStatus)
      
      const data = await apiGet(`/ferramentas?${params}`)
      setFerramentas(data)
    } catch (error) {
      console.error('Erro ao carregar ferramentas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEstatisticas = async () => {
    try {
      const data = await apiGet('/ferramentas/estatisticas')
      setEstatisticas(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadFerramentas()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, filtroStatus])

  const handleNovaFerramenta = () => {
    setEditingFerramenta(null)
    setFerramentaData({
      nome: '',
      codigo: '',
      categoria: '',
      marca: '',
      modelo: '',
      numero_serie: '',
      data_aquisicao: '',
      valor_aquisicao: '',
      localizacao: '',
      status: 'disponivel',
      observacoes: ''
    })
    setShowForm(true)
  }

  const handleEditarFerramenta = (ferramenta) => {
    setEditingFerramenta(ferramenta)
    setFerramentaData({
      nome: ferramenta.nome || '',
      codigo: ferramenta.codigo || '',
      categoria: ferramenta.categoria || '',
      marca: ferramenta.marca || '',
      modelo: ferramenta.modelo || '',
      numero_serie: ferramenta.numero_serie || '',
      data_aquisicao: ferramenta.data_aquisicao || '',
      valor_aquisicao: ferramenta.valor_aquisicao || '',
      localizacao: ferramenta.localizacao || '',
      status: ferramenta.status || 'disponivel',
      observacoes: ferramenta.observacoes || ''
    })
    setShowForm(true)
  }

  const handleFerramentaChange = (field, value) => {
    setFerramentaData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const salvarFerramenta = async () => {
    try {
      setLoading(true)

      // Validações básicas
      if (!ferramentaData.nome.trim()) {
        notify.error('Nome da ferramenta é obrigatório')
        return
      }

      // Código não é mais obrigatório - será gerado automaticamente se vazio

      if (editingFerramenta?.id) {
        await apiPut(`/ferramentas/${editingFerramenta.id}`, ferramentaData)
        notify.success('Ferramenta atualizada com sucesso!')
      } else {
        await apiPost('/ferramentas', ferramentaData)
        notify.success('Ferramenta cadastrada com sucesso!')
      }
      
      setShowForm(false)
      setEditingFerramenta(null)
      loadFerramentas()
      loadEstatisticas()

    } catch (error) {
      notify.error('Erro ao salvar ferramenta: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFerramenta = async (id) => {
    const confirmed = await confirm.confirmDelete('Tem certeza que deseja remover esta ferramenta? Esta ação não pode ser desfeita.')
    if (!confirmed) return
    
    try {
      await apiDelete(`/ferramentas/${id}`)
      notify.success('Ferramenta removida com sucesso!')
      loadFerramentas()
      loadEstatisticas()
    } catch (error) {
      console.error('Erro ao remover ferramenta:', error)
      notify.error('Erro ao remover ferramenta')
    }
  }

  const handleEmprestimo = async (formData) => {
    try {
      await apiPost(`/ferramentas/${selectedFerramenta.id}/emprestimo`, formData)
      notify.success('Empréstimo registrado com sucesso!')
      setShowEmprestimoForm(false)
      setSelectedFerramenta(null)
      loadFerramentas()
      loadEstatisticas()
    } catch (error) {
      console.error('Erro ao registrar empréstimo:', error)
      notify.error('Erro ao registrar empréstimo')
    }
  }

  const handleDevolucao = async (id) => {
    const confirmed = await confirm.confirm('Confirmar devolução da ferramenta?')
    if (!confirmed) return
    
    try {
      await apiPost(`/ferramentas/${id}/devolucao`, {})
      notify.success('Devolução registrada com sucesso!')
      loadFerramentas()
      loadEstatisticas()
    } catch (error) {
      console.error('Erro ao registrar devolução:', error)
      notify.error('Erro ao registrar devolução')
    }
  }

  const handleManutencao = async (formData) => {
    try {
      await apiPost(`/ferramentas/${selectedFerramenta.id}/manutencao`, formData)
      notify.success('Manutenção registrada com sucesso!')
      setShowManutencaoForm(false)
      setSelectedFerramenta(null)
      loadFerramentas()
      loadEstatisticas()
    } catch (error) {
      console.error('Erro ao registrar manutenção:', error)
      notify.error('Erro ao registrar manutenção')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingFerramenta(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponivel': return 'text-green-600 bg-green-100'
      case 'emprestada': return 'text-yellow-600 bg-yellow-100'
      case 'manutencao': return 'text-red-600 bg-red-100'
      case 'perdida': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'disponivel': return <CheckCircle className="h-4 w-4" />
      case 'emprestada': return <UserCheck className="h-4 w-4" />
      case 'manutencao': return <Settings className="h-4 w-4" />
      case 'perdida': return <AlertTriangle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editingFerramenta?.id ? 'Editar Ferramenta' : 'Cadastrar Ferramenta'}
            </h1>
            <p className="text-gray-600">
              {editingFerramenta?.id ? 'Edite os dados da ferramenta' : 'Cadastre uma nova ferramenta'}
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

        {/* Formulário da Ferramenta */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Dados da Ferramenta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Ferramenta *
                </label>
                <input
                  type="text"
                  value={ferramentaData.nome}
                  onChange={(e) => handleFerramentaChange('nome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da ferramenta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={ferramentaData.codigo}
                  onChange={(e) => handleFerramentaChange('codigo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deixe vazio para gerar automaticamente (FER-0001)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={ferramentaData.categoria}
                  onChange={(e) => handleFerramentaChange('categoria', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Categoria da ferramenta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  value={ferramentaData.marca}
                  onChange={(e) => handleFerramentaChange('marca', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Marca da ferramenta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  value={ferramentaData.modelo}
                  onChange={(e) => handleFerramentaChange('modelo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Modelo da ferramenta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Série
                </label>
                <input
                  type="text"
                  value={ferramentaData.numero_serie}
                  onChange={(e) => handleFerramentaChange('numero_serie', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de série"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Aquisição
                </label>
                <input
                  type="date"
                  value={ferramentaData.data_aquisicao}
                  onChange={(e) => handleFerramentaChange('data_aquisicao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor de Aquisição
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ferramentaData.valor_aquisicao}
                  onChange={(e) => handleFerramentaChange('valor_aquisicao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização
                </label>
                <input
                  type="text"
                  value={ferramentaData.localizacao}
                  onChange={(e) => handleFerramentaChange('localizacao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Bancada 1, Gaveta A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={ferramentaData.status}
                  onChange={(e) => handleFerramentaChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="disponivel">Disponível</option>
                  <option value="emprestada">Emprestada</option>
                  <option value="manutencao">Em Manutenção</option>
                  <option value="perdida">Perdida</option>
                </select>
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={ferramentaData.observacoes}
                  onChange={(e) => handleFerramentaChange('observacoes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observações sobre a ferramenta"
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
            onClick={salvarFerramenta}
            disabled={loading}
            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 inline mr-2" />
            {loading ? 'Salvando...' : (editingFerramenta?.id ? 'Atualizar Ferramenta' : 'Salvar Ferramenta')}
          </button>
        </div>
      </div>
    )
  }

  if (showEmprestimoForm) {
    return (
      <EmprestimoForm 
        ferramenta={selectedFerramenta}
        onClose={() => {
          setShowEmprestimoForm(false)
          setSelectedFerramenta(null)
        }}
        onSave={handleEmprestimo}
      />
    )
  }

  if (showManutencaoForm) {
    return (
      <ManutencaoForm 
        ferramenta={selectedFerramenta}
        onClose={() => {
          setShowManutencaoForm(false)
          setSelectedFerramenta(null)
        }}
        onSave={handleManutencao}
      />
    )
  }
=======
import { Plus, Search, Wrench, Edit, Trash2, ArrowRight, ArrowLeft, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Ferramentas() {
  const [ferramentas, setFerramentas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFerramentaModalOpen, setIsFerramentaModalOpen] = useState(false)
  const [isEmprestimoModalOpen, setIsEmprestimoModalOpen] = useState(false)
  const [isManutencaoModalOpen, setIsManutencaoModalOpen] = useState(false)
  const [currentFerramenta, setCurrentFerramenta] = useState(null)
  const [formDataFerramenta, setFormDataFerramenta] = useState({
    codigo: '', nome: '', descricao: '', tipo: '', marca: '', modelo: '',
    numero_serie: '', localizacao: '', status: 'disponivel', valor_aquisicao: 0,
    data_aquisicao: '', fornecedor: '', data_ultima_manutencao: '', frequencia_manutencao_dias: 0,
    observacoes: ''
  })
  const [formDataEmprestimo, setFormDataEmprestimo] = useState({
    responsavel: '', data_emprestimo: '', data_devolucao_prevista: '', observacoes: ''
  })
  const [formDataManutencao, setFormDataManutencao] = useState({
    tipo: '', descricao: '', data_manutencao: '', custo: 0, responsavel: '', fornecedor_servico: '', observacoes: ''
  })

  useEffect(() => {
    fetchFerramentas()
  }, [])

  const fetchFerramentas = async () => {
    try {
      const response = await fetch(`/api/ferramentas?search=${searchTerm}`)
      const data = await response.json()
      if (data.success) {
        setFerramentas(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar ferramentas.', variant: 'destructive' })
    }
  }

  // Handlers para Ferramentas
  const handleFerramentaInputChange = (e) => {
    const { id, value } = e.target
    setFormDataFerramenta(prev => ({ ...prev, [id]: value }))
  }

  const handleFerramentaSelectChange = (id, value) => {
    setFormDataFerramenta(prev => ({ ...prev, [id]: value }))
  }

  const handleSaveFerramenta = async () => {
    const method = currentFerramenta ? 'PUT' : 'POST'
    const url = currentFerramenta ? `/api/ferramentas/${currentFerramenta.id}` : '/api/ferramentas'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataFerramenta)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        setIsFerramentaModalOpen(false)
        fetchFerramentas()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar ferramenta.', variant: 'destructive' })
    }
  }

  const handleEditFerramenta = (ferramenta) => {
    setCurrentFerramenta(ferramenta)
    setFormDataFerramenta({
      codigo: ferramenta.codigo, nome: ferramenta.nome, descricao: ferramenta.descricao || '',
      tipo: ferramenta.tipo || '', marca: ferramenta.marca || '', modelo: ferramenta.modelo || '',
      numero_serie: ferramenta.numero_serie || '', localizacao: ferramenta.localizacao || '',
      status: ferramenta.status, valor_aquisicao: ferramenta.valor_aquisicao || 0,
      data_aquisicao: ferramenta.data_aquisicao ? new Date(ferramenta.data_aquisicao).toISOString().split('T')[0] : '',
      fornecedor: ferramenta.fornecedor || '',
      data_ultima_manutencao: ferramenta.data_ultima_manutencao ? new Date(ferramenta.data_ultima_manutencao).toISOString().split('T')[0] : '',
      frequencia_manutencao_dias: ferramenta.frequencia_manutencao_dias || 0,
      observacoes: ferramenta.observacoes || ''
    })
    setIsFerramentaModalOpen(true)
  }

  const handleDeleteFerramenta = async (id) => {
    if (!window.confirm('Tem certeza que deseja desativar esta ferramenta?')) return
    try {
      const response = await fetch(`/api/ferramentas/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        fetchFerramentas()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao desativar ferramenta.', variant: 'destructive' })
    }
  }

  const handleNewFerramentaClick = () => {
    setCurrentFerramenta(null)
    setFormDataFerramenta({
      codigo: '', nome: '', descricao: '', tipo: '', marca: '', modelo: '',
      numero_serie: '', localizacao: '', status: 'disponivel', valor_aquisicao: 0,
      data_aquisicao: '', fornecedor: '', data_ultima_manutencao: '', frequencia_manutencao_dias: 0,
      observacoes: ''
    })
    setIsFerramentaModalOpen(true)
  }

  // Handlers para Empréstimo
  const handleEmprestimoInputChange = (e) => {
    const { id, value } = e.target
    setFormDataEmprestimo(prev => ({ ...prev, [id]: value }))
  }

  const handleEmprestarClick = (ferramenta) => {
    setCurrentFerramenta(ferramenta)
    setFormDataEmprestimo({
      responsavel: '',
      data_emprestimo: new Date().toISOString().slice(0, 16).replace('T', ' '),
      data_devolucao_prevista: '',
      observacoes: ''
    })
    setIsEmprestimoModalOpen(true)
  }

  const handleSaveEmprestimo = async () => {
    if (!currentFerramenta) return
    try {
      const response = await fetch(`/api/ferramentas/${currentFerramenta.id}/emprestimo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataEmprestimo)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        setIsEmprestimoModalOpen(false)
        fetchFerramentas()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao registrar empréstimo.', variant: 'destructive' })
    }
  }

  const handleDevolverClick = async (ferramentaId) => {
    if (!window.confirm('Tem certeza que deseja registrar a devolução desta ferramenta?')) return
    try {
      const response = await fetch(`/api/ferramentas/${ferramentaId}/devolucao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        fetchFerramentas()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao registrar devolução.', variant: 'destructive' })
    }
  }

  // Handlers para Manutenção
  const handleManutencaoInputChange = (e) => {
    const { id, value } = e.target
    setFormDataManutencao(prev => ({ ...prev, [id]: value }))
  }

  const handleManutencaoClick = (ferramenta) => {
    setCurrentFerramenta(ferramenta)
    setFormDataManutencao({
      tipo: '', descricao: '', data_manutencao: new Date().toISOString().split('T')[0],
      custo: 0, responsavel: '', fornecedor_servico: '', observacoes: ''
    })
    setIsManutencaoModalOpen(true)
  }

  const handleSaveManutencao = async () => {
    if (!currentFerramenta) return
    try {
      const response = await fetch(`/api/ferramentas/${currentFerramenta.id}/manutencao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataManutencao)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        setIsManutencaoModalOpen(false)
        fetchFerramentas()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao registrar manutenção.', variant: 'destructive' })
    }
  }
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ferramentas</h1>
          <p className="text-gray-600">Controle de ferramentas e inventário</p>
        </div>
<<<<<<< HEAD
        <button
          onClick={handleNovaFerramenta}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
=======
        <Button onClick={handleNewFerramentaClick}>
          <Plus className="h-4 w-4 mr-2" />
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
          Nova Ferramenta
        </button>
      </div>

<<<<<<< HEAD
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.total || 0}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disponíveis</p>
              <p className="text-2xl font-bold text-green-600">{estatisticas.disponiveis || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emprestadas</p>
              <p className="text-2xl font-bold text-yellow-600">{estatisticas.emprestadas || 0}</p>
            </div>
            <UserCheck className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Manutenção</p>
              <p className="text-2xl font-bold text-red-600">{estatisticas.manutencao || 0}</p>
            </div>
            <Settings className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Precisam Manutenção</p>
              <p className="text-2xl font-bold text-orange-600">{estatisticas.precisam_manutencao || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
=======
      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar ferramentas por código, nome ou série..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchFerramentas() }}
            className="pl-10"
          />
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
        </div>
        <Button onClick={fetchFerramentas}>Buscar</Button>
      </div>

<<<<<<< HEAD
      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar ferramentas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="emprestada">Emprestada</option>
          <option value="manutencao">Manutenção</option>
          <option value="perdida">Perdida</option>
        </select>
      </div>

      {/* Lista de Ferramentas */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ferramenta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
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
              ) : ferramentas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Nenhuma ferramenta encontrada
                  </td>
                </tr>
              ) : (
                ferramentas.map((ferramenta) => (
                  <tr key={ferramenta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ferramenta.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ferramenta.marca} {ferramenta.modelo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ferramenta.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ferramenta.status)}`}>
                        {getStatusIcon(ferramenta.status)}
                        {ferramenta.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ferramenta.localizacao || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ferramenta.responsavel_atual || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditarFerramenta(ferramenta)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {ferramenta.status === 'disponivel' && (
                        <button
                          onClick={() => {
                            setSelectedFerramenta(ferramenta)
                            setShowEmprestimoForm(true)
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Emprestar"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      
                      {ferramenta.status === 'emprestada' && (
                        <button
                          onClick={() => handleDevolucao(ferramenta.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Devolver"
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedFerramenta(ferramenta)
                          setShowManutencaoForm(true)
                        }}
                        className="text-purple-600 hover:text-purple-900"
                        title="Manutenção"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteFerramenta(ferramenta.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Remover"
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
      </div>
    </div>
  )
}
=======
      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            Lista de Ferramentas
          </CardTitle>
          <CardDescription>
            Visualize e gerencie as ferramentas cadastradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Próx. Manutenção</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ferramentas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="8" className="text-center">Nenhuma ferramenta encontrada.</TableCell>
                </TableRow>
              ) : (
                ferramentas.map(ferramenta => (
                  <TableRow key={ferramenta.id}>
                    <TableCell className="font-medium">{ferramenta.codigo}</TableCell>
                    <TableCell>{ferramenta.nome}</TableCell>
                    <TableCell>{ferramenta.tipo}</TableCell>
                    <TableCell>{ferramenta.localizacao}</TableCell>
                    <TableCell>{ferramenta.status}</TableCell>
                    <TableCell>{ferramenta.responsavel_atual || 'N/A'}</TableCell>
                    <TableCell>{ferramenta.proxima_manutencao || 'N/A'}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditFerramenta(ferramenta)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {ferramenta.status === 'disponivel' ? (
                        <Button variant="outline" size="sm" onClick={() => handleEmprestarClick(ferramenta)}>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleDevolverClick(ferramenta.id)}>
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleManutencaoClick(ferramenta)}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteFerramenta(ferramenta.id)}>
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

      {/* Modal de Cadastro/Edição de Ferramenta */}
      <Dialog open={isFerramentaModalOpen} onOpenChange={setIsFerramentaModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{currentFerramenta ? 'Editar Ferramenta' : 'Nova Ferramenta'}</DialogTitle>
            <DialogDescription>
              Preencha os dados da ferramenta.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" value={formDataFerramenta.codigo} onChange={handleFerramentaInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={formDataFerramenta.nome} onChange={handleFerramentaInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" value={formDataFerramenta.descricao} onChange={handleFerramentaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Input id="tipo" value={formDataFerramenta.tipo} onChange={handleFerramentaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input id="marca" value={formDataFerramenta.marca} onChange={handleFerramentaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input id="modelo" value={formDataFerramenta.modelo} onChange={handleFerramentaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero_serie">Número de Série</Label>
              <Input id="numero_serie" value={formDataFerramenta.numero_serie} onChange={handleFerramentaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Input id="localizacao" value={formDataFerramenta.localizacao} onChange={handleFerramentaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={formDataFerramenta.status} onValueChange={(value) => handleFerramentaSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="emprestada">Emprestada</SelectItem>
                  <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  <SelectItem value="desativada">Desativada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor_aquisicao">Valor Aquisição</Label>
              <Input id="valor_aquisicao" type="number" step="0.01" value={formDataFerramenta.valor_aquisicao} onChange={handleFerramentaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_aquisicao">Data Aquisição</Label>
              <Input id="data_aquisicao" type="date" value={formDataFerramenta.data_aquisicao} onChange={handleFerramentaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input id="fornecedor" value={formDataFerramenta.fornecedor} onChange={handleFerramentaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_ultima_manutencao">Última Manutenção</Label>
              <Input id="data_ultima_manutencao" type="date" value={formDataFerramenta.data_ultima_manutencao} onChange={handleFerramentaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequencia_manutencao_dias">Frequência Manutenção (dias)</Label>
              <Input id="frequencia_manutencao_dias" type="number" value={formDataFerramenta.frequencia_manutencao_dias} onChange={handleFerramentaInputChange} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input id="observacoes" value={formDataFerramenta.observacoes} onChange={handleFerramentaInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFerramentaModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveFerramenta}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Empréstimo de Ferramenta */}
      <Dialog open={isEmprestimoModalOpen} onOpenChange={setIsEmprestimoModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Emprestar Ferramenta: {currentFerramenta?.nome}</DialogTitle>
            <DialogDescription>
              Registre o empréstimo da ferramenta.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input id="responsavel" value={formDataEmprestimo.responsavel} onChange={handleEmprestimoInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_emprestimo">Data Empréstimo</Label>
              <Input id="data_emprestimo" type="datetime-local" value={formDataEmprestimo.data_emprestimo} onChange={handleEmprestimoInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_devolucao_prevista">Devolução Prevista</Label>
              <Input id="data_devolucao_prevista" type="datetime-local" value={formDataEmprestimo.data_devolucao_prevista} onChange={handleEmprestimoInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input id="observacoes" value={formDataEmprestimo.observacoes} onChange={handleEmprestimoInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmprestimoModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEmprestimo}>Registrar Empréstimo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Manutenção de Ferramenta */}
      <Dialog open={isManutencaoModalOpen} onOpenChange={setIsManutencaoModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Manutenção: {currentFerramenta?.nome}</DialogTitle>
            <DialogDescription>
              Registre uma manutenção para a ferramenta.
              </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Manutenção</Label>
              <Input id="tipo" value={formDataManutencao.tipo} onChange={handleManutencaoInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" value={formDataManutencao.descricao} onChange={handleManutencaoInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_manutencao">Data Manutenção</Label>
              <Input id="data_manutencao" type="date" value={formDataManutencao.data_manutencao} onChange={handleManutencaoInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custo">Custo</Label>
              <Input id="custo" type="number" step="0.01" value={formDataManutencao.custo} onChange={handleManutencaoInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input id="responsavel" value={formDataManutencao.responsavel} onChange={handleManutencaoInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fornecedor_servico">Fornecedor do Serviço</Label>
              <Input id="fornecedor_servico" value={formDataManutencao.fornecedor_servico} onChange={handleManutencaoInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input id="observacoes" value={formDataManutencao.observacoes} onChange={handleManutencaoInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManutencaoModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveManutencao}>Registrar Manutenção</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
