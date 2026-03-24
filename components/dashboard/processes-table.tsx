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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

export function ProcessesTable({ processos = [] }: { processos?: any[] }) {
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
                  <TableRow key={processo.numero_processo} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm text-card-foreground">
                      {processo.numero_processo}
                    </TableCell>
                    <TableCell className="font-medium text-card-foreground">
                      {processo.nome_reclamante}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {processo.trt} / {processo.comarca}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {processo.fase_processual}
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
                            <Eye className="h-4 w-4" />
                            Ver detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Processo: {processo.numero_processo}</DialogTitle>
                            <DialogDescription>
                              Visão completa dos dados extraídos
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Reclamante</p>
                              <p className="text-sm font-semibold">{processo.nome_reclamante || "Não informado"}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Advogado(a)</p>
                              <p className="text-sm">{processo.advogado_reclamante || "Não informado"}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Função</p>
                              <p className="text-sm">{processo.funcao_reclamante || "Não informada"}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Perito Técnico</p>
                              <p className="text-sm">{processo.perito_tecnico || "Não designado"}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Perito Ergonômico</p>
                              <p className="text-sm">{processo.perito_ergonomico || "Não designado"}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Fase Processual</p>
                              <p className="text-sm">{processo.fase_processual || processo.fase_processo_atual || "-"}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Instância</p>
                              <p className="text-sm">{processo.instancia || "1ª Instância"}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Localidade</p>
                              <p className="text-sm">{processo.vara || "Vara N/A"} - {processo.comarca} ({processo.uf || processo.trt || "UF"})</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Valor da Causa</p>
                              <p className="text-sm text-emerald-600 font-semibold">
                                {processo.valor_causa ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(processo.valor_causa) : "Não informado"}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
