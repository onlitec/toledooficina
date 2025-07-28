import { useState, useEffect } from 'react'
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

export function Financeiro() {
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
        alert('Descrição é obrigatória')
        return
      }

      if (!contaData.valor) {
        alert('Valor é obrigatório')
        return
      }

      if (!contaData.data_vencimento) {
        alert('Data de vencimento é obrigatória')
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
        alert(editingConta?.id ? 'Conta atualizada com sucesso!' : 'Conta cadastrada com sucesso!')
        setShowForm(false)
        setEditingConta(null)
        loadContas()
      } else {
        throw new Error(result.message)
      }

    } catch (error) {
      alert('Erro ao salvar conta: ' + error.message)
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
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600">Controle financeiro da oficina</p>
        </div>
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
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir esta conta?')) {
                              // Implementar exclusão
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
    </div>
  )
}

