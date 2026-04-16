"""
importar.py — Limpa e reimporta dados dos Excels da pasta import/ para o Supabase.

Uso:
    python import/importar.py

Requerimentos:
    pip install pandas openpyxl supabase

Configuração:
    Defina as variáveis de ambiente abaixo ou crie um arquivo .env.local na raiz com:
        NEXT_PUBLIC_SUPABASE_URL=...
        SUPABASE_SERVICE_ROLE_KEY=...
"""

import os
import math
import pandas as pd
from supabase import create_client
from pathlib import Path

# ─── Configuração ────────────────────────────────────────────────────────────

# Carrega .env.local se existir
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
    print("ERRO: Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não encontradas.")
    print("      Configure o arquivo .env.local na raiz do projeto.")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

IMPORT_DIR = Path(__file__).parent

# Mapeamento: nome_do_arquivo.xlsx → nome_da_tabela_no_supabase
# Também define renomeações de colunas quando o Excel difere do banco
TABELAS = {
    "tb_processo.xlsx": {
        "tabela": "tb_processo",
        "renomear": {
            "numero_ processo_apenso": "numero_processo_apenso",
            "testemunha reclamante": "testemunha_reclamante",
        },
    },
    "tb_pedidos_inicial.xlsx": {
        "tabela": "tb_pedidos_inicial",
        "renomear": {
            "periculosidade ": "periculosidade",
            "honorarios_adv": "honorarios_advocaticios",
        },
    },
    "tb_pedidos_sentenca.xlsx": {
        "tabela": "tb_pedidos_sentenca",
        "renomear": {
            "periculosidade ": "periculosidade",
            "do_psiquica": "do_mental",
            "do_medica_geral": "do_ergonomica",
            "ergonomia": "do_ergonomica",
            "obrigacoes_fazer": "obrigacao",
            "honorarios_adv": "honorarios_advocaticios",
        },
    },
    "tb_laudo.xlsx": {
        "tabela": "tb_laudo",
        "renomear": {},
    },
    "tb_valores.xlsx": {
        "tabela": "tb_valores",
        "renomear": {
            "deposito_judicial ": "deposito_judicial",
        },
    },
}

BATCH_SIZE = 100  # linhas por inserção (limite seguro da API do Supabase)


# ─── Funções auxiliares ───────────────────────────────────────────────────────

def limpar_valor(v):
    """Converte NaN, NaT e tipos numpy para tipos Python nativos."""
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    # Converte tipos numpy para Python nativo
    if hasattr(v, "item"):
        return v.item()
    # Converte Timestamp pandas para string ISO
    if hasattr(v, "isoformat"):
        return v.isoformat()
    return v


def linha_para_dict(row: pd.Series) -> dict:
    return {k: limpar_valor(v) for k, v in row.items()}


def importar_arquivo(xlsx_path: Path, config: dict):
    tabela = config["tabela"]
    renomear = config.get("renomear", {})

    print(f"\n{'─'*60}")
    print(f"  Arquivo : {xlsx_path.name}")
    print(f"  Tabela  : {tabela}")

    # Lê o Excel
    df = pd.read_excel(xlsx_path, dtype=str)  # tudo como string primeiro

    # Remove colunas sem nome (colunas extras no Excel)
    df = df.loc[:, df.columns.notna()]
    df.columns = [str(c).strip() for c in df.columns]

    # Renomeia colunas conforme mapeamento
    if renomear:
        df = df.rename(columns=renomear)

    # Remove linhas completamente vazias
    df = df.dropna(how="all")

    # Converte strings "nan" para None
    df = df.where(df.notna(), None)
    df = df.replace("nan", None)
    df = df.replace("", None)

    total = len(df)
    print(f"  Linhas  : {total}")
    print(f"  Colunas : {list(df.columns)}")

    # ── Limpa a tabela ────────────────────────────────────────────────────────
    print(f"  Limpando tabela {tabela}...", end=" ")
    resp = supabase.table(tabela).delete().neq("numero_processo", "__NUNCA_EXISTE__").execute()
    print("OK")

    # ── Insere em batches ─────────────────────────────────────────────────────
    erros = 0
    inseridos = 0
    num_batches = math.ceil(total / BATCH_SIZE)

    for i in range(num_batches):
        batch_df = df.iloc[i * BATCH_SIZE : (i + 1) * BATCH_SIZE]
        registros = [linha_para_dict(row) for _, row in batch_df.iterrows()]

        try:
            supabase.table(tabela).insert(registros).execute()
            inseridos += len(registros)
            print(f"  Batch {i+1}/{num_batches} — {inseridos}/{total} inseridos", end="\r")
        except Exception as e:
            erros += len(registros)
            print(f"\n  ERRO no batch {i+1}: {e}")

    print(f"  Inseridos: {inseridos}/{total} {'✓' if erros == 0 else f'({erros} erros)'}     ")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  IMPORTAÇÃO — Dashboard CAT")
    print("=" * 60)

    xlsx_files = sorted(IMPORT_DIR.glob("*.xlsx"))

    if not xlsx_files:
        print("Nenhum arquivo .xlsx encontrado na pasta import/")
        return

    for xlsx_path in xlsx_files:
        config = TABELAS.get(xlsx_path.name)
        if not config:
            print(f"\nAVISO: {xlsx_path.name} não tem configuração em TABELAS, pulando.")
            continue
        try:
            importar_arquivo(xlsx_path, config)
        except Exception as e:
            print(f"\nERRO ao processar {xlsx_path.name}: {e}")

    print(f"\n{'='*60}")
    print("  Importação concluída.")
    print("=" * 60)


if __name__ == "__main__":
    main()
