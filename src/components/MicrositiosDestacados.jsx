import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { obtenerActoresPublicos } from '../services/firestore';
import { MapPin, Star } from 'lucide-react';

const CATEGORIA_COLORES = {
  'Alojamiento': { accent: 'border-blue-500', tag: 'bg-blue-50 text-blue-600' },
  'Gastronomía': { accent: 'border-red-500', tag: 'bg-red-50 text-red-600' },
  'Tour operador': { accent: 'border-teal-500', tag: 'bg-teal-50 text-teal-600' },
  'Ente territorial': { accent: 'border-slate-600', tag: 'bg-slate-50 text-slate-700' },
  'Institución': { accent: 'border-indigo-500', tag: 'bg-indigo-50 text-indigo-600' },
  'Microempresa': { accent: 'border-amber-600', tag: 'bg-amber-50 text-amber-700' },
  'Bares y pubs': { accent: 'border-purple-500', tag: 'bg-purple-50 text-purple-600' },
  'Recuperadora de residuos': { accent: 'border-green-600', tag: 'bg-green-50 text-green-700' },
  'Joyería en filigrana': { accent: 'border-yellow-500', tag: 'bg-yellow-50 text-yellow-600' },
  'Actor cultural': { accent: 'border-pink-500', tag: 'bg-pink-50 text-pink-600' },
  'Eventos': { accent: 'border-fuchsia-500', tag: 'bg-fuchsia-50 text-fuchsia-600' },
  'Lavandería': { accent: 'border-cyan-500', tag: 'bg-cyan-50 text-cyan-600' },
  'Cambio de moneda': { accent: 'border-emerald-500', tag: 'bg-emerald-50 text-emerald-600' },
  'Transporte': { accent: 'border-sky-600', tag: 'bg-sky-50 text-sky-700' },
  'Comunicaciones': { accent: 'border-violet-500', tag: 'bg-violet-50 text-violet-600' },
};

function colorCategoria(categoria) {
  return CATEGORIA_COLORES[categoria] || { accent: 'border-terracota', tag: 'bg-crema text-terracota' };
}

function mezclar(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export default function MicrositiosDestacados() {
  const [actores, setActores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await obtenerActoresPublicos();
      setActores(mezclar(data).slice(0, 8));
    } catch (error) {
      console.error('Error cargando actores:', error);
    }
    setLoading(false);
  };

  return (
    <section className="bg-naranja py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="flex items-center justify-center gap-2 text-3xl font-bold text-white mb-2 text-center">
          <img src="/logo-teal.png" alt="" className="h-16 brightness-0 invert" /> {t('destacados.micrositiosTitulo')}
        </h2>
        <p className="text-white/90 text-center mb-10">{t('destacados.micrositiosSubtitulo')}</p>

        {loading ? (
          <p className="text-center text-white">{t('comun.cargando')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
            {actores.map((actor) => {
              const color = colorCategoria(actor.categoria);
              return (
                <Link
                  key={actor.id}
                  to={`/micrositio/${actor.slug}`}
                  className={`block rounded-lg overflow-hidden border-t-4 ${color.accent} bg-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all`}
                >
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    {actor.fotoPortada ? (
                      <img src={actor.fotoPortada} alt={actor.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${color.tag} text-2xl md:text-3xl font-bold`}>
                        {actor.nombre.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-2 md:p-4">
                    <span className={`hidden md:inline-block ${color.tag} text-xs font-semibold px-2 py-0.5 rounded-full mb-2`}>
                      {actor.categoria}
                    </span>
                    <div className="flex items-center gap-2">
                      {actor.logo && (
                        <div className="hidden md:block w-8 h-8 rounded-full border border-gris/20 flex-shrink-0 overflow-hidden bg-white">
                          <img src={actor.logo} alt="" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <p className="font-bold text-marron text-xs md:text-base leading-snug line-clamp-2">{actor.nombre}</p>
                    </div>
                    {actor.municipio && (
                      <p className="flex items-center gap-1 text-[10px] md:text-xs text-gris mt-1">
                        <MapPin size={11} /> {actor.municipio}
                      </p>
                    )}
                    <div className="hidden md:flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < Math.round(actor.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
                        />
                      ))}
                      {actor.totalResenas > 0 && (
                        <span className="text-xs text-gris ml-1">({actor.totalResenas})</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/directorio"
            className="inline-block bg-white text-terracota font-semibold px-6 py-3 rounded-lg hover:bg-crema transition"
          >
            {t('destacados.verTodos')}
          </Link>
        </div>
      </div>
    </section>
  );
}