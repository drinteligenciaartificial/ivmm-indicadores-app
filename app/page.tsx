import { KpiCard } from "@/components/KpiCard";
import { TrafficBadge } from "@/components/TrafficBadge";
import { AreaBarChart, PeriodLineChart, TrafficPieChart } from "@/components/DashboardCharts";
import { DashboardImageExport } from "@/components/DashboardImageExport";
import { requireFeature } from "@/lib/auth";
import { areas, statuses, trafficLights } from "@/lib/constants";
import { formatArea } from "@/lib/kpi";
import { prisma } from "@/lib/prisma";
import { LayoutDashboard } from "lucide-react";

function param(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value || "";
}

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function periodLabel(period: string) {
  const [year, month] = period.split("-");
  return `${month}/${year}`;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireFeature("dashboard");
  const params = await searchParams;
  const filters = {
    status: param(params, "status"),
    indicatorId: param(params, "indicatorId"),
    area: param(params, "area"),
    periodStart: param(params, "periodStart"),
    periodEnd: param(params, "periodEnd"),
    traffic: param(params, "traffic"),
    chartMode: param(params, "chartMode") || "COMPLETO",
  };
  const allIndicators = await prisma.indicator.findMany({ orderBy: { code: "asc" }, select: { id: true, code: true, name: true } });
  const indicators = await prisma.indicator.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.indicatorId ? { id: filters.indicatorId } : {}),
      ...(filters.area ? { area: filters.area } : {}),
    },
    orderBy: { code: "asc" },
    include: { results: { orderBy: { referenceDate: "desc" } } },
  });

  const records = indicators.flatMap((indicator) => indicator.results
    .filter((result) => {
      const period = monthKey(result.referenceDate);
      if (filters.periodStart && period < filters.periodStart) return false;
      if (filters.periodEnd && period > filters.periodEnd) return false;
      if (filters.traffic && result.trafficLight !== filters.traffic) return false;
      return true;
    })
    .map((result) => ({ indicator, result })));
  const latestByIndicator = [...new Map(records.map((record) => [record.indicator.id, record])).values()];
  const avg = records.length ? records.reduce((sum, item) => sum + item.result.achievement, 0) / records.length : 0;
  const critical = records.filter((item) => item.result.trafficLight === "VERMELHO").length;

  const byArea = Object.values(records.reduce((acc: Record<string, { area: string; total: number; count: number }>, item) => {
    if (!acc[item.indicator.area]) acc[item.indicator.area] = { area: formatArea(item.indicator.area), total: 0, count: 0 };
    acc[item.indicator.area].total += item.result.achievement;
    acc[item.indicator.area].count += 1;
    return acc;
  }, {})).map((area) => ({ area: area.area, media: Number((area.total / area.count).toFixed(1)) }));
  const traffic = ["VERDE", "AMARELO", "VERMELHO"].map((name) => ({
    name,
    value: records.filter((item) => item.result.trafficLight === name).length,
  }));

  const grouped = records.reduce((acc: Record<string, { actual: number; target: number; achievement: number; count: number }>, item) => {
    const period = monthKey(item.result.referenceDate);
    if (!acc[period]) acc[period] = { actual: 0, target: 0, achievement: 0, count: 0 };
    acc[period].actual += item.result.actualValue;
    acc[period].target += item.result.targetValue;
    acc[period].achievement += item.result.achievement;
    acc[period].count += 1;
    return acc;
  }, {});
  const singleIndicator = indicators.length === 1;
  const periodSeries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([period, values]) => ({
    period: periodLabel(period),
    value: Number((singleIndicator ? values.actual / values.count : values.achievement / values.count).toFixed(2)),
    target: Number((singleIndicator ? values.target / values.count : 100).toFixed(2)),
  }));
  const lineValueLabel = singleIndicator ? `Resultado (${indicators[0].unit})` : "Atingimento médio (%)";
  const lineTargetLabel = singleIndicator ? `Meta (${indicators[0].unit})` : "Referência (100%)";
  const showLine = filters.chartMode === "COMPLETO" || filters.chartMode === "LINHA";
  const showPie = filters.chartMode === "COMPLETO" || filters.chartMode === "PIZZA";
  const showBar = filters.chartMode === "COMPLETO" || filters.chartMode === "BARRAS";

  const sortedRecords = [...records].sort((a, b) => b.result.referenceDate.getTime() - a.result.referenceDate.getTime());
  const exportData = {
    chartMode: filters.chartMode,
    metrics: [
      { label: "Indicadores no período", value: latestByIndicator.length },
      { label: "Competências analisadas", value: records.length },
      { label: "Atingimento médio", value: `${avg.toFixed(1)}%` },
      { label: "Resultados críticos", value: critical },
    ],
    byArea,
    traffic,
    periodSeries,
    lineValueLabel,
    lineTargetLabel,
    rows: sortedRecords.map(({ indicator, result }) => ({
      reference: monthKey(result.referenceDate),
      code: indicator.code,
      name: indicator.name,
      area: formatArea(indicator.area),
      actual: `${result.actualValue} ${indicator.unit}`,
      target: `${result.targetValue} ${indicator.unit}`,
      achievement: `${result.achievement.toFixed(1)}%`,
      trafficLight: result.trafficLight,
    })),
  };

  return (
    <>
      <section className="page-header">
        <div><h2>Dashboard Executivo</h2><p>Analise indicadores por período e escolha a apresentação mais adequada.</p></div>
        <DashboardImageExport data={exportData} />
      </section>
      <form className="card filters dashboard-filters">
        <label>Status<select className="select" name="status" defaultValue={filters.status}><option value="">Todos</option>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Indicador<select className="select" name="indicatorId" defaultValue={filters.indicatorId}><option value="">Todos</option>{allIndicators.map((indicator) => <option key={indicator.id} value={indicator.id}>{indicator.code} - {indicator.name}</option>)}</select></label>
        <label>Área<select className="select" name="area" defaultValue={filters.area}><option value="">Todas</option>{areas.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Período inicial<input className="input" name="periodStart" type="month" defaultValue={filters.periodStart} /></label>
        <label>Período final<input className="input" name="periodEnd" type="month" defaultValue={filters.periodEnd} /></label>
        <label>Semáforo<select className="select" name="traffic" defaultValue={filters.traffic}><option value="">Todos</option>{trafficLights.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Apresentação<select className="select" name="chartMode" defaultValue={filters.chartMode}><option value="COMPLETO">Painel completo</option><option value="LINHA">Evolução em linha</option><option value="PIZZA">Distribuição em pizza</option><option value="BARRAS">Comparação por área</option></select></label>
        <div className="filter-actions"><button className="button" type="submit"><LayoutDashboard aria-hidden="true" size={18} />Gerar dashboard</button></div>
      </form>
      <section id="dashboard-export-area" className="dashboard-export-area" style={{ marginTop: 18 }}>
        <section className="grid grid-4">
          <KpiCard label="Indicadores no período" value={latestByIndicator.length} />
          <KpiCard label="Competências analisadas" value={records.length} />
          <KpiCard label="Atingimento médio" value={`${avg.toFixed(1)}%`} />
          <KpiCard label="Resultados críticos" value={critical} />
        </section>
        {showLine && <section className="card" style={{ marginTop: 18 }}><h3>Evolução no período</h3><PeriodLineChart data={periodSeries} valueLabel={lineValueLabel} targetLabel={lineTargetLabel} /></section>}
        {(showBar || showPie) && <section className={`grid ${showBar && showPie ? "grid-2" : ""}`} style={{ marginTop: 18 }}>
          {showBar && <div className="card"><h3>Atingimento por área</h3><AreaBarChart data={byArea} /></div>}
          {showPie && <div className="card"><h3>Distribuição dos resultados</h3><TrafficPieChart data={traffic} /></div>}
        </section>}
        <section className="card" style={{ marginTop: 18 }}>
          <h3>Resultados do período</h3>
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Referência</th><th>Código</th><th>Indicador</th><th>Área</th><th>Resultado</th><th>Meta</th><th>Atingimento</th><th>Status</th></tr></thead>
            <tbody>{sortedRecords.map(({ indicator, result }) => <tr key={result.id}><td>{monthKey(result.referenceDate)}</td><td>{indicator.code}</td><td>{indicator.name}</td><td>{formatArea(indicator.area)}</td><td>{result.actualValue} {indicator.unit}</td><td>{result.targetValue} {indicator.unit}</td><td>{result.achievement.toFixed(1)}%</td><td><TrafficBadge value={result.trafficLight} /></td></tr>)}</tbody>
          </table></div>
        </section>
      </section>
    </>
  );
}
