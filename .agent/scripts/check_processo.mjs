import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: 'c:\\v0-dashboard-cat\\.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data, error } = await supabase.from('tb_processo').select('*').limit(1)
if (error) console.error(error)
else console.log("Cols:", Object.keys(data[0]).join(', '))
