import { createClient } from '@supabase/supabase-js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import fs from 'fs';
const supabaseUrl = "https://dcqpzzdtpdjvcjcobgbs.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcXB6emR0cGRqdmNqY29iZ2JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMzNjk3NSwiZXhwIjoyMDg4OTEyOTc1fQ.gRkY-2JZAn14CkB2IG2_iKT2akwSeyCVLOJ1IgmLfgY";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const { data } = await supabase.from('tb_laudo').select('*').limit(5);
    fs.writeFileSync('c:\\v0-dashboard-cat\\.agent\\scripts\\laudos.json', JSON.stringify(data, null, 2));
}

run();
