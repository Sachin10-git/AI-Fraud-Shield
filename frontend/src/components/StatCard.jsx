export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
