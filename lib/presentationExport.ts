export type IndicatorExportRow = {
  code: string;
  name: string;
  area: string;
  bscPerspective: string;
  collectionOwner: string;
  status: string;
  strategicObjective: string;
  formula: string;
  sourceSystem: string;
  achievement?: string;
  trafficLight?: string;
};

export function indicatorWorkbook(rows: IndicatorExportRow[]) {
  const tableRows = rows.map((row) => `
    <tr>
      <td>${row.code}</td>
      <td>${row.name}</td>
      <td>${row.area}</td>
      <td>${row.bscPerspective}</td>
      <td>${row.collectionOwner}</td>
      <td>${row.status}</td>
      <td>${row.achievement ?? "-"}</td>
      <td class="traffic ${row.trafficLight ?? ""}">${row.trafficLight ?? "-"}</td>
      <td>${row.strategicObjective}</td>
      <td>${row.formula}</td>
      <td>${row.sourceSystem}</td>
    </tr>
  `).join("");
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body{font-family:Arial,Helvetica,sans-serif;background:#f7f6f4;color:#22283f}
        .title{background:#1b2551;color:white;font-size:22px;font-weight:700;padding:18px;border-bottom:4px solid #a4866e}
        .subtitle{background:#f5f1eb;color:#696d7b;padding:10px 18px}
        table{border-collapse:collapse;width:100%;background:white}
        th{background:#e2d9cb;color:#1b2551;font-weight:700}
        th,td{border:1px solid #ded8d0;padding:10px;text-align:left;vertical-align:top}
        .traffic{font-weight:700;text-align:center}
        .VERDE{background:#e2f3e9;color:#237a4b}.AMARELO{background:#fff2d3;color:#9b6b0b}.VERMELHO{background:#fae5e8;color:#b4313c}
      </style>
    </head>
    <body>
      <div class="title">IVMM - Banco de Indicadores e Fichas</div>
      <div class="subtitle">Exportação com layout institucional, cores e dados técnicos principais.</div>
      <table>
        <thead><tr><th>Código</th><th>Indicador</th><th>Área</th><th>BSC</th><th>Coleta</th><th>Status</th><th>Atingimento</th><th>Semáforo</th><th>Objetivo</th><th>Fórmula</th><th>Fonte</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
  </html>`;
}
