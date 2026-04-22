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
    { data: laudos },
    { data: valores }
  ] = await Promise.all([
    supabase.from('tb_processo').select(
      'id, numero_processo, nome_reclamante, funcao_reclamante, advogado_reclamante, ' +
      'reclamada, centro_custo, empresa_terceirizada, tipo_acao, vara, comarca, uf, ' +
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
      'id, numero_processo, deposito_recursal, apolice, custas_processuais, ' +
      'deposito_judicial, provavel_principal_quarter_anterior, provavel_correcao_quarter_anterior, ' +
      'provavel_juros_quarter_anterior, provavel_principal_quarter_atual, ' +
      'provavel_correcao_quarter_atual, provavel_juros_quarter_atual, ' +
      'possivel_principal_quarter_atual, possivel_correcao_quarter_atual, ' +
      'possivel_juros_quarter_atual, remoto_principal_quarter_atual, ' +
      'remoto_correcao_quarter_atual, remoto_juros_quarter_atual, ' +
      'justificativa_reavaliacao_quarter_anterior, justificativa_reavaliacao_quarter_atual'
    ),
  ])

  if (errProc && process.env.NODE_ENV !== 'production') {
    console.error('Erro ao buscar processos no Supabase:', errProc)
  }

  return (
    <DashboardClient
      processos={processos || []}
      pedidosInicial={pedidosInicial || []}
      pedidosSentenca={pedidosSentenca || []}
      pedidosAcordao={pedidosAcordao || []}
      laudos={laudos || []}
      valores={valores || []}
    />
  )
}
