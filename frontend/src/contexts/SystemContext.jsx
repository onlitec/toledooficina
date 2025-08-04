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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: savedRefreshToken
        })
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          if (data.success && data.access_token) {
            const newToken = data.access_token
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
    
    // Salvar refresh token apenas se fornecido
    if (userRefreshToken) {
      localStorage.setItem('refreshToken', userRefreshToken)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setRefreshToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  // Função para fazer requisições à API com token
  const apiRequest = async (url, options = {}) => {
    return apiRequestUtil(url, {
      ...options,
      token,
      refreshToken,
      onTokenRefresh: (newToken) => {
        setToken(newToken)
        localStorage.setItem('token', newToken)
      },
      onAuthError: logout
    })
  }

  // Carregar configurações do sistema
  const loadSystemConfig = async () => {
    try {
      setLoading(true)
      const response = await apiRequest('/api/configuracoes/sistema')
      if (response.success) {
        setSystemConfig(response.data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do sistema:', error)
    } finally {
      setLoading(false)
    }
  }

  // Atualizar configurações do sistema
  const updateSystemConfig = async (config) => {
    try {
      setLoading(true)
      const response = await apiRequest('/api/configuracoes/sistema', {
        method: 'PUT',
        body: JSON.stringify(config)
      })
      
      if (response.success) {
        setSystemConfig(response.data)
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      return { success: false, message: 'Erro interno do servidor' }
    } finally {
      setLoading(false)
    }
  }

  // Função para adicionar notificação
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      time: 'agora',
      ...notification
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  // Função para remover notificação
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  // Função para marcar notificação como lida
  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    checkAuth()
  }, [])

  // Carregar configurações do sistema quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadSystemConfig()
    }
  }, [isAuthenticated])

  const value = {
    // Estados de autenticação
    user,
    token,
    refreshToken,
    isAuthenticated,
    authLoading,
    
    // Funções de autenticação
    login,
    logout,
    checkAuth,
    refreshAccessToken,
    
    // Estados do sistema
    systemConfig,
    loading,
    
    // Funções do sistema
    loadSystemConfig,
    updateSystemConfig,
    apiRequest,
    
    // Estados e funções de notificações
    notifications,
    addNotification,
    removeNotification,
    markNotificationAsRead
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