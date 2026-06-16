import { PieChart as PieIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import SectionCard from "./SectionCard";
import { formatCompactCurrency, formatPercent, shortName } from "../utils/formatters";

const colors = ["#ff7b55", "#ff9a6d", "#f2c078", "#d85d42", "#c4503c"];

export default function CompanyDonut({ data }) {
  return (
    <SectionCard title="Distribucion por Empresa" icon={PieIcon}>
      <div className="grid min-h-[210px] grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_150px]">
        <div className="h-[205px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius="62%" outerRadius="86%" paddingAngle={3} dataKey="value" stroke="none">
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCompactCurrency(value)}
                contentStyle={{ background: "#22231f", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-[11px] font-bold text-stone-300">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="truncate">{shortName(item.name)}</span>
              </span>
              <span className="text-[11px] font-black text-stone-100">{formatPercent(item.percent)}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
