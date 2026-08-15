import React, { useState, useEffect } from 'react';
import { guardarReporteSemanal, obtenerReporteSemanaActual, obtenerHistorialReportes, obtenerPromedioTerritorio } from '../services/firestore';
import { BarChart3, TrendingUp, Info, CheckCircle } from 'lucide-react';

const ACTIVIDADES_VISITANTE = [
  'Vacaciones/ocio', 'Trabajo', 'Nómada digital', 'Aventura', 'Deportes', 'Académico', 'Religioso'
];

const MOTIVOS_CONSULTA_PIT = [
  'Alojamiento', 'Tours', 'Gastronomía', 'Historia', 'Búsqueda de personas',
  'Transportes', 'Agenda', 'Promociones', 'Temas ambientales', 'Consultas oficiales'
];

const LABELS = {
  huespedesRecibidos: 'Huéspedes recibidos',
  diasSol: 'Visitantes de día de sol (piscina + almuerzo, sin hospedaje)',
  visitantesNacionales: 'Nacionales',
  visitantesExtranjeros: 'Extranjeros',
  actividadPrincipal: 'Motivo de viaje',
  totalComensales: 'Total comensales',
  eventosAtendidos: 'Eventos atendidos',
  clientesAtendidos: 'Clientes atendidos',
  cantidadMaterial: 'Material recolectado',
  unidadMaterial: 'Unidad',
  eventosAsistio: 'Eventos en los que participó',
  personasAsistieron: 'Personas en sus presentaciones',
  recorridosRealizados: 'Recorridos realizados',
  personasAsistentes: 'Personas asistentes a tours',
  municipiosImpactados: 'Municipios impactados',
  pasajerosAtendidos: 'Pasajeros atendidos',
  asistentes: 'Asistentes',
  eventosRealizados: 'Eventos realizados',
  totalAsistentes: 'Total asistentes a eventos',
  eventosAcademico: 'Eventos académicos',
  eventosSocial: 'Eventos sociales',
  eventosCorporativo: 'Eventos corporativos',
  eventosReligioso: 'Eventos religiosos',
  eventosDeportivo: 'Eventos deportivos',
  personasAtendidas: 'Personas atendidas',
  visitantesParques: 'Visitantes en parques/recreación',
  visitantesSedesAdmin: 'Visitantes sedes administrativas',
  asistentesEventosPropios: 'Asistentes a eventos propios',
  personasAtendidasSedes: 'Personas atendidas en sedes',
  nuevasEmpresasCreadas: 'Nuevas empresas creadas',
  numeroVisitantes: 'Número de visitantes',
};

const CONFIG_REPORTE = {
  'Alojamiento': {
    campos: [
      { name: 'huespedesRecibidos', type: 'number' },
      { name: 'diasSol', type: 'number' },
      { name: 'visitantesNacionales', type: 'number' },
      { name: 'visitantesExtranjeros', type: 'number' },
      { name: 'actividadPrincipal', type: 'select', options: ACTIVIDADES_VISITANTE },
    ]
  },
  'Gastronomía': {
    campos: [
      { name: 'totalComensales', type: 'number' },
      { name: 'eventosAtendidos', type: 'number' },
    ]
  },
  'Microempresa': {
    campos: [
      { name: 'clientesAtendidos', type: 'number' },
    ]
  },
  'Recuperadora de residuos': {
    campos: [
      { name: 'cantidadMaterial', type: 'number' },
      { name: 'unidadMaterial', type: 'select', options: ['kg', 'm³'] },
    ]
  },
  'Joyería en filigrana': {
    campos: [
      { name: 'clientesAtendidos', type: 'number' },
      { name: 'visitantesNacionales', type: 'number' },
      { name: 'visitantesExtranjeros', type: 'number' },
    ]
  },
  'Actor cultural': {
    campos: [
      { name: 'eventosAsistio', type: 'number' },
      { name: 'personasAsistieron', type: 'number' },
    ]
  },
  'Tour operador': {
    campos: [
      { name: 'recorridosRealizados', type: 'number' },
      { name: 'personasAsistentes', type: 'number' },
      { name: 'municipiosImpactados', type: 'number' },
    ]
  },
  'Transporte': {
    campos: [
      { name: 'pasajerosAtendidos', type: 'number' },
    ]
  },
  'Bares y pubs': {
    campos: [
      { name: 'asistentes', type: 'number' },
      { name: 'eventosRealizados', type: 'number' },
    ]
  },
  'Eventos': {
    campos: [
      { name: 'totalAsistentes', type: 'number' },
      { name: 'eventosAcademico', type: 'number' },
      { name: 'eventosSocial', type: 'number' },
      { name: 'eventosCorporativo', type: 'number' },
      { name: 'eventosReligioso', type: 'number' },
      { name: 'eventosDeportivo', type: 'number' },
    ]
  },
  'Comunicaciones': { campos: [{ name: 'personasAtendidas', type: 'number' }] },
  'Lavandería': { campos: [{ name: 'personasAtendidas', type: 'number' }] },
  'Cambio de moneda': { campos: [{ name: 'personasAtendidas', type: 'number' }] },
  'Otros': { campos: [{ name: 'personasAtendidas', type: 'number' }] },
};

const CONFIG_INSTITUCION = {
  'Caja de compensación': {
    campos: [
      { name: 'visitantesParques', type: 'number' },
      { name: 'visitantesSedesAdmin', type: 'number' },
      { name: 'asistentesEventosPropios', type: 'number' },
    ]
  },
  'Cámara de comercio': {
    campos: [
      { name: 'personasAtendidasSedes', type: 'number' },
      { name: 'asistentesEventosPropios', type: 'number' },
      { name: 'nuevasEmpresasCreadas', type: 'number' },
    ]
  },
  'Museo': {
    campos: [
      { name: 'numeroVisitantes', type: 'number' },
      { name: 'asistentesEventosPropios', type: 'number' },
    ]
  },
};

const INSTITUCION_SIN_REPORTE = ['Religiosa'];

function getConfig(categoria, subcategoria) {
  if (categoria === 'Institución') {
    if (INSTITUCION_SIN_REPORTE.includes(subcategoria)) return null;
    return CONFIG_INSTITUCION[subcategoria] || { campos: [{ name: 'personasAtendidas', type: 'number' }] };
  }
  return CONFIG_REPORTE[categoria] || null;
}

export default function MisDatosActor({ actorId, categoria, subcategoria }) {
  const [reporteActual, setReporteActual] = useState(null);
  const [promedio, setPromedio] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({});

  const esGrupoC = categoria === 'Ente territorial';
  const config = esGrupoC ? null : getConfig(categoria, subcategoria);
  const sinReporte = !esGrupoC && !config;

  useEffect(() => {
    if (!sinReporte) cargarDatos();
    else setLoading(false);
  }, [actorId, categoria, subcategoria]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const reporte = await obtenerReporteSemanaActual(actorId);
      setReporteActual(reporte);

      const campos = esGrupoC
        ? [{ name: 'visitantesNacionales' }, { name: 'visitantesExtranjeros' }, { name: 'actividadPrincipal' }]
        : config.campos;

      const inicial = {};
      campos.forEach(c => {
        inicial[c.name] = reporte?.[c.name] ?? '';
      });
      setFormData(inicial);

      const hist = await obtenerHistorialReportes(actorId);
      setHistorial(hist);

      const prom = await obtenerPromedioTerritorio(categoria, categoria === 'Institución' ? subcategoria : undefined);
      setPromedio(prom);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const datos = {};
      const campos = esGrupoC
        ? [{ name: 'visitantesNacionales', type: 'number' }, { name: 'visitantesExtranjeros', type: 'number' }, { name: 'actividadPrincipal', type: 'select' }]
        : config.campos;

      campos.forEach(c => {
        const valor = formData[c.name];
        datos[c.name] = c.type === 'number' ? (parseFloat(valor) || 0) : valor;
      });

      await guardarReporteSemanal(actorId, categoria, categoria === 'Institución' ? subcategoria : null, datos);
      setSuccess(true);
      setEditando(false);
      cargarDatos();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error guardando reporte:', error);
    }
    setGuardando(false);
  };

  if (loading) {
    return <p className="text-terracota text-sm">Cargando...</p>;
  }

  if (sinReporte) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-xl font-bold text-terracota mb-3">Mis Datos</h2>
        <p className="text-gris text-sm">
          Esta sección no aplica para tu categoría de actor. ¡Gracias por ser parte del territorio!
        </p>
      </div>
    );
  }

  const camposFormulario = esGrupoC
    ? [
        { name: 'visitantesNacionales', type: 'number' },
        { name: 'visitantesExtranjeros', type: 'number' },
        { name: 'actividadPrincipal', type: 'select', options: MOTIVOS_CONSULTA_PIT },
      ]
    : config.campos;

  const mostrarFormulario = !reporteActual || editando;

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-700">
          ✓ Reporte guardado correctamente
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="text-terracota" size={22} />
          <h2 className="text-xl font-bold text-terracota">Mis Datos — Reporte Semanal</h2>
        </div>
        <p className="text-sm text-gris mb-6">
          {esGrupoC
            ? 'Cuéntanos cuántas personas atendió el Punto de Información Turística (PIT) esta semana. Esta información ayuda al territorio a tomar mejores decisiones.'
            : 'Cuéntanos cómo te fue esta semana. Tus datos se usan de forma agregada y anónima para apoyar decisiones del territorio, y a cambio puedes ver el promedio de tu categoría.'}
        </p>

        {!mostrarFormulario && reporteActual && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">Ya reportaste esta semana</p>
              <div className="text-xs text-green-700 mt-1 space-y-0.5">
                {camposFormulario.map(c => (
                  reporteActual[c.name] !== undefined && reporteActual[c.name] !== '' && (
                    <p key={c.name}>{LABELS[c.name] || c.name}: {reporteActual[c.name]}</p>
                  )
                ))}
              </div>
              <button
                onClick={() => setEditando(true)}
                className="text-terracota text-xs font-semibold hover:underline mt-2"
              >
                Editar reporte
              </button>
            </div>
          </div>
        )}

        {mostrarFormulario && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {camposFormulario.map(campo => (
              <div key={campo.name}>
                <label className="block text-sm font-semibold text-marron mb-2">
                  {LABELS[campo.name] || campo.name}
                  {esGrupoC && campo.name === 'actividadPrincipal' ? ' (motivo de consulta más recurrente)' : ''}
                </label>
                {campo.type === 'select' ? (
                  <select
                    name={campo.name}
                    value={formData[campo.name] || ''}
                    onChange={handleChange}
                    className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                  >
                    <option value="">Selecciona...</option>
                    {campo.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    name={campo.name}
                    value={formData[campo.name] || ''}
                    onChange={handleChange}
                    min={campo.min ?? 0}
                    max={campo.max}
                    required
                    className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                    placeholder="0"
                  />
                )}
              </div>
            ))}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar Reporte'}
              </button>
              {editando && (
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="px-6 border border-gris/30 text-gris font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {promedio && (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-terracota" size={20} />
            <h3 className="text-lg font-bold text-terracota">Promedio del territorio esta semana</h3>
          </div>
          <p className="text-xs text-gris mb-4 flex items-start gap-1">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            Basado en {promedio.totalReportantes} actor{promedio.totalReportantes !== 1 ? 'es' : ''} de tu misma categoría que ya reportaron.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {Object.entries(promedio.promedios).map(([campo, valor]) => (
              <div key={campo} className="bg-crema rounded-lg p-4">
                <p className="text-2xl font-bold text-terracota">{valor}</p>
                <p className="text-xs text-gris mt-1">{LABELS[campo] || campo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {historial.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-lg font-bold text-terracota mb-4">Historial reciente</h3>
          <div className="space-y-2">
            {historial.map((rep) => (
              <div key={rep.id} className="border border-gris/20 rounded-lg p-3 text-sm">
                <p className="font-semibold text-marron mb-1">{rep.semana}</p>
                <p className="text-gris text-xs">
                  {camposFormulario
                    .filter(c => rep[c.name] !== undefined && rep[c.name] !== '')
                    .map(c => `${LABELS[c.name] || c.name}: ${rep[c.name]}`)
                    .join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}