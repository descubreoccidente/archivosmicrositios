import React, { useState, useEffect } from 'react';
import { obtenerAgendaRegional, toggleAsistenciaEvento, obtenerAsistenciaEvento } from '../services/firestore';
import NavBar from './NavBar';
import { useSEO } from '../hooks/useSEO';
import { onAuthChange } from '../services/auth';
import ModalLoginVisitante from './modallogivisitante';
import { Calendar, MapPin, Users, Clock, X, ExternalLink } from 'lucide-react';

const CATEGORIAS_TIPOS = {
  'Cultural': ['Cine', 'Musical', 'Artes plásticas', 'Teatro', 'Artesanal', 'Danza', 'Literario'],
  'Normativo': ['Turismo', 'Agroalimentario', 'Municipal', 'Judicial', 'Salud'],
  'Formación': ['Taller', 'Curso', 'Capacitación', 'Seminario', 'Conferencia', 'Diplomado', 'Congreso', 'Simposio', 'Coloquio'],
  'Institucional': ['Empresarial', 'Caja de compensación', 'Acción comunal', 'JAL', 'Corporativo', 'Ente público nacional', 'Ente público municipal', 'Ente público regional', 'Cooperativo', 'Congreso', 'Feria', 'Show room', 'Comercial'],
  'Religioso': ['Católico romano', 'Cristiano/Evangélico', 'Judío', 'Islámico', 'Otro'],
  'Fiestas tradicionales': ['Municipal', 'Veredal', 'Regional'],
  'Otros': [],
};

const CATEGORIAS = Object.keys(CATEGORIAS_TIPOS);

const MUNICIPIOS = [
  'Abriaquí', 'Anzá', 'Armenia', 'Buriticá', 'Caicedo', 'Cañasgordas',
  'Dabeiba', 'Ebéjico', 'Frontino', 'Giraldo', 'Heliconia', 'Liborina',
  'Olaya', 'Peque', 'Sabanalarga', 'San Jerónimo', 'Santa Fe de Antioquia',
  'Sopetrán', 'Uramita'
];

function formatFecha(fecha) {
  if (!fecha) return '';
  const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
  return date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatFechaCorta(fecha) {
  if (!fecha) return '';
  const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

export default function AgendaRegional() {
  const [eventos, setEventos] = useState([]);
  const [todosEventos, setTodosEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [mostrarLoginVisitante, setMostrarLoginVisitante] = useState(false);
  const [asistencia, setAsistencia] = useState({ total: 0, yaAsiste: false });
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [filtros, setFiltros] = useState({
    categoria: '',
    tipo: '',
    municipio: '',
    actor: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0]
  });
useSEO(
    'Agenda Regional — Eventos del Occidente Antioqueño | Descubre Occidente',
    'Descubre todos los eventos culturales, religiosos, de formación y fiestas tradicionales del Occidente Antioqueño en un solo lugar.'
  );
  
  useEffect(() => {
    cargarEventos();
  }, [filtros]);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => setUsuario(user));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (eventoSeleccionado) {
      cargarAsistencia(eventoSeleccionado.id);
    }
  }, [eventoSeleccionado, usuario]);

  const cargarAsistencia = async (eventId) => {
    const data = await obtenerAsistenciaEvento(eventId, usuario?.uid);
    setAsistencia(data);
  };

  const handleAsistire = async (eventId) => {
    if (!usuario) {
      setAccionPendiente(() => () => handleAsistire(eventId));
      setMostrarLoginVisitante(true);
      return;
    }
    try {
      await toggleAsistenciaEvento(eventId, usuario.uid, {
        nombre: usuario.displayName,
        email: usuario.email
      });
      cargarAsistencia(eventId);
    } catch (error) {
      console.error('Error marcando asistencia:', error);
    }
  };

  const handleLoginExitoso = (user) => {
    setUsuario(user);
    setMostrarLoginVisitante(false);
    if (accionPendiente) {
      accionPendiente();
      setAccionPendiente(null);
    }
  };

  const cargarEventos = async () => {
    setLoading(true);
    try {
      const data = await obtenerAgendaRegional(filtros);
      let resultado = data;
      if (filtros.tipo) {
        resultado = resultado.filter(e => e.tipo === filtros.tipo);
      }
      if (filtros.actor) {
        resultado = resultado.filter(e => e.nombreNegocio === filtros.actor);
      }
      setEventos(resultado);
      if (!filtros.actor) setTodosEventos(data);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
    setLoading(false);
  };

  const actoresDisponibles = [...new Set(todosEventos.map(e => e.nombreNegocio).filter(Boolean))].sort();

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    if (name === 'categoria') {
      setFiltros(prev => ({ ...prev, categoria: value, tipo: '' }));
      return;
    }
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-crema">
      <NavBar />
      {/* Header */}
      <div className="bg-gradient-to-r from-terracota to-terracota-dark text-white py-12">
        <div className="max-w-6xl mx-auto px-8">
          <h1 className="flex items-center gap-3 text-4xl font-bold mb-2">
            <img src="/logo-teal.png" alt="" className="h-16 brightness-0 invert" /> Agenda Regional
          </h1>
          <p className="text-lg opacity-90">
            Descubre todos los eventos del Occidente Antioqueño
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gris/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Subcategoría
              </label>
              <select
                name="tipo"
                value={filtros.tipo}
                onChange={handleFiltroChange}
                disabled={!filtros.categoria}
                className="w-full border border-gris/30 rounded px-3 py-2 focus:outline-none focus:border-terracota text-sm disabled:opacity-50 disabled:bg-gray-50"
              >
                <option value="">Todas</option>
                {(filtros.categoria ? CATEGORIAS_TIPOS[filtros.categoria] : []).map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
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
                {MUNICIPIOS.map(mun => (
                  <option key={mun} value={mun}>{mun}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Actor
              </label>
              <select
                name="actor"
                value={filtros.actor}
                onChange={handleFiltroChange}
                className="w-full border border-gris/30 rounded px-3 py-2 focus:outline-none focus:border-terracota text-sm"
              >
                <option value="">Todos</option>
                {actoresDisponibles.map(nombre => (
                  <option key={nombre} value={nombre}>{nombre}</option>
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
            {eventos.map((evento) => (
              <button
                key={evento.id}
                onClick={() => setEventoSeleccionado(evento)}
                className="w-full text-left bg-white rounded-lg p-6 border-l-4 border-terracota hover:shadow-lg transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {evento.imagen && (
                    <div className="md:col-span-1">
                      <img
                        src={evento.imagen}
                        alt={evento.nombre}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className={evento.imagen ? 'md:col-span-2' : 'md:col-span-3'}>
                    <h3 className="text-xl font-bold text-marron mb-1">
                      {evento.nombre}
                    </h3>
                    {evento.nombreNegocio && (
                      <p className="text-sm text-terracota font-semibold mb-2">
                        Por {evento.nombreNegocio}
                      </p>
                    )}
                    {evento.descripcion && (
                      <p className="text-gris mb-4 text-sm line-clamp-2">
                        {evento.descripcion}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gris">
                        <Calendar size={16} />
                        <span>{formatFechaCorta(evento.fechaInicio || evento.fecha)}</span>
                      </div>

                      {(evento.horaInicio || evento.horaFin) && (
                        <div className="flex items-center gap-2 text-sm text-gris">
                          <Clock size={16} />
                          <span>{evento.horaInicio}{evento.horaFin ? ` - ${evento.horaFin}` : ''}</span>
                        </div>
                      )}

                      {(evento.lugar || evento.municipio) && (
                        <div className="flex items-center gap-2 text-sm text-gris">
                          <MapPin size={16} />
                          <span>{[evento.lugar, evento.municipio].filter(Boolean).join(', ')}</span>
                        </div>
                      )}

                      {evento.modalidad && (
                        <div className="flex items-center gap-2 text-sm text-gris">
                          <Users size={16} />
                          <span>{evento.modalidad}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {evento.categoria && (
                        <span className="bg-terracota/10 text-terracota px-3 py-1 rounded text-xs font-semibold">
                          {evento.categoria}{evento.tipo ? ` · ${evento.tipo}` : ''}
                        </span>
                      )}
                      {evento.parqueo && (
                        <span className="bg-gray-100 text-gris px-3 py-1 rounded text-xs">
                          🅿️ Parqueo
                        </span>
                      )}
                      {evento.alimentacion && evento.alimentacion.length > 0 && (
                        <span className="bg-gray-100 text-gris px-3 py-1 rounded text-xs">
                          🍽️ Incluye alimentación
                        </span>
                      )}
                      {evento.cobro && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-semibold">
                          💰 ${evento.precio ? evento.precio.toLocaleString() : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
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

      {mostrarLoginVisitante && (
        <ModalLoginVisitante
          onClose={() => setMostrarLoginVisitante(false)}
          onSuccess={handleLoginExitoso}
        />
      )}

      {/* Modal de detalle */}
      {eventoSeleccionado && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setEventoSeleccionado(null)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {eventoSeleccionado.imagen && (
              <img src={eventoSeleccionado.imagen} alt={eventoSeleccionado.nombre} className="w-full h-48 object-cover rounded-t-lg" />
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-terracota">{eventoSeleccionado.nombre}</h3>
                  {eventoSeleccionado.nombreNegocio && (
                    <p className="text-sm text-gris">Por {eventoSeleccionado.nombreNegocio}</p>
                  )}
                </div>
                <button onClick={() => setEventoSeleccionado(null)} className="text-gris hover:text-terracota p-1">
                  <X size={22} />
                </button>
              </div>

              {(eventoSeleccionado.categoria || eventoSeleccionado.tipo) && (
                <span className="inline-block bg-crema text-terracota px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  {eventoSeleccionado.categoria}{eventoSeleccionado.tipo ? ` · ${eventoSeleccionado.tipo}` : ''}
                </span>
              )}

              {eventoSeleccionado.descripcion && (
                <p className="text-marron text-sm mb-4">{eventoSeleccionado.descripcion}</p>
              )}

              <div className="space-y-2 text-sm text-marron">
                <p className="flex items-center gap-2">
                  <Calendar size={16} className="text-terracota" />
                  {formatFecha(eventoSeleccionado.fechaInicio || eventoSeleccionado.fecha)}
                  {eventoSeleccionado.fechaFin && eventoSeleccionado.fechaFin !== eventoSeleccionado.fechaInicio &&
                    ` — ${formatFecha(eventoSeleccionado.fechaFin)}`}
                </p>
                {(eventoSeleccionado.horaInicio || eventoSeleccionado.horaFin) && (
                  <p className="flex items-center gap-2">
                    <Clock size={16} className="text-terracota" />
                    {eventoSeleccionado.horaInicio}{eventoSeleccionado.horaFin ? ` - ${eventoSeleccionado.horaFin}` : ''}
                  </p>
                )}
                {(eventoSeleccionado.lugar || eventoSeleccionado.municipio) && (
                  <p className="flex items-center gap-2">
                    <MapPin size={16} className="text-terracota" />
                    {[eventoSeleccionado.lugar, eventoSeleccionado.municipio].filter(Boolean).join(', ')}
                  </p>
                )}
                {eventoSeleccionado.modalidad && (
                  <p className="flex items-center gap-2">
                    <Users size={16} className="text-terracota" />
                    {eventoSeleccionado.modalidad}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleAsistire(eventoSeleccionado.id)}
                className={`mt-4 w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-lg transition ${
                  asistencia.yaAsiste
                    ? 'bg-green-100 text-green-700 border-2 border-green-400'
                    : 'border-2 border-terracota text-terracota hover:bg-crema'
                }`}
              >
                {asistencia.yaAsiste ? '✓ Asistiré' : 'Asistiré'} {asistencia.total > 0 && `· ${asistencia.total} interesados`}
              </button>

              <div className="space-y-2 text-sm text-marron mt-4">
                {eventoSeleccionado.cobro && (
                  <p className="flex items-center gap-2 font-semibold">
                    💰 ${eventoSeleccionado.precio ? eventoSeleccionado.precio.toLocaleString() : ''} COP
                  </p>
                )}
              </div>

              {eventoSeleccionado.ubicacion?.lat && eventoSeleccionado.ubicacion?.lng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${eventoSeleccionado.ubicacion.lat},${eventoSeleccionado.ubicacion.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-terracota text-terracota font-semibold py-2.5 rounded-lg hover:bg-crema transition text-sm"
                >
                  <MapPin size={16} /> Cómo llegar
                </a>
              )}
              {eventoSeleccionado.requiereInscripcion && eventoSeleccionado.linkInscripcion && (
                <a
                  href={eventoSeleccionado.linkInscripcion}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition"
                >
                  Inscribirme <ExternalLink size={16} />
                </a>
              )}
              {eventoSeleccionado.cobro && eventoSeleccionado.boleteria && (
                <a
                  href={eventoSeleccionado.boleteria}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
                >
                  Comprar entrada <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}