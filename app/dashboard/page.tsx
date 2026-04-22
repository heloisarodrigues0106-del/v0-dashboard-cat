import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardClient from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  const [
    { data: processos, error: errProc },
    { data: pedidosInicial },
    { data: pedidosSentenca },
    { data: pedidosAcordao },
    { data: laudos, error: errLaudos },
    { data: valores, error: errValores }
  ] = await Promise.all([
    supabase.from('tb_processo').select(
      'numero_processo, nome_reclamante, funcao_reclamante, advogado_reclamante, ' +
      'reclamada, centro_custo, empresa_terceirizada, tipo_acao, vara, comarca, ' +
      'data_ajuizamento, data_arquivamento, valor_causa, status, fase_processual, instancia, ' +
      'perito_medico_psiquiatra, perito_medico_geral, perito_ergonomico, perito_tecnico'
    ),
    supabase.from('tb_pedidos_inicial').select(
      'id, numero_processo, do_at, reintegracao, periculosidade, insalubridade, ' +
      'danos_morais, horas_extras, intrajornada, horas_itinere, acumulo_funcao, ' +
      'equip_salarial, rec_vinculo, outros, rescisao_indireta, danos_materiais, ' +
      'honorarios_advocaticios'
    ),
    supabase.from('tb_pedidos_sentenca').select(
      'id, numero_processo, reintegracao, periculosidade, insalubridade, danos_morais, ' +
      'horas_extras, intrajornada, horas_itinere, acumulo_funcao, equip_salarial, ' +
      'rec_vinculo, outros, do_mental, do_ergonomica, incapacidade, acidente_trabalho, ' +
      'rescisao_indireta, danos_materiais, honorarios_advocaticios, obrigacao'
    ),
    supabase.from('tb_pedidos_acordao').select(
      'id, numero_processo, reintegracao, periculosidade, insalubridade, danos_morais, ' +
      'horas_extras, intrajornada, horas_itinere, acumulo_funcao, equip_salarial, ' +
      'rec_vinculo, outros, do_mental, do_ergonomica, incapacidade, acidente_trabalho, ' +
      'rescisao_indireta, danos_materiais, honorarios_advocaticios, obrigacao'
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

  if (process.env.NODE_ENV !== 'production') {
    if (errProc) console.error('Erro tb_processo:', errProc)
    if (errValores) console.error('Erro tb_valores:', errValores)
  }

  const errorMsg = [errProc, errValores, errLaudos]
    .filter(Boolean)
    .map(e => e.message)
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
