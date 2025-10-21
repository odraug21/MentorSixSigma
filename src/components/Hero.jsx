const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center h-screen text-center px-6">
      <h1 className="text-5xl font-bold mb-4 text-indigo-400">
        Resuelve tus problemas Lean paso a paso
      </h1>
      <p className="text-xl mb-8">
        Crea, analiza y mejora tus procesos con la ayuda de IA
      </p>
      <button className="bg-indigo-500 px-6 py-3 rounded-lg text-lg hover:bg-indigo-600">
        Crear mi primer A3
      </button>
    </section>
  );
};

export default Hero;
