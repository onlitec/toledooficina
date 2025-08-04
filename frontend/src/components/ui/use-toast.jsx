import React from 'react'

// Função toast simples que usa alert
function toast({ title, description, variant }) {
  const message = title + (description ? ': ' + description : '')
  
  if (variant === 'destructive') {
    alert('❌ ' + message)
  } else {
    alert('✅ ' + message)
  }
}

// Hook useToast que retorna a função toast
function useToast() {
  return {
    toast,
    dismiss: () => {}, // Função vazia para compatibilidade
  }
}

export { useToast, toast }

