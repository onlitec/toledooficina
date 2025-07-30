import { Navigate, useLocation } from 'react-router-dom'
import { useSystem } from '../contexts/SystemContext'

export function ProtectedRoute({ children, requiredRole = null, requiredPermission = null }) {
  const { isAuthenticated, authLoading, user, hasRole, hasPermission } = useSystem()
  const location = useLocation()

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar role se especificada
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-gray-500">
            Role necessária: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{requiredRole}</span>
          </p>
          <p className="text-sm text-gray-500">
            Sua role: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user?.role}</span>
          </p>
        </div>
      </div>
    )
  }

  // Verificar permissão se especificada
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-gray-500">
            Permissão necessária: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{requiredPermission}</span>
          </p>
        </div>
      </div>
    )
  }

  // Renderizar componente se todas as verificações passaram
  return children
}

// Componente específico para rotas de admin
export function AdminRoute({ children }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  )
}

// Componente específico para rotas de manager
export function ManagerRoute({ children }) {
  return (
    <ProtectedRoute requiredPermission="delete">
      {children}
    </ProtectedRoute>
  )
}
