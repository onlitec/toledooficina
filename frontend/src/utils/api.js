// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const STATIC_BASE_URL = import.meta.env.VITE_STATIC_URL || '/static'

// Função para gerar URL de imagem
export const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STATIC_BASE_URL}/uploads/${path}`
}

// Função utilitária para fazer requisições à API
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
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
        // Tentar renovar o token
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`
          }
        })

        if (refreshResponse.ok) {
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
        }
      }
    }

    return response
  } catch (error) {
    console.error('Erro na requisição API:', error)
    throw error
  }
}

// Função para fazer requisições GET
export const apiGet = async (endpoint) => {
  return apiRequest(endpoint, { method: 'GET' })
}

// Função para fazer requisições POST
export const apiPost = async (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// Função para fazer requisições PUT
export const apiPut = async (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

// Função para fazer requisições DELETE
export const apiDelete = async (endpoint) => {
  return apiRequest(endpoint, { method: 'DELETE' })
}

// Função para upload de arquivos
export const apiUpload = async (endpoint, formData) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  const headers = {}
  
  // Obter token do localStorage se existir
  const token = localStorage.getItem('token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    })

    return response
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