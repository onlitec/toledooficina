import { useState, useEffect } from 'react'
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
      
      const response = await fetch(`/api/pecas?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setPecas(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar peças:', error)
    }
  }

  const carregarCategorias = async () => {
    try {
      const response = await fetch('/api/categorias')
      const result = await response.json()
      
      if (result.success) {
        setCategorias(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const carregarResumo = async () => {
    try {
      const response = await fetch('/api/relatorios/resumo')
      const result = await response.json()
      
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
        const response = await fetch(`http://localhost:5000/api/pecas/${id}`, {
          method: 'DELETE'
        })
        const result = await response.json()
        
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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      const result = await response.json()

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
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-600">Gerencie o estoque de peças e produtos</p>
        </div>
        
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
        </div>
      </div>

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
