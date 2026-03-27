import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, DollarSign, WalletCards, Landmark, ShieldCheck, Search } from "lucide-react"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value || 0)
}

export function ValoresTab({ valores }: { valores: any[] }) {
  const [riscoAtivo, setRiscoAtivo] = useState("provavel")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  
  const { kpis, processosVariacao } = useMemo(() => {
    let kpiGeral = {
      custas: 0,
      depositoRecursal: 0,
      apolice: 0,
      depositoJudicial: 0
    }
    let kpiQuarter = {
      atual: 0,
      anterior: 0
    }

    const variacoes: any[] = []

    valores.forEach(v => {
      // Gerais
      kpiGeral.custas += (Number(v.custas_processuais) || 0)
      kpiGeral.depositoRecursal += (Number(v.deposito_recursal) || 0)
      if (v.apolice === true || String(v.apolice).toLowerCase() === "true") kpiGeral.apolice++
      kpiGeral.depositoJudicial += (Number(v.deposito_judicial) || 0)

      // Variables for the specific risk currently selected via Tabs
      const principalAtual = Number(v[`${riscoAtivo}_principal_quarter_atual`]) || 0
      const correcaoAtual = Number(v[`${riscoAtivo}_correcao_quarter_atual`]) || 0
      const jurosAtual = Number(v[`${riscoAtivo}_juros_quarter_atual`]) || 0
      const totalAtual = principalAtual + correcaoAtual + jurosAtual

      const principalAnterior = Number(v[`${riscoAtivo}_principal_quarter_anterior`]) || 0
      const correcaoAnterior = Number(v[`${riscoAtivo}_correcao_quarter_anterior`]) || 0
      const jurosAnterior = Number(v[`${riscoAtivo}_juros_quarter_anterior`]) || 0
      const totalAnterior = principalAnterior + correcaoAnterior + jurosAnterior

      kpiQuarter.atual += totalAtual
      kpiQuarter.anterior += totalAnterior

      // Análise de Variação (Drill-Down Logic)
      if (totalAtual !== totalAnterior) {
        let diff = totalAtual - totalAnterior
        let percentual = totalAnterior > 0 ? (diff / totalAnterior) * 100 : 100

        variacoes.push({
          numero_processo: v.numero_processo,
          principalAnterior, principalAtual,
          correcaoAnterior, correcaoAtual,
          jurosAnterior, jurosAtual,
          totalAnterior, totalAtual,
          diferenca: diff,
          percentual: percentual,
          tipo: diff > 0 ? "Aumento de Provisão" : "Redução de Passivo",
          justificativa: v.justificativa_reavaliacao_quarter_atual || "Sem justificativa de campo"
        })
      }
    })

    // Ordenar variações (maiores diferenças absolutas primeiro)
    variacoes.sort((a, b) => Math.abs(b.diferenca) - Math.abs(a.diferenca))

    return { kpis: { geral: kpiGeral, quarter: kpiQuarter }, processosVariacao: variacoes }
  }, [valores, riscoAtivo])

  const totalGeral = kpis.geral.custas + kpis.geral.depositoRecursal + kpis.geral.apolice + kpis.geral.depositoJudicial
  const diffQuarter = kpis.quarter.atual - kpis.quarter.anterior
  const percentQuarter = kpis.quarter.anterior > 0 ? (diffQuarter / kpis.quarter.anterior) * 100 : 0

  return (
    <Tabs defaultValue="provavel" onValueChange={setRiscoAtivo} className="w-full space-y-6">
      
      <TabsList className="w-full overflow-x-auto flex bg-muted/30">
        <TabsTrigger value="provavel" className="flex-1 min-w-[110px] data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs md:text-sm">Risco Provável</TabsTrigger>
        <TabsTrigger value="possivel" className="flex-1 min-w-[110px] data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs md:text-sm">Risco Possível</TabsTrigger>
        <TabsTrigger value="remoto" className="flex-1 min-w-[110px] data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs md:text-sm">Risco Remoto</TabsTrigger>
      </TabsList>

      <TabsContent value={riscoAtivo} className="space-y-6 mt-0">
        
        {/* Visões de Quarter Dinâmicas */}
        <h3 className="text-lg font-medium">Comparativo Trimestral - Risco {riscoAtivo.charAt(0).toUpperCase() + riscoAtivo.slice(1)}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quarter Anterior</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground/50" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-muted-foreground">{formatCurrency(kpis.quarter.anterior)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quarter Atual</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{formatCurrency(kpis.quarter.atual)}</div>
            </CardContent>
          </Card>

          <Card className={diffQuarter > 0 ? "bg-destructive/5 border-destructive/20" : diffQuarter < 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/5"}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${diffQuarter > 0 ? "text-destructive" : diffQuarter < 0 ? "text-emerald-600" : "text-muted-foreground"}`}>Variação do Período</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`text-xl md:text-2xl font-bold ${diffQuarter > 0 ? "text-destructive" : diffQuarter < 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {diffQuarter > 0 ? '+' : ''}{formatCurrency(diffQuarter)}
                </div>
                <div className="text-xs mt-1 font-medium flex items-center gap-1 text-muted-foreground">
                  {diffQuarter > 0 ? <ArrowUpIcon className="h-3 w-3 text-destructive" /> : diffQuarter < 0 ? <ArrowDownIcon className="h-3 w-3 text-emerald-600" /> : <ArrowRightIcon className="h-3 w-3" />}
                  {diffQuarter > 0 ? "Aumento de Provisão" : diffQuarter < 0 ? "Redução de Passivo" : "Estável"}
                </div>
            </CardContent>
          </Card>
        </div>

      {/* Gestão de Custos e Garantias */}
      <h3 className="text-lg font-medium mt-8">Gestão de Garantias e Custos</h3>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Custas Processuais</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatCurrency(kpis.geral.custas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Depósitos Recursais</CardTitle>
            <WalletCards className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatCurrency(kpis.geral.depositoRecursal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Depósitos Judiciais</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatCurrency(kpis.geral.depositoJudicial)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Seguro Garantia/Apólice</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{kpis.geral.apolice}</div>
            <p className="text-xs text-muted-foreground">Registros ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Processos Drill-down */}
      <h3 className="text-lg font-medium mt-8">Detalhamento Individual da Variação</h3>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Número do Processo</TableHead>
                <TableHead className="text-right">Quarter Anterior</TableHead>
                <TableHead className="text-right">Quarter Atual</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processosVariacao.length > 0 ? (
                processosVariacao.map((item) => (
                  <React.Fragment key={item.numero_processo}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50" 
                      onClick={() => setExpandedRow(expandedRow === item.numero_processo ? null : item.numero_processo)}
                    >
                      <TableCell>
                        <Search className={`h-4 w-4 text-muted-foreground transition-transform ${expandedRow === item.numero_processo ? 'rotate-90' : ''}`} />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.numero_processo}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(item.totalAnterior)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.totalAtual)}</TableCell>
                      <TableCell className="text-right font-medium">
                         <span className={item.diferenca > 0 ? 'text-destructive' : 'text-emerald-500'}>
                           {item.diferenca > 0 ? '+' : ''}{formatCurrency(item.diferenca)}
                         </span>
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge variant="outline" className={item.diferenca > 0 ? 'bg-destructive/10 text-destructive border-transparent' : 'bg-emerald-500/10 text-emerald-600 border-transparent'}>
                            {item.tipo}
                         </Badge>
                      </TableCell>
                    </TableRow>
                    
                    {expandedRow === item.numero_processo && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={6} className="p-6">
                          <div className="space-y-4 max-w-4xl mx-auto">
                            <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">Abertura de Valores</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-background border rounded-lg p-4 shadow-sm">
                               <div>
                                 <span className="text-muted-foreground block text-xs uppercase">Principal</span>
                                 <div className="font-medium mt-1">Ant: {formatCurrency(item.principalAnterior)}</div>
                                 <div className="font-bold">Atu: {formatCurrency(item.principalAtual)}</div>
                               </div>
                               <div>
                                 <span className="text-muted-foreground block text-xs uppercase">Correção</span>
                                 <div className="font-medium mt-1">Ant: {formatCurrency(item.correcaoAnterior)}</div>
                                 <div className="font-bold">Atu: {formatCurrency(item.correcaoAtual)}</div>
                               </div>
                               <div>
                                 <span className="text-muted-foreground block text-xs uppercase">Juros</span>
                                 <div className="font-medium mt-1">Ant: {formatCurrency(item.jurosAnterior)}</div>
                                 <div className="font-bold">Atu: {formatCurrency(item.jurosAtual)}</div>
                               </div>
                               <div className="border-l pl-4">
                                 <span className="text-muted-foreground block text-xs uppercase">Soma Total</span>
                                 <div className="font-medium mt-1 text-muted-foreground">Ant: {formatCurrency(item.totalAnterior)}</div>
                                 <div className="font-bold text-primary">Atu: {formatCurrency(item.totalAtual)}</div>
                               </div>
                            </div>
                            {item.justificativa && (
                              <div className="bg-background border-l-4 border-l-primary rounded p-3 text-sm flex gap-3 shadow-sm">
                                 <span className="font-semibold whitespace-nowrap">Justificativa:</span>
                                 <span className="italic text-muted-foreground">{item.justificativa}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhuma variação registrada entre os trimestres ou risco base sem dados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      </TabsContent>
    </Tabs>
  )
}
