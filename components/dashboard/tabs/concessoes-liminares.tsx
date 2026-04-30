"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip, LabelList } from "recharts"
import { Scale } from "lucide-react"

const CHART_COLORS = ['#102A63', '#183B8C', '#4F6DB8', '#94A3B8', '#14B8A6'];

const CustomYAxisTick = ({ x, y, payload }: any) => {
  const text = payload.value;
  if (!text) return null;
  
  const MAX_LINE_LENGTH = 30;
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word: string) => {
    if ((currentLine + word).length > MAX_LINE_LENGTH) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  });
  if (currentLine) lines.push(currentLine.trim());

  // Limitar a 3 linhas para não poluir
  const displayLines = lines.slice(0, 3);
  const hasMore = lines.length > 3;

  return (
    <g transform={`translate(${x},${y})`}>
      {displayLines.map((line, index) => (
        <text
          key={index}
          x={-10}
          y={index * 12 - (displayLines.length - 1) * 6}
          dy={4}
          textAnchor="end"
          fill="#475569"
          style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
        >
          {index === 2 && hasMore ? `${line.substring(0, MAX_LINE_LENGTH - 3)}...` : line}
        </text>
      ))}
    </g>
  );
};

export function ConcessoesLiminares({ processos = [] }: { processos: any[] }) {
  const [agrupamento, setAgrupamento] = useState<"Assunto" | "Origem">("Assunto")
  const [assuntoFilter, setAssuntoFilter] = useState<string>("all")
  const [ufFilter, setUfFilter] = useState<string>("all")

  // Função robusta para normalização e separação de múltiplos assuntos
  const splitAndNormalizeAssuntos = (valorRaw: any): string[] => {
    if (!valorRaw) return [];
    
    // 1. Converter para string e limpeza inicial
    let texto = String(valorRaw)
      .replace(/concedida\s*-\s*/i, '')
      .replace(/parcialmente concedida\s*-\s*/i, '')
      .replace(/\s+/g, ' ') // remover espaços duplicados
      .trim();
    
    const ignoredValues = ["NULL", "N/A", "NA", "-", "—", "NULO", "VAZIO"];
    if (!texto || ignoredValues.includes(texto.toUpperCase())) return [];

    // 2. Delimitadores: ponto seguido de espaço, ponto e vírgula, quebra de linha, barra, pipe
    // Usamos regex para capturar as diferentes formas de separação
    const regex = /\.\s*|;|\n|\/|\|/g;
    const partes = texto.split(regex);
    
    const subjects = partes
      .map(p => p.trim())
      // Remover pontuação residual no início e fim de cada parte
      .map(p => p.replace(/^[.,;:/|]+|[.,;:/|]+$/g, '').trim())
      // Unificação básica e caixa alta
      .map(p => {
         let v = p.toUpperCase();
         if (v === "MANUTENCAO DO PLANO DE SAUDE") return "PLANO DE SAUDE";
         return v;
      })
      // Filtrar itens vazios ou ignorados após limpeza
      .filter(p => p.length > 0 && !ignoredValues.includes(p.toUpperCase()));

    // Remover duplicados dentro do mesmo registro (Requisito 12)
    return Array.from(new Set(subjects));
  }

  // Extrair base de liminares (Regras de Negócio 4)
  const baseLiminares = useMemo(() => {
    return processos.filter(p => {
      const text = String(p.liminar || "").toUpperCase();
      const statusExtra = String(p.status_liminar || p.concessao_liminar || p.decisao_liminar || "").toUpperCase();

      if (!text || text === "NULL" || text === "N/A" || text === "-" || text === "FALSE") return false;

      // Se for explicitamente negada no texto ou no status extra, removemos
      const isNegada = 
        text.includes("INDEFERIDA") || 
        text.includes("NEGADA") || 
        text.includes("REJEITADA") ||
        statusExtra.includes("INDEFERIDA") ||
        statusExtra.includes("NEGADA") ||
        statusExtra.includes("REJEITADA");

      if (isNegada) return false;

      return true;
    });
  }, [processos]);

  // Lista única de Assuntos considerando os valores separados
  const assuntosUnicos = useMemo(() => {
    const s = new Set<string>();
    baseLiminares.forEach(p => {
      const subjects = splitAndNormalizeAssuntos(p.liminar);
      subjects.forEach(sub => s.add(sub));
    });
    return Array.from(s).sort();
  }, [baseLiminares]);

  // Lista única de UFs
  const ufsUnicos = useMemo(() => {
    const s = new Set<string>();
    baseLiminares.forEach(p => {
      const uf = p.uf ? String(p.uf).trim().toUpperCase() : "";
      if (uf) s.add(uf);
    });
    return Array.from(s).sort();
  }, [baseLiminares]);

  // Agregar dados conforme o filtro e agrupamento (Regras de Agregação 9-13)
  const chartData = useMemo(() => {
    // 1. Aplica filtros principais
    const filtered = baseLiminares.filter(p => {
      if (ufFilter !== "all" && (p.uf ? String(p.uf).trim().toUpperCase() : "") !== ufFilter) return false;
      
      if (assuntoFilter !== "all") {
        const subjects = splitAndNormalizeAssuntos(p.liminar);
        if (!subjects.includes(assuntoFilter)) return false;
      }
      
      return true;
    });

    // 2. Agrupa os valores
    const counts: Record<string, number> = {};
    
    filtered.forEach(p => {
      if (agrupamento === "Assunto") {
        const subjects = splitAndNormalizeAssuntos(p.liminar);
        subjects.forEach(subject => {
          counts[subject] = (counts[subject] || 0) + 1;
        });
      } else if (agrupamento === "Origem") {
        const v = p.vara ? String(p.vara).trim() : "";
        const c = p.comarca ? String(p.comarca).trim() : "";
        let chave = "";
        
        if (v && c) {
          chave = `${v} VARA DE ${c}`.toUpperCase();
        } else if (v || c) {
          const varatext = v ? v : "VARA NÃO INFORMADA";
          const comarcatext = c ? ` DE ${c}` : "";
          chave = `${varatext}${comarcatext}`.toUpperCase();
        } else {
          chave = "ORIGEM NÃO INFORMADA".toUpperCase();
        }
        counts[chave] = (counts[chave] || 0) + 1;
      }
    });

    // 3. Transforma em array e ordena (Ranking descendente - Requisito 16)
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [baseLiminares, agrupamento, assuntoFilter, ufFilter]);

  // Calcular altura do container para gerar scroll apenas se houver muitos itens (> 10)
  const isScrollable = chartData.length > 10;
  const containerHeight = isScrollable ? 400 : Math.max(250, chartData.length * 40 + 40);

  return (
    <Card className="flex flex-col col-span-full xl:col-span-2 shadow-sm border border-slate-200/60">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              Concessões de Liminares
            </CardTitle>
            <CardDescription className="mt-1.5 max-w-md">
              Processos com status de 'Concedida' ou 'Parcialmente Concedida'. Não exibe liminares nulas ou indeferidas.
            </CardDescription>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 min-w-[200px]">
             <Select value={ufFilter} onValueChange={setUfFilter}>
              <SelectTrigger className="h-9 w-full md:w-[130px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="UF..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as UFs</SelectItem>
                {ufsUnicos.map(u => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>

             <Select value={assuntoFilter} onValueChange={setAssuntoFilter}>
              <SelectTrigger className="h-9 w-full md:w-[220px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Assunto da Liminar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Assuntos</SelectItem>
                {assuntosUnicos.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pilulas de Agrupamento */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Agrupar via:</span>
          {(["Assunto", "Origem"] as const).map(mod => (
            <Button 
              key={mod}
              variant={agrupamento === mod ? "default" : "outline"}
              size="sm"
              onClick={() => setAgrupamento(mod)}
              className={agrupamento === mod 
                ? "bg-[#183B8C] hover:bg-[#102A63] text-white font-black text-[10px] uppercase tracking-widest rounded-full px-5 shadow-md border-none" 
                : "rounded-full px-5 text-slate-500 font-bold text-[10px] uppercase tracking-widest border-slate-200 bg-[#F8FAFC] hover:bg-slate-100"
              }
            >
              {mod}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-2">
        {chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-[11px] font-black uppercase tracking-widest text-slate-300 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            Nenhuma concessão encontrada
          </div>
        ) : (
          <div className="pr-4" style={{ height: isScrollable ? '400px' : 'auto', overflowY: isScrollable ? 'auto' : 'visible' }}>
            <div style={{ height: `${containerHeight}px`, minHeight: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={220}
                    tick={<CustomYAxisTick />}
                  />
                  <Tooltip 
                    cursor={{ fill: "#F8FAFC", opacity: 0.5 }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)", fontWeight: 700 }}
                    formatter={(val: number) => [`${val} concessões`, agrupamento]}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 50, 50, 0]} 
                    barSize={24}
                    isAnimationActive={true}
                  >
                    <LabelList 
                      dataKey="count" 
                      position="right" 
                      style={{ fill: "#1F2937", fontSize: 12, fontWeight: 900 }}
                    />
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#183B8C" className="hover:fill-[#102A63] transition-all duration-300" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
