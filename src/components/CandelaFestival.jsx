import React, { useState, useEffect } from 'react';
import {
  obtenerVotoUsuarioCandela, votarCandela, CANDELA_FECHA_INICIO, CANDELA_FECHA_LIMITE
} from '../services/firestore';
import { onAuthChange } from '../services/auth';
import ModalLoginVisitante from './modallogivisitante';
import { Calendar, MapPin, Instagram, CheckCircle, Trophy } from 'lucide-react';
import NavBar from './NavBar';
import { obtenerParticipantesCandelaSheet } from '../services/candela';

const SEDES = [
  { nombre: 'Santa Fe de Antioquia', lat: 6.5564, lng: -75.8281 },
  { nombre: 'Sopetrán', lat: 6.5011, lng: -75.7439 },
  { nombre: 'San Jerónimo', lat: 6.4433, lng: -75.7256 },
];

const ALIADOS = [
  { nombre: 'Alcaldía de Santa Fe de Antioquia', archivo: 'alcaldia-santa-fe-de-antioquia.png' },
  { nombre: 'Cámara de Comercio de Medellín para Antioquia', archivo: 'camara-logo.png' },
  { nombre: 'Comfama', archivo: 'comfama.png' },
  { nombre: 'Comfenalco', archivo: 'comfenalco-logo.png' },
  { nombre: 'Eventos Antioquia', archivo: 'eventosantioquia-logo.png' },
  { nombre: 'SENA', archivo: 'logo-Sena.png' },
  { nombre: 'Marca Ciudad', archivo: 'marca-ciudad.png' },
  { nombre: 'Museo', archivo: 'museo-jc-logo.png' },
  { nombre: 'Provincia Agroindustrial del Occidente Antioqueño', archivo: 'provinciaagro-logo.png' },
  { nombre: 'Provincia Turística y Agroecológica del Occidente Antioqueño', archivo: 'provinciaagrotur-logo.png' },
];

const COLORES_FESTIVAL = [
  { bg: 'bg-[#2AA876]', tag: 'bg-[#2AA876]/10 text-[#2AA876]' },
  { bg: 'bg-[#F5821F]', tag: 'bg-[#F5821F]/10 text-[#F5821F]' },
  { bg: 'bg-[#E2568C]', tag: 'bg-[#E2568C]/10 text-[#E2568C]' },
  { bg: 'bg-[#D6203C]', tag: 'bg-[#D6203C]/10 text-[#D6203C]' },
  { bg: 'bg-[#F4E01B]', tag: 'bg-[#F4E01B]/10 text-yellow-700' },
];

async function obtenerParticipantesDesdeSheet() {
  const data = await obtenerParticipantesCandelaSheet();
  return data.map((p, idx) => ({
    ...p,
    color: COLORES_FESTIVAL[idx % COLORES_FESTIVAL.length]
  }));
}

export default function CandelaFestival() {
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [miVoto, setMiVoto] = useState(null);
  const [mostrarLoginVisitante, setMostrarLoginVisitante] = useState(false);
  const [participantePendiente, setParticipantePendiente] = useState(null);
  const [votando, setVotando] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const ahora = new Date();
  const votacionNoIniciada = ahora < CANDELA_FECHA_INICIO;
  const votacionCerrada = ahora > CANDELA_FECHA_LIMITE;
  const votacionAbierta = !votacionNoIniciada && !votacionCerrada;

  useEffect(() => {
    cargarParticipantes();
    const unsubscribe = onAuthChange((user) => setUsuario(user));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (usuario) {
      obtenerVotoUsuarioCandela(usuario.uid).then(setMiVoto);
    } else {
      setMiVoto(null);
    }
  }, [usuario]);

  const cargarParticipantes = async () => {
    setLoading(true);
    try {
      const data = await obtenerParticipantesDesdeSheet();
      setParticipantes(data);
    } catch (error) {
      console.error('Error cargando participantes:', error);
    }
    setLoading(false);
  };

  const iniciarVoto = (participanteId) => {
    if (!votacionAbierta || miVoto) return;
    if (!usuario) {
      setParticipantePendiente(participanteId);
      setMostrarLoginVisitante(true);
      return;
    }
    confirmarVoto(participanteId, usuario);
  };

  const confirmarVoto = async (participanteId, usuarioActivo) => {
    setVotando(true);
    setError(null);
    try {
      await votarCandela(participanteId, usuarioActivo.uid, usuarioActivo.displayName || 'Visitante');
      setMiVoto({ participanteId });
    } catch (err) {
      setError(err.message || 'No pudimos registrar tu voto. Intenta de nuevo.');
    }
    setVotando(false);
  };

  const handleLoginExitoso = (user) => {
    setUsuario(user);
    setMostrarLoginVisitante(false);
    if (participantePendiente) {
      confirmarVoto(participantePendiente, user);
      setParticipantePendiente(null);
    }
  };

  const participantesFiltrados = participantes.filter(p =>
    !busqueda || p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.municipio?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const ganador = votacionCerrada && participantes.length > 0
    ? [...participantes].sort((a, b) => b.votos - a.votos)[0]
    : null;

  return (
    <div className="min-h-screen bg-crema">
      <NavBar />
      {/* Hero */}
      <div
        className="relative py-20 px-6 text-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/candela-fondo.png')" }}
      >
        <img src="/candela-logo.png" alt="Candela Festival" className="h-56 md:h-80 mx-auto drop-shadow-2xl" />
        <p className="text-white text-lg md:text-xl font-semibold mt-2">Festival Gastronómico del Occidente Antioqueño</p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-white">
          <span className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full text-sm font-semibold">
            <Calendar size={16} /> 30 de septiembre — 4 de octubre, 2026
          </span>
          <span className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full text-sm font-semibold">
            <MapPin size={16} /> Santa Fe de Antioquia · Sopetrán · San Jerónimo
          </span>
        </div>

        <a
          href="#concurso"
          className="inline-flex items-center gap-2 bg-white text-[#c81d3f] font-bold px-8 py-3.5 rounded-lg hover:bg-crema transition text-lg mt-6 shadow-lg"
        >
          🏆 Vota ya por tu favorito
        </a>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <a
            href="https://www.instagram.com/candelafestivalgastronomico"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#e2007a] font-semibold px-5 py-2.5 rounded-lg hover:bg-crema transition"
          >
            <Instagram size={18} /> Síguenos en Instagram
          </a>
          <a
            href="https://drive.google.com/PENDIENTE-reemplazar-cuando-este-lista"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-yellow-400 text-[#c81d3f] font-bold px-5 py-2.5 rounded-lg hover:bg-yellow-300 transition"
          >
            <Calendar size={18} /> Ver programación completa
          </a>
        </div>
      </div>

      {/* Sobre el festival */}
      <section className="max-w-4xl mx-auto px-6 py-14 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#c81d3f] mb-4">La fiesta de nuestra identidad gastronómica</h2>
        <p className="text-marron leading-relaxed mb-4">
          El Candela Festival es el evento anual de la Corporación de Turismo del Occidente de Antioquia dedicado a
          celebrar la identidad gastronómica del territorio. En sus cuatro versiones anteriores se realizó siempre en
          Santa Fe de Antioquia; este año se suman Sopetrán y San Jerónimo. Durante cinco días, el festival reúne
          agenda cultural, cocina ancestral y un concurso de experiencias gastronómicas en los comercios inscritos,
          con el apoyo de la Cámara de Comercio de Medellín para Antioquia, las secretarías de desarrollo económico
          municipales y las instituciones del territorio. Candela Festival conecta la cultura culinaria, los insumos
          agrícolas y los saberes de siempre, para que el legado gastronómico del departamento se conserve y tenga
          relevo generacional.
        </p>
        <p className="text-marron leading-relaxed font-semibold">
          ¡Llega Candela Festival 2026! La gran vitrina gastronómica del Occidente de Antioquia sigue creciendo. Gracias
          a la integración con la plataforma Descubre Occidente, el festival contará con un micrositio oficial, mapa
          interactivo, formulario de votación y una estrategia de difusión en redes sociales que permitirá llegar a
          miles de potenciales visitantes.
        </p>
      </section>

      {/* Inscripción al concurso */}
      <section className="py-14" style={{ backgroundColor: '#c81d3f' }}>
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">¿Tienes un restaurante, café o bar?</h2>
          <p className="text-white/90 mb-6">
            Inscribe tu establecimiento y sé parte del Concurso de Experiencias Gastronómicas 2026 — sin ningún costo.
          </p>

          <div className="bg-white/10 rounded-lg p-4 mb-8 inline-flex items-center gap-2">
            <Calendar size={18} />
            <span className="font-semibold">Cierre de inscripciones: 10 de septiembre de 2026</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
            {[
              'Acompañamiento profesional',
              'Presencia en el micrositio oficial y en redes sociales del evento',
              'Identificador oficial para tu restaurante, café, panadería, repostería, bar o pub',
              'Inclusión en el formulario de votación y en el mapa interactivo de Descubre Occidente',
            ].map((beneficio, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white/10 rounded-lg p-3">
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5 text-yellow-300" />
                <span className="text-sm">{beneficio}</span>
              </div>
            ))}
          </div>

          <a
            href="https://forms.gle/Wi5NTMxNbUWa2V649"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-yellow-400 text-[#c81d3f] font-bold px-8 py-4 rounded-lg hover:bg-yellow-300 transition text-lg"
          >
            Inscribe tu establecimiento aquí →
          </a>
          <p className="text-white/70 text-xs mt-3">Todo sin costo, gracias al apoyo de las instituciones vinculadas.</p>
        </div>
      </section>

      {/* Paquetes de experiencia */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-[#c81d3f] mb-2 text-center">¿Qué experiencia ofrecerás?</h2>
        <p className="text-gris text-center mb-10">Precios de referencia para la experiencia de 2 personas</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              titulo: 'Restaurantes',
              precio: '$119.900',
              color: '#D6203C',
              items: ['1 entrada para compartir', '2 platos fuertes', '1 postre para compartir', '2 bebidas'],
            },
            {
              titulo: 'Cafés, cacao y reposterías',
              precio: '$39.900',
              color: '#F5821F',
              items: ['2 bebidas', '2 experiencias reposteras'],
            },
            {
              titulo: 'Bares y pubs',
              precio: '$69.900',
              color: '#E2568C',
              items: ['1 experiencia de bebidas para compartir', 'Maridaje para compartir'],
            },
          ].map((paquete) => (
            <div key={paquete.titulo} className="bg-white rounded-lg shadow-md overflow-hidden border-t-4" style={{ borderColor: paquete.color }}>
              <div className="p-6">
                <h3 className="font-bold text-marron text-lg mb-1">{paquete.titulo}</h3>
                <p className="text-2xl font-extrabold mb-1" style={{ color: paquete.color }}>{paquete.precio}</p>
                <p className="text-xs text-gris mb-4">Experiencia para 2 personas</p>
                <ul className="space-y-2">
                  {paquete.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-marron">
                      <span style={{ color: paquete.color }}>●</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sedes en mapa */}
      <section className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#c81d3f] mb-6 text-center">Municipios sede</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SEDES.map((sede) => (
              <div key={sede.nombre} className="bg-crema rounded-lg p-6 text-center border-t-4" style={{ borderColor: '#f26631' }}>
                <MapPin size={24} className="mx-auto mb-2" style={{ color: '#f26631' }} />
                <p className="font-bold text-marron">{sede.nombre}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gris mt-4">
            Encuentra la ubicación exacta de cada evento y concursante en el{' '}
            <a href="/#explorar" className="text-terracota underline">mapa del territorio</a>.
          </p>
        </div>
      </section>

      {/* Aliados y patrocinadores */}
      <section className="bg-crema py-14">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#c81d3f] mb-10 text-center">Aliados y Patrocinadores</h2>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
            {ALIADOS.map((aliado) => (
              aliado.pareja ? (
                <div key={aliado.archivo} className="flex items-center">
                  <img
                    src={`/aliados/${aliado.archivo}`}
                    alt={aliado.nombre}
                    className="max-h-14 md:max-h-20 max-w-[100px] md:max-w-[140px] w-auto h-auto object-contain"
                  />
                  <img
                    src={`/aliados/${aliado.pareja}`}
                    alt="Cajas de Compensación Familiar"
                    className="max-h-14 md:max-h-20 max-w-[100px] md:max-w-[140px] w-auto h-auto object-contain -ml-1"
                  />
                </div>
              ) : (
                <div key={aliado.archivo} className="h-14 w-24 md:h-20 md:w-36 flex items-center justify-center">
                  <img
                    src={`/aliados/${aliado.archivo}`}
                    alt={aliado.nombre}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Concurso de experiencias gastronómicas */}
      <section id="concurso" className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-[#c81d3f] mb-2 text-center">
          Concurso de Experiencias Gastronómicas
        </h2>
        <p className="text-gris text-center mb-2">
          Vota por tu experiencia gastronómica favorita del Candela Festival 2026
        </p>
        <p className="text-xs text-gris text-center mb-10">
          {votacionNoIniciada
            ? 'La votación abre el 30 de septiembre a las 7:00 PM.'
            : votacionCerrada
              ? 'La votación cerró el 4 de octubre a las 10:00 PM.'
              : 'Votación abierta hasta el 4 de octubre de 2026, 10:00 PM · Un voto por persona'}
        </p>

        {votacionCerrada && ganador && (
          <div className="max-w-md mx-auto mb-10 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 text-center">
            <Trophy size={32} className="mx-auto text-yellow-600 mb-2" />
            <p className="font-bold text-marron text-lg">{ganador.nombre}</p>
            <p className="text-sm text-gris">{ganador.negocio}</p>
            <p className="text-xs text-gris mt-2">Ganador del Concurso de Experiencias Gastronómicas 2026</p>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {miVoto && !votacionCerrada && (
          <div className="max-w-md mx-auto mb-6 bg-green-50 border border-green-200 rounded p-3 text-green-700 text-sm text-center flex items-center justify-center gap-2">
            <CheckCircle size={16} /> Ya registraste tu voto. ¡Gracias por participar!
          </div>
        )}

        {!loading && participantes.length > 0 && (
          <div className="max-w-md mx-auto mb-8">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Busca por nombre o municipio..."
              className="w-full border border-gris/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-terracota"
            />
          </div>
        )}

        {loading ? (
          <p className="text-center text-terracota">Cargando participantes...</p>
        ) : participantes.length === 0 ? (
          <p className="text-center text-gris">Los participantes se publicarán próximamente.</p>
        ) : participantesFiltrados.length === 0 ? (
          <p className="text-center text-gris">No encontramos ningún participante con ese nombre.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
            {participantesFiltrados.map((p) => {
              const esMiVoto = miVoto?.participanteId === p.id;
              const tieneCoordenadas = p.lat && p.lng && !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng));
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-lg overflow-hidden shadow-md border-2 ${esMiVoto ? 'border-yellow-400' : 'border-transparent'}`}
                >
                  <div className="aspect-square bg-gray-100">
                    {p.foto ? (
                      <img src={p.foto} alt={p.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-3xl font-bold text-white ${p.color.bg}`}>
                        {p.nombre?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-2 md:p-3">
                    <p className="font-bold text-marron text-xs md:text-sm leading-snug">{p.nombre}</p>
                    {p.negocio && <p className="text-[10px] md:text-xs text-gris">{p.negocio}</p>}
                    {p.municipio && (
                      <p className="flex items-center gap-1 text-[10px] md:text-xs text-gris mt-1">
                        <MapPin size={10} /> {p.municipio}
                      </p>
                    )}
                    {tieneCoordenadas && (
                      <a
                        href={`/?lat=${p.lat}&lng=${p.lng}&nombre=${encodeURIComponent(p.nombre)}#mapa-territorio`}
                        className="flex items-center justify-center gap-1 w-full mt-1.5 text-[10px] md:text-xs font-semibold py-1 rounded border border-[#f26631] text-[#f26631] hover:bg-[#f26631]/10 transition"
                      >
                        <MapPin size={10} /> Cómo llegar
                      </a>
                    )}
                    {votacionAbierta && (
                      <button
                        onClick={() => iniciarVoto(p.id)}
                        disabled={votando || !!miVoto}
                        className={`w-full mt-2 text-xs md:text-sm font-semibold py-1.5 md:py-2 rounded-lg transition ${
                          esMiVoto
                            ? 'bg-yellow-400 text-marron'
                            : miVoto
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : `text-white hover:opacity-90 ${p.color.bg}`
                        }`}
                      >
                        {esMiVoto ? '✓ Tu voto' : 'Votar'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {mostrarLoginVisitante && (
        <ModalLoginVisitante
          onClose={() => setMostrarLoginVisitante(false)}
          onSuccess={handleLoginExitoso}
        />
      )}
    </div>
  );
}