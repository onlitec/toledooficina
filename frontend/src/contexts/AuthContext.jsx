import { useSystem } from './SystemContext'

export function useAuth() {
  const { login: setLoginData, logout, user, isAuthenticated, authLoading } = useSystem()

  const login = async (username, password, rememberMe = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          remember_me: rememberMe
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Usar a função login do SystemContext para salvar os dados
        setLoginData(data.user, data.access_token, data.refresh_token)
        return data
      } else {
        throw new Error(data.message || 'Erro na requisição: ' + response.status)
      }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  return {
    login,
    logout,
    user,
    isAuthenticated,
    authLoading
  }
}