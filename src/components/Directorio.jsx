import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerActoresPublicos } from '../services/firestore';
import { MapPin, Star } from 'lucide-react';

const MUNICIPIOS = [
  'Abriaquí', 'Anzá', 'Armenia', 'Buriticá', 'Caicedo', 'Cañasgordas',
  'Dabeiba', 'Ebéjico', 'Frontino', 'Giraldo', 'Heliconia', 'Liborina',
  'Olaya', 'Peque', 'Sabanalarga', 'San Jerónimo', 'Santa Fe de Antioquia',
  'Sopetrán', 'Uramita'
];

const CATEGORIAS = [
  'Alojamiento', 'Gastronomía', 'Tour operador', 'Ente territorial', 'Institución',
  'Microempresa', 'Bares y pubs', 'Recuperadora de residuos', 'Joyería en filigrana',
  'Actor cultural', 'Eventos', 'Lavandería', 'Cambio de moneda', 'Transporte', 'Comunicaciones'
];

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

const PAGINA = 16;

export default function Directorio() {
  const [actores, setActores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMunicipio, setFiltroMunicipio] = useState('');
  const [visibles, setVisibles] = useState(PAGINA);

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    setVisibles(PAGINA);
  }, [filtroCategoria, filtroMunicipio]);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await obtenerActoresPublicos();
      setActores(data);
    } catch (error) {
      console.error('Error cargando actores:', error);
    }
    setLoading(false);
  };

  const filtrados = actores.filter(a =>
    (!filtroCategoria || a.categoria === filtroCategoria) &&
    (!filtroMunicipio || a.municipio === filtroMunicipio)
  );

  const mostrados = filtrados.slice(0, visibles);

  return (
    <div className="min-h-screen bg-crema">
      <div className="bg-gradient-to-r from-terracota to-terracota-dark text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="flex items-center gap-3 text-4xl font-bold mb-2">
            <img src="/logo-teal.png" alt="" className="h-16 brightness-0 invert" /> Directorio de Actores
          </h1>
          <p className="text-lg opacity-90">Todos los actores turísticos del Occidente Antioqueño</p>
        </div>
      </div>

      <div className="bg-white border-b border-gris/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-3">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gris/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-terracota"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filtroMunicipio}
            onChange={(e) => setFiltroMunicipio(e.target.value)}
            className="border border-gris/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-terracota"
          >
            <option value="">Todos los municipios</option>
            {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <span className="text-sm text-gris self-center ml-auto">
            {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-center text-terracota">Cargando actores...</p>
        ) : mostrados.length === 0 ? (
          <p className="text-center text-gris">No hay actores que coincidan con estos filtros.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
              {mostrados.map((actor) => {
                const color = colorCategoria(actor.categoria);
                return (
                  <React.Fragment key={actor.id}>
                    <Link
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
                          {actor.categoria}{actor.subcategoria ? ` · ${actor.subcategoria}` : ''}
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
                  </React.Fragment>
                );
              })}
            </div>

            {visibles < filtrados.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setVisibles(v => v + PAGINA)}
                  className="bg-terracota text-white font-semibold px-6 py-3 rounded-lg hover:bg-terracota-dark transition"
                >
                  Cargar más
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}