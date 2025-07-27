import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Car, 
  Edit, 
  Trash2, 
  Eye, 
  Camera,
  User,
  Calendar,
  Fuel,
  Settings
} from 'lucide-react'
import { VeiculoForm } from './VeiculoForm'

export function Veiculos() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [veiculos, setVeiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVeiculo, setEditingVeiculo] = useState(null)

  useEffect(() => {
    carregarVeiculos()
  }, [])

  const carregarVeiculos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/veiculos')
      const result = await response.json()
      
      if (result.success) {
        setVeiculos(result.data)
      } else {
        console.error('Erro ao carregar veículos:', result.message)
      }
    } catch (error) {
      console.error('Erro ao carregar veículos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVeiculos = veiculos.filter(veiculo =>
    veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNovoVeiculo = () => {
    setEditingVeiculo(null)
    setShowForm(true)
  }

  const handleEditarVeiculo = (veiculo) => {
    setEditingVeiculo(veiculo)
    setShowForm(true)
  }

  const handleExcluirVeiculo = async (id) => {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
      try {
        const response = await fetch(`/api/veiculos/${id}`, {
          method: 'DELETE'
        })
        const result = await response.json()
        
        if (result.success) {
          alert('Veículo excluído com sucesso!')
          carregarVeiculos()
        } else {
          alert('Erro ao excluir veículo: ' + result.message)
        }
      } catch (error) {
        alert('Erro ao excluir veículo: ' + error.message)
      }
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingVeiculo(null)
  }

  const handleSaveVeiculo = () => {
    setShowForm(false)
    setEditingVeiculo(null)
    carregarVeiculos()
  }

  if (showForm) {
    return (
      <VeiculoForm 
        veiculo={editingVeiculo}
        onClose={handleCloseForm} 
        onSave={handleSaveVeiculo} 
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Veículos</h1>
          <p className="text-gray-600">Gerencie os veículos dos clientes</p>
        </div>
        
        <button
          onClick={handleNovoVeiculo}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Veículo
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por placa, marca ou modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Veículos */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            <Car className="h-5 w-5 inline mr-2" />
            Lista de Veículos ({filteredVeiculos.length})
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredVeiculos.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece cadastrando o primeiro veículo'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleNovoVeiculo}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Veículo
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Veículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Combustível
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fotos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVeiculos.map((veiculo) => (
                    <tr key={veiculo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Car className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {veiculo.marca} {veiculo.modelo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {veiculo.cor} • {veiculo.cambio}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">Cliente #{veiculo.cliente_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">{veiculo.placa}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{veiculo.ano_fabricacao || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Fuel className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 capitalize">{veiculo.combustivel || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Camera className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {veiculo.fotos ? veiculo.fotos.length : 0} foto(s)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditarVeiculo(veiculo)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExcluirVeiculo(veiculo.id)}
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
