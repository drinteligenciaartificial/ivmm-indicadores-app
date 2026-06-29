import { KpiCard } from "@/components/KpiCard";
import { TrafficBadge } from "@/components/TrafficBadge";
import { AreaBarChart, TrafficPieChart } from "@/components/DashboardCharts";
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

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireFeature("dashboard");
  const params = await searchParams;
  const filters = {
    status: param(params, "status"),
    indicatorId: param(params, "indicatorId"),
    area: param(params, "area"),
    year: param(params, "year"),
    quarter: param(params, "quarter"),
    month: param(params, "month"),
    traffic: param(params, "traffic"),
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
  const results = indicators
    .map((indicator) => {
      const filteredResults = indicator.results.filter((result) => {
        if (filters.year && result.referenceDate.getUTCFullYear() !== Number(filters.year)) return false;
        if (filters.month && result.referenceDate.getUTCMonth() + 1 !== Number(filters.month)) return false;
        if (filters.quarter) {
          const quarter = Math.floor((result.referenceDate.getUTCMonth() + 3) / 3);
          if (quarter !== Number(filters.quarter)) return false;
        }
        if (filters.traffic && result.trafficLight !== filters.traffic) return false;
        return true;
      });
      return { ...indicator, last: filteredResults[0] };
    })
    .filter((indicator) => indicator.last);
  const total = results.length;
  const avg = results.length ? results.reduce((sum, item) => sum + item.last.achievement, 0) / results.length : 0;
  const green = results.filter((item) => item.last.trafficLight === "VERDE").length;
  const red = results.filter((item) => item.last.trafficLight === "VERMELHO").length;
  const byArea = Object.values(results.reduce((acc: Record<string, { area: string; total: number; count: number }>, item) => {
    if (!acc[item.area]) acc[item.area] = { area: formatArea(item.area), total: 0, count: 0 };
    acc[item.area].total += item.last.achievement;
    acc[item.area].count++;
    return acc;
  }, {})).map((area) => ({ area: area.area, media: Number((area.total / area.count).toFixed(1)) }));
  const traffic = ["VERDE", "AMARELO", "VERMELHO"].map((name) => ({ name, value: results.filter((item) => item.last.trafficLight === name).length }));
  const exportData = {
    metrics: [
      { label: "Indicadores filtrados", value: total },
      { label: "Atingimento médio", value: `${avg.toFixed(1)}%` },
      { label: "Indicadores verdes", value: green },
      { label: "Indicadores críticos", value: red },
    ],
    byArea,
    traffic,
    rows: results.map((item) => ({
      code: item.code,
      name: item.name,
      area: formatArea(item.area),
      actual: `${item.last.actualValue} ${item.unit}`,
      target: `${item.last.targetValue} ${item.unit}`,
      achievement: `${item.last.achievement.toFixed(1)}%`,
      trafficLight: item.last.trafficLight,
    })),
  };
  return (
    <>
      <section className="page-header">
        <div>
          <h2>Dashboard Executivo</h2>
          <p>Selecione indicadores e filtros para gerar automaticamente uma visão executiva exportável.</p>
        </div>
        <DashboardImageExport data={exportData} />
      </section>
      <form className="card filters">
        <label>Status<select className="select" name="status" defaultValue={filters.status}><option value="">Todos</option>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Indicador<select className="select" name="indicatorId" defaultValue={filters.indicatorId}><option value="">Todos</option>{allIndicators.map((indicator) => <option key={indicator.id} value={indicator.id}>{indicator.code} - {indicator.name}</option>)}</select></label>
        <label>Área<select className="select" name="area" defaultValue={filters.area}><option value="">Todas</option>{areas.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Ano<input className="input" name="year" type="number" defaultValue={filters.year} placeholder="2026" /></label>
        <label>Trimestre<input className="input" name="quarter" type="number" min="1" max="4" defaultValue={filters.quarter} /></label>
        <label>Mês<input className="input" name="month" type="number" min="1" max="12" defaultValue={filters.month} /></label>
        <label>Semáforo<select className="select" name="traffic" defaultValue={filters.traffic}><option value="">Todos</option>{trafficLights.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <div className="filter-actions">
          <button className="button" type="submit"><LayoutDashboard aria-hidden="true" size={18} />Gerar dashboard</button>
        </div>
      </form>
      <section id="dashboard-export-area" className="dashboard-export-area" style={{ marginTop: 18 }}>
        <section className="grid grid-4">
          <KpiCard label="Indicadores filtrados" value={total} />
          <KpiCard label="Atingimento médio" value={`${avg.toFixed(1)}%`} />
          <KpiCard label="Indicadores verdes" value={green} />
          <KpiCard label="Indicadores críticos" value={red} />
        </section>
        <section className="grid grid-2" style={{ marginTop: 18 }}>
          <div className="card"><h3>Atingimento por área</h3><AreaBarChart data={byArea} /></div>
          <div className="card"><h3>Semáforo geral</h3><TrafficPieChart data={traffic} /></div>
        </section>
        <section className="card" style={{ marginTop: 18 }}>
          <h3>Indicadores filtrados</h3>
          <table className="table">
            <thead><tr><th>Código</th><th>Indicador</th><th>Área</th><th>Resultado</th><th>Meta</th><th>Atingimento</th><th>Status</th></tr></thead>
            <tbody>{results.map((item) => <tr key={item.id}><td>{item.code}</td><td>{item.name}</td><td>{formatArea(item.area)}</td><td>{item.last.actualValue} {item.unit}</td><td>{item.last.targetValue} {item.unit}</td><td>{item.last.achievement.toFixed(1)}%</td><td><TrafficBadge value={item.last.trafficLight} /></td></tr>)}</tbody>
          </table>
        </section>
      </section>
    </>
  );
}
