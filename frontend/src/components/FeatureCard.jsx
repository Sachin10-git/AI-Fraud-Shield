export default function FeatureCard({ title, description }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 flex justify-between items-center hover:bg-gray-700 transition cursor-pointer">
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <span className="text-xl text-gray-400">›</span>
    </div>
  );
}
