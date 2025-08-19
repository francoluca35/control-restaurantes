export default function BotonesDashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <button className="bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg p-4 transition-colors duration-200">
        Generar informe
      </button>
      <button className="bg-red-700 hover:bg-red-600 text-white font-medium rounded-lg p-4 transition-colors duration-200">
        Configurar sistema
      </button>
    </div>
  );
}
