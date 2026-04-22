import { createClient } from '@supabase/supabase-js';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = "https://dcqpzzdtpdjvcjcobgbs.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcXB6emR0cGRqdmNqY29iZ2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzY5NzUsImV4cCI6MjA4ODkxMjk3NX0.RHptA5v_OdQBzU5fWWdZc_rcoOH5dSuRG95ndQW-wWI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const { data, error } = await supabase.from('tb_processo').select('*');
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Data count with ANON key:", data?.length);
    }
}
run();
