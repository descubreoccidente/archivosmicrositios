import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Store } from 'lucide-react';
import MicrositiosDestacados from './MicrositiosDestacados';

export default function Home() {
  return (
    <div className="min-h-screen bg-crema">
      {/* Hero */}
      <div className="relative h-screen min-h-[600px] w-full overflow-hidden">
        <img
          src="/fondo-login.png"
          alt="Occidente Antioqueño"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <img
            src="/logo-teal.png"
            alt="Descubre el Occidente Antioqueño"
            className="h-24 md:h-32 mb-6 brightness-0 invert"
          />
          <h1 className="text-3xl md:text-5xl font-bold text-white max-w-3xl leading-tight">
            Descubre el Occidente Antioqueño
          </h1>
          <p className="text-white/90 text-base md:text-lg mt-4 max-w-xl">
            19 municipios, decenas de experiencias auténticas y un territorio que te espera.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a
              href="#explorar"
              className="flex items-center justify-center gap-2 bg-terracota text-white font-semibold px-6 py-3 rounded-lg hover:bg-terracota-dark transition"
            >
              <Compass size={20} /> Explorar el territorio
            </a>
            <Link
              to="/ingresar"
              className="flex items-center justify-center gap-2 bg-white text-terracota font-semibold px-6 py-3 rounded-lg hover:bg-crema transition"
            >
              <Store size={20} /> Soy un actor turístico
            </Link>
          </div>
        </div>
      </div>

      <div id="explorar">
        <MicrositiosDestacados />
      </div>
    </div>
  );
}