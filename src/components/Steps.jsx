const Steps = () => {
  return (
    <section className="py-20 px-6 bg-gray-800">
      <h2 className="text-4xl font-bold text-center mb-12 text-indigo-400">Cómo funciona</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        <div className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
          <h3 className="text-2xl font-semibold mb-2">1. Define tu problema</h3>
          <p>Describe el problema que quieres resolver con claridad.</p>
        </div>
        <div className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
          <h3 className="text-2xl font-semibold mb-2">2. Analiza causas raíz</h3>
          <p>Identifica las causas principales que generan el problema.</p>
        </div>
        <div className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
          <h3 className="text-2xl font-semibold mb-2">3. Propón contramedidas</h3>
          <p>Diseña acciones para eliminar o reducir las causas.</p>
        </div>
        <div className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
          <h3 className="text-2xl font-semibold mb-2">4. Da seguimiento</h3>
          <p>Monitorea los resultados y ajusta según sea necesario.</p>
        </div>
      </div>
    </section>
  );
};

export default Steps;

