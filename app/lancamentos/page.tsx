import Link from "next/link";
import { createResult, importMonthlyResults } from "@/app/actions";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResultForm } from "../resultados/novo/page";

export default async function MonthlyLaunchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireFeature("lancamentos");
  const params = await searchParams;
  const indicators = await prisma.indicator.findMany({ where: { status: "ATIVO" }, orderBy: { code: "asc" }, include: { goals: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 1 } } });
  const manualIndicator = params.indicatorId || indicators[0]?.id || "";
  const modelIndicator = params.modelIndicatorId || indicators[0]?.id || "";
  return (
    <>
      <section className="page-header">
        <div>
          <h2>Lançamento Mensal de Resultados</h2>
          <p>A coleta de dados é responsabilidade da Coordenação Administrativa. Você pode lançar manualmente ou importar uma planilha modelo.</p>
        </div>
      </section>
      {params.importados && <div className="notice success"><strong>{params.importados} resultado(s) processado(s).</strong> {params.novos} novo(s), {params.atualizados} atualizado(s), {params.duplicados ?? 0} duplicado(s) removido(s) e {params.ignorados} ignorado(s).{params.inicio && params.fim ? ` Período: ${params.inicio} a ${params.fim}.` : ""}</div>}
      {params.detalhes && <div className="notice error"><strong>Linhas não importadas:</strong> {params.detalhes}</div>}
      {params.erro === "arquivo" && <p style={{ color: "var(--red)" }}>Selecione um arquivo CSV para importar.</p>}
      <section className="grid grid-2">
        <div>
          <ResultForm action={createResult} indicators={indicators} defaultIndicatorId={manualIndicator} />
        </div>
        <div className="card form">
          <h3>Importação por planilha</h3>
          <p className="muted">Escolha o indicador apenas para gerar o modelo. Na importação, cada linha será vinculada exclusivamente pelo codigo_indicador informado no arquivo.</p>
          <form className="form">
            <label>Indicador para modelo
              <select className="select" name="modelIndicatorId" defaultValue={modelIndicator}>
                {indicators.map((indicator) => <option key={indicator.id} value={indicator.id}>{indicator.code} - {indicator.name}</option>)}
              </select>
            </label>
            <button className="button secondary" type="submit">Selecionar indicador</button>
          </form>
          <Link className="button" href={`/lancamentos/modelo?indicatorId=${modelIndicator}`}>Exportar modelo de planilha</Link>
          <form action={importMonthlyResults} className="form">
            <label>Arquivo preenchido<input className="input" name="file" type="file" accept=".csv,text/csv" required /></label>
            <button className="button" type="submit">Solicitar importação de dados</button>
          </form>
          <div className="import-help">
            <h3>Colunas esperadas</h3>
            <p className="muted">Formato por linha: codigo_indicador, unidade, ano, mes, resultado, analise, plano_acao.</p>
            <p className="muted">Também são aceitas competência/data (ex.: 03/2026) ou colunas mensais (ex.: jan_2026, fev_2026).</p>
          </div>
        </div>
      </section>
    </>
  );
}
