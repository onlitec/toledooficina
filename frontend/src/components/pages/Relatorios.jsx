import { useState } from 'react'
import { BarChart3, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Relatorios() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Relatórios e análises da oficina</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Relatórios e Análises
          </CardTitle>
          <CardDescription>Módulo em desenvolvimento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Módulo de Relatórios</h3>
            <p className="text-gray-600 mb-4">
              Relatórios detalhados e análises de desempenho da oficina.
            </p>
            <p className="text-sm text-gray-500">
              Funcionalidades: relatórios de vendas, estoque, financeiro, produtividade, etc.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

