// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const STATIC_BASE_URL = import.meta.env.VITE_STATIC_URL || '/static'

// Função para verificar se a resposta é JSON válido
const isJsonResponse = (response) => {
  const contentType = response.headers.get('content-type')
  return contentType && contentType.includes('application/json')
}

// Função para fazer parsing seguro de JSON
const safeJsonParse = async (response) => {
  if (!isJsonResponse(response)) {
    const text = await response.text()
    console.error('Resposta não é JSON válido:', text.substring(0, 200))
    throw new Error('Resposta não é JSON válido')
  }
  return await response.json()
}

// Função para gerar URL de imagem
export const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STATIC_BASE_URL}/uploads/${path}`
}

// Função utilitária para fazer requisições à API
export const apiRequest = async (endpoint, options = {}) => {
  // Remove /api do início do endpoint se estiver presente para evitar duplicação
  const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint
  const url = `${API_BASE_URL}${cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`}`
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // Obter token do localStorage se existir
  const token = localStorage.getItem('token')
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`
  }

  try {
    let response = await fetch(url, {
      ...options,
      headers: defaultHeaders
    })

    // Se receber 401 (não autorizado), tentar renovar o token
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          // Tentar renovar o token
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`
            }
          })

          if (refreshResponse.ok) {
            const contentType = refreshResponse.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
              const refreshResult = await refreshResponse.json()
              if (refreshResult.success && refreshResult.data.access_token) {
                // Salvar novo token
                localStorage.setItem('token', refreshResult.data.access_token)
                
                // Tentar novamente com o novo token
                defaultHeaders.Authorization = `Bearer ${refreshResult.data.access_token}`
                response = await fetch(url, {
                  ...options,
                  headers: defaultHeaders
                })
              }
            } else {
              console.error('Resposta de refresh não é JSON válido')
              // Limpar tokens inválidos
              localStorage.removeItem('token')
              localStorage.removeItem('refreshToken')
            }
          } else {
            console.warn('Falha na renovação do token:', refreshResponse.status)
            // Limpar tokens inválidos
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
          }
        } catch (refreshError) {
          console.error('Erro ao tentar renovar token:', refreshError)
          // Limpar tokens inválidos
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
        }
      } else {
        // Não há refresh token, limpar dados de autenticação
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    }

    return response
  } catch (error) {
    console.error('Erro na requisição API:', error)
    throw error
  }
}

// Função para fazer requisições GET com parsing seguro
export const apiGet = async (endpoint) => {
  const response = await apiRequest(endpoint, { method: 'GET' })
  if (response.ok) {
    return await safeJsonParse(response)
  }
  throw new Error(`Erro na requisição: ${response.status}`)
}

// Função para fazer requisições POST com parsing seguro
export const apiPost = async (endpoint, data) => {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })
  if (response.ok) {
    return await safeJsonParse(response)
  }
  throw new Error(`Erro na requisição: ${response.status}`)
}

// Função para fazer requisições PUT com parsing seguro
export const apiPut = async (endpoint, data) => {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  if (response.ok) {
    return await safeJsonParse(response)
  }
  throw new Error(`Erro na requisição: ${response.status}`)
}

// Função para fazer requisições DELETE com parsing seguro
export const apiDelete = async (endpoint) => {
  const response = await apiRequest(endpoint, { method: 'DELETE' })
  if (response.ok) {
    return await safeJsonParse(response)
  }
  throw new Error(`Erro na requisição: ${response.status}`)
}

// Função para upload de arquivos com parsing seguro
export const apiUpload = async (endpoint, formData) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  const headers = {}
  
  // Obter token do localStorage se existir
  const token = localStorage.getItem('token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    })

    // Se receber 401, tentar renovar o token
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`
            }
          })

          if (refreshResponse.ok && isJsonResponse(refreshResponse)) {
            const refreshResult = await refreshResponse.json()
            if (refreshResult.success && refreshResult.data.access_token) {
              localStorage.setItem('token', refreshResult.data.access_token)
              headers.Authorization = `Bearer ${refreshResult.data.access_token}`
              
              // Tentar novamente com o novo token
              response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData
              })
            }
          }
        } catch (refreshError) {
          console.error('Erro ao renovar token no upload:', refreshError)
        }
      }
    }

    if (response.ok) {
      return await safeJsonParse(response)
    }
    throw new Error(`Erro no upload: ${response.status}`)
  } catch (error) {
    console.error('Erro no upload:', error)
    throw error
  }
}

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiUpload,
  getImageUrl
}