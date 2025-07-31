import { useState, useEffect } from 'react'
import { 
  Car, 
  Camera, 
  Upload, 
  X,
  Save,
  ArrowLeft,
  User
} from 'lucide-react'
import { useNotify } from '../ui/notification'
import { apiGet, apiPost, apiPut, apiDelete, apiUpload, getImageUrl } from '@/utils/api'

export function VeiculoForm({ veiculo, onClose, onSave }) {
  const notify = useNotify()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState([])
  const [fotosPreviews, setFotosPreviews] = useState([])
  
  const [veiculoData, setVeiculoData] = useState({
    cliente_id: '',
    marca: '',
    modelo: '',
    ano_fabricacao: '',
    ano_modelo: '',
    cor: '',
    placa: '',
    chassi: '',
    renavam: '',
    combustivel: 'gasolina',
    motor: '',
    cambio: 'manual',
    quilometragem: '',
    vencimento_ipva: '',
    vencimento_seguro: '',
    vencimento_licenciamento: '',
    observacoes: '',
    fotos: []
  })

  useEffect(() => {
    carregarClientes()
    if (veiculo) {
      // Garantir que todos os campos tenham valores string para evitar warnings do React
      setVeiculoData({
        cliente_id: veiculo.cliente_id || '',
        marca: veiculo.marca || '',
        modelo: veiculo.modelo || '',
        ano_fabricacao: veiculo.ano_fabricacao || '',
        ano_modelo: veiculo.ano_modelo || '',
        cor: veiculo.cor || '',
        placa: veiculo.placa || '',
        chassi: veiculo.chassi || '',
        renavam: veiculo.renavam || '',
        combustivel: veiculo.combustivel || 'gasolina',
        motor: veiculo.motor || '',
        cambio: veiculo.cambio || 'manual',
        quilometragem: veiculo.quilometragem || '',
        vencimento_ipva: veiculo.vencimento_ipva || '',
        vencimento_seguro: veiculo.vencimento_seguro || '',
        vencimento_licenciamento: veiculo.vencimento_licenciamento || '',
        observacoes: veiculo.observacoes || '',
        fotos: veiculo.fotos || []
      })
      // Carregar previews das fotos existentes
      if (veiculo.fotos && veiculo.fotos.length > 0) {
        const previews = veiculo.fotos.map(foto => ({
          preview: getImageUrl(`veiculos/${foto}`),
          name: foto,
          existing: true
        }))
        setFotosPreviews(previews)
      }
    }
  }, [veiculo])

  const carregarClientes = async () => {
    try {
      const result = await apiGet('/clientes')
      if (result.success) {
        setClientes(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }

  const handleChange = (field, value) => {
    setVeiculoData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFotoUpload = (event) => {
    const files = Array.from(event.target.files)
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        notify.error('Arquivo muito grande. Máximo 5MB por foto.')
        return
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        notify.error('Tipo de arquivo não permitido. Use PNG, JPG, GIF ou WEBP.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setFotosPreviews(prev => [...prev, {
          file: file,
          preview: e.target.result,
          name: file.name,
          existing: false
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const abrirCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment'
      input.onchange = handleFotoUpload
      input.click()
    } else {
      notify.error('Câmera não disponível neste dispositivo')
    }
  }

  const removerFoto = async (index) => {
    const foto = fotosPreviews[index]
    
    if (foto.existing && veiculo?.id) {
      // Remover foto existente do servidor
      try {
        const result = await apiDelete(`/veiculos/${veiculo.id}/fotos/${foto.name}`)
        if (!result.success) {
          notify.error('Erro ao remover foto: ' + result.message)
          return
        }
      } catch (error) {
        notify.error('Erro ao remover foto: ' + error.message)
        return
      }
    }

    // Remover da preview
    const novasPreviews = fotosPreviews.filter((_, i) => i !== index)
    setFotosPreviews(novasPreviews)
  }

  const uploadFotosNovas = async (veiculoId) => {
    const fotosNovas = fotosPreviews.filter(foto => !foto.existing && foto.file)
    
    for (const foto of fotosNovas) {
      const formData = new FormData()
      formData.append('foto', foto.file)
      
      try {
        const result = await apiUpload(`/veiculos/${veiculoId}/fotos`, formData)
        if (!result.success) {
          console.error('Erro ao fazer upload da foto:', result.message)
        }
      } catch (error) {
        console.error('Erro ao fazer upload da foto:', error)
      }
    }
  }

  const salvarVeiculo = async () => {
    try {
      setLoading(true)

      // Validar dados obrigatrrrios
      if (!veiculoData.cliente_id || !veiculoData.marca || !veiculoData.modelo || !veiculoData.placa) {
        notify.error('Cliente, marca, modelo e placa são obrigatórios')
        return
      }

      let result
      if (veiculo?.id) {
        result = await apiPut(`/veiculos/${veiculo.id}`, veiculoData)
      } else {
        result = await apiPost('/veiculos', veiculoData)
      }

      if (result.success) {
        // Upload das fotos novas
        const veiculoId = veiculo?.id || result.data.id
        await uploadFotosNovas(veiculoId)
        
        notify.success(`Veículo ${veiculo?.id ? 'atualizado' : 'cadastrado'} com sucesso!`)
        onSave()
      } else {
        throw new Error(result.message)
      }

    } catch (error) {
      notify.error('Erro ao salvar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {veiculo?.id ? 'Editar Veículo' : 'Cadastrar Veículo'}
          </h1>
          <p className="text-gray-600">
            {veiculo?.id ? 'Edite os dados do veículo' : 'Cadastre um novo veículo'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            <Car className="h-5 w-5 inline mr-2" />
            Dados do Veículo
          </h3>
          
          <div className="space-y-6">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <select
                value={veiculoData.cliente_id}
                onChange={(e) => handleChange('cliente_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.cpf_cnpj}
                  </option>
                ))}
              </select>
            </div>

            {/* Dados básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  value={veiculoData.marca}
                  onChange={(e) => handleChange('marca', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Toyota"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  value={veiculoData.modelo}
                  onChange={(e) => handleChange('modelo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Corolla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa *
                </label>
                <input
                  type="text"
                  value={veiculoData.placa}
                  onChange={(e) => handleChange('placa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chassi
                </label>
                <input
                  type="text"
                  value={veiculoData.chassi}
                  onChange={(e) => handleChange('chassi', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9BWZZZ377VT004251"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano Fabricação
                </label>
                <input
                  type="number"
                  value={veiculoData.ano_fabricacao}
                  onChange={(e) => handleChange('ano_fabricacao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2020"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano Modelo
                </label>
                <input
                  type="number"
                  value={veiculoData.ano_modelo}
                  onChange={(e) => handleChange('ano_modelo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2021"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <input
                  type="text"
                  value={veiculoData.cor}
                  onChange={(e) => handleChange('cor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Branco"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Combustível
                </label>
                <select
                  value={veiculoData.combustivel}
                  onChange={(e) => handleChange('combustivel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gasolina">Gasolina</option>
                  <option value="etanol">Etanol</option>
                  <option value="flex">Flex</option>
                  <option value="diesel">Diesel</option>
                  <option value="gnv">GNV</option>
                  <option value="eletrico">Elétrico</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Câmbio
                </label>
                <select
                  value={veiculoData.cambio}
                  onChange={(e) => handleChange('cambio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="manual">Manual</option>
                  <option value="automatico">Automático</option>
                  <option value="cvt">CVT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quilometragem
                </label>
                <input
                  type="number"
                  value={veiculoData.quilometragem}
                  onChange={(e) => handleChange('quilometragem', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Fotos do Veículo */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Fotos do Veículo (Vistoria)</h4>
              <div className="flex space-x-2 mb-4">
                <button
                  type="button"
                  onClick={abrirCamera}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Fotografar
                </button>
                <label className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preview das fotos */}
              {fotosPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {fotosPreviews.map((foto, index) => (
                    <div key={index} className="relative">
                      <img
                        src={foto.preview}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removerFoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {foto.existing && (
                        <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                          Salva
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={veiculoData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observações sobre o veículo..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={salvarVeiculo}
          disabled={loading}
          className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4 inline mr-2" />
          {loading ? 'Salvando...' : (veiculo?.id ? 'Atualizar Veículo' : 'Salvar Veículo')}
        </button>
      </div>
    </div>
  )
}
