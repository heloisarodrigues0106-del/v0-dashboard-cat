import { createClient } from '@supabase/supabase-js';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = "https://dcqpzzdtpdjvcjcobgbs.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcXB6emR0cGRqdmNqY29iZ2JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMzNjk3NSwiZXhwIjoyMDg4OTEyOTc1fQ.gRkY-2JZAn14CkB2IG2_iKT2akwSeyCVLOJ1IgmLfgY";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const { data, error } = await supabase.from('tb_processo').select(
      'id, numero_processo, nome_reclamante, funcao_reclamante, advogado_reclamante, ' +
      'reclamada, centro_custo, empresa_terceirizada, tipo_acao, vara, comarca, trt, ' +
      'data_ajuizamento, data_arquivamento, valor_causa, status, fase, instancia, ' +
      'perito_medico_psiquiatra, perito_medico_geral, perito_ergonomico, perito_tecnico'
    );
    
    if (error) {
        console.log("QUERY ERROR:", JSON.stringify(error, null, 2));
    } else {
        console.log("Data count:", data?.length);
    }
}
run();
