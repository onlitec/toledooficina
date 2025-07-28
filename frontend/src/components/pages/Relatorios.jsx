import { useState, useEffect } from 'react'
import {
  BarChart3,
  FileText,
  Download,
  Plus,
  ArrowLeft,
  Save,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Wrench
} from 'lucide-react'

export function Relatorios() {
  const [showForm, setShowForm] = useState(false)
  const [relatorios, setRelatorios] = useState([])
  const [loading, setLoading] = useState(false)

  // Estados para o formulário inline
  const [relatorioData, setRelatorioData] = useState({
    tipo: 'vendas',
    titulo: '',
    data_inicio: '',
    data_fim: '',
    formato: 'pdf',
    incluir_graficos: true,
    filtros: {
      cliente_id: '',
      status: '',
      categoria: ''
    }
  })
  useEffect(() => {
    loadRelatorios()
  }, [])

  const loadRelatorios = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/relatorios')
      const result = await response.json()
      if (result.success) {
        setRelatorios(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNovoRelatorio = () => {
    setRelatorioData({
      tipo: 'vendas',
      titulo: '',
      data_inicio: '',
      data_fim: '',
      formato: 'pdf',
      incluir_graficos: true,
      filtros: {
        cliente_id: '',
        status: '',
        categoria: ''
      }
    })
    setShowForm(true)
  }

  const handleRelatorioChange = (field, value) => {
    if (field.startsWith('filtros.')) {
      const filterField = field.split('.')[1]
      setRelatorioData(prev => ({
        ...prev,
        filtros: {
          ...prev.filtros,
          [filterField]: value
        }
      }))
    } else {
      setRelatorioData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const gerarRelatorio = async () => {
    try {
      setLoading(true)

      // Validações básicas
      if (!relatorioData.titulo.trim()) {
        alert('Título do relatório é obrigatório')
        return
      }

      if (!relatorioData.data_inicio) {
        alert('Data de início é obrigatória')
        return
      }

      if (!relatorioData.data_fim) {
        alert('Data de fim é obrigatória')
        return
      }

      const response = await fetch('/api/relatorios/gerar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(relatorioData)
      })

      const result = await response.json()

      if (result.success) {
        alert('Relatório gerado com sucesso!')
        setShowForm(false)
        loadRelatorios()

        // Se houver URL de download, abrir em nova aba
        if (result.download_url) {
          window.open(result.download_url, '_blank')
        }
      } else {
        throw new Error(result.message)
      }

    } catch (error) {
      alert('Erro ao gerar relatório: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const tiposRelatorio = [
    { value: 'vendas', label: 'Relatório de Vendas', icon: DollarSign },
    { value: 'estoque', label: 'Relatório de Estoque', icon: Package },
    { value: 'clientes', label: 'Relatório de Clientes', icon: Users },
    { value: 'servicos', label: 'Relatório de Serviços', icon: Wrench },
    { value: 'financeiro', label: 'Relatório Financeiro', icon: TrendingUp }
  ]

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerar Novo Relatório
            </h1>
            <p className="text-gray-600">
              Configure os parâmetros para gerar um relatório personalizado
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

        {/* Formulário do Relatório */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Configurações do Relatório
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Relatório *
                </label>
                <input
                  type="text"
                  value={relatorioData.titulo}
                  onChange={(e) => handleRelatorioChange('titulo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Relatório de Vendas - Janeiro 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Relatório *
                </label>
                <select
                  value={relatorioData.tipo}
                  onChange={(e) => handleRelatorioChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tiposRelatorio.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início *
                </label>
                <input
                  type="date"
                  value={relatorioData.data_inicio}
                  onChange={(e) => handleRelatorioChange('data_inicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Fim *
                </label>
                <input
                  type="date"
                  value={relatorioData.data_fim}
                  onChange={(e) => handleRelatorioChange('data_fim', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formato
                </label>
                <select
                  value={relatorioData.formato}
                  onChange={(e) => handleRelatorioChange('formato', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div className="col-span-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="incluir_graficos"
                    checked={relatorioData.incluir_graficos}
                    onChange={(e) => handleRelatorioChange('incluir_graficos', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="incluir_graficos" className="ml-2 block text-sm text-gray-900">
                    Incluir gráficos no relatório
                  </label>
                </div>
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
            onClick={gerarRelatorio}
            disabled={loading}
            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 inline mr-2" />
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Relatórios e análises da oficina</p>
        </div>
        <button
          onClick={handleNovoRelatorio}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Gerar Relatório
        </button>
      </div>

      {/* Tipos de Relatórios Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiposRelatorio.map((tipo) => {
          const IconComponent = tipo.icon
          return (
            <div key={tipo.value} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {tipo.label}
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {tipo.value === 'vendas' && 'Análise detalhada das vendas e faturamento da oficina.'}
                {tipo.value === 'estoque' && 'Controle e movimentação do estoque de peças e materiais.'}
                {tipo.value === 'clientes' && 'Informações e histórico dos clientes da oficina.'}
                {tipo.value === 'servicos' && 'Relatório dos serviços executados e produtividade.'}
                {tipo.value === 'financeiro' && 'Análise financeira completa da oficina.'}
              </p>
              <button
                onClick={() => {
                  setRelatorioData(prev => ({ ...prev, tipo: tipo.value }))
                  handleNovoRelatorio()
                }}
                className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Gerar {tipo.label}
              </button>
            </div>
          )
        })}
      </div>

      {/* Histórico de Relatórios */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Relatórios Gerados Recentemente
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando relatórios...</p>
            </div>
          ) : relatorios.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório encontrado</h3>
              <p className="text-gray-600 mb-4">
                Comece gerando seu primeiro relatório.
              </p>
              <button
                onClick={handleNovoRelatorio}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Gerar Relatório
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gerado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {relatorios.map((relatorio) => (
                    <tr key={relatorio.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {relatorio.titulo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tiposRelatorio.find(t => t.value === relatorio.tipo)?.label || relatorio.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {relatorio.data_inicio && relatorio.data_fim ?
                          `${new Date(relatorio.data_inicio).toLocaleDateString('pt-BR')} - ${new Date(relatorio.data_fim).toLocaleDateString('pt-BR')}`
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {relatorio.created_at ? new Date(relatorio.created_at).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            if (relatorio.download_url) {
                              window.open(relatorio.download_url, '_blank')
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                          Download
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

