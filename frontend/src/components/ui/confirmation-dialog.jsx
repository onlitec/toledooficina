import React, { useState } from 'react'
import { AlertTriangle, Trash2, Edit, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Context para gerenciar diálogos de confirmação
const ConfirmationContext = React.createContext()

export function ConfirmationProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  const showConfirmation = (options) => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        onConfirm: () => {
          setDialog(null)
          resolve(true)
        },
        onCancel: () => {
          setDialog(null)
          resolve(false)
        }
      })
    })
  }

  const hideConfirmation = () => {
    setDialog(null)
  }

  return (
    <ConfirmationContext.Provider value={{ showConfirmation, hideConfirmation }}>
      {children}
      {dialog && <ConfirmationDialog {...dialog} />}
    </ConfirmationContext.Provider>
  )
}

export function useConfirmation() {
  const context = React.useContext(ConfirmationContext)
  if (!context) {
    throw new Error('useConfirmation deve ser usado dentro de ConfirmationProvider')
  }
  return context
}

// Componente do diálogo de confirmação
function ConfirmationDialog({
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  type = 'warning', // 'warning', 'danger', 'info'
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  React.useEffect(() => {
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleConfirm = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onConfirm()
    }, 200)
  }

  const handleCancel = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onCancel()
    }, 200)
  }

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="h-6 w-6 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
      case 'edit':
        return <Edit className="h-6 w-6 text-blue-600" />
      default:
        return <AlertTriangle className="h-6 w-6 text-gray-600" />
    }
  }

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white'
      case 'edit':
        return 'bg-blue-600 hover:bg-blue-700 text-white'
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black transition-opacity duration-300 z-40',
          isVisible && !isLeaving ? 'opacity-50' : 'opacity-0'
        )}
        onClick={handleCancel}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            'bg-white rounded-lg shadow-xl max-w-md w-full transition-all duration-300 transform',
            isVisible && !isLeaving 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
          )}
        >
          {/* Header */}
          <div className="flex items-center p-6 pb-4">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {title}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <X className="h-4 w-4 inline mr-2" />
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors inline-flex items-center',
                getConfirmButtonStyle()
              )}
            >
              <Check className="h-4 w-4 mr-2" />
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Hook para facilitar o uso
export function useConfirm() {
  const { showConfirmation } = useConfirmation()

  return {
    // Confirmação de exclusão
    confirmDelete: (message = 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.') => 
      showConfirmation({
        title: 'Confirmar Exclusão',
        message,
        type: 'danger',
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }),
    
    // Confirmação de edição
    confirmEdit: (message = 'Tem certeza que deseja salvar as alterações?') => 
      showConfirmation({
        title: 'Confirmar Alterações',
        message,
        type: 'edit',
        confirmText: 'Salvar',
        cancelText: 'Cancelar'
      }),
    
    // Confirmação genérica
    confirm: (options) => showConfirmation(options)
  }
}