
  const carregarSistema = async () => {
    try {
      // Carregar título da empresa
      const tituloResponse = await fetch('/api/configuracoes/sistema/titulo')
      if (tituloResponse.ok) {
        const tituloResult = await tituloResponse.json()
        if (tituloResult.success) {
          setSistemaData(prev => ({
            ...prev,
            titulo_empresa: tituloResult.data.titulo
          }))
        }
      }

      // Carregar informaçeeeees do logotipo
      const logoResponse = await fetch('/api/configuracoes/sistema/logotipo')
      if (logoResponse.ok) {
        const logoResult = await logoResponse.json()
        if (logoResult.success) {
          setSistemaData(prev => ({
            ...prev,
            logotipo_info: logoResult.data
          }))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do sistema:', error)
    }
  }

  const salvarTituloEmpresa = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracoes/sistema/titulo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo: sistemaData.titulo_empresa
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('Título da empresa salvo com sucesso!')
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      alert('Erro ao salvar título da empresa: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const uploadLogotipo = async (file) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('logotipo', file)

      const response = await fetch('/api/configuracoes/sistema/logotipo', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        alert('Logotipo enviado com sucesso!')
        // Atualizar informações do logotipo
        setSistemaData(prev => ({
          ...prev,
          logotipo_info: {
            tem_logotipo: true,
            url_logotipo: result.data.url_logotipo,
            nome_arquivo: result.data.nome_arquivo
          }
        }))
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      alert('Erro ao enviar logotipo: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const removerLogotipo = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracoes/sistema/logotipo', {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        alert('Logotipo removido com sucesso!')
        // Limpar informações do logotipo
        setSistemaData(prev => ({
          ...prev,
          logotipo_info: {
            tem_logotipo: false,
            url_logotipo: null,
            nome_arquivo: null
          }
        }))
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      alert('Erro ao remover logotipo: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Verificar tamanho do arquivo
      if (file.size > 2 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo 2MB.')
        return
      }
      
      // Verificar tipo do arquivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de arquivo não permitido. Use PNG, JPG, GIF ou WEBP.')
        return
      }
      
      uploadLogotipo(file)
    }
  }
