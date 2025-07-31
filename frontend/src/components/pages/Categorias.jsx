import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, ArrowLeft, Save } from 'lucide-react'
import { useNotify } from '../ui/notification'
import { useConfirm } from '../ui/confirmation-dialog'

export function Categorias() {
  const notify = useNotify()
  const confirm = useConfirm()
  const [searchTerm, setSearchTerm] = useState('')
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState(null)

  // Estados para o formulário
  const [categoriaData, setCategoriaData] = useState({
    nome: '',
    descricao: ''
  })

  useEffect(() => {
    carregarCategorias()
  }, [])

  const carregarCategorias = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categorias')
      const result = await response.json()
      
      if (result.success) {
        setCategorias(result.data)
      } else {
        console.error('Erro ao carregar categorias:', result.message)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoriaChange = (field, value) => {
    setCategoriaData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const novaCategoria = () => {
    setCategoriaData({
      nome: '',
      descricao: ''
    })
    setEditingCategoria(null)
    setShowForm(true)
  }

  const editarCategoria = (categoria) => {
    setCategoriaData({
      nome: categoria.nome || '',
      descricao: categoria.descricao || ''
    })
    setEditingCategoria(categoria)
    setShowForm(true)
  }

  const salvarCategoria = async () => {
    try {
      setLoading(true)

      // Validar dados obrigatórios
      if (!categoriaData.nome.trim()) {
        notify.error('Nome da categoria é obrigatório')
        return
      }

      const url = editingCategoria?.id
        ? `/api/categorias/${editingCategoria.id}`
        : '/api/categorias'
      
      const method = editingCategoria?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoriaData)
      })

      const result = await response.json()

      if (result.success) {
        notify.success(result.message)
        setShowForm(false)
        setCategoriaData({ nome: '', descricao: '' })
        setEditingCategoria(null)
        carregarCategorias()
      } else {
        notify.error('Erro: ' + result.message)
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      notify.error('Erro ao salvar categoria: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const excluirCategoria = async (id) => {
    const confirmed = await confirm.confirmDelete(
      'Tem certeza que deseja excluir esta categoria?',
      'Esta ação não pode ser desfeita.'
    )
    
    if (!confirmed) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/categorias/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        notify.success('Categoria excluída com sucesso!')
        carregarCategorias()
      } else {
        notify.error('Erro: ' + result.message)
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      notify.error('Erro ao excluir categoria: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categoria.descricao && categoria.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading && categorias.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando categorias...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias de Peças</h1>
          <p className="text-gray-600">Gerencie as categorias para organizar suas peças</p>
        </div>
        
        {!showForm && (
          <button
            onClick={novaCategoria}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Categoria</span>
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={categoriaData.nome}
                  onChange={(e) => handleCategoriaChange('nome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Filtros, Pneus, Óleos..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={categoriaData.descricao}
                  onChange={(e) => handleCategoriaChange('descricao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição opcional da categoria"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarCategoria}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Categorias */}
      {!showForm && (
        <>
          {/* Busca */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Lista de Categorias ({filteredCategorias.length})
                </h3>
              </div>

              {filteredCategorias.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCategorias.map((categoria) => (
                        <tr key={categoria.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {categoria.nome}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              {categoria.descricao || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => editarCategoria(categoria)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => excluirCategoria(categoria.id)}
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
        </>
      )}
    </div>
  )
}
