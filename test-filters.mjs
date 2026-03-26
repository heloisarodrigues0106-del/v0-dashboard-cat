import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('tb_processo').select('*').limit(3);
  let out = {};
  if (error) {
    out.error = error;
  }
  if (data) {
    if (data.length > 0) {
      out.columns = Object.keys(data[0]);
    }
    out.data_ajuizamento = data.map(d => d.data_ajuizamento);
    out.data_arquivamento = data.map(d => d.data_arquivamento);
  }
  fs.writeFileSync('test-output.json', JSON.stringify(out, null, 2));
}

test();
