import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Dashboard } from '@/components/pages/Dashboard'
import { Clientes } from '@/components/pages/Clientes'
import { Veiculos } from '@/components/pages/Veiculos'
import { Estoque } from '@/components/pages/Estoque'
import { Ferramentas } from '@/components/pages/Ferramentas'
import { OrdensServico } from '@/components/pages/OrdensServico'
import { Financeiro } from '@/components/pages/Financeiro'
import { Relatorios } from '@/components/pages/Relatorios'
import { Configuracoes } from '@/components/pages/Configuracoes'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/veiculos" element={<Veiculos />} />
              <Route path="/estoque" element={<Estoque />} />
              <Route path="/ferramentas" element={<Ferramentas />} />
              <Route path="/ordens-servico" element={<OrdensServico />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App

