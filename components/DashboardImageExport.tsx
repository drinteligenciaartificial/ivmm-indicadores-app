"use client";

import { Download } from "lucide-react";

type ExportRow = {
  reference: string;
  code: string;
  name: string;
  area: string;
  actual: string;
  target: string;
  achievement: string;
  trafficLight: string;
};

type DashboardExportData = {
  chartMode: string;
  metrics: { label: string; value: string | number }[];
  byArea: { area: string; media: number }[];
  traffic: { name: string; value: number }[];
  periodSeries: { period: string; value: number }[];
  lineValueLabel: string;
  lineTargetLabel: string;
  rows: ExportRow[];
};

const colors: Record<string, string> = {
  VERDE: "#237a4b",
  AMARELO: "#9b6b0b",
  VERMELHO: "#b4313c",
};
const chartColors = ["#1b2551", "#a4866e", "#237a4b", "#b4313c", "#4f6d9b", "#9b6b0b", "#6b4e71", "#2f7f7b"];

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius = 8) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, max = 42) {
  const trimmed = value.length > max ? `${value.slice(0, max - 1)}...` : value;
  ctx.fillText(trimmed, x, y);
}

function drawDashboard(data: DashboardExportData, format: "png" | "jpeg") {
  const width = 1400;
  const tableHeight = Math.max(260, data.rows.slice(0, 14).length * 34 + 90);
  const showLine = data.chartMode === "COMPLETO" || data.chartMode === "LINHA";
  const showBar = data.chartMode === "COMPLETO" || data.chartMode === "BARRAS";
  const showPie = data.chartMode === "COMPLETO" || data.chartMode === "PIZZA";
  const chartRows = (showLine ? 1 : 0) + (showBar || showPie ? 1 : 0);
  const tableY = 306 + chartRows * 390;
  const height = tableY + tableHeight + 30;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#f7f6f4";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#1b2551";
  roundedRect(ctx, 36, 30, width - 72, 96, 8);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 30px Arial";
  ctx.fillText("IVMM - Dashboard Executivo", 64, 72);
  ctx.font = "16px Arial";
  ctx.fillText("Painel filtrado por indicadores, área, tempo, status e semáforo.", 64, 102);

  const cardWidth = 310;
  data.metrics.forEach((metric, index) => {
    const x = 36 + index * (cardWidth + 20);
    roundedRect(ctx, x, 156, cardWidth, 120, 8);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#ded8d0";
    ctx.stroke();
    ctx.fillStyle = "#696d7b";
    ctx.font = "15px Arial";
    ctx.fillText(metric.label, x + 22, 196);
    ctx.fillStyle = "#1b2551";
    ctx.font = "700 34px Arial";
    ctx.fillText(String(metric.value), x + 22, 242);
  });

  let chartY = 306;
  if (showLine) {
    roundedRect(ctx, 36, chartY, width - 72, 360, 8);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#ded8d0";
    ctx.stroke();
    ctx.fillStyle = "#1b2551";
    ctx.font = "700 20px Arial";
    ctx.fillText("Evolução no período", 64, chartY + 40);
    const values = data.periodSeries.map((item) => item.value);
    const maxLine = Math.max(1, ...values);
    const plotX = 90;
    const plotY = chartY + 76;
    const plotWidth = width - 180;
    const plotHeight = 220;
    ctx.strokeStyle = "#e2d9cb";
    ctx.beginPath();
    ctx.moveTo(plotX, plotY + plotHeight);
    ctx.lineTo(plotX + plotWidth, plotY + plotHeight);
    ctx.stroke();
    const drawLine = (color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      data.periodSeries.forEach((item, index) => {
        const x = plotX + (data.periodSeries.length > 1 ? index * plotWidth / (data.periodSeries.length - 1) : plotWidth / 2);
        const y = plotY + plotHeight - (item.value / maxLine) * plotHeight;
        if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };
    drawLine("#1b2551");
    ctx.lineWidth = 1;
    ctx.font = "13px Arial";
    ctx.fillStyle = "#696d7b";
    data.periodSeries.forEach((item, index) => {
      const x = plotX + (data.periodSeries.length > 1 ? index * plotWidth / (data.periodSeries.length - 1) : plotWidth / 2);
      ctx.fillText(item.period, x - 22, plotY + plotHeight + 24);
    });
    ctx.fillStyle = "#1b2551";
    ctx.fillText(data.lineValueLabel, 100, chartY + 330);
    chartY += 390;
  }

  if (showBar) {
  roundedRect(ctx, 36, chartY, showPie ? 640 : width - 72, 360, 8);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#ded8d0";
  ctx.stroke();
  ctx.fillStyle = "#1b2551";
  ctx.font = "700 20px Arial";
  ctx.fillText("Resultados médios por área", 64, chartY + 40);
  const max = Math.max(1, ...data.byArea.map((item) => item.media));
  data.byArea.forEach((item, index) => {
    const y = chartY + 84 + index * 42;
    const barWidth = Math.round((item.media / max) * 420);
    ctx.fillStyle = "#696d7b";
    ctx.font = "14px Arial";
    text(ctx, item.area, 64, y + 16, 20);
    ctx.fillStyle = "#e2d9cb";
    ctx.fillRect(210, y, 420, 22);
    ctx.fillStyle = "#1b2551";
    ctx.fillRect(210, y, barWidth, 22);
    ctx.fillStyle = "#22283f";
    ctx.fillText(item.media.toFixed(1), 640, y + 16);
  });
  }

  if (showPie) {
  const pieX = showBar ? 706 : 36;
  roundedRect(ctx, pieX, chartY, showBar ? 658 : width - 72, 360, 8);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#ded8d0";
  ctx.stroke();
  ctx.fillStyle = "#1b2551";
  ctx.font = "700 20px Arial";
  ctx.fillText("Distribuição dos resultados", pieX + 28, chartY + 40);
  const totalTraffic = data.traffic.reduce((sum, item) => sum + item.value, 0) || 1;
  let start = -Math.PI / 2;
  data.traffic.forEach((item, index) => {
    const angle = (item.value / totalTraffic) * Math.PI * 2;
    ctx.beginPath();
    const centerX = showBar ? 910 : 520;
    const centerY = chartY + 184;
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, 120, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = chartColors[index % chartColors.length];
    ctx.fill();
    start += angle;
  });
  data.traffic.forEach((item, index) => {
    const y = chartY + 118 + index * 40;
    ctx.fillStyle = chartColors[index % chartColors.length];
    ctx.fillRect(showBar ? 1080 : 760, y, 22, 22);
    ctx.fillStyle = "#22283f";
    ctx.font = "15px Arial";
    ctx.fillText(`${item.name}: ${item.value}`, showBar ? 1116 : 796, y + 17);
  });
  }

  roundedRect(ctx, 36, tableY, width - 72, tableHeight, 8);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#ded8d0";
  ctx.stroke();
  ctx.fillStyle = "#1b2551";
  ctx.font = "700 20px Arial";
  ctx.fillText("Resultados do período", 64, tableY + 42);
  const headers = ["Referência", "Código", "Indicador", "Área", "Resultado", "Meta", "Ating.", "Status"];
  const x = [64, 150, 230, 570, 750, 880, 990, 1100];
  ctx.fillStyle = "#e2d9cb";
  ctx.fillRect(64, tableY + 64, width - 128, 34);
  ctx.fillStyle = "#1b2551";
  ctx.font = "700 13px Arial";
  headers.forEach((header, index) => ctx.fillText(header, x[index], tableY + 86));
  ctx.font = "13px Arial";
  data.rows.slice(0, 14).forEach((row, index) => {
    const y = tableY + 130 + index * 34;
    ctx.fillStyle = index % 2 === 0 ? "#ffffff" : "#f7f6f4";
    ctx.fillRect(64, y - 24, width - 128, 34);
    ctx.fillStyle = "#22283f";
    text(ctx, row.reference, x[0], y, 10);
    text(ctx, row.code, x[1], y);
    text(ctx, row.name, x[2], y, 38);
    text(ctx, row.area, x[3], y, 18);
    text(ctx, row.actual, x[4], y, 14);
    text(ctx, row.target, x[5], y, 14);
    text(ctx, row.achievement, x[6], y, 12);
    ctx.fillStyle = colors[row.trafficLight] ?? "#696d7b";
    text(ctx, row.trafficLight, x[7], y, 12);
  });

  const link = document.createElement("a");
  link.download = `dashboard-ivmm.${format === "png" ? "png" : "jpg"}`;
  link.href = canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.95);
  link.click();
}

export function DashboardImageExport({ data }: { data: DashboardExportData }) {
  return (
    <div className="inline-actions">
      <button className="button secondary" type="button" onClick={() => drawDashboard(data, "png")}><Download aria-hidden="true" size={17} />Exportar PNG</button>
      <button className="button secondary" type="button" onClick={() => drawDashboard(data, "jpeg")}><Download aria-hidden="true" size={17} />Exportar JPG</button>
    </div>
  );
}
