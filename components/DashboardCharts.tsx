"use client";

import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
