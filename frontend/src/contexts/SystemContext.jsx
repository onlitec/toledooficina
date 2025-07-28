import { createContext, useContext, useState, useEffect } from 'react'

const SystemContext = createContext()

export function SystemProvider({ children }) {
  const [systemConfig, setSystemConfig] = useState({
    titulo_empresa: 'ERP Oficina Mecânica',
    logotipo_info: {
      tem_logotipo: false,
      url_logotipo: null,
      nome_arquivo: null
    }
  })

  const [loading, setLoading] = useState(false)

  const carregarConfiguracoesDoSistema = async () => {
    try {
      setLoading(true)
      
      // Carregar título da empresa
      const tituloResponse = await fetch('/api/configuracoes/sistema/titulo')
      if (tituloResponse.ok) {
        const tituloResult = await tituloResponse.json()
        if (tituloResult.success) {
          setSystemConfig(prev => ({
            ...prev,
            titulo_empresa: tituloResult.data.titulo
          }))
        }
      }

      // Carregar informações do logotipo
      const logoResponse = await fetch('/api/configuracoes/sistema/logotipo')
      if (logoResponse.ok) {
        const logoResult = await logoResponse.json()
        if (logoResult.success) {
          setSystemConfig(prev => ({
            ...prev,
            logotipo_info: logoResult.data
          }))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do sistema:', error)
    } finally {
      setLoading(false)
    }
  }

  const atualizarTituloEmpresa = (novoTitulo) => {
    setSystemConfig(prev => ({
      ...prev,
      titulo_empresa: novoTitulo
    }))
  }

  const atualizarLogotipo = (logoInfo) => {
    setSystemConfig(prev => ({
      ...prev,
      logotipo_info: logoInfo
    }))
  }

  useEffect(() => {
    carregarConfiguracoesDoSistema()
  }, [])

  const value = {
    systemConfig,
    loading,
    carregarConfiguracoesDoSistema,
    atualizarTituloEmpresa,
    atualizarLogotipo
  }

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  )
}

export function useSystem() {
  const context = useContext(SystemContext)
  if (!context) {
    throw new Error('useSystem deve ser usado dentro de um SystemProvider')
  }
  return context
}
