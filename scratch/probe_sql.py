import os
from supabase import create_client
from pathlib import Path
import ssl

env_path = Path("c:/v0-dashboard-cat/.env.local")
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

ssl._create_default_https_context = ssl._create_unverified_context
os.environ["HTTPX_SSL_VERIFY"] = "0"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

funcs = ["exec_sql", "run_sql", "query", "sql", "execute_sql"]
for f in funcs:
    try:
        res = supabase.rpc(f, {"sql": "SELECT 1"}).execute()
        print(f"Sucesso com {f}:", res.data)
        break
    except Exception as e:
        print(f"Falha com {f}:", e)
