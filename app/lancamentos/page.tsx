import Link from "next/link";
import { createResult, importMonthlyResults } from "@/app/actions";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResultForm } from "../resultados/novo/page";

export default async function MonthlyLaunchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireFeature("lancamentos");
  const params = await searchParams;
  const indicators = await prisma.indicator.findMany({ where: { status: "ATIVO" }, orderBy: { code: "asc" }, include: { goals: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 1 } } });
  const selectedIndicator = params.indicatorId || indicators[0]?.id || "";
  return (
    <>
      <section className="page-header">
        <div>
          <h2>Lançamento Mensal de Resultados</h2>
          <p>A coleta de dados é responsabilidade da Coordenação Administrativa. Você pode lançar manualmente ou importar uma planilha modelo.</p>
        </div>
      </section>
      {params.importados && <div className="notice success"><strong>{params.importados} resultado(s) processado(s).</strong> {params.novos} novo(s), {params.atualizados} atualizado(s), {params.duplicados ?? 0} duplicado(s) removido(s) e {params.ignorados} ignorado(s).{params.inicio && params.fim ? ` Período: ${params.inicio} a ${params.fim}.` : ""}</div>}
      {params.erro === "arquivo" && <p style={{ color: "var(--red)" }}>Selecione um arquivo CSV para importar.</p>}
      <section className="grid grid-2">
        <div>
          <ResultForm action={createResult} indicators={indicators} defaultIndicatorId={selectedIndicator} />
        </div>
        <div className="card form">
          <h3>Importação por planilha</h3>
          <p className="muted">Escolha o indicador, baixe o modelo, preencha todos os meses necessários no Excel e importe o CSV. Cada linha ou coluna de competência será processada no seu próprio período.</p>
          <form className="form">
            <label>Indicador para modelo
              <select className="select" name="indicatorId" defaultValue={selectedIndicator}>
                {indicators.map((indicator) => <option key={indicator.id} value={indicator.id}>{indicator.code} - {indicator.name}</option>)}
              </select>
            </label>
            <button className="button secondary" type="submit">Selecionar indicador</button>
          </form>
          <Link className="button" href={`/lancamentos/modelo?indicatorId=${selectedIndicator}`}>Exportar modelo de planilha</Link>
          <form action={importMonthlyResults} className="form">
            <input name="fallbackCode" type="hidden" value={indicators.find((indicator) => indicator.id === selectedIndicator)?.code ?? ""} />
            <label>Arquivo preenchido<input className="input" name="file" type="file" accept=".csv,text/csv" required /></label>
            <button className="button" type="submit">Solicitar importação de dados</button>
          </form>
          <div className="import-help">
            <h3>Colunas esperadas</h3>
            <p className="muted">Formato por linha: codigo_indicador, ano, mes, resultado, meta, analise, plano_acao.</p>
            <p className="muted">Também são aceitas competência/data (ex.: 03/2026) ou colunas mensais (ex.: jan_2026, fev_2026).</p>
          </div>
        </div>
      </section>
    </>
  );
}
