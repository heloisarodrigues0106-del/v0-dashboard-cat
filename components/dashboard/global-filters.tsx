"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, X, Filter, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FilterHistogramSlider } from "@/components/dashboard/filter-histogram-slider"

interface GlobalFiltersProps {
  dataAjuizamentoInicio: Date | undefined
  setDataAjuizamentoInicio: (date: Date | undefined) => void
  dataAjuizamentoFim: Date | undefined
  setDataAjuizamentoFim: (date: Date | undefined) => void
  dataArquivamentoInicio: Date | undefined
  setDataArquivamentoInicio: (date: Date | undefined) => void
  dataArquivamentoFim: Date | undefined
  setDataArquivamentoFim: (date: Date | undefined) => void
  empresa: string
  setEmpresa: (val: string) => void
  unidade: string
  setUnidade: (val: string) => void
  advogado: string
  setAdvogado: (val: string) => void
  terceirizada: string
  setTerceirizada: (val: string) => void
  tipoAcao: string
  setTipoAcao: (val: string) => void
  vara: string
  setVara: (val: string) => void
  filterOptions: {
    empresas: string[]
    unidades: string[]
    advogados: string[]
    terceirizadas: string[]
    tiposAcao: string[]
    varas: string[]
  }
  valorAcaoRange: [number, number]
  setValorAcaoRange: (val: [number, number]) => void
  processos: any[]
}

export function GlobalFilters({
  dataAjuizamentoInicio,
  setDataAjuizamentoInicio,
  dataAjuizamentoFim,
  setDataAjuizamentoFim,
  dataArquivamentoInicio,
  setDataArquivamentoInicio,
  dataArquivamentoFim,
  setDataArquivamentoFim,
  empresa,
  setEmpresa,
  unidade,
  setUnidade,
  advogado,
  setAdvogado,
  terceirizada,
  setTerceirizada,
  tipoAcao,
  setTipoAcao,
  vara,
  setVara,
  filterOptions,
  valorAcaoRange,
  setValorAcaoRange,
  processos
}: GlobalFiltersProps) {
  
  const hasActiveFilters =
    dataAjuizamentoInicio ||
    dataAjuizamentoFim ||
    dataArquivamentoInicio ||
    dataArquivamentoFim ||
    empresa !== "all" ||
    unidade !== "all" ||
    advogado !== "all" ||
    terceirizada !== "all" ||
    tipoAcao !== "all" ||
    vara !== "all" ||
    valorAcaoRange[0] !== 1000 ||
    valorAcaoRange[1] !== 1000000;

  const resetFilters = () => {
    setDataAjuizamentoInicio(undefined)
    setDataAjuizamentoFim(undefined)
    setDataArquivamentoInicio(undefined)
    setDataArquivamentoFim(undefined)
    setEmpresa("all")
    setUnidade("all")
    setAdvogado("all")
    setTerceirizada("all")
    setTipoAcao("all")
    setVara("all")
    setValorAcaoRange([1000, 1000000])
  }

  return (
    <div className="px-8 pt-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 font-medium">
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters ? (
              <span className="flex h-2 w-2 rounded-full bg-primary absolute top-2 right-2" />
            ) : null}
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-[350px] sm:w-[450px] flex flex-col p-0">
          <SheetHeader className="px-6 py-4 border-b text-left">
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            
            {/* Datas */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Periodização
              </h3>
              
              <div className="space-y-3 p-4 bg-muted/40 rounded-lg border border-border/50">
                <label className="text-xs font-medium text-foreground uppercase tracking-wider">Ajuizamento</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">Início</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-background h-8 px-2 text-xs">
                          {dataAjuizamentoInicio ? format(dataAjuizamentoInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dataAjuizamentoInicio} onSelect={setDataAjuizamentoInicio} locale={ptBR} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">Fim</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-background h-8 px-2 text-xs">
                          {dataAjuizamentoFim ? format(dataAjuizamentoFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dataAjuizamentoFim} onSelect={setDataAjuizamentoFim} locale={ptBR} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-muted/40 rounded-lg border border-border/50">
                <label className="text-xs font-medium text-foreground uppercase tracking-wider">Arquivamento</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">Início</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-background h-8 px-2 text-xs">
                          {dataArquivamentoInicio ? format(dataArquivamentoInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dataArquivamentoInicio} onSelect={setDataArquivamentoInicio} locale={ptBR} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">Fim</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-background h-8 px-2 text-xs">
                          {dataArquivamentoFim ? format(dataArquivamentoFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dataArquivamentoFim} onSelect={setDataArquivamentoFim} locale={ptBR} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-border my-6" />

            {/* Valores de Risco / Causa */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Valores (R$)
              </h3>
              
              <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
                <label className="text-xs font-medium text-foreground uppercase tracking-wider mb-2 block">
                  Faixa de Valor da Causa
                </label>
                <div className="-mx-2">
                  <FilterHistogramSlider 
                    data={processos.map(p => Number(p.valor_acao) || 0)}
                    min={1000}
                    max={1000000}
                    step={1000}
                    value={valorAcaoRange}
                    onValueChange={setValorAcaoRange}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-border my-6" />

            {/* Dados do Processo */}
            <div className="space-y-4 pb-8">
              <h3 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground flex items-center gap-2">
                <Filter className="h-4 w-4" /> Categorias
              </h3>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider">Empresa (Reclamada)</label>
                  <Select value={empresa} onValueChange={setEmpresa}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {filterOptions.empresas.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider">Unidade/Centro de Custo</label>
                  <Select value={unidade} onValueChange={setUnidade}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {filterOptions.unidades.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider">Empresa Terceirizada</label>
                  <Select value={terceirizada} onValueChange={setTerceirizada}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {filterOptions.terceirizadas.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider">Advogado Adverso</label>
                  <Select value={advogado} onValueChange={setAdvogado}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {filterOptions.advogados.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider">Tipo de Ação</label>
                  <Select value={tipoAcao} onValueChange={setTipoAcao}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {filterOptions.tiposAcao.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider">Vara e Comarca</label>
                  <Select value={vara} onValueChange={setVara}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {filterOptions.varas.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

          </div>

          <SheetFooter className="p-6 border-t bg-muted/20 mt-auto flex-row justify-between sm:justify-between items-center shrink-0">
            {hasActiveFilters ? (
               <Button 
                variant="ghost" 
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground -ml-4"
              >
                Limpar Todos
              </Button>
            ) : (
               <div />
            )}
            
            <SheetClose asChild>
              <Button className="bg-[#F6D000] hover:bg-[#d4a800] text-[#111111] rounded-md px-8 transition-all duration-300 transform active:scale-95 shadow-md font-medium">
                Aplicar e Fechar
              </Button>
            </SheetClose>
          </SheetFooter>

        </SheetContent>
      </Sheet>
    </div>
  )
}
