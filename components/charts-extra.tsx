import { TooltipProps } from "recharts";

interface CustomTooltipContentProps extends TooltipProps<number, string> {
  colorMap?: Record<string, string>;
  labelMap?: Record<string, string>;
  // Optional array to define display order
  dataKeys?: string[];
  // Optional formatter for values
  valueFormatter?: (value: number) => string;
}

export function CustomTooltipContent({
  active,
  payload,
  label,
  colorMap = {},
  labelMap = {},
  dataKeys, // If provided, will be used to order the items
  valueFormatter = (value:any) => `$${value.toLocaleString()}`,
}: CustomTooltipContentProps&any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Create a map of payload items by dataKey for easy lookup
  const payloadMap = payload.reduce(
    (acc:any, item:any) => {
      acc[item.dataKey as string] = item;
      return acc;
    },
    {} as Record<string, (typeof payload)[0]>,
  );

  // If dataKeys is provided, use it to order the items
  // Otherwise, use the original payload order
  const orderedPayload = dataKeys
    ? dataKeys
        .filter((key:any) => payloadMap[key]) // Only include keys that exist in the payload
        .map((key:any) => payloadMap[key])
    : payload;

  return (
    <div className="bg-black/70 backdrop-blur-sm border border-gray-600/50 rounded-lg px-3 py-2 shadow-xl">
      <div className="text-xs font-medium text-gray-300 mb-1">{label}</div>
      <div className="grid gap-1.5">
        {orderedPayload.map((entry:any, index:any) => {
          // Skip undefined entries
          if (!entry) return null;

          const name = entry.dataKey as string;
          const value = entry.value as number;

          // Get color and label from maps, with fallbacks
          const color = colorMap[name] || "var(--chart-1)";
          const displayLabel = labelMap[name] || name;

          // Add descriptive text based on data type
          const getDescription = (key: string, val: number) => {
            if (key === 'actual') return `Current period performance: ${valueFormatter(val)}`;
            if (key === 'projected') return `Forecasted target: ${valueFormatter(val)}`;
            if (key === 'revenues') return `Revenue generated: ${valueFormatter(val)}`;
            if (key === 'churn') return `Customer churn: ${valueFormatter(val)}`;
            if (key === 'value') return `Total value: ${valueFormatter(val)}`;
            return `${displayLabel}: ${valueFormatter(val)}`;
          };

          return (
            <div key={`item-${index}`} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-semibold text-white">
                  {displayLabel}
                </span>
              </div>
              <div className="text-xs text-gray-300 ml-4">
                {getDescription(name, value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
