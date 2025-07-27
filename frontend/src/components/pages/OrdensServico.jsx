import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OrdensServicoForm } from './OrdensServicoForm'

export function OrdensServico() {
  const [searchTerm, setSearchTerm] = useState('')
  const [osList, setOsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingOs, setEditingOs] = useState(null)

  useEffect(() => {
    loadOs()
  }, [searchTerm])

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

  const handleSave = async (formData) => {
    try {
      const url = editingOs ? `/api/ordens-servico/${editingOs.id}` : '/api/ordens-servico'
      const method = editingOs ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const json = await response.json()
      if (json.success) {
        setShowForm(false)
        setEditingOs(null)
        loadOs()
      } else {
        alert(json.message || 'Erro ao salvar ordem de serviço')
      }
    } catch (error) {
      console.error('Erro ao salvar ordem de serviço:', error)
      alert('Erro ao salvar ordem de serviço')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deseja cancelar esta ordem de serviço?')) return
    try {
      const response = await fetch(`/api/ordens-servico/${id}`, { method: 'DELETE' })
      const json = await response.json()
      if (json.success) {
        loadOs()
      } else {
        alert(json.message || 'Erro ao cancelar ordem de serviço')
      }
    } catch (error) {
      console.error('Erro ao cancelar ordem de serviço:', error)
      alert('Erro ao cancelar ordem de serviço')
    }
  }

  if (showForm) {
    return (
      <OrdensServicoForm
        ordem={editingOs}
        onClose={() => {
          setShowForm(false)
          setEditingOs(null)
        }}
        onSave={handleSave}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="text-gray-600">Gerencie as ordens de serviço da oficina</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Ordem
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar ordens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

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
                      onClick={() => {
                        setEditingOs(os)
                        setShowForm(true)
                      }}
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
    </div>
  )
}

