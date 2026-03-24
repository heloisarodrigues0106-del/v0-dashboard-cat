import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigate() {
  const tables = [
    'tb_pedidos_inicial',
    'tb_pedidos_sentenca',
    'tb_pedidos_acordao',
    'tb_laudos',
    'tb_valores'
  ];

  for (const table of tables) {
    console.log(`\nInvestigando tabela: ${table}...`);
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      console.error(`Erro ao acessar ${table}:`, error.message);
    } else {
      if (data && data.length > 0) {
        console.log(`Colunas em ${table}:`, Object.keys(data[0]).join(', '));
      } else {
        console.log(`Tabela ${table} acessada com sucesso, mas está VAZIA. Não é possível inferir as colunas via REST select sem reflection.`);
      }
    }
  }
}

investigate();
