/** Domain filter dropdown for analytics tabs */

interface Props {
  domains: string[];
  value: string;
  onChange: (domain: string) => void;
}

export default function DomainFilter({ domains, value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-800/50 border border-gray-700/50 text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gray-600"
    >
      <option value="all">All Properties</option>
      {domains.map((d) => (
        <option key={d} value={d}>{d}</option>
      ))}
    </select>
  );
}
