
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const tables = ['tb_pedidos_inicial', 'tb_pedidos_sentenca', 'tb_pedidos_acordao'];
  
  for (const table of tables) {
    console.log(`\n--- Columns for ${table} ---`);
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`Error fetching from ${table}:`, error.message);
      continue;
    }
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]).join(', '));
    } else {
      console.log("No data found to inspect columns.");
    }
  }
}

checkColumns();
