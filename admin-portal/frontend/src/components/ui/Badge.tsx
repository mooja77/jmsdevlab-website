const variants: Record<string, string> = {
  healthy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  degraded: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  down: 'bg-red-500/10 text-red-400 border-red-500/20',
  unknown: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  qualified: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  proposal: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  lost: 'bg-red-500/10 text-red-400 border-red-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  prospect: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function Badge({ status, className = '' }: { status: string; className?: string }) {
  const variant = variants[status] || variants.unknown;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${variant} ${className}`}>
      {status}
    </span>
  );
}
