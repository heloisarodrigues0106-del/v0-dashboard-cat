"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { processos } from "@/lib/mock-data"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"

const ITEMS_PER_PAGE = 5

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Ativo":
      return "default"
    case "Suspenso":
      return "secondary"
    case "Encerrado":
      return "outline"
    case "Arquivado":
      return "outline"
    default:
      return "default"
  }
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Ativo":
      return "bg-success text-success-foreground"
    case "Suspenso":
      return "bg-warning text-warning-foreground"
    case "Encerrado":
      return "bg-muted text-muted-foreground"
    case "Arquivado":
      return "bg-secondary text-secondary-foreground"
    default:
      return ""
  }
}

export function ProcessesTable() {
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalPages = Math.ceil(processos.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProcesses = processos.slice(startIndex, endIndex)

  return (
    <section className="px-6 py-6">
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Detalhamento dos Processos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-card-foreground">Número do Processo</TableHead>
                  <TableHead className="font-semibold text-card-foreground">Reclamante</TableHead>
                  <TableHead className="font-semibold text-card-foreground">TRT/Comarca</TableHead>
                  <TableHead className="font-semibold text-card-foreground">Fase Atual</TableHead>
                  <TableHead className="font-semibold text-card-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-card-foreground text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProcesses.map((processo) => (
                  <TableRow key={processo.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm text-card-foreground">
                      {processo.numero_processo}
                    </TableCell>
                    <TableCell className="font-medium text-card-foreground">
                      {processo.reclamante}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {processo.trt} / {processo.comarca}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {processo.fase_atual}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(processo.status)}
                        className={getStatusColor(processo.status)}
                      >
                        {processo.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
                        <Eye className="h-4 w-4" />
                        Ver detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(endIndex, processos.length)} de {processos.length} processos
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
