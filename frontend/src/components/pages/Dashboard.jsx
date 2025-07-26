import { useState, useEffect } from 'react'
import { 
  Users, 
  Car, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const statsCards = [
  {
    title: 'Total de Clientes',
    value: '1,234',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    title: 'Veículos Cadastrados',
    value: '2,456',
    change: '+8%',
    changeType: 'positive',
    icon: Car,
    color: 'bg-green-500'
  },
  {
    title: 'Ordens em Andamento',
    value: '45',
    change: '-5%',
    changeType: 'negative',
    icon: FileText,
    color: 'bg-yellow-500'
  },
  {
    title: 'Faturamento Mensal',
    value: 'R$ 125.430',
    change: '+15%',
    changeType: 'positive',
    icon: DollarSign,
    color: 'bg-purple-500'
  }
]

const revenueData = [
  { month: 'Jan', revenue: 85000, orders: 120 },
  { month: 'Fev', revenue: 92000, orders: 135 },
  { month: 'Mar', revenue: 78000, orders: 110 },
  { month: 'Abr', revenue: 105000, orders: 150 },
  { month: 'Mai', revenue: 118000, orders: 165 },
  { month: 'Jun', revenue: 125430, orders: 180 }
]

const serviceTypeData = [
  { name: 'Manutenção Preventiva', value: 35, color: '#3B82F6' },
  { name: 'Troca de Óleo', value: 25, color: '#10B981' },
  { name: 'Freios', value: 20, color: '#F59E0B' },
  { name: 'Suspensão', value: 12, color: '#EF4444' },
  { name: 'Outros', value: 8, color: '#8B5CF6' }
]

const recentOrders = [
  { id: 'OS-1234', client: 'João Silva', vehicle: 'Honda Civic 2020', status: 'em_andamento', priority: 'alta' },
  { id: 'OS-1235', client: 'Maria Santos', vehicle: 'Toyota Corolla 2019', status: 'aguardando_peca', priority: 'normal' },
  { id: 'OS-1236', client: 'Pedro Costa', vehicle: 'Ford Ka 2021', status: 'concluida', priority: 'baixa' },
  { id: 'OS-1237', client: 'Ana Oliveira', vehicle: 'Volkswagen Gol 2018', status: 'aberta', priority: 'urgente' }
]

const alerts = [
  { type: 'warning', message: '5 peças com estoque baixo', icon: AlertTriangle },
  { type: 'info', message: '3 ferramentas precisam de manutenção', icon: Clock },
  { type: 'success', message: '12 ordens concluídas hoje', icon: CheckCircle }
]

export function Dashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const getStatusBadge = (status) => {
    const statusConfig = {
      'aberta': { label: 'Aberta', variant: 'secondary' },
      'em_andamento': { label: 'Em Andamento', variant: 'default' },
      'aguardando_peca': { label: 'Aguardando Peça', variant: 'destructive' },
      'concluida': { label: 'Concluída', variant: 'success' }
    }
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'baixa': { label: 'Baixa', className: 'bg-green-100 text-green-800' },
      'normal': { label: 'Normal', className: 'bg-blue-100 text-blue-800' },
      'alta': { label: 'Alta', className: 'bg-yellow-100 text-yellow-800' },
      'urgente': { label: 'Urgente', className: 'bg-red-100 text-red-800' }
    }
    
    const config = priorityConfig[priority] || { label: priority, className: 'bg-gray-100 text-gray-800' }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral da sua oficina mecânica</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className={`h-4 w-4 mr-1 ${
                        stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert, index) => {
          const Icon = alert.icon
          return (
            <Card key={index} className={`border-l-4 ${
              alert.type === 'warning' ? 'border-l-yellow-500' :
              alert.type === 'info' ? 'border-l-blue-500' :
              'border-l-green-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${
                    alert.type === 'warning' ? 'text-yellow-500' :
                    alert.type === 'info' ? 'text-blue-500' :
                    'text-green-500'
                  }`} />
                  <span className="text-sm font-medium">{alert.message}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
            <CardDescription>Receita dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Faturamento']} />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Types Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Serviço</CardTitle>
            <CardDescription>Distribuição dos serviços realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {serviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço Recentes</CardTitle>
          <CardDescription>Últimas ordens de serviço cadastradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.client}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.vehicle}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(order.priority)}
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

