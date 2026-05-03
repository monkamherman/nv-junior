import React from 'react';

const Hero: React.FC = () => {
  return (
    <>
      <section className="relative z-10 flex flex-col items-center bg-black/50 bg-[url('/etudiante.jpg')] bg-cover bg-center bg-no-repeat px-6 py-24 text-center md:py-40">
        <div className="h-screen-1/2 w-full bg-black/50 p-2">
          <p className="font-semibold uppercase tracking-wide text-blue-400">
            Conseil en Technologies
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-6xl">
            Nous Transformons les Concepts <br /> En Technologie
          </h1>

          {/* <p className="mt-6 max-w-2xl tracking-wide text-gray-300">
            Consectetur adipiscing elit. Aenean scelerisque augue eu mauris
          </p> */}
          <button className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700">
            Explorer Plus
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-8 bg-blue-700 py-6 text-sm text-white">
          <span className="flex items-center gap-2">⚡ Tech Media</span>
          <span className="flex items-center gap-2">✔ Tech Media</span>
          <span className="flex items-center gap-2">💬 Tech Media</span>
          <span className="flex items-center gap-2">📈 Tech Media</span>
        </div>
      </section>
    </>
  );
};

export default Hero;
