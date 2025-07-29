import { useState, useEffect } from 'react'
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

export function Ferramentas() {
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
      
      const response = await fetch(`/api/ferramentas?${params}`)
      const data = await response.json()
      setFerramentas(data)
    } catch (error) {
      console.error('Erro ao carregar ferramentas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEstatisticas = async () => {
    try {
      const response = await fetch('/api/ferramentas/estatisticas')
      const data = await response.json()
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
        alert('Nome da ferramenta é obrigatório')
        return
      }

      // Código não é mais obrigatório - será gerado automaticamente se vazio

      const url = editingFerramenta?.id
        ? `/api/ferramentas/${editingFerramenta.id}`
        : '/api/ferramentas'

      const method = editingFerramenta?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ferramentaData)
      })

      const result = await response.json()

      if (response.ok) {
        alert(editingFerramenta?.id ? 'Ferramenta atualizada com sucesso!' : 'Ferramenta cadastrada com sucesso!')
        setShowForm(false)
        setEditingFerramenta(null)
        loadFerramentas()
        loadEstatisticas()
      } else {
        throw new Error(result.error || result.message)
      }

    } catch (error) {
      alert('Erro ao salvar ferramenta: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFerramenta = async (id) => {
    if (!confirm('Tem certeza que deseja remover esta ferramenta?')) return
    
    try {
      const response = await fetch(`/api/ferramentas/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        loadFerramentas()
        loadEstatisticas()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao remover ferramenta')
      }
    } catch (error) {
      console.error('Erro ao remover ferramenta:', error)
      alert('Erro ao remover ferramenta')
    }
  }

  const handleEmprestimo = async (formData) => {
    try {
      const response = await fetch(`/api/ferramentas/${selectedFerramenta.id}/emprestimo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setShowEmprestimoForm(false)
        setSelectedFerramenta(null)
        loadFerramentas()
        loadEstatisticas()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao registrar empréstimo')
      }
    } catch (error) {
      console.error('Erro ao registrar empréstimo:', error)
      alert('Erro ao registrar empréstimo')
    }
  }

  const handleDevolucao = async (id) => {
    if (!confirm('Confirmar devolução da ferramenta?')) return
    
    try {
      const response = await fetch(`/api/ferramentas/${id}/devolucao`, {
        method: 'POST'
      })
      
      if (response.ok) {
        loadFerramentas()
        loadEstatisticas()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao registrar devolução')
      }
    } catch (error) {
      console.error('Erro ao registrar devolução:', error)
      alert('Erro ao registrar devolução')
    }
  }

  const handleManutencao = async (formData) => {
    try {
      const response = await fetch(`/api/ferramentas/${selectedFerramenta.id}/manutencao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setShowManutencaoForm(false)
        setSelectedFerramenta(null)
        loadFerramentas()
        loadEstatisticas()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao registrar manutenção')
      }
    } catch (error) {
      console.error('Erro ao registrar manutenção:', error)
      alert('Erro ao registrar manutenção')
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ferramentas</h1>
          <p className="text-gray-600">Controle de ferramentas e inventário</p>
        </div>
        <button
          onClick={handleNovaFerramenta}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Ferramenta
        </button>
      </div>

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
        </div>
      </div>

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
