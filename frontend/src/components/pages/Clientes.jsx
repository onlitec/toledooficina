import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, MapPin, Car, ArrowLeft, Save, Camera, Upload, X } from 'lucide-react'
import { useNotify } from '@/components/ui/notification'
import { useConfirm } from '@/components/ui/confirmation-dialog'

export function Clientes() {
  const notify = useNotify()
  const confirm = useConfirm()
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState(null)
  
  const [clienteData, setClienteData] = useState({
    nome: '',
    tipo_pessoa: 'fisica',
    cpf_cnpj: '',
    rg_ie: '',
    telefone: '',
    celular: '',
    email: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    data_nascimento: '',
    observacoes: ''
  })

  const [veiculos, setVeiculos] = useState([{
    marca: '',
    modelo: '',
    ano_fabricacao: '',
    ano_modelo: '',
    cor: '',
    placa: '',
    chassi: '',
    renavam: '',
    combustivel: 'flex',
    motor: '',
    cambio: 'manual',
    quilometragem: '',
    observacoes: '',
    fotos: []
  }])

  const [fotosPreviews, setFotosPreviews] = useState([])

  useEffect(() => {
    carregarClientes()
  }, [])

  const carregarClientes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/clientes')
      const result = await response.json()
      
      if (result.success) {
        setClientes(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNovoCliente = () => {
    setEditingCliente(null)
    setClienteData({
      nome: '',
      tipo_pessoa: 'fisica',
      cpf_cnpj: '',
      rg_ie: '',
      telefone: '',
      celular: '',
      email: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      data_nascimento: '',
      observacoes: ''
    })
    setVeiculos([{
      marca: '',
      modelo: '',
      ano_fabricacao: '',
      ano_modelo: '',
      cor: '',
      placa: '',
      chassi: '',
      renavam: '',
      combustivel: 'flex',
      motor: '',
      cambio: 'manual',
      quilometragem: '',
      observacoes: '',
      fotos: []
    }])
    setFotosPreviews([])
    setShowForm(true)
  }

  const handleEditarCliente = (cliente) => {
    setEditingCliente(cliente)
    // Garantir que todos os campos tenham valores string para evitar warnings do React
    setClienteData({
      nome: cliente.nome || '',
      tipo_pessoa: cliente.tipo_pessoa || 'fisica',
      cpf_cnpj: cliente.cpf_cnpj || '',
      rg_ie: cliente.rg_ie || '',
      telefone: cliente.telefone || '',
      celular: cliente.celular || '',
      email: cliente.email || '',
      endereco: cliente.endereco || '',
      numero: cliente.numero || '',
      complemento: cliente.complemento || '',
      bairro: cliente.bairro || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
      cep: cliente.cep || '',
      data_nascimento: cliente.data_nascimento || '',
      observacoes: cliente.observacoes || ''
    })
    setShowForm(true)
  }

  const handleExcluirCliente = async (id) => {
    const confirmed = await confirm.confirmDelete('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')
    if (confirmed) {
      try {
        const response = await fetch(`http://localhost:5000/api/clientes/${id}`, {
          method: 'DELETE'
        })
        const result = await response.json()
        
        if (result.success) {
          notify.success('Cliente excluído com sucesso!')
          carregarClientes()
        } else {
          notify.error('Erro ao excluir cliente: ' + result.message)
        }
      } catch (error) {
        notify.error('Erro ao excluir cliente: ' + error.message)
      }
    }
  }

  const handleClienteChange = (field, value) => {
    setClienteData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleVeiculoChange = (index, field, value) => {
    const novosVeiculos = [...veiculos]
    novosVeiculos[index] = {
      ...novosVeiculos[index],
      [field]: value
    }
    setVeiculos(novosVeiculos)
  }

  const adicionarVeiculo = () => {
    setVeiculos([...veiculos, {
      marca: '',
      modelo: '',
      ano_fabricacao: '',
      ano_modelo: '',
      cor: '',
      placa: '',
      chassi: '',
      renavam: '',
      combustivel: 'flex',
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
      // Remover fotos do veículo removido
      const novasFotosPreviews = fotosPreviews.filter(foto => foto.veiculoIndex !== index)
      setFotosPreviews(novasFotosPreviews)
    }
  }

  const handleFotoUpload = (event, veiculoIndex) => {
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
          veiculoIndex: veiculoIndex,
          existing: false
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const abrirCamera = (veiculoIndex) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment'
      input.onchange = (e) => handleFotoUpload(e, veiculoIndex)
      input.click()
    } else {
      notify.error('Câmera não disponível neste dispositivo')
    }
  }

  const removerFoto = (fotoIndex) => {
    const novasFotosPreviews = fotosPreviews.filter((_, i) => i !== fotoIndex)
    setFotosPreviews(novasFotosPreviews)
  }

  const getFotosVeiculo = (veiculoIndex) => {
    return fotosPreviews.filter(foto => foto.veiculoIndex === veiculoIndex)
  }

  const uploadFotosVeiculos = async (veiculosCriados) => {
    // Fazer upload das fotos para cada veículo criado
    for (let i = 0; i < veiculosCriados.length; i++) {
      const veiculo = veiculosCriados[i]
      const fotosVeiculo = fotosPreviews.filter(foto => foto.veiculoIndex === i && foto.file)
      
      for (const foto of fotosVeiculo) {
        const formData = new FormData()
        formData.append('foto', foto.file)
        
        try {
          const response = await fetch(`/api/veiculos/${veiculo.id}/fotos`, {
            method: 'POST',
            body: formData
          })
          const result = await response.json()
          if (!result.success) {
            console.error('Erro ao fazer upload da foto:', result.message)
          }
        } catch (error) {
          console.error('Erro ao fazer upload da foto:', error)
        }
      }
    }
  }

  const salvarCliente = async () => {
    try {
      setLoading(true)

      // Validar dados obrigatórios
      if (!clienteData.nome || !clienteData.cpf_cnpj) {
        notify.error("Nome e CPF/CNPJ são obrigatórios")
        return
      }

      // Validar veículos se houver algum preenchido
      const veiculosValidos = veiculos.filter(v => v.marca || v.modelo || v.placa)
      for (let i = 0; i < veiculosValidos.length; i++) {
        const veiculo = veiculosValidos[i]
        if (!veiculo.marca || !veiculo.modelo || !veiculo.placa) {
          notify.error(`Marca, modelo e placa são obrigatórios para o veículo ${i + 1}`)
          return
        }
      }

      if (editingCliente?.id) {
        // Atualizar cliente existente
        const response = await fetch(`/api/clientes/${editingCliente.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(clienteData)
        })

        const result = await response.json()

        if (result.success) {
          notify.success("Cliente atualizado com sucesso!")
          setShowForm(false)
          carregarClientes()
        } else {
          throw new Error(result.message)
        }
      } else {
        // Criar novo cliente com veículos
        const dadosCompletos = {
          ...clienteData,
          veiculos: veiculosValidos
        }

        const response = await fetch("/api/clientes/com-veiculos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dadosCompletos)
        })

        const result = await response.json()

        if (result.success) {
          // Fazer upload das fotos dos veículos criados
          if (result.data.veiculos && result.data.veiculos.length > 0) {
            await uploadFotosVeiculos(result.data.veiculos)
          }
          
          notify.success(result.message || "Cliente cadastrado com sucesso!")
          setShowForm(false)
          carregarClientes()
        } else {
          throw new Error(result.message)
        }
      }

    } catch (error) {
      notify.error("Erro ao salvar: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCPFCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
  }

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf_cnpj.includes(searchTerm) ||
    (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editingCliente?.id ? 'Editar Cliente' : 'Cadastrar Cliente'}
            </h1>
            <p className="text-gray-600">
              {editingCliente?.id ? 'Edite os dados do cliente' : 'Cadastre um novo cliente e seus veículos'}
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

        {/* Dados do Cliente */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Dados do Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-2">
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
                  <option value="fisica">Pessoa Física</option>
                  <option value="juridica">Pessoa Jurídica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {clienteData.tipo_pessoa === 'fisica' ? 'CPF *' : 'CNPJ *'}
                </label>
                <input
                  type="text"
                  value={clienteData.cpf_cnpj}
                  onChange={(e) => handleClienteChange('cpf_cnpj', formatCPFCNPJ(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={clienteData.tipo_pessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {clienteData.tipo_pessoa === 'fisica' ? 'RG' : 'Inscrição Estadual'}
                </label>
                <input
                  type="text"
                  value={clienteData.rg_ie}
                  onChange={(e) => handleClienteChange('rg_ie', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={clienteData.telefone}
                  onChange={(e) => handleClienteChange('telefone', formatPhone(e.target.value))}
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
                  onChange={(e) => handleClienteChange('celular', formatPhone(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={clienteData.email}
                  onChange={(e) => handleClienteChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Endereço
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={clienteData.endereco}
                  onChange={(e) => handleClienteChange('endereco', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua, Avenida, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={clienteData.numero}
                  onChange={(e) => handleClienteChange('numero', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={clienteData.complemento}
                  onChange={(e) => handleClienteChange('complemento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={clienteData.bairro}
                  onChange={(e) => handleClienteChange('bairro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={clienteData.cidade}
                  onChange={(e) => handleClienteChange('cidade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={clienteData.estado}
                  onChange={(e) => handleClienteChange('estado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={clienteData.cep}
                  onChange={(e) => handleClienteChange('cep', e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Veículos */}
        {!editingCliente?.id && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <Car className="h-5 w-5 inline mr-2" />
                  Veículos do Cliente
                </h3>
                <button
                  onClick={adicionarVeiculo}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Veículo
                </button>
              </div>
              
              {veiculos.map((veiculo, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">
                      Veículo {index + 1}
                    </h4>
                    {veiculos.length > 1 && (
                      <button
                        onClick={() => removerVeiculo(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marca
                      </label>
                      <input
                        type="text"
                        value={veiculo.marca}
                        onChange={(e) => handleVeiculoChange(index, 'marca', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Toyota, Ford, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modelo
                      </label>
                      <input
                        type="text"
                        value={veiculo.modelo}
                        onChange={(e) => handleVeiculoChange(index, 'modelo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Corolla, Fiesta, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Placa
                      </label>
                      <input
                        type="text"
                        value={veiculo.placa}
                        onChange={(e) => handleVeiculoChange(index, 'placa', e.target.value.toUpperCase())}
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
                        placeholder="Branco, Preto, etc."
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
                  </div>

                  {/* Fotos do Veículo */}
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Fotos do Veículo (Vistoria)</h4>
                    <div className="flex space-x-2 mb-4">
                      <button
                        type="button"
                        onClick={() => abrirCamera(index)}
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
                          onChange={(e) => handleFotoUpload(e, index)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Preview das fotos */}
                    {getFotosVeiculo(index).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {getFotosVeiculo(index).map((foto, fotoIndex) => {
                          const globalFotoIndex = fotosPreviews.findIndex(f => f === foto)
                          return (
                            <div key={fotoIndex} className="relative">
                              <img
                                src={foto.preview}
                                alt={`Foto ${fotoIndex + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                onClick={() => removerFoto(globalFotoIndex)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Observações
            </h3>
            
            <textarea
              value={clienteData.observacoes}
              onChange={(e) => handleClienteChange('observacoes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observações adicionais sobre o cliente..."
            />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowForm(false)}
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
            {loading ? 'Salvando...' : (editingCliente?.id ? 'Atualizar Cliente' : 'Salvar Cliente')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes da oficina</p>
        </div>
        
        <button
          onClick={handleNovoCliente}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Lista de Clientes
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece cadastrando o primeiro cliente'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleNovoCliente}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Cliente
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {cliente.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {cliente.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cliente.cpf_cnpj}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {cliente.telefone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1 text-gray-400" />
                              {cliente.telefone}
                            </div>
                          )}
                          {cliente.email && (
                            <div className="flex items-center mt-1">
                              <Mail className="h-4 w-4 mr-1 text-gray-400" />
                              {cliente.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {cliente.cidade && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                              {cliente.cidade}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditarCliente(cliente)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExcluirCliente(cliente.id)}
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
