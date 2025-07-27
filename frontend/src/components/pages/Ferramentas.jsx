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
  Calendar
} from 'lucide-react'
import { FerramentaForm } from './FerramentaForm'
import { EmprestimoForm } from './EmprestimoForm'
import { ManutencaoForm } from './ManutencaoForm'

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

  const handleSaveFerramenta = async (formData) => {
    try {
      const url = editingFerramenta 
        ? `/api/ferramentas/${editingFerramenta.id}`
        : '/api/ferramentas'
      
      const method = editingFerramenta ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        handleCloseForm()
        loadFerramentas()
        loadEstatisticas()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar ferramenta')
      }
    } catch (error) {
      console.error('Erro ao salvar ferramenta:', error)
      alert('Erro ao salvar ferramenta')
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
      <FerramentaForm 
        ferramenta={editingFerramenta}
        onClose={handleCloseForm}
        onSave={handleSaveFerramenta}
      />
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
          onClick={() => setShowForm(true)}
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
                        onClick={() => {
                          setEditingFerramenta(ferramenta)
                          setShowForm(true)
                        }}
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
