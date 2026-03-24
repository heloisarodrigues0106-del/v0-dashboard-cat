import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: 'c:\\v0-dashboard-cat\\.env.local' })
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
import fs from 'fs'
const { data, error } = await supabase.from('tb_valores').select('*').limit(1)
if (error) console.error(error)
else fs.writeFileSync('c:\\v0-dashboard-cat\\.agent\\scripts\\cols.json', JSON.stringify(Object.keys(data[0]), null, 2))
