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

  const COLORS = ['#10b981', '#f3f4f6']; // Emerald green, gray

  return (
    <div className="h-64 flex flex-col items-center justify-center relative">
      <h3 className="text-sm font-semibold text-gray-500 mb-2">Fixkostendeckung</h3>
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
          <Tooltip
             formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Anteil']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-8 flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-800">{ratio.toFixed(1)}%</span>
      </div>
    </div>
  );
};
