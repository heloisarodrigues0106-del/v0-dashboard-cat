import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardClient from './dashboard-client'
import { provisionamentoConfig } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  const [
    { data: processos, error: errProc },
    { data: pedidosInicial, error: errPI },
    { data: pedidosSentenca, error: errPS },
    { data: pedidosAcordao, error: errPA },
    { data: laudos, error: errLaudo },
    { data: valoresOperacionais, error: errValoresOp },
    { data: valoresQ1, error: errValoresQ1 },
    { data: valoresQ2, error: errValoresQ2 }
  ] = await Promise.all([
    supabase.from('tb_processo').select(
      'numero_processo, nome_reclamante, status_reclamante, funcao_reclamante, advogado_reclamante, ' +
      'reclamada, centro_custo, empresa_terceirizada, tipo_acao, vara, comarca, uf, ' +
      'data_ajuizamento, data_arquivamento, data_admissao_reclamante, data_demissao_reclamante, ' +
      'valor_causa, valor_acordo, status, fase_processual, instancia, modalidade_rescisao, ' +
      'honorario_pericia, testemunha_reclamante, testemunha_reclamada, ' +
      'perito_medico_psiquiatra, perito_medico_geral, perito_ergonomico, perito_tecnico, ' +
      'assistente_medico, assistente_tecnico, ' +
      'liminar, tipo_processo_apenso, numero_processo_apenso'
    ),
    supabase.from('tb_pedidos_inicial').select('*'),
    supabase.from('tb_pedidos_sentenca').select('*'),
    supabase.from('tb_pedidos_acordao').select('*'),
    supabase.from('tb_laudo').select('*'),
    supabase.from('tb_valores').select(
      'numero_processo, deposito_recursal, apolice, custas_processuais, deposito_judicial'
    ),
    supabase.from(provisionamentoConfig.tabelaAnterior).select(
      'numero_processo, ' +
      'provavel_principal_quarter_atual, provavel_correcao_quarter_atual, provavel_juros_quarter_atual, provavel_total_atual, ' +
      'possivel_principal_quarter_atual, possivel_correcao_quarter_atual, possivel_juros_quarter_atual, possivel_total_atual, ' +
      'remoto_principal_quarter_atual, remoto_correcao_quarter_atual, remoto_juros_quarter_atual, remoto_total_atual'
    ),
    supabase.from(provisionamentoConfig.tabelaAtual).select(
      'numero_processo, ' +
      'provavel_principal_quarter_atual, provavel_correcao_quarter_atual, provavel_juros_quarter_atual, provavel_total_atual, ' +
      'possivel_principal_quarter_atual, possivel_correcao_quarter_atual, possivel_juros_quarter_atual, possivel_total_atual, ' +
      'remoto_principal_quarter_atual, remoto_correcao_quarter_atual, remoto_juros_quarter_atual, remoto_total_atual, ' +
      'justificativa_reavaliacao_quarter_atual, valor_pago_reclamante'
    )
  ])

  const erros = { errProc, errPI, errPS, errPA, errLaudo, errValoresOp, errValoresQ1, errValoresQ2 }
  Object.entries(erros).forEach(([k, v]) => {
    if (v) console.error(`[dashboard] ${k}:`, JSON.stringify(v))
  })

  const errorMsg = [errProc, errValoresOp, errValoresQ1, errValoresQ2, errLaudo]
    .filter(Boolean)
    .map((e: any) => e.message)
    .join(" | ")

  // Consolidar valores do Q1 (Anterior) e Q2 (Atual) por numero_processo
  const q1Map = new Map<string, any>()
  const safeValoresQ1 = (valoresQ1 as any[]) || []
  safeValoresQ1.forEach((row: any) => {
    if (row.numero_processo) {
      q1Map.set(row.numero_processo, row)
    }
  })

  const q2Map = new Map<string, any>()
  const safeValoresQ2 = (valoresQ2 as any[]) || []
  safeValoresQ2.forEach((row: any) => {
    if (row.numero_processo) {
      q2Map.set(row.numero_processo, row)
    }
  })

  const allProcessosSet = new Set<string>([
    ...safeValoresQ1.map((r: any) => r.numero_processo),
    ...safeValoresQ2.map((r: any) => r.numero_processo)
  ].filter(Boolean))

  const valoresProvisionamento = Array.from(allProcessosSet).map(numProc => {
    const q1Row = q1Map.get(numProc) || {}
    const q2Row = q2Map.get(numProc) || {}

    return {
      numero_processo: numProc,
      
      // Valores Q1 (Anterior) vem do Q1's actual/atual columns
      provavel_principal_quarter_anterior: q1Row.provavel_principal_quarter_atual ?? null,
      provavel_correcao_quarter_anterior: q1Row.provavel_correcao_quarter_atual ?? null,
      provavel_juros_quarter_anterior: q1Row.provavel_juros_quarter_atual ?? null,
      provavel_total_anterior: q1Row.provavel_total_atual ?? 0,

      possivel_principal_quarter_anterior: q1Row.possivel_principal_quarter_atual ?? null,
      possivel_correcao_quarter_anterior: q1Row.possivel_correcao_quarter_atual ?? null,
      possivel_juros_quarter_anterior: q1Row.possivel_juros_quarter_atual ?? null,
      possivel_total_anterior: q1Row.possivel_total_atual ?? 0,

      remoto_principal_quarter_anterior: q1Row.remoto_principal_quarter_atual ?? null,
      remoto_correcao_quarter_anterior: q1Row.remoto_correcao_quarter_atual ?? null,
      remoto_juros_quarter_anterior: q1Row.remoto_juros_quarter_atual ?? null,
      remoto_total_anterior: q1Row.remoto_total_atual ?? 0,

      // Valores Q2 (Atual) vem do Q2's actual/atual columns
      provavel_principal_quarter_atual: q2Row.provavel_principal_quarter_atual ?? null,
      provavel_correcao_quarter_atual: q2Row.provavel_correcao_quarter_atual ?? null,
      provavel_juros_quarter_atual: q2Row.provavel_juros_quarter_atual ?? null,
      provavel_total_atual: q2Row.provavel_total_atual ?? 0,

      possivel_principal_quarter_atual: q2Row.possivel_principal_quarter_atual ?? null,
      possivel_correcao_quarter_atual: q2Row.possivel_correcao_quarter_atual ?? null,
      possivel_juros_quarter_atual: q2Row.possivel_juros_quarter_atual ?? null,
      possivel_total_atual: q2Row.possivel_total_atual ?? 0,

      remoto_principal_quarter_atual: q2Row.remoto_principal_quarter_atual ?? null,
      remoto_correcao_quarter_atual: q2Row.remoto_correcao_quarter_atual ?? null,
      remoto_juros_quarter_atual: q2Row.remoto_juros_quarter_atual ?? null,
      remoto_total_atual: q2Row.remoto_total_atual ?? 0,

      justificativa_reavaliacao_quarter_atual: q2Row.justificativa_reavaliacao_quarter_atual || "",
      valor_pago_reclamante: q2Row.valor_pago_reclamante ?? 0
    }
  })

  // Normalização de comarcas (Requisito: Agrupar Piracicaba, Hortolândia e Sete Lagoas)
  const normalizedProcessos = ((processos as any[]) || []).map((p: any) => {
    if (p.comarca) {
      const clean = p.comarca.trim();
      const upper = clean.toUpperCase();
      let normalized = clean;
      
      if (upper === 'PIRACICABA') {
        normalized = 'PIRACICABA';
      } else if (upper === 'HORTOLANDIA' || upper === 'HORTOLÂNDIA') {
        normalized = 'HORTOLÂNDIA';
      } else if (upper === 'SETE LAGOAS') {
        normalized = 'SETE LAGOAS';
      } else {
        normalized = upper; // Garante consistência visual em caixa alta para todas as outras comarcas
      }
      
      return { ...p, comarca: normalized };
    }
    return p;
  });

  return (
    <>
      {errorMsg && (
        <div className="bg-red-500 text-white p-4 font-bold rounded m-4 shadow-lg text-sm">
          Erro no banco de dados (A API falhou e retornou 0 resultados): {errorMsg}
        </div>
      )}
      <DashboardClient
        processos={normalizedProcessos}
        pedidosInicial={pedidosInicial || []}
        pedidosSentenca={pedidosSentenca || []}
        pedidosAcordao={pedidosAcordao || []}
        laudos={laudos || []}
        valoresOperacionais={valoresOperacionais || []}
        valoresProvisionamento={valoresProvisionamento || []}
      />
    </>
  )
}
