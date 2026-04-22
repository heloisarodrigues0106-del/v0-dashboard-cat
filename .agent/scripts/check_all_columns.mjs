import { createClient } from '@supabase/supabase-js';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = "https://dcqpzzdtpdjvcjcobgbs.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcXB6emR0cGRqdmNqY29iZ2JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMzNjk3NSwiZXhwIjoyMDg4OTEyOTc1fQ.gRkY-2JZAn14CkB2IG2_iKT2akwSeyCVLOJ1IgmLfgY";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const tables = ['tb_pedidos_inicial', 'tb_pedidos_sentenca', 'tb_pedidos_acordao', 'tb_laudo', 'tb_valores'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`Error fetching ${table}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`Columns in ${table}:`, Object.keys(data[0]));
        } else {
            console.log(`No data in ${table} to check columns.`);
        }
    }
}
run();
