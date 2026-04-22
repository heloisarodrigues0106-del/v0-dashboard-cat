const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  "https://dcqpzzdtpdjvcjcobgbs.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcXB6emR0cGRqdmNqY29iZ2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzY5NzUsImV4cCI6MjA4ODkxMjk3NX0.RHptA5v_OdQBzU5fWWdZc_rcoOH5dSuRG95ndQW-wWI"
)

async function test() {
  const { data, error } = await supabase.from('tb_processo').select(
      'id, numero_processo, nome_reclamante, funcao_reclamante, advogado_reclamante, ' +
      'reclamada, centro_custo, empresa_terceirizada, tipo_acao, vara, comarca, trt, ' +
      'data_ajuizamento, data_arquivamento, valor_causa, status, fase, instancia, ' +
      'perito_medico_psiquiatra, perito_medico_geral, perito_ergonomico, perito_tecnico'
    ).limit(1)
  console.log('tb_processo:', { error: error ? error.message : null, count: data ? data.length : 0 })

  const { data: d2, error: e2 } = await supabase.from('tb_valores').select(
      'id, numero_processo, deposito_recursal, apolice, custas_processuais, ' +
      'deposito_judicial, provavel_principal_quarter_anterior, provavel_correcao_quarter_anterior, ' +
      'provavel_juros_quarter_anterior, provavel_total_anterior, provavel_principal_quarter_atual, ' +
      'provavel_correcao_quarter_atual, provavel_juros_quarter_atual, provavel_total_atual, ' +
      'possivel_principal_quarter_atual, possivel_correcao_quarter_atual, ' +
      'possivel_juros_quarter_atual, possivel_total_atual, remoto_principal_quarter_atual, ' +
      'remoto_correcao_quarter_atual, remoto_juros_quarter_atual, remoto_total_atual, ' +
      'justificativa_reavaliacao_quarter_anterior, justificativa_reavaliacao_quarter_atual'
    ).limit(1)
  console.log('tb_valores:', { error: e2 ? e2.message : null, count: d2 ? d2.length : 0 })
}

test()
