import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCHF } from '../../utils/format';

export const WealthTrajectoryChart = ({ trajectory }: { trajectory: any[] }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 shadow-2xl rounded min-w-[200px] text-slate-200 font-mono text-xs">
          <p className="font-bold border-b border-slate-800 pb-1.5 mb-2 text-slate-100 font-sans">Jahr {label}</p>
          {payload.map((p: any, idx: number) => (
             <div key={idx} className="flex justify-between items-center py-1">
                <span style={{ color: p.color }} className="font-medium">{p.name}:</span>
                <span className="ml-4 text-slate-100">{formatCHF(p.value)}</span>
             </div>
          ))}
          <div className="flex justify-between items-center py-1 mt-2 border-t border-slate-800 pt-1.5 font-bold text-slate-100">
            <span>Total Vermögen:</span>
            <span className="text-emerald-400">{formatCHF(payload[0].payload.totalWealth)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={trajectory}
          margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36}/>
          <Area
             type="monotone"
             dataKey="liquidWealth"
             name="Liquides Vermögen (Cash)"
             stackId="1"
             stroke="#3b82f6"
             fill="#93c5fd"
          />
          <Area
             type="monotone"
             dataKey="pensionWealth"
             name="Vorsorgekapital (PK, 3a, FZK)"
             stackId="1"
             stroke="#8b5cf6"
             fill="#c084fc"
          />
          <Area
             type="monotone"
             dataKey="realEstateEquity"
             name="Immobilien-Eigenkapital"
             stackId="1"
             stroke="#10b981"
             fill="#6ee7b7"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
