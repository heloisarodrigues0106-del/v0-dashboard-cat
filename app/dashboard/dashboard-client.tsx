"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

// Importações dos novos componentes de Abas (agora rotas do sidebar)
import { VisaoGeralTab } from "@/components/dashboard/tabs/visao-geral-tab"
import { ProcessosTab } from "@/components/dashboard/tabs/processos-tab"
import { LaudosTab } from "@/components/dashboard/tabs/laudos-tab"
import { ValoresTab } from "@/components/dashboard/tabs/valores-tab"
import { AcordosTab } from "@/components/dashboard/tabs/acordos-tab"
import { GlobalFilters } from "@/components/dashboard/global-filters"

// Páginas secundárias
import { ConfiguracoesPage } from "@/components/dashboard/configuracoes-page"
import { createClient } from "@/lib/supabase-client"
import { cn } from "@/lib/utils"

export default function DashboardClient({ 
  processos,
  pedidosInicial,
  pedidosSentenca,
  pedidosAcordao,
  laudos,
  valores
}: { 
  processos: any[],
  pedidosInicial: any[],
  pedidosSentenca: any[],
  pedidosAcordao: any[],
  laudos: any[],
  valores: any[]
}) {
  const router = useRouter()
  const [activeNavItem, setActiveNavItem] = useState("dashboard")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true)
    
    // Atraso intencional para montar todas as 5 sub-abas invisíveis e os gráficos SVG iniciarem
    setTimeout(async () => {
      try {
        const html2pdf = (await import('html2pdf.js')).default
        const element = document.getElementById('pdf-export-container')
        
        if (element) {
          const opt = {
            margin:       [10, 10, 10, 10] as [number, number, number, number], // Margem em mm (Top, Left, Bottom, Right)
            filename:     'Dashboard-CAT.pdf',
            image:        { type: 'jpeg' as const, quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
          }
          await html2pdf().set(opt).from(element).save()
        }
      } catch (error) {
        console.error("Erro ao gerar/exportar PDF:", error)
      } finally {
        setIsExporting(false)
      }
    }, 1500)
  }, [])

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }, [router])

  // Filtros Globais de Data
  const [dataAjuizamentoInicio, setDataAjuizamentoInicio] = useState<Date | undefined>()
  const [dataAjuizamentoFim, setDataAjuizamentoFim] = useState<Date | undefined>()
  const [dataArquivamentoInicio, setDataArquivamentoInicio] = useState<Date | undefined>()
  const [dataArquivamentoFim, setDataArquivamentoFim] = useState<Date | undefined>()

  // Novos Filtros Globais Categóricos
  const [empresa, setEmpresa] = useState<string>("all")
  const [unidade, setUnidade] = useState<string>("all")
  const [advogado, setAdvogado] = useState<string>("all")
  const [terceirizada, setTerceirizada] = useState<string>("all")
  const [tipoAcao, setTipoAcao] = useState<string>("all")
  const [vara, setVara] = useState<string>("all")
  
  // Filtro de Faixa de Valor da Causa
  const [valorAcaoRange, setValorAcaoRange] = useState<[number, number]>([1000, 1000000])

  // Extract unique options for dropdowns
  const filterOptions = useMemo(() => {
    const empresas = new Set<string>()
    const unidades = new Set<string>()
    const advogados = new Set<string>()
    const terceirizadas = new Set<string>()
    const tiposAcao = new Set<string>()
    const varas = new Set<string>()

    processos.forEach(p => {
      if (p.reclamada) empresas.add(p.reclamada)
      if (p.centro_custo) unidades.add(p.centro_custo)
      if (p.advogado_reclamante) advogados.add(p.advogado_reclamante)
      if (p.empresa_terceirizada) terceirizadas.add(p.empresa_terceirizada)
      if (p.tipo_acao) tiposAcao.add(p.tipo_acao)
      
      const v = p.vara ? p.vara.trim() : ""
      const c = p.comarca ? p.comarca.trim() : ""
      const combinedVara = v && c ? `${v} - ${c}` : v || c || ""
      if (combinedVara) varas.add(combinedVara)
    })

    return {
      empresas: Array.from(empresas).sort(),
      unidades: Array.from(unidades).sort(),
      advogados: Array.from(advogados).sort(),
      terceirizadas: Array.from(terceirizadas).sort(),
      tiposAcao: Array.from(tiposAcao).sort(),
      varas: Array.from(varas).sort()
    }
  }, [processos])

  // Logic to filter the base processos array
  const filteredProcessos = useMemo(() => {
    // Helper para converter string "YYYY-MM-DD" do banco para Data local (ignorando fuso que pode mudar o dia)
    const parseToLocalDate = (dateStr: string) => {
      if (!dateStr) return null;
      const [year, month, day] = dateStr.split('T')[0].split('-');
      return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    };

    return processos.filter(p => {
      let matchesAjuizamento = true
      if (dataAjuizamentoInicio || dataAjuizamentoFim) {
        if (!p.data_ajuizamento) {
          matchesAjuizamento = false
        } else {
          const d = parseToLocalDate(p.data_ajuizamento)
          if (d) {
            if (dataAjuizamentoInicio) {
              const inicio = new Date(dataAjuizamentoInicio)
              inicio.setHours(0, 0, 0, 0)
              if (d < inicio) matchesAjuizamento = false
            }
            if (dataAjuizamentoFim) {
              const fim = new Date(dataAjuizamentoFim)
              fim.setHours(23, 59, 59, 999)
              if (d > fim) matchesAjuizamento = false
            }
          } else {
            matchesAjuizamento = false
          }
        }
      }

      let matchesArquivamento = true
      if (dataArquivamentoInicio || dataArquivamentoFim) {
        if (!p.data_arquivamento) {
          matchesArquivamento = false
        } else {
          const d = parseToLocalDate(p.data_arquivamento)
          if (d) {
            if (dataArquivamentoInicio) {
              const inicio = new Date(dataArquivamentoInicio)
              inicio.setHours(0, 0, 0, 0)
              if (d < inicio) matchesArquivamento = false
            }
            if (dataArquivamentoFim) {
              const fim = new Date(dataArquivamentoFim)
              fim.setHours(23, 59, 59, 999)
              if (d > fim) matchesArquivamento = false
            }
          } else {
             matchesArquivamento = false
          }
        }
      }

      const matchesEmpresa = empresa === "all" || p.reclamada === empresa
      const matchesUnidade = unidade === "all" || p.centro_custo === unidade
      const matchesAdvogado = advogado === "all" || p.advogado_reclamante === advogado
      const matchesTerceirizada = terceirizada === "all" || p.empresa_terceirizada === terceirizada
      const matchesTipoAcao = tipoAcao === "all" || p.tipo_acao === tipoAcao
      
      const matchesVara = vara === "all" || (() => {
        const v = p.vara ? p.vara.trim() : ""
        const c = p.comarca ? p.comarca.trim() : ""
        const pt = v && c ? `${v} - ${c}` : v || c || ""
        return pt === vara
      })()

      // Filtro de Valor da Causa
      let matchesValorAcao = true
      const valor = Number(p.valor_acao) || 0
      if (valor < valorAcaoRange[0]) matchesValorAcao = false
      if (valorAcaoRange[1] < 1000000 && valor > valorAcaoRange[1]) matchesValorAcao = false

      return (
        matchesAjuizamento && 
        matchesArquivamento &&
        matchesEmpresa &&
        matchesUnidade &&
        matchesAdvogado &&
        matchesTerceirizada &&
        matchesTipoAcao &&
        matchesVara &&
        matchesValorAcao
      )
    })
  }, [
    processos, dataAjuizamentoInicio, dataAjuizamentoFim, dataArquivamentoInicio, dataArquivamentoFim,
    empresa, unidade, advogado, terceirizada, tipoAcao, vara, valorAcaoRange
  ])

  // Extract valid numero_processos for cascading filters to other arrays
  const validProcessosSet = useMemo(() => {
    return new Set(filteredProcessos.map((p: any) => p.numero_processo))
  }, [filteredProcessos])

  const filteredPedidosInicial = useMemo(() => pedidosInicial.filter((p: any) => validProcessosSet.has(p.numero_processo)), [pedidosInicial, validProcessosSet])
  const filteredPedidosSentenca = useMemo(() => pedidosSentenca.filter((p: any) => validProcessosSet.has(p.numero_processo)), [pedidosSentenca, validProcessosSet])
  const filteredPedidosAcordao = useMemo(() => pedidosAcordao.filter((p: any) => validProcessosSet.has(p.numero_processo)), [pedidosAcordao, validProcessosSet])
  const filteredLaudos = useMemo(() => laudos.filter((l: any) => validProcessosSet.has(l.numero_processo)), [laudos, validProcessosSet])
  const filteredValores = useMemo(() => valores.filter((v: any) => validProcessosSet.has(v.numero_processo)), [valores, validProcessosSet])

  const getBreadcrumb = () => {
    switch (activeNavItem) {
      case "dashboard":
        return "Visão Geral"
      case "processos":
        return "Processos"
      case "acordos":
        return "Acordos"
      case "laudos":
        return "Laudos"
      case "valores":
        return "Valores"
      case "configuracoes":
        return "Configurações"
      default:
        return "Visão Geral"
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Sidebar */}
      <SidebarNav 
        activeItem={activeNavItem} 
        onItemClick={setActiveNavItem} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        // Desktop: offset by sidebar width
        isCollapsed ? "md:ml-20" : "md:ml-64",
        // Mobile: no offset (sidebar overlays)
        "ml-0"
      )}>
        {/* Header */}
        <DashboardHeader 
          breadcrumb={getBreadcrumb()} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
          isExporting={isExporting}
          onExportPDF={handleExportPDF}
        />

        {/* Global Filters */}
        {activeNavItem !== "configuracoes" && (
          <GlobalFilters
            dataAjuizamentoInicio={dataAjuizamentoInicio}
            setDataAjuizamentoInicio={setDataAjuizamentoInicio}
            dataAjuizamentoFim={dataAjuizamentoFim}
            setDataAjuizamentoFim={setDataAjuizamentoFim}
            dataArquivamentoInicio={dataArquivamentoInicio}
            setDataArquivamentoInicio={setDataArquivamentoInicio}
            dataArquivamentoFim={dataArquivamentoFim}
            setDataArquivamentoFim={setDataArquivamentoFim}
            empresa={empresa}
            setEmpresa={setEmpresa}
            unidade={unidade}
            setUnidade={setUnidade}
            advogado={advogado}
            setAdvogado={setAdvogado}
            terceirizada={terceirizada}
            setTerceirizada={setTerceirizada}
            tipoAcao={tipoAcao}
            setTipoAcao={setTipoAcao}
            vara={vara}
            setVara={setVara}
            valorAcaoRange={valorAcaoRange}
            setValorAcaoRange={setValorAcaoRange}
            processos={processos} // For the histogram
            filterOptions={filterOptions}
          />
        )}

        {/* Content based on active nav item */}
        <div className="pb-8">
          
          {/* 1. Visão Geral (Antigo Dashboard com Cards) */}
          {activeNavItem === "dashboard" && (
            <div className="px-4 md:px-8 pt-4 md:pt-6 animate-in fade-in-50 duration-500">
              <VisaoGeralTab processos={filteredProcessos} pedidos={filteredPedidosInicial} />
            </div>
          )}

          {/* 2. Processos */}
          {activeNavItem === "processos" && (
            <div className="px-4 md:px-8 pt-4 md:pt-6 animate-in fade-in-50 duration-500">
              <ProcessosTab 
                processos={filteredProcessos} 
                pedidosInicial={filteredPedidosInicial} 
                pedidosSentenca={filteredPedidosSentenca} 
                pedidosAcordao={filteredPedidosAcordao}
                laudos={filteredLaudos}
              />
            </div>
          )}

          {/* 3. Acordos */}
          {activeNavItem === "acordos" && (
            <div className="px-4 md:px-8 pt-4 md:pt-6 animate-in fade-in-50 duration-500">
               <AcordosTab processos={filteredProcessos} />
            </div>
          )}

          {/* 4. Laudos */}
          {activeNavItem === "laudos" && (
            <div className="px-4 md:px-8 pt-4 md:pt-6 animate-in fade-in-50 duration-500">
               <LaudosTab laudos={filteredLaudos} />
            </div>
          )}

          {/* 4. Valores */}
          {activeNavItem === "valores" && (
            <div className="px-4 md:px-8 pt-4 md:pt-6 animate-in fade-in-50 duration-500">
               <ValoresTab valores={filteredValores} />
            </div>
          )}

          {/* 5. Configurações */}
          {activeNavItem === "configuracoes" && (
            <div className="px-4 md:px-8 pt-4 md:pt-6 animate-in fade-in-50 duration-500">
              <ConfiguracoesPage />
            </div>
          )}

        </div>

        {/* --- EXPORT VIEW (RENDERIZADO INVISÍVEL APENAS PARA O PDF) --- */}
        {isExporting && (
          <div 
            id="pdf-export-container" 
            className="absolute left-[9999px] top-0 w-[1400px] bg-[#f8fafc] text-slate-900 flex flex-col gap-16 p-8"
          >
            <div className="mb-8 text-center border-b-4 border-[#F6D000] pb-6">
              <h1 className="text-4xl font-black uppercase text-slate-900 tracking-tight">Caterpillar - Relatório Jurídico Consolidado</h1>
              <p className="text-slate-500 font-medium mt-2">Extração automática de métricas globais</p>
            </div>
            
            <section className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-3xl font-bold mb-6 text-slate-800 border-l-8 border-[#F6D000] pl-4">Visão Geral</h2>
              <VisaoGeralTab processos={filteredProcessos} pedidos={filteredPedidosInicial} />
            </section>
            
            <div className="html2pdf__page-break"></div>
            
            <section className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-3xl font-bold mb-6 text-slate-800 border-l-8 border-[#F6D000] pl-4">Processos em Detalhe</h2>
              <ProcessosTab 
                processos={filteredProcessos} 
                pedidosInicial={filteredPedidosInicial} 
                pedidosSentenca={filteredPedidosSentenca} 
                pedidosAcordao={filteredPedidosAcordao}
                laudos={filteredLaudos}
              />
            </section>
            
            <div className="html2pdf__page-break"></div>
            
            <section className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-3xl font-bold mb-6 text-slate-800 border-l-8 border-[#F6D000] pl-4">Gestão de Acordos</h2>
              <AcordosTab processos={filteredProcessos} />
            </section>
            
            <div className="html2pdf__page-break"></div>
            
            <section className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-3xl font-bold mb-6 text-slate-800 border-l-8 border-[#F6D000] pl-4">Histórico de Laudos Periciais</h2>
              <LaudosTab laudos={filteredLaudos} />
            </section>
            
            <div className="html2pdf__page-break"></div>
            
            <section className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-3xl font-bold mb-6 text-slate-800 border-l-8 border-[#F6D000] pl-4">Valores Envolvidos e Custos</h2>
              <ValoresTab valores={filteredValores} />
            </section>
          </div>
        )}

      </main>
    </div>
  )
}
