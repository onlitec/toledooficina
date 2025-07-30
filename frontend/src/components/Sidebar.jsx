import { Link, useLocation } from 'react-router-dom'
import { useSystem } from '@/contexts/SystemContext'
import {
  LayoutDashboard,
  Users,
  Car,
  Package,
  Tags,
  Wrench,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: Car, label: 'Veículos', path: '/veiculos' },
  { icon: Package, label: 'Estoque', path: '/estoque' },
  { icon: Tags, label: 'Categorias', path: '/categorias' },
  { icon: Wrench, label: 'Ferramentas', path: '/ferramentas' },
  { icon: FileText, label: 'Ordens de Serviço', path: '/ordens-servico' },
  { icon: DollarSign, label: 'Financeiro', path: '/financeiro' },
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
]

export function Sidebar({ open, setOpen }) {
  const location = useLocation()
  const { systemConfig } = useSystem()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full bg-white shadow-lg transition-all duration-300
        ${open ? 'w-64' : 'w-16'}
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {open && (
            <div className="flex items-center space-x-2">
              {systemConfig.logotipo_info?.tem_logotipo ? (
                <img
                  src={systemConfig.logotipo_info.url_logotipo}
                  alt="Logo da empresa"
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <Wrench className="h-8 w-8 text-blue-600" />
              )}
              <span className="text-xl font-bold text-gray-800">
                {systemConfig.titulo_empresa}
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(!open)}
            className="hidden lg:flex"
          >
            {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                onClick={() => window.innerWidth < 1024 && setOpen(false)}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {open && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {open && (
          <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-500 text-center">
            ERP Oficina v1.0
          </div>
        )}
      </div>
    </>
  )
}

