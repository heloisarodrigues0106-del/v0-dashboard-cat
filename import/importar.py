# -*- coding: utf-8 -*-
"""
importar.py — Limpa e reimporta dados dos Excels da pasta import/ para o Supabase.

Uso:
    python import/importar.py

Requerimentos:
    pip install pandas openpyxl supabase
"""

import os
import sys
import math
import ssl
import pandas as pd
from supabase import create_client
from pathlib import Path

# Força UTF-8 no terminal Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

# ─── Configuração ────────────────────────────────────────────────────────────

env_path = Path(__file__).parent.parent / ".env.local"
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERRO: Variaveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nao encontradas.")
    exit(1)

# Desabilita verificacao SSL (necessario para este ambiente)
ssl._create_default_https_context = ssl._create_unverified_context
os.environ["HTTPX_SSL_VERIFY"] = "0"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

IMPORT_DIR = Path(__file__).parent
BATCH_SIZE = 100

# ─── Colunas por tipo ────────────────────────────────────────────────────────

# Colunas que o banco espera como boolean
BOOL_COLS = {
    "tb_pedidos_inicial": [
        "do_at", "reintegracao", "periculosidade", "insalubridade",
        "rescisao_indireta", "danos_morais", "danos_materiais", "horas_extras",
        "intrajornada", "horas_itinere", "acumulo_funcao", "equip_salarial",
        "rec_vinculo", "honorarios_adv", "estabilidade",
    ],
    "tb_pedidos_sentenca": [
        "reintegracao", "periculosidade", "insalubridade", "danos_morais",
        "danos_materiais", "horas_extras", "intrajornada", "horas_itinere",
        "acumulo_funcao", "equip_salarial", "rec_vinculo", "honorarios_adv",
        "rescisao_indireta", "acidente_trabalho", "estabilidade",
        # do_psiquica, do_medica_geral, incapacidade são text ("CAUSA","CONCAUSA","SEM NEXO","INCAPAZ","CAPAZ")
    ],
    "tb_pedidos_acordao": [
        "reintegracao", "periculosidade", "insalubridade", "danos_morais",
        "danos_materiais", "horas_extras", "intrajornada", "horas_itinere",
        "acumulo_funcao", "equip_salarial", "rec_vinculo", "honorarios_adv",
        "rescisao_indireta", "acidente_trabalho", "estabilidade",
        # do_psiquica, do_medica_geral, incapacidade são text ("CAUSA","CONCAUSA","SEM NEXO","INCAPAZ","CAPAZ")
    ],
    # tb_laudo: do_psiquica e do_medico_geral são text ("CAUSA","CONCAUSA","SEM NEXO")
    # apenas acidente_trabalho, periculosidade e insalubridade são boolean
    "tb_laudo": [
        "acidente_trabalho", "periculosidade", "insalubridade",
    ],
    "tb_valores": ["apolice"],
}

NUMERIC_COLS = {
    "tb_processo": ["valor_causa", "valor_acordo", "honorario_pericia"],
    "tb_laudo": ["grau_psiquica", "grau_medico", "grau_insalubridade"],
    "tb_valores": [
        "deposito_recursal", "custas_processuais", "deposito_judicial",
        "provavel_principal_quarter_anterior", "provavel_correcao_quarter_anterior",
        "provavel_juros_quarter_anterior", "provavel_total_anterior",
        "provavel_principal_quarter_atual", "provavel_correcao_quarter_atual",
        "provavel_juros_quarter_atual", "provavel_total_atual",
        "possivel_principal_quarter_anterior", "possivel_correcao_quarter_anterior",
        "possivel_juros_quarter_anterior", "possivel_total_anterior",
        "possivel_principal_quarter_atual", "possivel_correcao_quarter_atual",
        "possivel_juros_quarter_atual", "possivel_total_atual",
        "remoto_principal_quarter_anterior", "remoto_correcao_quarter_anterior",
        "remoto_juros_quarter_anterior", "remoto_total_anterior",
        "remoto_principal_quarter_atual", "remoto_correcao_quarter_atual",
        "remoto_juros_quarter_atual", "remoto_total_atual",
        "valor_pago_reclamante",
    ],
}

# Colunas que o banco espera como date
DATE_COLS = {
    "tb_processo": [
        "data_ajuizamento", "data_arquivamento",
        "data_admissao_reclamante", "data_demissao_reclamante",
    ],
}

# ─── Mapeamento de arquivos ───────────────────────────────────────────────────

TABELAS = {
    "tb_processo.xlsx":       {"tabela": "tb_processo"},
    "tb_pedidos_inicial.xlsx": {"tabela": "tb_pedidos_inicial"},
    "tb_pedidos_sentenca.xlsx": {"tabela": "tb_pedidos_sentenca"},
    "tb_pedidos_acordao.xlsx": {"tabela": "tb_pedidos_acordao"},
    "tb_laudo.xlsx":           {"tabela": "tb_laudo"},
    "tb_valores.xlsx":         {"tabela": "tb_valores"},
}

# ─── Conversores ─────────────────────────────────────────────────────────────

BOOL_TRUTHY  = {"true", "t", "yes", "sim", "1", "x"}
BOOL_FALSY   = {"false", "f", "no", "nao", "não", "0", "flase", "falser"}

def to_bool(v):
    if v is None: return None
    s = str(v).strip().lower()
    if s in ("", "nan", "none"): return None
    if s in BOOL_TRUTHY: return True
    if s in BOOL_FALSY:  return False
    return None  # valores como "INCAPAZ", "CAUSA" — não são boolean, viram None

def to_numeric(v):
    if v is None: return None
    # Rejeita datetime que pandas cria ao ler células de data em colunas numéricas
    if hasattr(v, "year") and hasattr(v, "month"): return None
    s = str(v).strip().replace("\xa0", "").replace(" ", "")
    if s in ("", "nan", "none", "true", "false"): return None
    s = s.replace(",", ".")
    # Formato com ponto de milhar + ponto decimal: ex "50.000.00" ou "12.665.14"
    partes = s.split(".")
    if len(partes) == 3:
        s = partes[0] + partes[1] + "." + partes[2]
    try:
        return float(s)
    except ValueError:
        return None

def to_date(v):
    if v is None: return None
    # NaT do pandas
    if pd.isnull(v) if not isinstance(v, str) else False: return None
    # Timestamp do pandas — converte direto
    if hasattr(v, 'date') and hasattr(v, 'year'):
        try:
            return v.date().isoformat()
        except Exception:
            return None
    s = str(v).strip()
    if s in ("", "nan", "none", "nat", "NaT"): return None
    # Número serial do Excel (ex: 45231)
    if s.isdigit():
        try:
            dt = pd.to_datetime("1899-12-30") + pd.Timedelta(days=int(s))
            return dt.date().isoformat()
        except Exception:
            return None
    # Float serial (ex: 45231.0)
    try:
        f = float(s)
        dt = pd.to_datetime("1899-12-30") + pd.Timedelta(days=int(f))
        return dt.date().isoformat()
    except Exception:
        pass
    try:
        return pd.to_datetime(s).date().isoformat()
    except Exception:
        return None

def limpar_valor(v):
    if v is None: return None
    if isinstance(v, float) and math.isnan(v): return None
    if hasattr(v, "item"):
        val = v.item()
        if isinstance(val, float) and math.isnan(val): return None
        return val
    if hasattr(v, "isoformat"): return v.isoformat()
    s = str(v).strip().replace("\xa0", "").strip()
    if s in ("", "nan", "NaN", "None", "none"): return None
    return s

def sanitize_record(record: dict) -> dict:
    """Substitui NaN e strings vazias por None para manter consistência de chaves no batch."""
    clean = {}
    for k, v in record.items():
        if v is None:
            clean[k] = None
        elif isinstance(v, float) and math.isnan(v):
            clean[k] = None
        elif isinstance(v, str) and v.strip().lower() in ("nan", ""):
            clean[k] = None
        else:
            clean[k] = v
    return clean

# ─── Verificação de colunas ──────────────────────────────────────────────────

def verificar_colunas(xlsx_path: Path, config: dict) -> bool:
    """
    Compara colunas do Excel (após renomear) com colunas do banco.
    Imprime divergências e retorna False se houver alguma.
    """
    tabela   = config["tabela"]
    renomear = config.get("renomear", {})

    # Lê colunas do Excel
    df = pd.read_excel(xlsx_path, dtype=str, nrows=0)
    df = df.loc[:, df.columns.notna()]
    df.columns = [str(c).strip() for c in df.columns]
    df = df.rename(columns=renomear)
    df = df.loc[:, ~df.columns.duplicated()]
    cols_excel = set(df.columns) - {"id"}

    # Lê colunas do banco via information_schema (SQL direto)
    resp = supabase.rpc(
        "get_table_columns",
        {"p_table": tabela}
    ).execute()
    cols_banco = {r["column_name"] for r in resp.data} - {"id"}

    so_excel  = cols_excel - cols_banco   # existem no Excel, faltam no banco
    so_banco  = cols_banco - cols_excel   # existem no banco, faltam no Excel

    ok = not so_excel and not so_banco

    print(f"\n  [{tabela}]")
    if ok:
        print(f"    OK — {len(cols_excel)} colunas sincronizadas.")
    else:
        if so_excel:
            print(f"    FALTA NO BANCO  : {sorted(so_excel)}")
        if so_banco:
            print(f"    FALTA NO EXCEL  : {sorted(so_banco)}")

    return ok


def config_para(xlsx_path: Path) -> dict:
    """Retorna config do arquivo: usa TABELAS se existir, senão usa o nome do arquivo como tabela."""
    return TABELAS.get(xlsx_path.name, {"tabela": xlsx_path.stem})


def checar_todas() -> bool:
    """Roda verificacao em todos os arquivos. Retorna True se tudo OK."""
    print("=" * 60)
    print("  VERIFICACAO DE COLUNAS")
    print("=" * 60)

    xlsx_files = sorted(IMPORT_DIR.glob("*.xlsx"))
    tudo_ok = True

    for xlsx_path in xlsx_files:
        config = config_para(xlsx_path)
        try:
            ok = verificar_colunas(xlsx_path, config)
            if not ok:
                tudo_ok = False
        except Exception as e:
            print(f"\n  ERRO ao verificar {xlsx_path.name}: {e}")
            tudo_ok = False

    print(f"\n{'='*60}")
    if tudo_ok:
        print("  Todas as tabelas sincronizadas. Prosseguindo com importacao...")
    else:
        print("  DIVERGENCIAS encontradas. Corrija antes de importar.")
    print("=" * 60)

    return tudo_ok


# ─── Importação ──────────────────────────────────────────────────────────────

def importar_arquivo(xlsx_path: Path, config: dict):
    tabela   = config["tabela"]
    renomear = config.get("renomear", {})

    print(f"\n{'─'*60}")
    print(f"  Arquivo : {xlsx_path.name}")
    print(f"  Tabela  : {tabela}")

    df = pd.read_excel(xlsx_path, dtype=str)

    # Remove colunas sem nome
    df = df.loc[:, df.columns.notna()]
    df.columns = [str(c).strip() for c in df.columns]

    # Renomeia colunas
    if renomear:
        df = df.rename(columns=renomear)

    # Remove colunas que não existem no banco
    ignorar = config.get("ignorar", [])
    if ignorar:
        df = df.drop(columns=[c for c in ignorar if c in df.columns])

    # Remove colunas duplicadas (mantém a primeira)
    df = df.loc[:, ~df.columns.duplicated()]

    # Remove linhas completamente vazias
    df = df.dropna(how="all")

    total = len(df)
    print(f"  Linhas  : {total}")
    print(f"  Colunas : {list(df.columns)}")

    # Aplica conversões de tipo
    bool_cols    = BOOL_COLS.get(tabela, [])
    numeric_cols = NUMERIC_COLS.get(tabela, [])
    date_cols    = DATE_COLS.get(tabela, [])

    for col in df.columns:
        if col in bool_cols:
            df[col] = df[col].apply(to_bool)
        elif col in numeric_cols:
            df[col] = df[col].apply(to_numeric)
        elif col in date_cols:
            df[col] = df[col].apply(to_date)
        else:
            df[col] = df[col].apply(limpar_valor)

    # Remove coluna 'id' se existir (o banco gera automaticamente)
    if "id" in df.columns:
        df = df.drop(columns=["id"])

    # Limpa a tabela — usa a primeira coluna do df como âncora do filtro
    print(f"  Limpando tabela {tabela}...", end=" ", flush=True)
    try:
        primeira_col = df.columns[0]
        supabase.table(tabela).delete().neq(primeira_col, "__NUNCA_EXISTE__").execute()
        print("OK")
    except Exception as e:
        print(f"ERRO: {e}")
        return

    # Insere em batches
    erros = 0
    inseridos = 0
    num_batches = math.ceil(total / BATCH_SIZE)

    for i in range(num_batches):
        batch_df  = df.iloc[i * BATCH_SIZE : (i + 1) * BATCH_SIZE]
        registros = [
            sanitize_record(row.to_dict())
            for _, row in batch_df.iterrows()
        ]

        try:
            supabase.table(tabela).insert(registros).execute()
            inseridos += len(registros)
            print(f"  Batch {i+1}/{num_batches} — {inseridos}/{total} inseridos", end="\r", flush=True)
        except Exception as e:
            erros += len(registros)
            print(f"\n  ERRO no batch {i+1}: {e}")

    status = "✓" if erros == 0 else f"({erros} erros)"
    print(f"  Inseridos: {inseridos}/{total} {status}     ")

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    xlsx_files = sorted(IMPORT_DIR.glob("*.xlsx"))

    if not xlsx_files:
        print("Nenhum arquivo .xlsx encontrado na pasta import/")
        return

    tudo_ok = checar_todas()

    if not tudo_ok:
        resp = input("\nDeseja importar mesmo assim? (s/N): ").strip().lower()
        if resp != "s":
            print("Importacao cancelada.")
            return

    print("\n" + "=" * 60)
    print("  IMPORTACAO — Dashboard CAT")
    print("=" * 60)

    for xlsx_path in xlsx_files:
        config = config_para(xlsx_path)
        try:
            importar_arquivo(xlsx_path, config)
        except Exception as e:
            print(f"\nERRO ao processar {xlsx_path.name}: {e}")

    print(f"\n{'='*60}")
    print("  Importacao concluida.")
    print("=" * 60)


if __name__ == "__main__":
    main()
