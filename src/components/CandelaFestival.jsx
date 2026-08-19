import React, { useState, useEffect } from 'react';
import {
  obtenerVotoUsuarioCandela, votarCandela, CANDELA_FECHA_LIMITE
} from '../services/firestore';
import { onAuthChange } from '../services/auth';
import ModalLoginVisitante from './modallogivisitante';
import { Calendar, MapPin, Instagram, CheckCircle, Trophy } from 'lucide-react';

const SEDES = [
  { nombre: 'Santa Fe de Antioquia', lat: 6.5564, lng: -75.8281 },
  { nombre: 'Sopetrán', lat: 6.5011, lng: -75.7439 },
  { nombre: 'San Jerónimo', lat: 6.4433, lng: -75.7256 },
];

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKPl_uqsLeMzIBOCITggJHHSyR_y90wyPKcFHwxy-hxmgqtoCA3UmPuHIUlsyIBTxQ/exec';

const COLORES_FESTIVAL = [
  { bg: 'bg-[#2AA876]', tag: 'bg-[#2AA876]/10 text-[#2AA876]' },
  { bg: 'bg-[#F5821F]', tag: 'bg-[#F5821F]/10 text-[#F5821F]' },
  { bg: 'bg-[#E2568C]', tag: 'bg-[#E2568C]/10 text-[#E2568C]' },
  { bg: 'bg-[#D6203C]', tag: 'bg-[#D6203C]/10 text-[#D6203C]' },
  { bg: 'bg-[#F4E01B]', tag: 'bg-[#F4E01B]/10 text-yellow-700' },
];

function slugParticipante(nombre, municipio) {
  return `${nombre}-${municipio}`
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function obtenerParticipantesDesdeSheet() {
  const res = await fetch(`${SCRIPT_URL}?sheet=Concursantes`);
  const data = await res.json();
  if (data.error) return [];
  return data.map((p, idx) => ({
    ...p,
    id: slugParticipante(p.nombre, p.municipio),
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

  const votacionCerrada = new Date() > CANDELA_FECHA_LIMITE;

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
    if (votacionCerrada || miVoto) return;
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
          href="https://www.instagram.com/candelafestivalgastronomico"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 mt-6 bg-white text-[#e2007a] font-semibold px-5 py-2.5 rounded-lg hover:bg-crema transition"
        >
          <Instagram size={18} /> Síguenos en Instagram
        </a>
      </div>

      {/* Sobre el festival */}
      <section className="max-w-4xl mx-auto px-6 py-14 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#c81d3f] mb-4">La fiesta de nuestra identidad gastronómica</h2>
        <p className="text-marron leading-relaxed">
          El Candela Festival es el evento anual de la Corporación de Turismo del Occidente de Antioquia dedicado a
          celebrar la identidad gastronómica del territorio. En sus cuatro versiones anteriores se realizó siempre en
          Santa Fe de Antioquia; este año se suman Sopetrán y San Jerónimo. Durante cinco días, el festival reúne
          agenda cultural, cocina ancestral y un concurso de experiencias gastronómicas en los locales inscritos,
          con el apoyo de la Cámara de Comercio de Medellín para Antioquia, las secretarías de desarrollo económico
          municipales y las instituciones del territorio. Candela Festival conecta la cultura culinaria, los insumos
          agrícolas y los saberes de siempre, para que el legado gastronómico del departamento se conserve y tenga
          relevo generacional.
        </p>
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

      {/* Concurso de experiencias gastronómicas */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-[#c81d3f] mb-2 text-center">
          Concurso de Experiencias Gastronómicas
        </h2>
        <p className="text-gris text-center mb-2">
          Vota por tu experiencia gastronómica favorita del Candela Festival 2026
        </p>
        <p className="text-xs text-gris text-center mb-10">
          {votacionCerrada
            ? 'La votación cerró el 4 de octubre.'
            : 'Votación abierta hasta el 4 de octubre de 2026 · Un voto por persona'}
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
                    {!votacionCerrada && (
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