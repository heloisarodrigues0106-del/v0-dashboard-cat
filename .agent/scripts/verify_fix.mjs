import { createClient } from '@supabase/supabase-js';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = "https://dcqpzzdtpdjvcjcobgbs.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcXB6emR0cGRqdmNqY29iZ2JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMzNjk3NSwiZXhwIjoyMDg4OTEyOTc1fQ.gRkY-2JZAn14CkB2IG2_iKT2akwSeyCVLOJ1IgmLfgY";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log("Testing TB_PROCESSO...");
    const { data: proc, error: errProc } = await supabase.from('tb_processo').select(
      'numero_processo, nome_reclamante, funcao_reclamante, advogado_reclamante, ' +
      'reclamada, centro_custo, empresa_terceirizada, tipo_acao, vara, comarca, ' +
      'data_ajuizamento, data_arquivamento, valor_causa, status, fase_processual, instancia, ' +
      'perito_medico_psiquiatra, perito_medico_geral, perito_ergonomico, perito_tecnico'
    ).limit(5);
    
    if (errProc) {
        console.error("TB_PROCESSO FAILED:", errProc.message);
    } else {
        console.log("TB_PROCESSO SUCCESS. Count:", proc.length);
    }

    console.log("Testing TB_VALORES...");
    const { data: val, error: errVal } = await supabase.from('tb_valores').select(
      'numero_processo, deposito_recursal, apolice, custas_processuais, ' +
      'deposito_judicial, provavel_principal_quarter_anterior, provavel_correcao_quarter_anterior, ' +
      'provavel_juros_quarter_anterior, provavel_total_anterior, provavel_principal_quarter_atual, ' +
      'provavel_correcao_quarter_atual, provavel_juros_quarter_atual, provavel_total_atual, ' +
      'possivel_principal_quarter_atual, possivel_correcao_quarter_atual, ' +
      'possivel_juros_quarter_atual, possivel_total_atual, remoto_principal_quarter_atual, ' +
      'remoto_correcao_quarter_atual, remoto_juros_quarter_atual, remoto_total_atual, ' +
      'justificativa_reavaliacao_quarter_anterior, justificativa_reavaliacao_quarter_atual'
    ).limit(5);

    if (errVal) {
        console.error("TB_VALORES FAILED:", errVal.message);
    } else {
        console.log("TB_VALORES SUCCESS. Count:", val.length);
    }
}
run();
