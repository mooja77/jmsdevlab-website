/** Donut/ring chart — lightweight SVG */

interface Slice {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Slice[];
  size?: number;
  className?: string;
}

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#ec4899'];

export default function PieRing({ data, size = 120, className = '' }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return null;

  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  let offset = 0;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((slice, i) => {
          const pct = slice.value / total;
          const dash = circ * pct;
          const gap = circ - dash;
          const rot = (offset / total) * 360 - 90;
          offset += slice.value;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={slice.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              strokeWidth={16}
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rot} ${cx} ${cy})`}
              strokeLinecap="round"
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white text-lg font-semibold">
          {total.toLocaleString()}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-500 text-[10px]">
          total
        </text>
      </svg>
      <div className="space-y-1">
        {data.map((slice, i) => {
          const pct = ((slice.value / total) * 100).toFixed(1);
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: slice.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
              />
              <span className="text-gray-400 w-20 truncate">{slice.label}</span>
              <span className="text-gray-300 font-mono">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
