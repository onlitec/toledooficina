import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Car, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck
} from 'lucide-react'

export function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalClientes: 1234,
    totalVeiculos: 2456,
    ordensAndamento: 45,
    totalFornecedores: 89
  })

  // Dados dos cards principais (sem faturamento mensal)
  const statsCards = [
    {
      title: 'Total de Clientes',
      value: stats.totalClientes.toLocaleString(),
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500',
      link: '/clientes'
    },
    {
      title: 'Veículos Cadastrados',
      value: stats.totalVeiculos.toLocaleString(),
      change: '+8%',
      changeType: 'positive',
      icon: Car,
      color: 'bg-green-500',
      link: '/veiculos'
    },
    {
      title: 'Ordens em Andamento',
      value: stats.ordensAndamento.toString(),
      change: '-5%',
      changeType: 'negative',
      icon: FileText,
      color: 'bg-yellow-500',
      link: '/ordens-servico'
    },
    {
      title: 'Total de Fornecedores',
      value: stats.totalFornecedores.toLocaleString(),
      change: '+3%',
      changeType: 'positive',
      icon: Truck,
      color: 'bg-purple-500',
      link: '/fornecedores'
    }
  ]

  useEffect(() => {
    setLoading(false)
  }, [])

  const handleCardClick = (link) => {
    navigate(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Painel de Controle</h1>
        <p className="text-gray-600">Visão geral da sua oficina mecânica</p>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div 
              key={index} 
              className="bg-white shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200 p-6"
              onClick={() => handleCardClick(card.link)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className={`text-sm ${
                    card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
#                    {card.change} em relaç
o ao mês anterior
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Placeholder para gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ordens de Serviço por Mês</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Gráfico em desenvolvimento</p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Tipo de Serviço</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Gráfico em desenvolvimento</p>
          </div>
        </div>
      </div>
    </div>
  )
}
