import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { obtenerPromocionesDestacadas } from '../services/firestore';
import { Tag, MapPin } from 'lucide-react';

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

export default function PromocionesDestacadas() {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMunicipio, setFiltroMunicipio] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
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

  const destacadas = filtradas.slice(0, 3);

  return (
    <section className="bg-teal py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="flex items-center justify-center gap-2 text-3xl font-bold text-white mb-2 text-center">
          <img src="/medalla-promocion.png" alt="" className="h-10" /> {t('destacados.promoTitulo')}
        </h2>
        <p className="text-white/90 text-center mb-8">{t('destacados.promoSubtitulo')}</p>
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gris/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-terracota bg-white"
          >
            <option value="">{t('comun.todasSubcategorias')}</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filtroMunicipio}
            onChange={(e) => setFiltroMunicipio(e.target.value)}
            className="border border-gris/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-terracota bg-white"
          >
            <option value="">{t('comun.todosMunicipios')}</option>
            {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-terracota">{t('comun.cargandoPromos')}</p>
        ) : destacadas.length === 0 ? (
          <p className="text-center text-gris">{t('comun.sinPromos')}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {destacadas.map((promo) => {
              const color = colorPromo(promo.categoria);
              return (
                <div
                  key={promo.id}
                  className={`bg-white rounded-lg overflow-hidden border-t-4 ${color.accent} shadow-md hover:shadow-lg transition-all`}
                >
                  <div className="relative aspect-video bg-gray-100">
                    {promo.imagen ? (
                      <img src={promo.imagen} alt={promo.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${color.tag}`}>
                        <Tag size={28} />
                      </div>
                    )}
                    {promo.descuento && (
                      <span className={`absolute top-2 left-2 ${color.badge} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                        -{promo.descuento}%
                      </span>
                    )}
                  </div>
                  <div className="p-2 md:p-4">
                    <span className={`hidden md:inline-block ${color.tag} text-xs font-semibold px-2 py-0.5 rounded-full mb-2`}>
                      {promo.categoria}
                    </span>
                    <p className="font-bold text-marron text-xs md:text-base leading-snug line-clamp-2">{promo.titulo}</p>
                    <p className="hidden md:block text-xs text-gris mt-1 line-clamp-2">{promo.descripcion}</p>
                    {promo.municipio && (
                      <p className="hidden md:flex items-center gap-1 text-xs text-gris mt-2">
                        <MapPin size={11} /> {promo.municipio}
                      </p>
                    )}
                    {promo.precioOriginal && promo.precioDescuento && (
                      <div className="mt-1 md:mt-2 flex items-baseline gap-1 md:gap-2">
                        <span className="text-gris line-through text-[10px] md:text-xs">
                          ${promo.precioOriginal.toLocaleString()}
                        </span>
                        <span className="text-terracota font-bold text-sm md:text-lg">
                          ${promo.precioDescuento.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/promociones"
            className="inline-block bg-terracota text-white font-semibold px-6 py-3 rounded-lg hover:bg-terracota-dark transition"
          >
            {t('destacados.verPromociones')}
          </Link>
        </div>
      </div>
    </section>
  );
}