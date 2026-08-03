export const provisionamentoConfig = {
  tabelaAtual: "tb_valores_q2_2026",
  tabelaAnterior: "tb_valores_q1_2026",
  quarterAnterior: "Q1 2026",
  quarterAtual: "Q2 2026",
};

export function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function isAcaoNova(justificativa: unknown, totalAnterior: number): boolean {
  if (justificativa === null || justificativa === undefined || justificativa === "") return false;
  const normalized = normalizeText(String(justificativa));
  const expressions = ["nova acao", "acao nova", "nova provisao", "novo processo"];
  const matchesExpr = expressions.some(expr => normalized.includes(expr));
  return matchesExpr && totalAnterior === 0;
}
