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

export default function MicrositiosDestacados() {
  const [actores, setActores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMunicipio, setFiltroMunicipio] = useState('');

  useEffect(() => {
    cargar();
  }, []);

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

  return (
    <section className="bg-naranja py-16">
      <div className="max-w-6xl mx-auto px-6">
      <h2 className="flex items-center justify-center gap-2 text-3xl font-bold text-white mb-2 text-center">
        <img src="/logo-teal.png" alt="" className="h-16 brightness-0 invert" /> Explora el territorio
      </h2>
      <p className="text-white/90 text-center mb-8">Descubre los actores turísticos del Occidente Antioqueño</p>

      <div className="flex flex-wrap gap-3 justify-center mb-10">
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
      </div>

      {loading ? (
        <p className="text-center text-terracota">Cargando actores...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-center text-gris">No hay actores que coincidan con estos filtros.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtrados.map((actor) => {
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
                    <div className={`w-full h-full flex items-center justify-center ${color.tag} text-3xl font-bold`}>
                      {actor.nombre.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className={`inline-block ${color.tag} text-xs font-semibold px-2 py-0.5 rounded-full mb-2`}>
                    {actor.categoria}{actor.subcategoria ? ` · ${actor.subcategoria}` : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    {actor.logo && (
                      <div className="w-8 h-8 rounded-full border border-gris/20 flex-shrink-0 overflow-hidden bg-white">
                        <img src={actor.logo} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <p className="font-bold text-marron text-base leading-snug">{actor.nombre}</p>
                  </div>
                  {actor.municipio && (
                    <p className="flex items-center gap-1 text-xs text-gris mt-1">
                      <MapPin size={12} /> {actor.municipio}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
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
    </div>
    </section>
  );
}