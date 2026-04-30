import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardClient from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  const [
    { data: processos, error: errProc },
    { data: pedidosInicial, error: errPI },
    { data: pedidosSentenca, error: errPS },
    { data: pedidosAcordao, error: errPA },
    { data: laudos, error: errLaudo },
    { data: valores, error: errValores }
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
    supabase.from('tb_pedidos_inicial').select(
      'id, numero_processo, do_at, reintegracao, periculosidade, insalubridade, ' +
      'danos_morais, horas_extras, intrajornada, horas_itinere, acumulo_funcao, ' +
      'equip_salarial, rec_vinculo, outros, rescisao_indireta, danos_materiais, ' +
      'honorarios_advocaticios, estabilidade'
    ),
    supabase.from('tb_pedidos_sentenca').select(
      'id, numero_processo, reintegracao, periculosidade, insalubridade, danos_morais, ' +
      'horas_extras, intrajornada, horas_itinere, acumulo_funcao, equip_salarial, ' +
      'rec_vinculo, outros, do_mental, do_ergonomica, incapacidade, acidente_trabalho, ' +
      'rescisao_indireta, danos_materiais, honorarios_advocaticios, obrigacao, estabilidade'
    ),
    supabase.from('tb_pedidos_acordao').select(
      'id, numero_processo, reintegracao, periculosidade, insalubridade, danos_morais, ' +
      'horas_extras, intrajornada, horas_itinere, acumulo_funcao, equip_salarial, ' +
      'rec_vinculo, outros, do_mental, do_ergonomica, incapacidade, acidente_trabalho, ' +
      'rescisao_indireta, danos_materiais, honorarios_advocaticios, obrigacao, estabilidade'
    ),
    supabase.from('tb_laudo').select('*'),
    supabase.from('tb_valores').select(
      'numero_processo, deposito_recursal, apolice, custas_processuais, ' +
      'deposito_judicial, provavel_principal_quarter_anterior, provavel_correcao_quarter_anterior, ' +
      'provavel_juros_quarter_anterior, provavel_total_anterior, provavel_principal_quarter_atual, ' +
      'provavel_correcao_quarter_atual, provavel_juros_quarter_atual, provavel_total_atual, ' +
      'possivel_principal_quarter_atual, possivel_correcao_quarter_atual, ' +
      'possivel_juros_quarter_atual, possivel_total_atual, remoto_principal_quarter_atual, ' +
      'remoto_correcao_quarter_atual, remoto_juros_quarter_atual, remoto_total_atual, ' +
      'justificativa_reavaliacao_quarter_anterior, justificativa_reavaliacao_quarter_atual'
    ),
  ])

  const erros = { errProc, errPI, errPS, errPA, errLaudo, errValores }
  Object.entries(erros).forEach(([k, v]) => {
    if (v) console.error(`[dashboard] ${k}:`, JSON.stringify(v))
  })

  const errorMsg = [errProc, errValores, errLaudo]
    .filter(Boolean)
    .map((e: any) => e.message)
    .join(" | ")

  return (
    <>
      {errorMsg && (
        <div className="bg-red-500 text-white p-4 font-bold rounded m-4 shadow-lg text-sm">
          Erro no banco de dados (A API falhou e retornou 0 resultados): {errorMsg}
        </div>
      )}
      <DashboardClient
        processos={processos || []}
        pedidosInicial={pedidosInicial || []}
        pedidosSentenca={pedidosSentenca || []}
        pedidosAcordao={pedidosAcordao || []}
        laudos={laudos || []}
        valores={valores || []}
      />
    </>
  )
}
