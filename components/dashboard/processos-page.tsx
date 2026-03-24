"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  X,
  FileText,
  User,
  MapPin,
  Scale,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  pedidosIniciais,
  pedidosSentenca,
  valoresRisco,
  trts,
  comarcas,
  varas,
  statusOptions,
  fasesProcesso,
  pedidoLabels,
  type Processo,
  type PedidoInicial,
  type PedidoSentenca,
  type ValorRisco
} from "@/lib/mock-data"

const ITEMS_PER_PAGE = 10

function getStatusColor(status: string) {
  switch (status) {
    case "Ativo":
      return "bg-success/10 text-success border-success/20"
    case "Encerrado":
      return "bg-muted text-muted-foreground border-muted"
    case "Suspenso":
      return "bg-warning/10 text-warning-foreground border-warning/20"
    case "Arquivado":
      return "bg-secondary text-secondary-foreground border-secondary"
    default:
      return "bg-muted text-muted-foreground border-muted"
  }
}

function getStatusReclamanteColor(status: string) {
  switch (status) {
    case "Ativo":
      return "bg-success/10 text-success border-success/20"
    case "Demitido":
      return "bg-destructive/10 text-destructive border-destructive/20"
    case "Aposentado":
      return "bg-primary/10 text-primary border-primary/20"
    default:
      return "bg-muted text-muted-foreground border-muted"
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value)
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-"
  return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
}

// Componente de detalhes do processo
function ProcessoDetails({ processo }: { processo: Processo }) {
  const pedidoInicial = pedidosIniciais.find(
    (p) => p.numero_processo === processo.numero_processo
  )
  const pedidoSentencaData = pedidosSentenca.find(
    (p) => p.numero_processo === processo.numero_processo
  )
  const valores = valoresRisco.filter(
    (v) => v.numero_processo === processo.numero_processo
  )

  const pedidoKeys = Object.keys(pedidoLabels).filter((key) => key !== "outros")

  return (
    <Tabs defaultValue="geral" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="geral">Geral</TabsTrigger>
        <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        <TabsTrigger value="valores">Valores</TabsTrigger>
        <TabsTrigger value="partes">Partes</TabsTrigger>
      </TabsList>

      <TabsContent value="geral" className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="h-4 w-4" />
                Informações do Processo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Número</span>
                <span className="text-sm font-medium font-mono">
                  {processo.numero_processo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className={getStatusColor(processo.status)}>
                  {processo.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fase Atual</span>
                <span className="text-sm font-medium">{processo.fase_processual}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">FOPAG</span>
                <span className="text-sm font-medium">{processo.fopag}</span>
              </div>
              {processo.processo_apenso && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Processo Apenso</span>
                  <span className="text-sm font-medium font-mono">
                    {processo.processo_apenso}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">TRT</span>
                <span className="text-sm font-medium">{processo.trt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Comarca</span>
                <span className="text-sm font-medium">{processo.comarca}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vara</span>
                <span className="text-sm font-medium">{processo.vara}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                Datas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Data Ajuizamento</span>
                <span className="text-sm font-medium">
                  {formatDate(processo.data_ajuizamento)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Data Arquivamento</span>
                <span className="text-sm font-medium">
                  {formatDate(processo.data_arquivamento)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="pedidos" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="h-4 w-4" />
              Comparativo de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead className="text-center">Inicial</TableHead>
                  <TableHead className="text-center">Sentença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidoKeys.map((key) => {
                  const inicial = pedidoInicial?.[key as keyof PedidoInicial]
                  const sentenca = pedidoSentencaData?.[key as keyof PedidoSentenca]
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium">
                        {pedidoLabels[key]}
                      </TableCell>
                      <TableCell className="text-center">
                        {inicial ? (
                          <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {pedidoSentencaData ? (
                          sentenca ? (
                            <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {pedidoInicial?.outros && (
                  <TableRow>
                    <TableCell className="font-medium">Outros</TableCell>
                    <TableCell colSpan={2} className="text-center">
                      {pedidoInicial.outros}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="valores" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" />
              Valores de Risco por Trimestre
            </CardTitle>
          </CardHeader>
          <CardContent>
            {valores.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-right">Provável</TableHead>
                    <TableHead className="text-right">Possível</TableHead>
                    <TableHead className="text-right">Remoto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {valores.map((v) => {
                    const totalProvavel =
                      v.principal_provavel +
                      v.correcao_monetaria_provavel +
                      v.juros_provavel
                    const totalPossivel =
                      v.principal_possivel +
                      v.correcao_monetaria_possivel +
                      v.juros_possivel
                    const totalRemoto =
                      v.principal_remoto +
                      v.correcao_monetaria_remoto +
                      v.juros_remoto
                    return (
                      <TableRow key={`${v.numero_processo}-${v.quarter}-${v.ano}`}>
                        <TableCell className="font-medium">
                          {v.quarter}/{v.ano}
                        </TableCell>
                        <TableCell className="text-right text-destructive font-medium">
                          {formatCurrency(totalProvavel)}
                        </TableCell>
                        <TableCell className="text-right text-warning-foreground font-medium">
                          {formatCurrency(totalPossivel)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(totalRemoto)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum valor de risco cadastrado para este processo.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="partes" className="mt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                Reclamante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Nome</span>
                <span className="text-sm font-medium">{processo.nome_reclamante}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Função</span>
                <span className="text-sm font-medium">{processo.funcao_reclamante}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={getStatusReclamanteColor(processo.status_reclamante)}
                >
                  {processo.status_reclamante}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Scale className="h-4 w-4" />
                Advogado do Reclamante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Nome</span>
                <span className="text-sm font-medium">
                  {processo.advogado_reclamante}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

export function ProcessosPage({ processos = [] }: { processos?: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTrt, setSelectedTrt] = useState<string>("all")
  const [selectedComarca, setSelectedComarca] = useState<string>("all")
  const [selectedVara, setSelectedVara] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedFase, setSelectedFase] = useState<string>("all")
  const [dataInicio, setDataInicio] = useState<Date | undefined>()
  const [dataFim, setDataFim] = useState<Date | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null)

  const filteredProcessos = useMemo(() => {
    return processos.filter((processo) => {
      const matchesSearch =
        processo.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        processo.nome_reclamante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        processo.advogado_reclamante.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTrt = selectedTrt === "all" || processo.trt === selectedTrt
      const matchesComarca =
        selectedComarca === "all" || processo.comarca === selectedComarca
      const matchesVara = selectedVara === "all" || processo.vara === selectedVara
      const matchesStatus =
        selectedStatus === "all" || processo.status === selectedStatus
      const matchesFase =
        selectedFase === "all" || processo.fase_processual === selectedFase

      const processoDate = new Date(processo.data_ajuizamento)
      const matchesDataInicio = !dataInicio || processoDate >= dataInicio
      const matchesDataFim = !dataFim || processoDate <= dataFim

      return (
        matchesSearch &&
        matchesTrt &&
        matchesComarca &&
        matchesVara &&
        matchesStatus &&
        matchesFase &&
        matchesDataInicio &&
        matchesDataFim
      )
    })
  }, [
    searchTerm,
    selectedTrt,
    selectedComarca,
    selectedVara,
    selectedStatus,
    selectedFase,
    dataInicio,
    dataFim
  ])

  const totalPages = Math.ceil(filteredProcessos.length / ITEMS_PER_PAGE)
  const paginatedProcessos = filteredProcessos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedTrt("all")
    setSelectedComarca("all")
    setSelectedVara("all")
    setSelectedStatus("all")
    setSelectedFase("all")
    setDataInicio(undefined)
    setDataFim(undefined)
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchTerm ||
    selectedTrt !== "all" ||
    selectedComarca !== "all" ||
    selectedVara !== "all" ||
    selectedStatus !== "all" ||
    selectedFase !== "all" ||
    dataInicio ||
    dataFim

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número do processo, reclamante ou advogado..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>

          {/* Filtros em grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Data Início
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio
                      ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={(date) => {
                      setDataInicio(date)
                      setCurrentPage(1)
                    }}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Data Fim
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim
                      ? format(dataFim, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={(date) => {
                      setDataFim(date)
                      setCurrentPage(1)
                    }}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">TRT</label>
              <Select
                value={selectedTrt}
                onValueChange={(value) => {
                  setSelectedTrt(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {trts.map((trt) => (
                    <SelectItem key={trt} value={trt}>
                      {trt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Comarca</label>
              <Select
                value={selectedComarca}
                onValueChange={(value) => {
                  setSelectedComarca(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {comarcas.map((comarca) => (
                    <SelectItem key={comarca} value={comarca}>
                      {comarca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Vara</label>
              <Select
                value={selectedVara}
                onValueChange={(value) => {
                  setSelectedVara(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {varas.map((vara) => (
                    <SelectItem key={vara} value={vara}>
                      {vara}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Fase</label>
              <Select
                value={selectedFase}
                onValueChange={(value) => {
                  setSelectedFase(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {fasesProcesso.map((fase) => (
                    <SelectItem key={fase} value={fase}>
                      {fase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Processos */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Processos ({filteredProcessos.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Número do Processo</TableHead>
                  <TableHead>Reclamante</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>TRT / Comarca</TableHead>
                  <TableHead>Vara</TableHead>
                  <TableHead>Fase Atual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Recebimento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProcessos.length > 0 ? (
                  paginatedProcessos.map((processo) => (
                    <TableRow key={processo.numero_processo}>
                      <TableCell className="font-mono text-sm">
                        {processo.numero_processo}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{processo.nome_reclamante}</p>
                          <p className="text-xs text-muted-foreground">
                            {processo.advogado_reclamante}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {processo.funcao_reclamante}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{processo.trt}</p>
                          <p className="text-xs text-muted-foreground">
                            {processo.comarca}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{processo.vara}</TableCell>
                      <TableCell className="text-sm">
                        {processo.fase_processual}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(processo.status)}
                        >
                          {processo.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(processo.data_ajuizamento)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedProcesso(processo)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver detalhes</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Detalhes do Processo
                              </DialogTitle>
                            </DialogHeader>
                            {selectedProcesso && (
                              <ProcessoDetails processo={selectedProcesso} />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Nenhum processo encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredProcessos.length)} de{" "}
                {filteredProcessos.length} processos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Página anterior</span>
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(page)}
                      className="h-8 w-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Próxima página</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
