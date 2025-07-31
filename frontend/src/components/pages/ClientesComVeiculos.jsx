import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Car, 
  Plus, 
  Trash2, 
  Camera, 
  Upload, 
  X,
  Save,
  ArrowLeft
} from 'lucide-react'
import { useNotify } from '../ui/notification'

export function ClientesComVeiculos() {
  const navigate = useNavigate()
  const notify = useNotify()
  const [loading, setLoading] = useState(false)
  const [clienteData, setClienteData] = useState({
    nome: '',
    tipo_pessoa: 'fisica',
    cpf_cnpj: '',
    telefone: '',
    celular: '',
    email: ''
  })

  const [veiculos, setVeiculos] = useState([{
    marca: '',
    modelo: '',
    placa: '',
    ano_fabricacao: '',
    ano_modelo: '',
    cor: '',
    chassi: '',
    renavam: '',
    combustivel: 'gasolina',
    motor: '',
    cambio: 'manual',
    quilometragem: '',
    observacoes: '',
    fotos: []
  }])

  const handleClienteChange = (field, value) => {
    setClienteData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleVeiculoChange = (index, field, value) => {
    const novosVeiculos = [...veiculos]
    novosVeiculos[index][field] = value
    setVeiculos(novosVeiculos)
  }

  const adicionarVeiculo = () => {
    setVeiculos([...veiculos, {
      marca: '',
      modelo: '',
      placa: '',
      ano_fabricacao: '',
      ano_modelo: '',
      cor: '',
      chassi: '',
      renavam: '',
      combustivel: 'gasolina',
      motor: '',
      cambio: 'manual',
      quilometragem: '',
      observacoes: '',
      fotos: []
    }])
  }

  const removerVeiculo = (index) => {
    if (veiculos.length > 1) {
      const novosVeiculos = veiculos.filter((_, i) => i !== index)
      setVeiculos(novosVeiculos)
    }
  }

  const salvarCliente = async () => {
    try {
      setLoading(true)

      if (!clienteData.nome || !clienteData.cpf_cnpj) {
        notify.error('Nome e CPF/CNPJ são obrigatórios')
        return
      }

      for (let i = 0; i < veiculos.length; i++) {
        const veiculo = veiculos[i]
        if (!veiculo.marca || !veiculo.modelo || !veiculo.placa) {
          notify.error(`Marca, modelo e placa são obrigatórios para o veículo ${i + 1}`)
          return
        }
      }

      const dadosCompletos = {
        ...clienteData,
        veiculos: veiculos
      }

      const response = await fetch('/api/clientes/com-veiculos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosCompletos)
      })

      const result = await response.json()

      if (result.success) {
        notify.success('Cliente e veículo(s) cadastrados com sucesso!')
        navigate('/clientes')
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
          <h1 className="text-3xl font-bold text-gray-900">Cadastrar Cliente com Veículos</h1>
          <p className="text-gray-600">Cadastre um cliente junto com seus veículos</p>
        </div>
        <button
          onClick={() => navigate('/clientes')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </button>
      </div>

      {/* Dados do Cliente */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            <Users className="h-5 w-5 inline mr-2" />
            Dados do Cliente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={clienteData.nome}
                onChange={(e) => handleClienteChange('nome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome completo do cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Pessoa
              </label>
              <select
                value={clienteData.tipo_pessoa}
                onChange={(e) => handleClienteChange('tipo_pessoa', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fisica">Pessoa Fica</option>
                <option value="juridica">Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {clienteData.tipo_pessoa === 'fisica' ? 'CPF' : 'CNPJ'} *
              </label>
              <input
                type="text"
                value={clienteData.cpf_cnpj}
                onChange={(e) => handleClienteChange('cpf_cnpj', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={clienteData.tipo_pessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="text"
                value={clienteData.telefone}
                onChange={(e) => handleClienteChange('telefone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Celular
              </label>
              <input
                type="text"
                value={clienteData.celular}
                onChange={(e) => handleClienteChange('celular', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={clienteData.email}
                onChange={(e) => handleClienteChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="cliente@email.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Veículos */}
      <div className="space-y-4">
        {veiculos.map((veiculo, index) => (
          <div key={index} className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <Car className="h-5 w-5 inline mr-2" />
                  Veículo {index + 1}
                </h3>
                {veiculos.length > 1 && (
                  <button
                    onClick={() => removerVeiculo(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={veiculo.marca}
                    onChange={(e) => handleVeiculoChange(index, 'marca', e.target.value)}
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
                    value={veiculo.modelo}
                    onChange={(e) => handleVeiculoChange(index, 'modelo', e.target.value)}
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
                    value={veiculo.placa}
                    onChange={(e) => handleVeiculoChange(index, 'placa', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ABC-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano Fabricação
                  </label>
                  <input
                    type="number"
                    value={veiculo.ano_fabricacao}
                    onChange={(e) => handleVeiculoChange(index, 'ano_fabricacao', e.target.value)}
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
                    value={veiculo.ano_modelo}
                    onChange={(e) => handleVeiculoChange(index, 'ano_modelo', e.target.value)}
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
                    value={veiculo.cor}
                    onChange={(e) => handleVeiculoChange(index, 'cor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Branco"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chassi
                  </label>
                  <input
                    type="text"
                    value={veiculo.chassi}
                    onChange={(e) => handleVeiculoChange(index, 'chassi', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="9BWZZZ377VT004251"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Renavam
                  </label>
                  <input
                    type="text"
                    value={veiculo.renavam}
                    onChange={(e) => handleVeiculoChange(index, 'renavam', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345678901"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Combustível
                  </label>
                  <select
                    value={veiculo.combustivel}
                    onChange={(e) => handleVeiculoChange(index, 'combustivel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gasolina">Gasolina</option>
                    <option value="etanol">Etanol</option>
                    <option value="flex">Flex</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motor
                  </label>
                  <input
                    type="text"
                    value={veiculo.motor}
                    onChange={(e) => handleVeiculoChange(index, 'motor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1.0, 1.6, 2.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Câmbio
                  </label>
                  <select
                    value={veiculo.cambio}
                    onChange={(e) => handleVeiculoChange(index, 'cambio', e.target.value)}
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
                    value={veiculo.quilometragem}
                    onChange={(e) => handleVeiculoChange(index, 'quilometragem', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50000"
                  />
                </div>
              </div>

              {/* Observações do Veículo */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={veiculo.observacoes}
                  onChange={(e) => handleVeiculoChange(index, 'observacoes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Observações sobre o veículo..."
                />
              </div>

              {/* Área de fotos simplificada */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotos do Veículo (Vistoria)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Funcionalidade de fotos será implementada após o cadastro
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Botão para adicionar veículo */}
        <button
          onClick={adicionarVeiculo}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        >
          <Plus className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <span className="text-gray-600">Adicionar outro veículo</span>
        </button>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => navigate('/clientes')}
          className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={salvarCliente}
          disabled={loading}
          className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4 inline mr-2" />
          {loading ? 'Salvando...' : 'Salvar Cliente e Veículos'}
        </button>
      </div>
    </div>
  )
}
