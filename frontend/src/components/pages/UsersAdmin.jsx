import { useState, useEffect } from 'react'
import { useSystem } from '@/contexts/SystemContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Search, User, Shield, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useConfirm } from '../ui/confirmation-dialog'

export function UsersAdmin() {
  const { apiRequest, isAdmin } = useSystem()
  const confirm = useConfirm()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nome_completo: '',
    role: 'user',
    ativo: true,
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // Carregar usuários
  const loadUsers = async (page = 1, search = '') => {
    try {
      setLoading(true)
      const response = await apiRequest(`/api/users?page=${page}&per_page=10&search=${encodeURIComponent(search)}`)
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
        setTotalPages(data.pagination.pages)
        setTotalUsers(data.pagination.total)
        setCurrentPage(data.pagination.page)
      } else {
        toast.error('Erro ao carregar usuários', {
          description: data.message
        })
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar usuários', {
        description: 'Não foi possível carregar a lista de usuários'
      })
    } finally {
      setLoading(false)
    }
  }

  // Carregar usuários ao montar o componente
  useEffect(() => {
    loadUsers()
  }, [])

  // Pesquisar usuários
  const handleSearch = (e) => {
    e.preventDefault()
    loadUsers(1, searchTerm)
  }

  // Criar ou atualizar usuário
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      // Validações básicas
      if (!formData.username.trim()) {
        setError('Username é obrigatório')
        return
      }
      if (!formData.email.trim()) {
        setError('Email é obrigatório')
        return
      }
      if (!editingUser && !formData.password) {
        setError('Senha é obrigatória para novos usuários')
        return
      }

      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'

      const response = await apiRequest(url, {
        method,
        body: JSON.stringify({
          ...formData,
          username: formData.username.trim(),
          email: formData.email.trim(),
          nome_completo: formData.nome_completo.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingUser ? 'Usuário atualizado com sucesso' : 'Usuário criado com sucesso', {
          description: data.message
        })
        
        setIsDialogOpen(false)
        setEditingUser(null)
        setFormData({
          username: '',
          email: '',
          nome_completo: '',
          role: 'user',
          ativo: true,
          password: ''
        })
        loadUsers()
      } else {
        setError(data.message || 'Erro ao salvar usuário')
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      setError('Erro de conexão. Tente novamente.')
    }
  }

  // Editar usuário
  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      nome_completo: user.nome_completo || '',
      role: user.role,
      ativo: user.ativo,
      password: ''
    })
    setIsDialogOpen(true)
  }

  // Deletar usuário (desativar)
  const handleDelete = async (userId, username) => {
    const confirmed = await confirm.confirmDelete(`Tem certeza que deseja desativar o usuário ${username}?`)
    if (!confirmed) {
      return
    }

    try {
      const response = await apiRequest(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Usuário desativado com sucesso', {
          description: data.message
        })
        loadUsers()
      } else {
        toast.error('Erro ao desativar usuário', {
          description: data.message
        })
      }
    } catch (error) {
      console.error('Erro ao desativar usuário:', error)
      toast.error('Erro ao desativar usuário', {
        description: 'Não foi possível desativar o usuário'
      })
    }
  }

  // Abrir diálogo para novo usuário
  const handleNewUser = () => {
    setEditingUser(null)
    setFormData({
      username: '',
      email: '',
      nome_completo: '',
      role: 'user',
      ativo: true,
      password: ''
    })
    setIsDialogOpen(true)
  }

  // Fechar diálogo
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({
      username: '',
      email: '',
      nome_completo: '',
      role: 'user',
      ativo: true,
      password: ''
    })
    setError('')
  }

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('pt-BR')
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button onClick={handleNewUser} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Barra de pesquisa */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar por username, email ou nome..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Pesquisar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({totalUsers})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando usuários...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Nenhum usuário corresponde aos critérios de pesquisa.' : 'Não há usuários cadastrados no sistema.'}
              </p>
              <div className="mt-6">
                <Button onClick={handleNewUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro usuário
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Nome Completo</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.nome_completo || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? (
                              <Shield className="h-3 w-3 mr-1" />
                            ) : null}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.ativo ? 'default' : 'destructive'}>
                            {user.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.data_cadastro)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.ativo && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(user.id, user.username)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <Button
                      onClick={() => loadUsers(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                    >
                      Anterior
                    </Button>
                    <Button
                      onClick={() => loadUsers(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                    >
                      Próximo
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> a{' '}
                        <span className="font-medium">{Math.min(currentPage * 10, totalUsers)}</span> de{' '}
                        <span className="font-medium">{totalUsers}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <Button
                          onClick={() => loadUsers(currentPage - 1)}
                          disabled={currentPage === 1}
                          variant="outline"
                          size="sm"
                        >
                          Anterior
                        </Button>
                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1
                          return (
                            <Button
                              key={page}
                              onClick={() => loadUsers(page)}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              className={currentPage === page ? 'z-10' : ''}
                            >
                              {page}
                            </Button>
                          )
                        })}
                        <Button
                          onClick={() => loadUsers(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          variant="outline"
                          size="sm"
                        >
                          Próximo
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para criar/editar usuário */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Digite o username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Digite o email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input
                id="nome_completo"
                name="nome_completo"
                value={formData.nome_completo}
                onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                placeholder="Digite o nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({...formData, role: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {editingUser ? 'Nova Senha (opcional)' : 'Senha'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder={editingUser ? 'Deixe em branco para manter a senha atual' : 'Digite a senha'}
                  {...(!editingUser && { required: true })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="ativo">Usuário ativo</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingUser ? 'Atualizar' : 'Criar'} Usuário
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
