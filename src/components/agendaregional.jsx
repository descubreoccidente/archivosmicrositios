import React, { useState, useEffect } from 'react';
import { obtenerAgendaRegional } from '../services/firestore';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';

export default function AgendaRegional() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    categoria: '',
    municipio: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
  });

  const categorias = [
    'Académico', 'Cultural', 'Religioso', 'Formación', 'Foro',
    'Seminario', 'Panel', 'Feria', 'Festival', 'Musical', 'Institucional'
  ];

  const municipios = [
    'Santa Fe de Antioquia', 'Caramanta', 'Jericó', 'Támesis',
    'Valdivia', 'Yarumal', 'Olaya', 'Sopetrán', 'Ebéjico'
  ];

  useEffect(() => {
    cargarEventos();
  }, [filtros]);

  const cargarEventos = async () => {
    setLoading(true);
    try {
      const data = await obtenerAgendaRegional(filtros);
      setEventos(data);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
    setLoading(false);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-crema">
      {/* Header */}
      <div className="bg-gradient-to-r from-terracota to-terracota-dark text-white py-12">
        <div className="max-w-6xl mx-auto px-8">
          <h1 className="text-4xl font-bold mb-2">Agenda Regional</h1>
          <p className="text-lg opacity-90">
            Descubre todos los eventos del Occidente Antioqueño
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gris/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Categoría
              </label>
              <select
                name="categoria"
                value={filtros.categoria}
                onChange={handleFiltroChange}
                className="w-full border border-gris/30 rounded px-3 py-2 focus:outline-none focus:border-terracota text-sm"
              >
                <option value="">Todas</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Municipio
              </label>
              <select
                name="municipio"
                value={filtros.municipio}
                onChange={handleFiltroChange}
                className="w-full border border-gris/30 rounded px-3 py-2 focus:outline-none focus:border-terracota text-sm"
              >
                <option value="">Todos</option>
                {municipios.map(mun => (
                  <option key={mun} value={mun}>{mun}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Desde
              </label>
              <input
                type="date"
                name="fechaInicio"
                value={filtros.fechaInicio}
                onChange={handleFiltroChange}
                className="w-full border border-gris/30 rounded px-3 py-2 focus:outline-none focus:border-terracota text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Hasta
              </label>
              <input
                type="date"
                name="fechaFin"
                value={filtros.fechaFin}
                onChange={handleFiltroChange}
                className="w-full border border-gris/30 rounded px-3 py-2 focus:outline-none focus:border-terracota text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-terracota text-lg">Cargando eventos...</p>
          </div>
        ) : eventos.length > 0 ? (
          <div className="space-y-4">
            {eventos.map((evento, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-6 border-l-4 border-terracota hover:shadow-lg transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Foto */}
                  {evento.imagen && (
                    <div className="md:col-span-1">
                      <img
                        src={evento.imagen}
                        alt={evento.nombre}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className={evento.imagen ? 'md:col-span-2' : 'md:col-span-3'}>
                    <h3 className="text-xl font-bold text-marron mb-2">
                      {evento.nombre}
                    </h3>
                    <p className="text-gris mb-4 text-sm">
                      {evento.descripcion}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gris">
                        <Calendar size={16} />
                        <span>
                          {new Date(evento.fecha).toLocaleDateString('es-CO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gris">
                        <span>⏰</span>
                        <span>{evento.horaInicio} - {evento.horaFin}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gris">
                        <MapPin size={16} />
                        <span>{evento.lugar}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gris">
                        <Users size={16} />
                        <span>{evento.detalles.publico ? 'Público' : 'Privado'}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-terracota/10 text-terracota px-3 py-1 rounded text-xs font-semibold">
                        {evento.categoria}
                      </span>
                      {evento.detalles.parqueo && (
                        <span className="bg-dorado/10 text-dorado px-3 py-1 rounded text-xs">
                          🅿️ Parqueo
                        </span>
                      )}
                      {evento.detalles.alimentacion.length > 0 && (
                        <span className="bg-terracota-dark/10 text-terracota-dark px-3 py-1 rounded text-xs">
                          🍽️ Incluye comida
                        </span>
                      )}
                      {evento.detalles.cobro && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-semibold">
                          💰 ${evento.detalles.precio}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botón */}
                <div className="mt-4 pt-4 border-t border-gris/20">
                  <a
                    href={evento.detalles.cobro ? evento.detalles.boleteria : '#'}
                    className="inline-block bg-terracota text-white px-6 py-2 rounded hover:bg-terracota-dark transition text-sm font-semibold"
                  >
                    {evento.detalles.cobro ? 'Comprar Entrada' : 'Ver Detalles'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gris text-lg">
              No hay eventos que coincidan con tus filtros
            </p>
          </div>
        )}
      </div>
    </div>
  );
}