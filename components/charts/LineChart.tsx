'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: Array<{
    name: string;
    value: number;
    [key: string]: any;
  }>;
  title?: string;
  height?: number;
  dataKey?: string;
  strokeColor?: string;
}

export default function LineChartComponent({ 
  data, 
  title, 
  height = 300, 
  dataKey = 'value',
  strokeColor = '#3B82F6'
}: LineChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(156, 163, 175, 0.3)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              color: '#ffffff'
            }}
            labelStyle={{ 
              color: '#d1d5db',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px'
            }}
            formatter={(value, name, props) => [
              <div key={name} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: strokeColor }} />
                  <span className="text-sm font-semibold text-white">{name}</span>
                </div>
                <div className="text-xs text-gray-300 ml-4">
                  Trend value: {value}
                </div>
              </div>
            ]}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={strokeColor}
            strokeWidth={2}
            dot={{ fill: strokeColor, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: strokeColor, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
