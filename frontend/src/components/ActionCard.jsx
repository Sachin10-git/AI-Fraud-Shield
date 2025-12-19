export default function ActionCard({ title, description }) {
  return (
    <div className="bg-zinc-900 hover:bg-zinc-800 transition rounded-xl p-5 cursor-pointer">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
  );
}
