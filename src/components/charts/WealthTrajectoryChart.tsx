import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCHF } from '../../utils/format';

export const WealthTrajectoryChart = ({ trajectory }: { trajectory: any[] }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-3 shadow rounded min-w-[200px]">
          <p className="font-bold border-b pb-1 mb-2">Jahr {label}</p>
          {payload.map((p: any, idx: number) => (
             <div key={idx} className="flex justify-between items-center text-sm py-1">
                <span style={{ color: p.color }} className="font-medium">{p.name}:</span>
                <span className="ml-4">{formatCHF(p.value)}</span>
             </div>
          ))}
          <div className="flex justify-between items-center text-sm py-1 mt-2 border-t pt-1 font-bold">
            <span>Total Vermögen:</span>
            <span>{formatCHF(payload[0].payload.totalWealth)}</span>
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
             name="Liquides Vermögen (inkl. 3a)"
             stackId="1"
             stroke="#3b82f6"
             fill="#93c5fd"
          />
          <Area
             type="monotone"
             dataKey="realEstateEquity"
             name="Immobilien (Netto)"
             stackId="1"
             stroke="#10b981"
             fill="#6ee7b7"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
