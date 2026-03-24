import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigate() {
  const { data, error } = await supabase.rpc('query_information_schema');
  
  if (error) {
    // try direct select with tb_laudo
    const { data: d2, error: e2 } = await supabase.from('tb_laudo').select('*').limit(1);
    if (e2) console.error("tb_laudo error:", e2.message);
    else console.log("tb_laudo columns:", d2 && d2.length > 0 ? Object.keys(d2[0]).join(', ') : "empty");

    // Let's just do a generic postgrest metadata request, but it's hard.
  } else {
      console.log(data);
  }
}

investigate();
