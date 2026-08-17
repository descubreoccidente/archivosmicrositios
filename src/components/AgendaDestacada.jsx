import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerAgendaRegional } from '../services/firestore';
import { Calendar, MapPin } from 'lucide-react';

const CATEGORIAS = ['Cultural', 'Normativo', 'Formación', 'Institucional', 'Religioso', 'Fiestas tradicionales', 'Otros'];

const MUNICIPIOS = [
  'Abriaquí', 'Anzá', 'Armenia', 'Buriticá', 'Caicedo', 'Cañasgordas',
  'Dabeiba', 'Ebéjico', 'Frontino', 'Giraldo', 'Heliconia', 'Liborina',
  'Olaya', 'Peque', 'Sabanalarga', 'San Jerónimo', 'Santa Fe de Antioquia',
  'Sopetrán', 'Uramita'
];

function formatFechaCorta(fecha) {
  if (!fecha) return '';
  const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

export default function AgendaDestacada() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMunicipio, setFiltroMunicipio] = useState('');

  useEffect(() => {
    cargar();
  }, [filtroCategoria, filtroMunicipio]);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await obtenerAgendaRegional({
        categoria: filtroCategoria,
        municipio: filtroMunicipio,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      });
      setEventos(data.slice(0, 10));
    } catch (error) {
      console.error('Error cargando agenda destacada:', error);
    }
    setLoading(false);
  };

  return (
    <section className="relative py-16 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(44,24,16,0.5), rgba(44,24,16,0.5)), url('/agenda-fondo.jpg')" }}>
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="flex items-center justify-center gap-2 text-3xl font-bold text-white mb-2 text-center">
          <img src="/logo-teal.png" alt="" className="h-16 brightness-0 invert" /> Agenda Regional
        </h2>
        <p className="text-white/90 text-center mb-8">Lo que está pasando en el Occidente Antioqueño</p>

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
          <p className="text-center text-terracota">Cargando eventos...</p>
        ) : eventos.length === 0 ? (
          <p className="text-center text-gris">No hay eventos próximos con estos filtros.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {eventos.map((evento) => (
              <Link
                key={evento.id}
                to="/agenda"
                className="block bg-crema rounded-lg overflow-hidden border border-gris/10 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-square bg-gray-100">
                  {evento.imagen ? (
                    <img src={evento.imagen} alt={evento.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-terracota/10">
                      <Calendar size={28} className="text-terracota" />
                    </div>
                  )}
                </div>
                <div className="p-2 md:p-3">
                  <span className="hidden md:inline-block bg-terracota/10 text-terracota text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                    {evento.categoria}
                  </span>
                  <p className="font-bold text-marron text-xs md:text-sm leading-snug line-clamp-2">{evento.nombre}</p>
                  <p className="flex items-center gap-1 text-[10px] md:text-xs text-gris mt-1">
                    <Calendar size={11} /> {formatFechaCorta(evento.fechaInicio || evento.fecha)}
                  </p>
                  {evento.municipio && (
                    <p className="hidden md:flex items-center gap-1 text-xs text-gris">
                      <MapPin size={11} /> {evento.municipio}
                    </p>
                  )}
                  {evento.nombreNegocio && (
                    <p className="hidden md:block text-xs text-terracota font-semibold mt-1">Por {evento.nombreNegocio}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/agenda"
            className="inline-block bg-terracota text-white font-semibold px-6 py-3 rounded-lg hover:bg-terracota-dark transition"
          >
            Ver agenda completa
          </Link>
        </div>
      </div>
    </section>
  );
}