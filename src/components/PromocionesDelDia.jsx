import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { useSEO } from '../hooks/useSEO';
import { obtenerPromocionesDestacadas } from '../services/firestore';
import { Tag, MapPin, Clock } from 'lucide-react';

const MUNICIPIOS = [
  'Abriaquí', 'Anzá', 'Armenia', 'Buriticá', 'Caicedo', 'Cañasgordas',
  'Dabeiba', 'Ebéjico', 'Frontino', 'Giraldo', 'Heliconia', 'Liborina',
  'Olaya', 'Peque', 'Sabanalarga', 'San Jerónimo', 'Santa Fe de Antioquia',
  'Sopetrán', 'Uramita'
];

const CATEGORIAS = [
  'Alojamiento', 'Comidas rápidas', 'Comida Gourmet', 'Tours', 'Entrada a show',
  'Bebidas y licores', 'Paquetes turísticos', 'Joyería en filigrana', 'Dulces y postres',
  'Happy hour', 'Día de sol', 'Noche de luna', 'Lunas de miel', 'Escapadas', 'Karaoke',
  'Entrada a museo', 'Afiliación', 'Formación', 'Gimnasio', 'Clases y talleres',
  'Oportunidad tributaria', 'Asesoría profesional'
];

const CATEGORIA_COLORES = {
  'Comidas rápidas': { badge: 'bg-red-500', accent: 'border-red-500', tag: 'bg-red-50 text-red-600' },
  'Comida Gourmet': { badge: 'bg-red-500', accent: 'border-red-500', tag: 'bg-red-50 text-red-600' },
  'Bebidas y licores': { badge: 'bg-orange-500', accent: 'border-orange-500', tag: 'bg-orange-50 text-orange-600' },
  'Dulces y postres': { badge: 'bg-pink-500', accent: 'border-pink-500', tag: 'bg-pink-50 text-pink-600' },
  'Happy hour': { badge: 'bg-orange-500', accent: 'border-orange-500', tag: 'bg-orange-50 text-orange-600' },
  'Alojamiento': { badge: 'bg-blue-500', accent: 'border-blue-500', tag: 'bg-blue-50 text-blue-600' },
  'Tours': { badge: 'bg-teal-500', accent: 'border-teal-500', tag: 'bg-teal-50 text-teal-600' },
  'Paquetes turísticos': { badge: 'bg-teal-500', accent: 'border-teal-500', tag: 'bg-teal-50 text-teal-600' },
  'Escapadas': { badge: 'bg-teal-500', accent: 'border-teal-500', tag: 'bg-teal-50 text-teal-600' },
  'Día de sol': { badge: 'bg-yellow-500', accent: 'border-yellow-500', tag: 'bg-yellow-50 text-yellow-600' },
  'Noche de luna': { badge: 'bg-indigo-500', accent: 'border-indigo-500', tag: 'bg-indigo-50 text-indigo-600' },
  'Lunas de miel': { badge: 'bg-pink-500', accent: 'border-pink-500', tag: 'bg-pink-50 text-pink-600' },
  'Entrada a show': { badge: 'bg-purple-500', accent: 'border-purple-500', tag: 'bg-purple-50 text-purple-600' },
  'Karaoke': { badge: 'bg-purple-500', accent: 'border-purple-500', tag: 'bg-purple-50 text-purple-600' },
  'Entrada a museo': { badge: 'bg-amber-600', accent: 'border-amber-600', tag: 'bg-amber-50 text-amber-700' },
  'Joyería en filigrana': { badge: 'bg-amber-600', accent: 'border-amber-600', tag: 'bg-amber-50 text-amber-700' },
  'Afiliación': { badge: 'bg-green-500', accent: 'border-green-500', tag: 'bg-green-50 text-green-600' },
  'Formación': { badge: 'bg-green-500', accent: 'border-green-500', tag: 'bg-green-50 text-green-600' },
  'Gimnasio': { badge: 'bg-green-500', accent: 'border-green-500', tag: 'bg-green-50 text-green-600' },
  'Clases y talleres': { badge: 'bg-green-500', accent: 'border-green-500', tag: 'bg-green-50 text-green-600' },
  'Oportunidad tributaria': { badge: 'bg-slate-600', accent: 'border-slate-600', tag: 'bg-slate-50 text-slate-700' },
  'Asesoría profesional': { badge: 'bg-slate-600', accent: 'border-slate-600', tag: 'bg-slate-50 text-slate-700' },
};

function colorPromo(categoria) {
  return CATEGORIA_COLORES[categoria] || { badge: 'bg-terracota', accent: 'border-terracota', tag: 'bg-crema text-terracota' };
}

export default function PromocionesDelDia() {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMunicipio, setFiltroMunicipio] = useState('');

  useSEO(
    'Promociones del Día — Ofertas del Occidente Antioqueño | Descubre Occidente',
    'Aprovecha las promociones y ofertas exclusivas de hoteles, restaurantes, tours y experiencias en el Occidente Antioqueño.'
  );

  useEffect(() => {
    cargarPromociones();
  }, []);

  const cargarPromociones = async () => {
    setLoading(true);
    try {
      const data = await obtenerPromocionesDestacadas();
      setPromociones(data);
    } catch (error) {
      console.error('Error cargando promociones:', error);
    }
    setLoading(false);
  };

  const filtradas = promociones.filter(p =>
    (!filtroCategoria || p.categoria === filtroCategoria) &&
    (!filtroMunicipio || p.municipio === filtroMunicipio)
  );

  return (
    <div className="min-h-screen bg-crema">
      <NavBar />
      {/* Header */}
      <div className="bg-gradient-to-r from-terracota to-terracota-dark text-white py-12">
        <div className="max-w-6xl mx-auto px-8">
          <h1 className="flex items-center gap-3 text-4xl font-bold mb-2">
            <img src="/medalla-promocion.png" alt="" className="h-14" /> Promociones del Día
          </h1>
          <p className="text-lg opacity-90">
            Ofertas exclusivas del Occidente Antioqueño
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gris/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-4 flex flex-wrap gap-3">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gris/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-terracota"
          >
            <option value="">Todas las subcategorías</option>
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
            {filtradas.length} promoción{filtradas.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* Grid de Promociones */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {loading ? (
          <p className="text-center text-terracota">Cargando promociones...</p>
        ) : filtradas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtradas.map((promo) => {
              const color = colorPromo(promo.categoria);
              return (
                <div key={promo.id} className={`bg-white rounded-lg overflow-hidden border-t-4 ${color.accent} shadow-md hover:shadow-lg transition-all`}>
                  <div className="relative aspect-video bg-gray-100">
                    {promo.imagen ? (
                      <img src={promo.imagen} alt={promo.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${color.tag}`}>
                        <Tag size={32} />
                      </div>
                    )}
                    {promo.descuento && (
                      <span className={`absolute top-3 left-3 ${color.badge} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                        -{promo.descuento}%
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <span className={`inline-block ${color.tag} text-xs font-semibold px-2 py-0.5 rounded-full mb-2`}>
                      {promo.categoria}
                    </span>
                    <p className="text-gris text-xs font-semibold mb-1">{promo.nombreNegocio}</p>
                    <h3 className="text-lg font-bold text-marron mb-2">{promo.titulo}</h3>
                    <p className="text-gris text-sm mb-3 line-clamp-2">{promo.descripcion}</p>

                    {promo.municipio && (
                      <p className="flex items-center gap-1 text-xs text-gris mb-3">
                        <MapPin size={12} /> {promo.municipio}
                      </p>
                    )}

                    {promo.precioOriginal && promo.precioDescuento && (
                      <div className="mb-4">
                        <span className="text-gris line-through text-sm mr-2">
                          ${promo.precioOriginal.toLocaleString()}
                        </span>
                        <span className="text-terracota font-bold text-xl">
                          ${promo.precioDescuento.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {promo.fechaVencimiento && (
                      <p className="flex items-center gap-1 text-xs text-gris mb-3">
                        <Clock size={12} /> Vence: {promo.fechaVencimiento.toDate().toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
                      </p>
                    )}

                    {promo.enlace && (
                      <a
                        href={promo.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block text-center ${color.badge} text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition`}
                      >
                        Ver oferta →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gris text-lg">
              No hay promociones que coincidan con estos filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}