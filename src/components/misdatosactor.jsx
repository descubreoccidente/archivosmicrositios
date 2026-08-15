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

const GRUPO_A = ['Alojamiento', 'Gastronomía', 'Tour operador', 'Bares y pubs', 'Eventos', 'Actor cultural', 'Joyería en filigrana', 'Microempresa', 'Institución'];
const GRUPO_B = ['Transporte', 'Lavandería', 'Cambio de moneda', 'Comunicaciones'];

export default function MisDatosActor({ actorId, categoria }) {
  const [reporteActual, setReporteActual] = useState(null);
  const [promedio, setPromedio] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editando, setEditando] = useState(false);

  const [formData, setFormData] = useState({
    visitantesNacionales: '',
    visitantesExtranjeros: '',
    nochesPromedio: '',
    actividadPrincipal: ''
  });

  const esGrupoA = GRUPO_A.includes(categoria);
  const esGrupoB = GRUPO_B.includes(categoria);
  const esGrupoC = categoria === 'Ente territorial';
  const sinReporte = categoria === 'Recuperadora de residuos' || (!esGrupoA && !esGrupoB && !esGrupoC);

  useEffect(() => {
    if (!sinReporte) cargarDatos();
    else setLoading(false);
  }, [actorId, categoria]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const reporte = await obtenerReporteSemanaActual(actorId);
      setReporteActual(reporte);
      if (reporte) {
        setFormData({
          visitantesNacionales: reporte.visitantesNacionales ?? '',
          visitantesExtranjeros: reporte.visitantesExtranjeros ?? '',
          nochesPromedio: reporte.nochesPromedio ?? '',
          actividadPrincipal: reporte.actividadPrincipal ?? ''
        });
      }
      const hist = await obtenerHistorialReportes(actorId);
      setHistorial(hist);
      const prom = await obtenerPromedioTerritorio(categoria);
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
      const nacionales = parseInt(formData.visitantesNacionales) || 0;
      const extranjeros = parseInt(formData.visitantesExtranjeros) || 0;

      const datos = {
        visitantesNacionales: nacionales,
        visitantesExtranjeros: extranjeros,
        totalVisitantes: nacionales + extranjeros
      };

      if (esGrupoA || esGrupoB || esGrupoC) {
        datos.actividadPrincipal = formData.actividadPrincipal;
      }
      if (categoria === 'Alojamiento' && formData.nochesPromedio) {
        datos.nochesPromedio = parseFloat(formData.nochesPromedio);
      }

      await guardarReporteSemanal(actorId, categoria, datos);
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

  const opcionesActividad = esGrupoC ? MOTIVOS_CONSULTA_PIT : ACTIVIDADES_VISITANTE;
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
              <p className="text-xs text-green-700 mt-1">
                {esGrupoC || esGrupoA
                  ? `Nacionales: ${reporteActual.visitantesNacionales} · Extranjeros: ${reporteActual.visitantesExtranjeros}`
                  : `Total atendidos: ${reporteActual.totalVisitantes}`}
                {reporteActual.nochesPromedio && ` · Noches promedio: ${reporteActual.nochesPromedio}`}
                {reporteActual.actividadPrincipal && ` · Actividad: ${reporteActual.actividadPrincipal}`}
              </p>
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
            {(esGrupoA || esGrupoC) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-marron mb-2">
                    {esGrupoC ? 'Nacionales atendidos en el PIT' : 'Visitantes nacionales'}
                  </label>
                  <input
                    type="number"
                    name="visitantesNacionales"
                    value={formData.visitantesNacionales}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-marron mb-2">
                    {esGrupoC ? 'Extranjeros atendidos en el PIT' : 'Visitantes extranjeros'}
                  </label>
                  <input
                    type="number"
                    name="visitantesExtranjeros"
                    value={formData.visitantesExtranjeros}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {esGrupoB && (
              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Personas atendidas esta semana
                </label>
                <input
                  type="number"
                  name="visitantesNacionales"
                  value={formData.visitantesNacionales}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                  placeholder="0"
                />
              </div>
            )}

            {categoria === 'Alojamiento' && (
              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Noches promedio de estadía
                </label>
                <input
                  type="number"
                  name="nochesPromedio"
                  value={formData.nochesPromedio}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                  placeholder="Ej: 2.5"
                />
              </div>
            )}

            {(esGrupoA || esGrupoB) && (
              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Motivo de viaje más frecuente esta semana
                </label>
                <select
                  name="actividadPrincipal"
                  value={formData.actividadPrincipal}
                  onChange={handleChange}
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                >
                  <option value="">Selecciona...</option>
                  {opcionesActividad.map(act => (
                    <option key={act} value={act}>{act}</option>
                  ))}
                </select>
              </div>
            )}

            {esGrupoC && (
              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Motivo de consulta más recurrente
                </label>
                <select
                  name="actividadPrincipal"
                  value={formData.actividadPrincipal}
                  onChange={handleChange}
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                >
                  <option value="">Selecciona...</option>
                  {opcionesActividad.map(act => (
                    <option key={act} value={act}>{act}</option>
                  ))}
                </select>
              </div>
            )}

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
            <div className="bg-crema rounded-lg p-4">
              <p className="text-2xl font-bold text-terracota">{promedio.promedioNacionales}</p>
              <p className="text-xs text-gris mt-1">Nacionales (prom.)</p>
            </div>
            <div className="bg-crema rounded-lg p-4">
              <p className="text-2xl font-bold text-terracota">{promedio.promedioExtranjeros}</p>
              <p className="text-xs text-gris mt-1">Extranjeros (prom.)</p>
            </div>
            {promedio.promedioNoches && (
              <div className="bg-crema rounded-lg p-4">
                <p className="text-2xl font-bold text-terracota">{promedio.promedioNoches}</p>
                <p className="text-xs text-gris mt-1">Noches (prom.)</p>
              </div>
            )}
          </div>
        </div>
      )}

      {historial.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-lg font-bold text-terracota mb-4">Historial reciente</h3>
          <div className="space-y-2">
            {historial.map((rep) => (
              <div key={rep.id} className="flex justify-between items-center border border-gris/20 rounded-lg p-3 text-sm">
                <span className="font-semibold text-marron">{rep.semana}</span>
                <span className="text-gris">
                  {rep.visitantesNacionales !== undefined && `Nac: ${rep.visitantesNacionales} · Ext: ${rep.visitantesExtranjeros}`}
                  {rep.actividadPrincipal && ` · ${rep.actividadPrincipal}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}