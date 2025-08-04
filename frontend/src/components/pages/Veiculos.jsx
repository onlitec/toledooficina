import { useState, useEffect } from 'react'
<<<<<<< HEAD
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
import { useNotify } from '../ui/notification'
import { useConfirm } from '../ui/confirmation-dialog'

export function Veiculos() {
  const navigate = useNavigate()
  const notify = useNotify()
  const confirm = useConfirm()
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
    veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (veiculo.cliente_nome && veiculo.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()))
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
    const confirmed = await confirm.confirmDelete(
      'Tem certeza que deseja excluir este veículo?',
      'Esta ação não pode ser desfeita.'
    )
    
    if (confirmed) {
      try {
        const response = await fetch(`http://localhost:5000/api/veiculos/${id}`, {
          method: 'DELETE'
        })
        const result = await response.json()
        
        if (result.success) {
          notify.success('Veículo excluído com sucesso!')
          carregarVeiculos()
        } else {
          notify.error('Erro ao excluir veículo: ' + result.message)
        }
      } catch (error) {
        notify.error('Erro ao excluir veículo: ' + error.message)
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
=======
import { Plus, Search, Car, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

export function Veiculos() {
  const [veiculos, setVeiculos] = useState([])
  const [clientes, setClientes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentVeiculo, setCurrentVeiculo] = useState(null)
  const [formData, setFormData] = useState({
    cliente_id: '',
    marca: '',
    modelo: '',
    ano_fabricacao: '',
    ano_modelo: '',
    cor: '',
    placa: '',
    chassi: '',
    renavam: '',
    combustivel: '',
    motor: '',
    cambio: '',
    quilometragem_atual: '',
    vencimento_ipva: '',
    vencimento_seguro: '',
    vencimento_licenciamento: '',
    observacoes: ''
  })

  useEffect(() => {
    fetchVeiculos()
    fetchClientes()
  }, [])

  const fetchVeiculos = async () => {
    try {
      const response = await fetch(`/api/veiculos?search=${searchTerm}`)
      const data = await response.json()
      if (data.success) {
        setVeiculos(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar veículos.', variant: 'destructive' })
    }
  }

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      const data = await response.json()
      if (data.success) {
        setClientes(data.data)
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar clientes.', variant: 'destructive' })
    }
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSaveVeiculo = async () => {
    const method = currentVeiculo ? 'PUT' : 'POST'
    const url = currentVeiculo ? `/api/veiculos/${currentVeiculo.id}` : '/api/veiculos'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        setIsModalOpen(false)
        fetchVeiculos()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar veículo.', variant: 'destructive' })
    }
  }

  const handleEditVeiculo = (veiculo) => {
    setCurrentVeiculo(veiculo)
    setFormData({
      cliente_id: veiculo.cliente_id,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano_fabricacao: veiculo.ano_fabricacao,
      ano_modelo: veiculo.ano_modelo || '',
      cor: veiculo.cor || '',
      placa: veiculo.placa,
      chassi: veiculo.chassi || '',
      renavam: veiculo.renavam || '',
      combustivel: veiculo.combustivel || '',
      motor: veiculo.motor || '',
      cambio: veiculo.cambio || '',
      quilometragem_atual: veiculo.quilometragem_atual || '',
      vencimento_ipva: veiculo.vencimento_ipva ? new Date(veiculo.vencimento_ipva).toISOString().split('T')[0] : '',
      vencimento_seguro: veiculo.vencimento_seguro ? new Date(veiculo.vencimento_seguro).toISOString().split('T')[0] : '',
      vencimento_licenciamento: veiculo.vencimento_licenciamento ? new Date(veiculo.vencimento_licenciamento).toISOString().split('T')[0] : '',
      observacoes: veiculo.observacoes || ''
    })
    setIsModalOpen(true)
  }

  const handleDeleteVeiculo = async (id) => {
    if (!window.confirm('Tem certeza que deseja desativar este veículo?')) return
    try {
      const response = await fetch(`/api/veiculos/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sucesso', description: data.message })
        fetchVeiculos()
      } else {
        toast({ title: 'Erro', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao desativar veículo.', variant: 'destructive' })
    }
  }

  const handleNewVeiculoClick = () => {
    setCurrentVeiculo(null)
    setFormData({
      cliente_id: '',
      marca: '',
      modelo: '',
      ano_fabricacao: '',
      ano_modelo: '',
      cor: '',
      placa: '',
      chassi: '',
      renavam: '',
      combustivel: '',
      motor: '',
      cambio: '',
      quilometragem_atual: '',
      vencimento_ipva: '',
      vencimento_seguro: '',
      vencimento_licenciamento: '',
      observacoes: ''
    })
    setIsModalOpen(true)
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Veículos</h1>
          <p className="text-gray-600">Gerencie os veículos dos clientes</p>
        </div>
        
<<<<<<< HEAD
        <button
          onClick={handleNovoVeiculo}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
=======
        <Button onClick={handleNewVeiculoClick}>
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
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
<<<<<<< HEAD
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
=======
            onKeyDown={(e) => { if (e.key === 'Enter') fetchVeiculos() }}
            className="pl-10"
>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
          />
        </div>
        <Button onClick={fetchVeiculos}>Buscar</Button>
      </div>

<<<<<<< HEAD
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
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {veiculo.cliente_nome || `Cliente #${veiculo.cliente_id}`}
                            </div>
                            {veiculo.cliente_telefone && (
                              <div className="text-sm text-gray-500">
                                {veiculo.cliente_telefone}
                              </div>
                            )}
                          </div>
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
=======
      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="h-5 w-5 mr-2" />
            Lista de Veículos
          </CardTitle>
          <CardDescription>
            Visualize e gerencie os veículos cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {veiculos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="6" className="text-center">Nenhum veículo encontrado.</TableCell>
                </TableRow>
              ) : (
                veiculos.map(veiculo => (
                  <TableRow key={veiculo.id}>
                    <TableCell className="font-medium">{veiculo.placa}</TableCell>
                    <TableCell>{veiculo.marca}</TableCell>
                    <TableCell>{veiculo.modelo}</TableCell>
                    <TableCell>{veiculo.ano_fabricacao}</TableCell>
                    <TableCell>{clientes.find(c => c.id === veiculo.cliente_id)?.nome || 'N/A'}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditVeiculo(veiculo)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteVeiculo(veiculo.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentVeiculo ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do veículo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente</Label>
              <Select id="cliente_id" value={formData.cliente_id} onValueChange={(value) => handleSelectChange('cliente_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input id="placa" value={formData.placa} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input id="marca" value={formData.marca} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input id="modelo" value={formData.modelo} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano_fabricacao">Ano Fabricação</Label>
              <Input id="ano_fabricacao" type="number" value={formData.ano_fabricacao} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano_modelo">Ano Modelo</Label>
              <Input id="ano_modelo" type="number" value={formData.ano_modelo} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Input id="cor" value={formData.cor} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chassi">Chassi</Label>
              <Input id="chassi" value={formData.chassi} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="renavam">Renavam</Label>
              <Input id="renavam" value={formData.renavam} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="combustivel">Combustível</Label>
              <Input id="combustivel" value={formData.combustivel} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motor">Motor</Label>
              <Input id="motor" value={formData.motor} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cambio">Câmbio</Label>
              <Input id="cambio" value={formData.cambio} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quilometragem_atual">Quilometragem Atual</Label>
              <Input id="quilometragem_atual" type="number" value={formData.quilometragem_atual} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vencimento_ipva">Vencimento IPVA</Label>
              <Input id="vencimento_ipva" type="date" value={formData.vencimento_ipva} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vencimento_seguro">Vencimento Seguro</Label>
              <Input id="vencimento_seguro" type="date" value={formData.vencimento_seguro} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vencimento_licenciamento">Vencimento Licenciamento</Label>
              <Input id="vencimento_licenciamento" type="date" value={formData.vencimento_licenciamento} onChange={handleInputChange} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input id="observacoes" value={formData.observacoes} onChange={handleInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveVeiculo}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


>>>>>>> fab928f (Implementação completa dos cadastros e correção do sistema de toast)
