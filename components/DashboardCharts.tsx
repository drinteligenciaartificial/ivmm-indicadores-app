"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const trafficColors: Record<string, string> = {
  VERDE: "#237a4b",
  AMARELO: "#9b6b0b",
  VERMELHO: "#b4313c",
};

const comparisonColors = ["#1b2551", "#a4866e", "#237a4b", "#b4313c", "#4f6d9b", "#9b6b0b", "#6b4e71", "#2f7f7b"];

export function AreaBarChart({ data }: { data: { area: string; media: number }[] }) {
  return (
    <div style={{ width: "100%", height: 320, minWidth: 0, minHeight: 320 }}>
      <ResponsiveContainer width="100%" height={320} minWidth={0}>
        <BarChart data={data}>
          <CartesianGrid stroke="#e2d9cb" strokeDasharray="3 3" />
          <XAxis dataKey="area" tick={{ fill: "#696d7b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#696d7b", fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="media" name="Atingimento médio (%)" fill="#1b2551" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrafficPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div style={{ width: "100%", height: 320, minWidth: 0, minHeight: 320 }}>
      <ResponsiveContainer width="100%" height={320} minWidth={0}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} label>
            {data.map((item) => <Cell key={item.name} fill={trafficColors[item.name] ?? "#a4866e"} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PeriodLineChart({ data, series }: {
  data: Array<{ period: string } & Record<string, string | number>>;
  series: { key: string; label: string }[];
}) {
  return (
    <div style={{ width: "100%", height: 340, minWidth: 0, minHeight: 340 }}>
      <ResponsiveContainer width="100%" height={340} minWidth={0}>
        <LineChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#e2d9cb" strokeDasharray="3 3" />
          <XAxis dataKey="period" tick={{ fill: "#696d7b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#696d7b", fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {series.map((item, index) => <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={comparisonColors[index % comparisonColors.length]} strokeWidth={3} connectNulls activeDot={{ r: 5 }} />)}
          <Line type="monotone" dataKey="reference" name="Referência (100%)" stroke="#696d7b" strokeWidth={2} strokeDasharray="6 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function IndicatorColumnChart({
  data,
  months,
}: {
  data: Array<{ indicator: string } & Record<string, string | number>>;
  months: { key: string; label: string }[];
}) {
  return (
    <div style={{ width: "100%", height: 360, minWidth: 0, minHeight: 360 }}>
      <ResponsiveContainer width="100%" height={360} minWidth={0}>
        <BarChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 28 }}>
          <CartesianGrid stroke="#e2d9cb" strokeDasharray="3 3" />
          <XAxis dataKey="indicator" tick={{ fill: "#696d7b", fontSize: 12 }} interval={0} />
          <YAxis tick={{ fill: "#696d7b", fontSize: 12 }} unit="%" />
          <Tooltip />
          <Legend />
          {months.map((month, index) => <Bar key={month.key} dataKey={month.key} name={month.label} fill={comparisonColors[index % comparisonColors.length]} radius={[3, 3, 0, 0]} />)}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
