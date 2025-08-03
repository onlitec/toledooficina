import { createContext, useContext, useState, useEffect } from 'react'
import { apiRequest as apiRequestUtil } from '@/utils/api'

const SystemContext = createContext()

export function SystemProvider({ children }) {
  // Estados de autenticação
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  // Estados do sistema
  const [systemConfig, setSystemConfig] = useState({
    titulo_empresa: 'ERP Oficina Mecânica',
    logotipo_info: {
      tem_logotipo: false,
      url_logotipo: null,
      nome_arquivo: null
    }
  })

  const [loading, setLoading] = useState(false)

  // Estados de notificações
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Estoque Baixo',
      message: '5 itens com estoque abaixo do mínimo',
      time: '2 min atrás'
    },
    {
      id: 2,
      type: 'info',
      title: 'Nova OS',
      message: 'OS #1234 foi criada para o cliente João Silva',
      time: '5 min atrás'
    }
  ])

  // Função para renovar token usando refresh token
  const refreshAccessToken = async () => {
    try {
      const savedRefreshToken = localStorage.getItem('refreshToken')
      if (!savedRefreshToken) {
        console.warn('Refresh token não encontrado')
        logout()
        return null
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedRefreshToken}`
        }
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          if (data.success && data.data.access_token) {
            const newToken = data.data.access_token
            setToken(newToken)
            localStorage.setItem('token', newToken)
            return newToken
          }
        } else {
          console.error('Resposta de refresh não é JSON válido')
        }
      } else {
        console.warn('Falha na renovação do token:', response.status)
      }

      // Se chegou aqui, houve falha na renovação
      logout()
      return null
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      logout()
      return null
    }
  }

  // Verificar autenticação ao carregar a aplicação
  const checkAuth = async () => {
    try {
      const savedToken = localStorage.getItem('token')
      const savedRefreshToken = localStorage.getItem('refreshToken')
      const savedUser = localStorage.getItem('user')

      if (savedToken && savedUser) {
        // Verificar se o token ainda é válido
        const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setToken(savedToken)
          setRefreshToken(savedRefreshToken) // pode ser null se não há refresh token
          setIsAuthenticated(true)
        } else if (response.status === 401 && savedRefreshToken) {
          // Token expirado e há refresh token, tentar renovar
          const newToken = await refreshAccessToken()
          if (newToken) {
            // Tentar novamente com o novo token
            const retryResponse = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${newToken}`
              }
            })
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json()
              setUser(retryData.user)
              setRefreshToken(savedRefreshToken)
              setIsAuthenticated(true)
            } else {
              logout()
            }
          }
        } else {
          // Token expirado e sem refresh token, ou outro erro
          logout()
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      logout()
    } finally {
      setAuthLoading(false)
    }
  }

  const login = (userData, accessToken, userRefreshToken) => {
    setUser(userData)
    setToken(accessToken)
    setRefreshToken(userRefreshToken)
    setIsAuthenticated(true)
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    
    // Só salvar refresh token se ele existir (quando remember_me é true)
    if (userRefreshToken) {
      localStorage.setItem('refreshToken', userRefreshToken)
    } else {
      localStorage.removeItem('refreshToken')
    }
  }

  const logout = async () => {
    try {
      // Tentar fazer logout no servidor para invalidar refresh token
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error)
    } finally {
      // Limpar dados locais independentemente do resultado
      setUser(null)
      setToken(null)
      setRefreshToken(null)
      setIsAuthenticated(false)
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // Função para fazer requisições autenticadas com renovação automática de token
  const apiRequest = async (url, options = {}) => {
    return apiRequestUtil(url, options)
  }

  const carregarConfiguracoesDoSistema = async () => {
    try {
      setLoading(true)

      // Carregar título da empresa
      const tituloResponse = await apiRequest('/api/configuracoes/sistema/titulo')
      if (tituloResponse.ok) {
        const contentType = tituloResponse.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const tituloResult = await tituloResponse.json()
          if (tituloResult.success) {
            setSystemConfig(prev => ({
              ...prev,
              titulo_empresa: tituloResult.data.titulo
            }))
          }
        } else {
          console.warn('Resposta não é JSON válido para título da empresa')
        }
      } else {
        console.warn('Erro ao carregar título da empresa:', tituloResponse.status)
      }

      // Carregar informações do logotipo
      const logoResponse = await apiRequest('/api/configuracoes/sistema/logotipo')
      if (logoResponse.ok) {
        const contentType = logoResponse.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const logoResult = await logoResponse.json()
          if (logoResult.success) {
            setSystemConfig(prev => ({
              ...prev,
              logotipo_info: logoResult.data
            }))
          }
        } else {
          console.warn('Resposta não é JSON válido para logotipo')
        }
      } else {
        console.warn('Erro ao carregar logotipo:', logoResponse.status)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do sistema:', error)
      // Se houver erro de autenticação, tentar fazer logout
      if (error.message && error.message.includes('401')) {
        console.log('Erro de autenticação detectado, fazendo logout...')
        logout()
      }
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

  // Funções de notificações
  const addNotification = (notification) => {
    setNotifications(prev => [
      { ...notification, id: Date.now(), time: 'Agora' },
      ...prev
    ])
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  // Verificar permissões do usuário
  const hasPermission = (permission) => {
    if (!user) return false

    const rolePermissions = {
      'admin': ['read', 'write', 'delete', 'manage_users', 'manage_system'],
      'manager': ['read', 'write', 'delete'],
      'user': ['read', 'write']
    }

    const userPermissions = rolePermissions[user.role] || []
    return userPermissions.includes(permission)
  }

  const hasRole = (role) => {
    return user && user.role === role
  }

  const isAdmin = () => hasRole('admin')
  const isManager = () => hasRole('manager') || hasRole('admin')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      carregarConfiguracoesDoSistema()
    }
  }, [isAuthenticated])

  const value = {
    // Autenticação
    user,
    token,
    refreshToken,
    isAuthenticated,
    authLoading,
    login,
    logout,
    updateUser,
    checkAuth,
    refreshAccessToken,
    apiRequest,

    // Permissões
    hasPermission,
    hasRole,
    isAdmin,
    isManager,

    // Sistema
    systemConfig,
    loading,
    carregarConfiguracoesDoSistema,
    atualizarTituloEmpresa,
    atualizarLogotipo,

    // Notificações
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
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
