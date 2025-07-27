import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

export function OrdensServicoForm({ ordem, onClose, onSave }) {
  const [formData, setFormData] = useState({
    numero: ordem?.numero || '',
    cliente_id: ordem?.cliente_id || '',
    veiculo_id: ordem?.veiculo_id || '',
    data_previsao: ordem?.data_previsao?.split('T')[0] || '',
    prioridade: ordem?.prioridade || 'normal',
    problema_relatado: ordem?.problema_relatado || '',
    observacoes: ordem?.observacoes || ''
  })
  const [clientes, setClientes] = useState([])
  const [veiculos, setVeiculos] = useState([])

  useEffect(() => {
    async function fetchClientes() {
      try {
        const res = await fetch('/api/clientes')
        const json = await res.json()
        if (json.success) setClientes(json.data)
      } catch (e) {
        console.error('Erro ao carregar clientes:', e)
      }
    }
    fetchClientes()
  }, [])

  useEffect(() => {
    async function fetchVeiculos() {
      try {
        if (formData.cliente_id) {
          const res = await fetch(`/api/veiculos?cliente_id=${formData.cliente_id}&per_page=100`)
          const json = await res.json()
          if (json.success) setVeiculos(json.data)
          else setVeiculos([])
        } else {
          setVeiculos([])
        }
      } catch (e) {
        console.error('Erro ao carregar veículos:', e)
      }
    }
    fetchVeiculos()
  }, [formData.cliente_id])

  // Geração automática do número da OS ao criar nova ordem (apenas se não estiver editando)
  useEffect(() => {
    if (!ordem) {
      (async () => {
        try {
          const res = await fetch('/api/ordens-servico')
          const json = await res.json()
          if (json.success) {
            const currentYear = new Date().getFullYear()
            const count = json.data.filter(os => os.numero.startsWith(`${currentYear}-`)).length
            const nextNumero = `${currentYear}-${count.toString().padStart(4,'0')}`
            setFormData(prev => ({ ...prev, numero: nextNumero }))
          }
        } catch (e) {
          console.error('Erro ao gerar número da OS:', e)
        }
      })()
    }
  }, [ordem])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {ordem ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número da OS</label>
            <p className="w-full px-3 py-2 bg-gray-100 rounded-md">{formData.numero}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select
              name="cliente_id"
              value={formData.cliente_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Selecione o cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Veículo *</label>
            <select
              name="veiculo_id"
              value={formData.veiculo_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Selecione o veículo</option>
              {veiculos.map(v => (
                <option key={v.id} value={v.id}>{v.placa}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Previsão</label>
            <input
              type="date"
              name="data_previsao"
              value={formData.data_previsao}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
            <select
              name="prioridade"
              value={formData.prioridade}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="baixa">Baixa</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problema Relatado</label>
            <textarea
              name="problema_relatado"
              value={formData.problema_relatado}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >Cancelar</button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
