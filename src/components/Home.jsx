import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Store } from 'lucide-react';
import NavBar from './NavBar';
import MicrositiosDestacados from './MicrositiosDestacados';
import AgendaDestacada from './AgendaDestacada';
import PromocionesDestacadas from './PromocionesDestacadas';
import MapaTerritorio from './MapaTerritorio';
import Footer from './Footer';
import Banner from './Banner';

const FONDOS_HERO = ['/fondo-hero-1.jpg', '/fondo-hero-2.jpeg', '/fondo-hero-3.jpg'];

export default function Home() {
  const [indiceFondo, setIndiceFondo] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceFondo((prev) => (prev + 1) % FONDOS_HERO.length);
    }, 6000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="min-h-screen bg-crema">
      <NavBar />
      {/* Hero */}
      <div className="relative h-screen min-h-[600px] w-full overflow-hidden">
        {FONDOS_HERO.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt="Occidente Antioqueño"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              idx === indiceFondo ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex flex-col items-center gap-2 w-28 md:w-36">
          <img
            src="/logo-corporacion.png"
            alt="Corporación de Turismo del Occidente de Antioquia"
            className="h-16 md:h-20 object-contain drop-shadow-lg"
          />
          <p className="hidden md:block text-xs text-white font-semibold leading-tight text-center drop-shadow-md">
            {t('hero.iniciativa')}
          </p>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <img
            src="/logo-teal.png"
            alt="Descubre el Occidente Antioqueño"
            className="h-24 md:h-32 mb-6 brightness-0 invert"
          />
          <h1 className="text-3xl md:text-5xl font-bold text-white max-w-3xl leading-tight">
            {t('hero.titulo')}
          </h1>
          <p className="text-white/90 text-base md:text-lg mt-4 max-w-xl">
            {t('hero.subtitulo')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a
              href="#explorar"
              className="flex items-center justify-center gap-2 bg-terracota text-white font-semibold px-6 py-3 rounded-lg hover:bg-terracota-dark transition"
            >
              <Compass size={20} /> {t('hero.explorar')}
            </a>
            <Link
              to="/ingresar"
              className="flex items-center justify-center gap-2 bg-white text-terracota font-semibold px-6 py-3 rounded-lg hover:bg-crema transition"
            >
              <Store size={20} /> {t('hero.soyActor')}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <Banner imagen="/banners/Banner-1.png" aspecto="2721/340" />
      </div>

      <div id="explorar">
        <MicrositiosDestacados />
      </div>
      <AgendaDestacada />
      <PromocionesDestacadas />
      <MapaTerritorio />
      <Footer />
    </div>
  );
}