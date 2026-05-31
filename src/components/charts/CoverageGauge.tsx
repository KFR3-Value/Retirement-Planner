import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const CoverageGauge = ({ ratio }: { ratio: number }) => {
  const data = useMemo(() => {
    // Cap at 100% for the gauge display
    const cappedRatio = Math.min(ratio, 100);
    return [
      { name: 'Gedeckt durch Garantiertes Einkommen', value: cappedRatio },
      { name: 'Unterdeckung', value: 100 - cappedRatio }
    ];
  }, [ratio]);

  const COLORS = ['#10b981', '#1e293b']; // Emerald green, dark slate

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-2 shadow-2xl rounded text-slate-200 font-mono text-xs">
          <p className="font-semibold text-slate-300">{payload[0].name}</p>
          <p className="text-emerald-400 font-bold mt-0.5">{Number(payload[0].value).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 flex flex-col items-center justify-center relative">
      <h3 className="text-sm font-semibold text-slate-400 mb-2 font-mono">Fixkostendeckung</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="80%"
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-8 flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-100 font-mono">{ratio.toFixed(1)}%</span>
      </div>
    </div>
  );
};
