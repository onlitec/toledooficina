import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SystemProvider, useSystem } from '@/contexts/SystemContext'
import { NotificationProvider } from '@/components/ui/notification'
import { ConfirmationProvider } from '@/components/ui/confirmation-dialog'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { ProtectedRoute, AdminRoute } from '@/components/ProtectedRoute'

// Páginas
import { Login } from '@/components/pages/Login'
import { ForgotPassword } from '@/components/pages/ForgotPassword'
import { ResetPassword } from '@/components/pages/ResetPassword'
import { Dashboard } from '@/components/pages/Dashboard'
import { Clientes } from '@/components/pages/Clientes'
import { Veiculos } from '@/components/pages/Veiculos'
import { Estoque } from '@/components/pages/Estoque'
import { Categorias } from '@/components/pages/Categorias'
import { Ferramentas } from '@/components/pages/Ferramentas'
import { OrdensServico } from '@/components/pages/OrdensServico'
import { Financeiro } from '@/components/pages/Financeiro'
import { Relatorios } from '@/components/pages/Relatorios'
import { Configuracoes } from '@/components/pages/Configuracoes'
import './App.css'

// Componente principal da aplicação autenticada
function AuthenticatedApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/veiculos" element={<Veiculos />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/ferramentas" element={<Ferramentas />} />
            <Route path="/ordens-servico" element={<OrdensServico />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={
              <AdminRoute>
                <Configuracoes />
              </AdminRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  )
}

// Componente de roteamento principal
function AppRoutes() {
  const { isAuthenticated, authLoading } = useSystem()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
        }
      />
      <Route
        path="/reset-password"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <SystemProvider>
      <NotificationProvider>
        <ConfirmationProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ConfirmationProvider>
      </NotificationProvider>
    </SystemProvider>
  )
}

export default App

