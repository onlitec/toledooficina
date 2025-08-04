import { useState, useEffect } from 'react'
<<<<<<< HEAD
import {
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Filter,
  BarChart3,
  Eye,
  ArrowUpDown,
  ArrowLeft,
  Save
} from 'lucide-react'
import { useNotify } from '../ui/notification'
import { useConfirm } from '../ui/confirmation-dialog'
import { apiGet, apiPost, apiPut, apiDelete } from '@/utils/api'

export function Estoque() {
  const notify = useNotify()
  const confirm = useConfirm()
  const [searchTerm, setSearchTerm] = useState('')
  const [pecas, setPecas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showMovimentacao, setShowMovimentacao] = useState(false)
  const [editingPeca, setEditingPeca] = useState(null)
  const [selectedPeca, setSelectedPeca] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [resumo, setResumo] = useState({})

  // Estados para o formulário inline
  const [pecaData, setPecaData] = useState({
    nome: '',
    codigo: '',
    categoria_id: '',
    preco_custo: '',
    preco_venda: '',
    estoque_minimo: '',
    estoque_atual: '',
    fornecedor: '',
    localizacao: '',
    descricao: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      await Promise.all([
        carregarPecas(),
        carregarCategorias(),
        carregarResumo()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarPecas = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filtroCategoria) params.append('categoria_id', filtroCategoria)
      if (filtroStatus) params.append('status_estoque', filtroStatus)
      
      const result = await apiGet(`/pecas?${params}`)
      
      if (result.success) {
        setPecas(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar peças:', error)
    }
  }

  const carregarCategorias = async () => {
    try {
      const result = await apiGet('/categorias')
      
      if (result.success) {
        setCategorias(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const carregarResumo = async () => {
    try {
      const result = await apiGet('/relatorios/resumo')
      
      if (result.success) {
        setResumo(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarPecas()
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, filtroCategoria, filtroStatus])

  const handleNovaPeca = () => {
    setEditingPeca(null)
    setPecaData({
      nome: '',
      codigo: '',
      categoria_id: '',
      preco_custo: '',
      preco_venda: '',
      estoque_minimo: '',
      estoque_atual: '',
      fornecedor: '',
      localizacao: '',
      descricao: ''
    })
    setShowForm(true)
  }

  const handleEditarPeca = (peca) => {
    setEditingPeca(peca)
    setPecaData({
      nome: peca.nome || '',
      codigo: peca.codigo || '',
      categoria_id: peca.categoria_id || '',
      preco_custo: peca.preco_custo || '',
      preco_venda: peca.preco_venda || '',
      estoque_minimo: peca.estoque_minimo || '',
      estoque_atual: peca.estoque_atual || '',
      fornecedor: peca.fornecedor || '',
      localizacao: peca.localizacao || '',
      descricao: peca.descricao || ''
    })
    setShowForm(true)
  }

  const handlePecaChange = (field, value) => {
    setPecaData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMovimentacao = (peca) => {
    setSelectedPeca(peca)
    setShowMovimentacao(true)
  }

  const handleExcluirPeca = async (id) => {
    const confirmed = await confirm.confirmDelete(
      'Tem certeza que deseja excluir esta peça?',
      'Esta ação não pode ser desfeita.'
    )
    
    if (confirmed) {
      try {
        const result = await apiDelete(`/pecas/${id}`)
        
        if (result.success) {
          notify.success('Peça excluída com sucesso!')
          carregarDados()
        } else {
          notify.error('Erro ao excluir peça: ' + result.message)
        }
      } catch (error) {
        notify.error('Erro ao excluir peça: ' + error.message)
      }
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingPeca(null)
  }

  const handleCloseMovimentacao = () => {
    setShowMovimentacao(false)
    setSelectedPeca(null)
  }

  const salvarPeca = async () => {
    try {
      setLoading(true)

      // Validações básicas
      if (!pecaData.nome.trim()) {
        notify.error('Nome da peça é obrigatório')
        return
      }

      // Código não é mais obrigatório - será gerado automaticamente se vazio

      const url = editingPeca?.id
        ? `/api/pecas/${editingPeca.id}`
        : '/api/pecas'

      const method = editingPeca?.id ? 'PUT' : 'POST'

      // Converter os dados para o formato esperado pelo backend
      const dataToSend = {
        ...pecaData,
        quantidade_atual: parseInt(pecaData.estoque_atual) || 0,
        quantidade_minima: parseInt(pecaData.estoque_minimo) || 0,
        preco_custo: parseFloat(pecaData.preco_custo) || 0,
        preco_venda: parseFloat(pecaData.preco_venda) || 0
      }

      const result = editingPeca?.id
        ? await apiPut(`/pecas/${editingPeca.id}`, dataToSend)
        : await apiPost('/pecas', dataToSend)

      if (result.success) {
        notify.success(editingPeca?.id ? 'Peça atualizada com sucesso!' : 'Peça cadastrada com sucesso!')
        setShowForm(false)
        setEditingPeca(null)
        carregarDados()
      } else {
        throw new Error(result.message)
      }

    } catch (error) {
      notify.error('Erro ao salvar peça: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMovimentacao = () => {
    setShowMovimentacao(false)
    setSelectedPeca(null)
    carregarDados()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'baixo':
        return 'text-red-600 bg-red-100'
      case 'alto':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-green-600 bg-green-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'baixo':
        return <AlertTriangle className="h-4 w-4" />
      case 'alto':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const filteredPecas = pecas.filter(peca => {
    const matchSearch = !searchTerm || 
      peca.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peca.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (peca.codigo_fabricante && peca.codigo_fabricante.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchCategoria = !filtroCategoria || peca.categoria_id == filtroCategoria
    const matchStatus = !filtroStatus || peca.status_estoque === filtroStatus
    
    return matchSearch && matchCategoria && matchStatus
  })

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editingPeca?.id ? 'Editar Peça' : 'Cadastrar Peça'}
            </h1>
            <p className="text-gray-600">
              {editingPeca?.id ? 'Edite os dados da peça' : 'Cadastre uma nova peça no estoque'}
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

        {/* Formulário da Peça */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Dados da Peça
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Peça *
                </label>
                <input
                  type="text"
                  value={pecaData.nome}
                  onChange={(e) => handlePecaChange('nome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da peça"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  value={pecaData.codigo}
                  onChange={(e) => handlePecaChange('codigo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deixe vazio para gerar automaticamente (CP-0001)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={pecaData.categoria_id}
                  onChange={(e) => handlePecaChange('categoria_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço de Custo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pecaData.preco_custo}
                  onChange={(e) => handlePecaChange('preco_custo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço de Venda
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pecaData.preco_venda}
                  onChange={(e) => handlePecaChange('preco_venda', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Mínimo
                </label>
                <input
                  type="number"
                  value={pecaData.estoque_minimo}
                  onChange={(e) => handlePecaChange('estoque_minimo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Atual
                </label>
                <input
                  type="number"
                  value={pecaData.estoque_atual}
                  onChange={(e) => handlePecaChange('estoque_atual', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                <input
                  type="text"
                  value={pecaData.fornecedor}
                  onChange={(e) => handlePecaChange('fornecedor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização
                </label>
                <input
                  type="text"
                  value={pecaData.localizacao}
                  onChange={(e) => handlePecaChange('localizacao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Prateleira A1"
                />
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={pecaData.descricao}
                  onChange={(e) => handlePecaChange('descricao', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição detalhada da peça"
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
            onClick={salvarPeca}
            disabled={loading}
            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 inline mr-2" />
            {loading ? 'Salvando...' : (editingPeca?.id ? 'Atualizar Peça' : 'Salvar Peça')}
          </button>
        </div>
      </div>
    )
  }

  if (showMovimentacao) {
    return (
      <MovimentacaoForm 
        peca={selectedPeca}
        onClose={handleCloseMovimentacao} 
        onSave={handleSaveMovimentacao} 
      />
    )
=======
import { Plus, Search, Package, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Estoque() {
  const [pecas, setPecas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isPecaModalOpen, setIsPecaModalOpen] = useState(false)
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false)
  const [isFornecedorModalOpen, setIsFornecedorModalOpen] = useState(false)
  const [isMovimentacaoModalOpen, setIsMovimentacaoModalOpen] = useState(false)
  const [currentPeca, setCurrentPeca] = useState(null)
  const [currentCategoria, setCurrentCategoria] = useState(null)
  const [currentFornecedor, setCurrentFornecedor] = useState(null)
  const [formDataPeca, setFormDataPeca] = useState({
    codigo: '', nome: '', descricao: '', categoria_id: '', fornecedor_id: '',
    quantidade_atual: 0, quantidade_minima: 0, quantidade_maxima: 0, localizacao: '',
    preco_custo: 0, preco_venda: 0, margem_lucro: 0, unidade_medida: 'UN',
    codigo_fabricante: '', codigo_original: '', aplicacao: ''
  })
  const [formDataCategoria, setFormDataCategoria] = useState({ nome: '', descricao: '' })
  const [formDataFornecedor, setFormDataFornecedor] = useState({
    nome: '', cnpj: '', telefone: '', email: '', endereco: '', contato: '', observacoes: ''
  })
  const [formDataMovimentacao, setFormDataMovimentacao] = useState({
    tipo: 'entrada', quantidade: 0, motivo: '', observacoes: ''
  })

  useEffect(() => {
    fetchPecas()
    fetchCategorias()
    fetchFornecedores()
  }, [])

  const fetchPecas = async () => {
    try {
      const response = await fetch(`/api/pecas?search=${searchTerm}`)
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

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias')
      const data = await response.json()
      if (data.success) {
        setCategorias(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar categorias.', variant: 'destructive' })
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

  // Handlers para Peças
  const handlePecaInputChange = (e) => {
    const { id, value } = e.target
    setFormDataPeca(prev => ({ ...prev, [id]: value }))
  }

  const handlePecaSelectChange = (id, value) => {
    setFormDataPeca(prev => ({ ...prev, [id]: value }))
  }

  const handleSavePeca = async () => {
    const method = currentPeca ? 'PUT' : 'POST'
    const url = currentPeca ? `/api/pecas/${currentPeca.id}` : '/api/pecas'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataPeca)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        setIsPecaModalOpen(false)
        fetchPecas()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar peça.', variant: 'destructive' })
    }
  }

  const handleEditPeca = (peca) => {
    setCurrentPeca(peca)
    setFormDataPeca({
      codigo: peca.codigo, nome: peca.nome, descricao: peca.descricao || '',
      categoria_id: peca.categoria_id || '', fornecedor_id: peca.fornecedor_id || '',
      quantidade_atual: peca.quantidade_atual, quantidade_minima: peca.quantidade_minima,
      quantidade_maxima: peca.quantidade_maxima, localizacao: peca.localizacao || '',
      preco_custo: peca.preco_custo, preco_venda: peca.preco_venda, margem_lucro: peca.margem_lucro,
      unidade_medida: peca.unidade_medida, codigo_fabricante: peca.codigo_fabricante || '',
      codigo_original: peca.codigo_original || '', aplicacao: peca.aplicacao || ''
    })
    setIsPecaModalOpen(true)
  }

  const handleDeletePeca = async (id) => {
    if (!window.confirm('Tem certeza que deseja desativar esta peça?')) return
    try {
      const response = await fetch(`/api/pecas/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        fetchPecas()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao desativar peça.', variant: 'destructive' })
    }
  }

  const handleNewPecaClick = () => {
    setCurrentPeca(null)
    setFormDataPeca({
      codigo: '', nome: '', descricao: '', categoria_id: '', fornecedor_id: '',
      quantidade_atual: 0, quantidade_minima: 0, quantidade_maxima: 0, localizacao: '',
      preco_custo: 0, preco_venda: 0, margem_lucro: 0, unidade_medida: 'UN',
      codigo_fabricante: '', codigo_original: '', aplicacao: ''
    })
    setIsPecaModalOpen(true)
  }

  // Handlers para Categorias
  const handleCategoriaInputChange = (e) => {
    const { id, value } = e.target
    setFormDataCategoria(prev => ({ ...prev, [id]: value }))
  }

  const handleSaveCategoria = async () => {
    const method = currentCategoria ? 'PUT' : 'POST'
    const url = currentCategoria ? `/api/categorias/${currentCategoria.id}` : '/api/categorias'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataCategoria)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        setIsCategoriaModalOpen(false)
        fetchCategorias()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar categoria.', variant: 'destructive' })
    }
  }

  const handleEditCategoria = (categoria) => {
    setCurrentCategoria(categoria)
    setFormDataCategoria({ nome: categoria.nome, descricao: categoria.descricao || '' })
    setIsCategoriaModalOpen(true)
  }

  const handleDeleteCategoria = async (id) => {
    if (!window.confirm('Tem certeza que deseja desativar esta categoria?')) return
    try {
      const response = await fetch(`/api/categorias/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        fetchCategorias()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao desativar categoria.', variant: 'destructive' })
    }
  }

  const handleNewCategoriaClick = () => {
    setCurrentCategoria(null)
    setFormDataCategoria({ nome: '', descricao: '' })
    setIsCategoriaModalOpen(true)
  }

  // Handlers para Fornecedores
  const handleFornecedorInputChange = (e) => {
    const { id, value } = e.target
    setFormDataFornecedor(prev => ({ ...prev, [id]: value }))
  }

  const handleSaveFornecedor = async () => {
    const method = currentFornecedor ? 'PUT' : 'POST'
    const url = currentFornecedor ? `/api/fornecedores/${currentFornecedor.id}` : '/api/fornecedores'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataFornecedor)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        setIsFornecedorModalOpen(false)
        fetchFornecedores()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar fornecedor.', variant: 'destructive' })
    }
  }

  const handleEditFornecedor = (fornecedor) => {
    setCurrentFornecedor(fornecedor)
    setFormDataFornecedor({
      nome: fornecedor.nome, cnpj: fornecedor.cnpj || '', telefone: fornecedor.telefone || '',
      email: fornecedor.email || '', endereco: fornecedor.endereco || '', contato: fornecedor.contato || '',
      observacoes: fornecedor.observacoes || ''
    })
    setIsFornecedorModalOpen(true)
  }

  const handleDeleteFornecedor = async (id) => {
    if (!window.confirm('Tem certeza que deseja desativar este fornecedor?')) return
    try {
      const response = await fetch(`/api/fornecedores/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        fetchFornecedores()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao desativar fornecedor.', variant: 'destructive' })
    }
  }

  const handleNewFornecedorClick = () => {
    setCurrentFornecedor(null)
    setFormDataFornecedor({
      nome: '', cnpj: '', telefone: '', email: '', endereco: '', contato: '', observacoes: ''
    })
    setIsFornecedorModalOpen(true)
  }

  // Handlers para Movimentação de Estoque
  const handleMovimentacaoInputChange = (e) => {
    const { id, value } = e.target
    setFormDataMovimentacao(prev => ({ ...prev, [id]: value }))
  }

  const handleMovimentacaoSelectChange = (id, value) => {
    setFormDataMovimentacao(prev => ({ ...prev, [id]: value }))
  }

  const handleSaveMovimentacao = async () => {
    if (!currentPeca) return
    try {
      const response = await fetch(`/api/pecas/${currentPeca.id}/movimentacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataMovimentacao)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        setIsMovimentacaoModalOpen(false)
        fetchPecas()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao registrar movimentação.', variant: 'destructive' })
    }
  }

  const handleMovimentacaoClick = (peca) => {
    setCurrentPeca(peca)
    setFormDataMovimentacao({ tipo: 'entrada', quantidade: 0, motivo: '', observacoes: '' })
    setIsMovimentacaoModalOpen(true)
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-600">Gerencie o estoque de peças e produtos</p>
        </div>
<<<<<<< HEAD
        
        <button
          onClick={handleNovaPeca}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Peça
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total de Peças
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {resumo.total_pecas || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Estoque Baixo
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {resumo.estoque_baixo || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Valor Total
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(resumo.valor_total_estoque || 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Categorias
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {resumo.total_categorias || 0}
                </dd>
              </dl>
            </div>
          </div>
=======
        <div className="flex space-x-2">
          <Button onClick={handleNewPecaClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Peça
          </Button>
          <Button variant="outline" onClick={handleNewCategoriaClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
          <Button variant="outline" onClick={handleNewFornecedorClick}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar peças por código, nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchPecas() }}
            className="pl-10"
          />
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
        </div>
        <Button onClick={fetchPecas}>Buscar</Button>
      </div>

<<<<<<< HEAD
      {/* Filtros e Busca */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por código, nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as categorias</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
          
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="baixo">Estoque Baixo</option>
            <option value="normal">Estoque Normal</option>
            <option value="alto">Estoque Alto</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            <Package className="h-4 w-4 mr-2" />
            {filteredPecas.length} peça(s) encontrada(s)
          </div>
        </div>
      </div>

      {/* Lista de Peças */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            <Package className="h-5 w-5 inline mr-2" />
            Lista de Peças
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredPecas.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filtroCategoria || filtroStatus ? 'Nenhuma peça encontrada' : 'Nenhuma peça cadastrada'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filtroCategoria || filtroStatus
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece cadastrando a primeira peça'
                }
              </p>
              {!searchTerm && !filtroCategoria && !filtroStatus && (
                <button
                  onClick={handleNovaPeca}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeira Pea
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peça
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estoque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preços
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
                  {filteredPecas.map((peca) => (
                    <tr key={peca.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {peca.codigo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {peca.nome}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{peca.quantidade_atual} {peca.unidade_medida}</div>
                          <div className="text-gray-500">
                            Min: {peca.quantidade_minima} | Max: {peca.quantidade_maxima}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Custo: {formatCurrency(peca.preco_custo)}</div>
                          <div>Venda: {formatCurrency(peca.preco_venda)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(peca.status_estoque)}`}>
                          {getStatusIcon(peca.status_estoque)}
                          <span className="ml-1 capitalize">{peca.status_estoque}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleMovimentacao(peca)}
                            className="text-green-600 hover:text-green-900"
                            title="Movimentar Estoque"
                          >
                            <ArrowUpDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditarPeca(peca)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExcluirPeca(peca.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
=======
      {/* Content Tabs */}
      <Tabs defaultValue="pecas" className="w-full">
        <TabsList>
          <TabsTrigger value="pecas">Peças</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
        </TabsList>
        <TabsContent value="pecas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Lista de Peças
              </CardTitle>
              <CardDescription>
                Visualize e gerencie as peças em estoque.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Qtd. Atual</TableHead>
                    <TableHead>Qtd. Mínima</TableHead>
                    <TableHead>Preço Venda</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pecas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="8" className="text-center">Nenhuma peça encontrada.</TableCell>
                    </TableRow>
                  ) : (
                    pecas.map(peca => (
                      <TableRow key={peca.id}>
                        <TableCell className="font-medium">{peca.codigo}</TableCell>
                        <TableCell>{peca.nome}</TableCell>
                        <TableCell>{categorias.find(c => c.id === peca.categoria_id)?.nome || 'N/A'}</TableCell>
                        <TableCell>{fornecedores.find(f => f.id === peca.fornecedor_id)?.nome || 'N/A'}</TableCell>
                        <TableCell>{peca.quantidade_atual}</TableCell>
                        <TableCell>{peca.quantidade_minima}</TableCell>
                        <TableCell>R$ {peca.preco_venda.toFixed(2)}</TableCell>
                        <TableCell className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditPeca(peca)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleMovimentacaoClick(peca)}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeletePeca(peca.id)}>
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
        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Lista de Categorias
              </CardTitle>
              <CardDescription>
                Gerencie as categorias de peças.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="3" className="text-center">Nenhuma categoria encontrada.</TableCell>
                    </TableRow>
                  ) : (
                    categorias.map(categoria => (
                      <TableRow key={categoria.id}>
                        <TableCell className="font-medium">{categoria.nome}</TableCell>
                        <TableCell>{categoria.descricao}</TableCell>
                        <TableCell className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditCategoria(categoria)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteCategoria(categoria.id)}>
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
        <TabsContent value="fornecedores">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Lista de Fornecedores
              </CardTitle>
              <CardDescription>
                Gerencie os fornecedores de peças e insumos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fornecedores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="5" className="text-center">Nenhum fornecedor encontrado.</TableCell>
                    </TableRow>
                  ) : (
                    fornecedores.map(fornecedor => (
                      <TableRow key={fornecedor.id}>
                        <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                        <TableCell>{fornecedor.cnpj}</TableCell>
                        <TableCell>{fornecedor.telefone}</TableCell>
                        <TableCell>{fornecedor.email}</TableCell>
                        <TableCell className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditFornecedor(fornecedor)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteFornecedor(fornecedor.id)}>
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

      {/* Modal de Cadastro/Edição de Peça */}
      <Dialog open={isPecaModalOpen} onOpenChange={setIsPecaModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{currentPeca ? 'Editar Peça' : 'Nova Peça'}</DialogTitle>
            <DialogDescription>
              Preencha os dados da peça.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" value={formDataPeca.codigo} onChange={handlePecaInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={formDataPeca.nome} onChange={handlePecaInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" value={formDataPeca.descricao} onChange={handlePecaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria_id">Categoria</Label>
              <Select id="categoria_id" value={formDataPeca.categoria_id} onValueChange={(value) => handlePecaSelectChange('categoria_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fornecedor_id">Fornecedor</Label>
              <Select id="fornecedor_id" value={formDataPeca.fornecedor_id} onValueChange={(value) => handlePecaSelectChange('fornecedor_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map(forn => (
                    <SelectItem key={forn.id} value={forn.id}>{forn.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade_atual">Qtd. Atual</Label>
              <Input id="quantidade_atual" type="number" value={formDataPeca.quantidade_atual} onChange={handlePecaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade_minima">Qtd. Mínima</Label>
              <Input id="quantidade_minima" type="number" value={formDataPeca.quantidade_minima} onChange={handlePecaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade_maxima">Qtd. Máxima</Label>
              <Input id="quantidade_maxima" type="number" value={formDataPeca.quantidade_maxima} onChange={handlePecaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Input id="localizacao" value={formDataPeca.localizacao} onChange={handlePecaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preco_custo">Preço Custo</Label>
              <Input id="preco_custo" type="number" step="0.01" value={formDataPeca.preco_custo} onChange={handlePecaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preco_venda">Preço Venda</Label>
              <Input id="preco_venda" type="number" step="0.01" value={formDataPeca.preco_venda} onChange={handlePecaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margem_lucro">Margem Lucro (%)</Label>
              <Input id="margem_lucro" type="number" step="0.01" value={formDataPeca.margem_lucro} onChange={handlePecaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidade_medida">Unidade Medida</Label>
              <Input id="unidade_medida" value={formDataPeca.unidade_medida} onChange={handlePecaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo_fabricante">Cód. Fabricante</Label>
              <Input id="codigo_fabricante" value={formDataPeca.codigo_fabricante} onChange={handlePecaInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo_original">Cód. Original</Label>
              <Input id="codigo_original" value={formDataPeca.codigo_original} onChange={handlePecaInputChange} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="aplicacao">Aplicação</Label>
              <Input id="aplicacao" value={formDataPeca.aplicacao} onChange={handlePecaInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPecaModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePeca}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cadastro/Edição de Categoria */}
      <Dialog open={isCategoriaModalOpen} onOpenChange={setIsCategoriaModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentCategoria ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            <DialogDescription>
              Preencha os dados da categoria.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={formDataCategoria.nome} onChange={handleCategoriaInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" value={formDataCategoria.descricao} onChange={handleCategoriaInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoriaModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveCategoria}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cadastro/Edição de Fornecedor */}
      <Dialog open={isFornecedorModalOpen} onOpenChange={setIsFornecedorModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do fornecedor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={formDataFornecedor.nome} onChange={handleFornecedorInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={formDataFornecedor.cnpj} onChange={handleFornecedorInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={formDataFornecedor.telefone} onChange={handleFornecedorInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={formDataFornecedor.email} onChange={handleFornecedorInputChange} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" value={formDataFornecedor.endereco} onChange={handleFornecedorInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contato">Contato</Label>
              <Input id="contato" value={formDataFornecedor.contato} onChange={handleFornecedorInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input id="observacoes" value={formDataFornecedor.observacoes} onChange={handleFornecedorInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFornecedorModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveFornecedor}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Movimentação de Estoque */}
      <Dialog open={isMovimentacaoModalOpen} onOpenChange={setIsMovimentacaoModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Movimentar Estoque: {currentPeca?.nome}</DialogTitle>
            <DialogDescription>
              Registre uma entrada, saída ou ajuste de estoque.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Movimentação</Label>
              <Select id="tipo" value={formDataMovimentacao.tipo} onValueChange={(value) => handleMovimentacaoSelectChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input id="quantidade" type="number" value={formDataMovimentacao.quantidade} onChange={handleMovimentacaoInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Input id="motivo" value={formDataMovimentacao.motivo} onChange={handleMovimentacaoInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input id="observacoes" value={formDataMovimentacao.observacoes} onChange={handleMovimentacaoInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMovimentacaoModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveMovimentacao}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
