import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const supabaseUrl = "https://dcqpzzdtpdjvcjcobgbs.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcXB6emR0cGRqdmNqY29iZ2JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMzNjk3NSwiZXhwIjoyMDg4OTEyOTc1fQ.gRkY-2JZAn14CkB2IG2_iKT2akwSeyCVLOJ1IgmLfgY";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const { data } = await supabase.from('tb_laudo').select('insalubridade, periculosidade, do_mental, do_ergonomica');
    
    const unique = (arr) => [...new Set(arr)];

    const result = {
        Insalubridade: unique(data.map(d => d.insalubridade)),
        Periculosidade: unique(data.map(d => d.periculosidade)),
        Mental: unique(data.map(d => d.do_mental)),
        Ergo: unique(data.map(d => d.do_ergonomica))
    };
    fs.writeFileSync('c:\\v0-dashboard-cat\\.agent\\scripts\\distinct.json', JSON.stringify(result, null, 2));
}

run();
