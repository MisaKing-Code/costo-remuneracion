import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCompactCurrency } from "../utils/formatters";

export default function TrendChart({ data = [] }) {
  return (
    <SectionCard title="Tendencia Mensual del Costo" icon={TrendingUp} className="min-h-[320px]">
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="costTrend" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#ff7b55" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#ff7b55" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
            <XAxis dataKey="period" tick={{ fill: "#a8a29e", fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={false} />
            <YAxis
              width={54}
              tickFormatter={formatCompactCurrency}
              tick={{ fill: "#78716c", fontSize: 10, fontWeight: 700 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCompactCurrency(value),
                name === "totalCost" ? "Costo total" : name === "totalHaberes" ? "Haberes" : "Aportes",
              ]}
              labelStyle={{ color: "#f8f5ee", fontWeight: 800 }}
              contentStyle={{ background: "#22231f", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8 }}
            />
            <Area
              type="monotone"
              dataKey="totalCost"
              stroke="#ff9a6d"
              strokeWidth={3}
              fill="url(#costTrend)"
              activeDot={{ r: 5, fill: "#ffbd8f", stroke: "#151513", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
