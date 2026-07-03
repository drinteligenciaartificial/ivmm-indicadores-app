"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const trafficColors: Record<string, string> = {
  VERDE: "#237a4b",
  AMARELO: "#9b6b0b",
  VERMELHO: "#b4313c",
};

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

export function PeriodLineChart({
  data,
  valueLabel,
  targetLabel,
}: {
  data: { period: string; value: number; target: number }[];
  valueLabel: string;
  targetLabel: string;
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
          <Line type="monotone" dataKey="value" name={valueLabel} stroke="#1b2551" strokeWidth={3} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="target" name={targetLabel} stroke="#a4866e" strokeWidth={2} strokeDasharray="6 4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
