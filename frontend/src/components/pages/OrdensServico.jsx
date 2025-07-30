import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, ArrowLeft, Save, FileText, User, Calendar, DollarSign } from 'lucide-react'

export function OrdensServico() {
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
        alert('Cliente é obrigatório')
        return
      }

      if (!osData.descricao_problema.trim()) {
        alert('Descrição do problema é obrigatória')
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
        alert(editingOs?.id ? 'Ordem de serviço atualizada com sucesso!' : 'Ordem de serviço criada com sucesso!')
        setShowForm(false)
        setEditingOs(null)
        loadOs()
      } else {
        throw new Error(result.message)
      }

    } catch (error) {
      alert('Erro ao salvar ordem de serviço: ' + error.message)
    } finally {
      setLoading(false)
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
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="text-gray-600">Gerencie as ordens de serviço da oficina</p>
        </div>
        <button
          onClick={handleNovaOs}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Ordem
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            placeholder="Buscar ordens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    </div>
  )
}

