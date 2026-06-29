"use client";

import { Download } from "lucide-react";

type ExportRow = {
  code: string;
  name: string;
  area: string;
  actual: string;
  target: string;
  achievement: string;
  trafficLight: string;
};

type DashboardExportData = {
  metrics: { label: string; value: string | number }[];
  byArea: { area: string; media: number }[];
  traffic: { name: string; value: number }[];
  rows: ExportRow[];
};

const colors: Record<string, string> = {
  VERDE: "#237a4b",
  AMARELO: "#9b6b0b",
  VERMELHO: "#b4313c",
};

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
  const height = 820 + tableHeight;
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

  roundedRect(ctx, 36, 306, 640, 360, 8);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#ded8d0";
  ctx.stroke();
  ctx.fillStyle = "#1b2551";
  ctx.font = "700 20px Arial";
  ctx.fillText("Atingimento por área", 64, 346);
  const max = Math.max(100, ...data.byArea.map((item) => item.media));
  data.byArea.forEach((item, index) => {
    const y = 390 + index * 42;
    const barWidth = Math.round((item.media / max) * 420);
    ctx.fillStyle = "#696d7b";
    ctx.font = "14px Arial";
    text(ctx, item.area, 64, y + 16, 20);
    ctx.fillStyle = "#e2d9cb";
    ctx.fillRect(210, y, 420, 22);
    ctx.fillStyle = "#1b2551";
    ctx.fillRect(210, y, barWidth, 22);
    ctx.fillStyle = "#22283f";
    ctx.fillText(`${item.media.toFixed(1)}%`, 640, y + 16);
  });

  roundedRect(ctx, 706, 306, 658, 360, 8);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#ded8d0";
  ctx.stroke();
  ctx.fillStyle = "#1b2551";
  ctx.font = "700 20px Arial";
  ctx.fillText("Semáforo geral", 734, 346);
  const totalTraffic = data.traffic.reduce((sum, item) => sum + item.value, 0) || 1;
  let start = -Math.PI / 2;
  data.traffic.forEach((item) => {
    const angle = (item.value / totalTraffic) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(910, 490);
    ctx.arc(910, 490, 120, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[item.name] ?? "#888888";
    ctx.fill();
    start += angle;
  });
  data.traffic.forEach((item, index) => {
    const y = 424 + index * 40;
    ctx.fillStyle = colors[item.name] ?? "#888888";
    ctx.fillRect(1080, y, 22, 22);
    ctx.fillStyle = "#22283f";
    ctx.font = "15px Arial";
    ctx.fillText(`${item.name}: ${item.value}`, 1116, y + 17);
  });

  roundedRect(ctx, 36, 696, width - 72, tableHeight, 8);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#ded8d0";
  ctx.stroke();
  ctx.fillStyle = "#1b2551";
  ctx.font = "700 20px Arial";
  ctx.fillText("Indicadores filtrados", 64, 738);
  const headers = ["Código", "Indicador", "Área", "Resultado", "Meta", "Ating.", "Status"];
  const x = [64, 160, 560, 760, 900, 1020, 1130];
  ctx.fillStyle = "#e2d9cb";
  ctx.fillRect(64, 760, width - 128, 34);
  ctx.fillStyle = "#1b2551";
  ctx.font = "700 13px Arial";
  headers.forEach((header, index) => ctx.fillText(header, x[index], 782));
  ctx.font = "13px Arial";
  data.rows.slice(0, 14).forEach((row, index) => {
    const y = 826 + index * 34;
    ctx.fillStyle = index % 2 === 0 ? "#ffffff" : "#f7f6f4";
    ctx.fillRect(64, y - 24, width - 128, 34);
    ctx.fillStyle = "#22283f";
    text(ctx, row.code, x[0], y);
    text(ctx, row.name, x[1], y, 46);
    text(ctx, row.area, x[2], y, 20);
    text(ctx, row.actual, x[3], y, 16);
    text(ctx, row.target, x[4], y, 16);
    text(ctx, row.achievement, x[5], y, 12);
    ctx.fillStyle = colors[row.trafficLight] ?? "#696d7b";
    text(ctx, row.trafficLight, x[6], y, 12);
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
