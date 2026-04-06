/** Horizontal bar chart — lightweight SVG, no chart library */

interface BarItem {
  label: string;
  value: number;
  sub?: string;
}

interface Props {
  data: BarItem[];
  color?: string;
  maxBars?: number;
  className?: string;
}

export default function BarChart({ data, color = '#4c6ef5', maxBars = 10, className = '' }: Props) {
  const items = data.slice(0, maxBars);
  if (!items.length) return null;
  const max = Math.max(...items.map(d => d.value), 1);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-36 truncate text-xs text-gray-400" title={item.label}>
            {item.label}
          </div>
          <div className="flex-1 h-5 bg-gray-800/30 rounded overflow-hidden">
            <div
              className="h-full rounded transition-all"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: color,
                opacity: 1 - i * 0.05,
              }}
            />
          </div>
          <div className="w-16 text-right text-xs font-mono text-gray-400">
            {item.value.toLocaleString()}
          </div>
          {item.sub && (
            <div className="w-12 text-right text-[10px] text-gray-600">{item.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
