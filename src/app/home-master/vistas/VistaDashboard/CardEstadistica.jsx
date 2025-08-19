export default function CardEstadistica({ icon: Icon, label, valor, color }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
      <Icon size={28} className={`${color}`} />
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-lg font-semibold">{valor}</p>
      </div>
    </div>
  );
}
