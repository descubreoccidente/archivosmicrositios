import React, { useState, useEffect } from 'react';
import { guardarSostenibilidad } from '../services/firestore';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Leaf, CheckCircle } from 'lucide-react';

const CRITERIOS = [
  { id: 'agua', pilar: 'Ambiental', texto: 'Uso eficiente de agua (revisión de fugas, dispositivos economizadores)' },
  { id: 'energia', pilar: 'Ambiental', texto: 'Uso eficiente de energía (bombillos LED, apagado de equipos no usados)' },
  { id: 'residuos', pilar: 'Ambiental', texto: 'Separación de residuos en la fuente (reciclaje)' },
  { id: 'plasticos', pilar: 'Ambiental', texto: 'Reducción de plásticos de un solo uso' },
  { id: 'fauna', pilar: 'Ambiental', texto: 'No usa flora/fauna silvestre como decoración o alimento' },

  { id: 'personalLocal', pilar: 'Sociocultural', texto: 'Contrata personal local del territorio' },
  { id: 'culturaLocal', pilar: 'Sociocultural', texto: 'Promueve y respeta la cultura/tradiciones locales' },
  { id: 'capacitacion', pilar: 'Sociocultural', texto: 'Capacita a su personal en atención al turista' },
  { id: 'proteccionNNA', pilar: 'Sociocultural', texto: 'Cuenta con protocolo de prevención de explotación sexual de NNA' },
  { id: 'accesibilidad', pilar: 'Sociocultural', texto: 'Ofrece condiciones de accesibilidad para personas con discapacidad' },

  { id: 'proveedoresLocales', pilar: 'Económico', texto: 'Compra insumos/productos a proveedores locales' },
  { id: 'promocionActores', pilar: 'Económico', texto: 'Promueve otros actores turísticos del territorio' },
  { id: 'preciosJustos', pilar: 'Económico', texto: 'Maneja precios justos y transparentes' },
  { id: 'politicaSostenibilidad', pilar: 'Económico', texto: 'Cuenta con una política o compromiso de sostenibilidad' },
  { id: 'reinversion', pilar: 'Económico', texto: 'Reinvierte parte de sus ingresos en mejoras de sostenibilidad' },
];

const PILARES = ['Ambiental', 'Sociocultural', 'Económico'];
const UMBRAL_INSIGNIA = 0.8;

export default function TurismoResponsable({ actorId }) {
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [actorId]);

  const cargarDatos = async () => {
    try {
      const actorDoc = await getDoc(doc(db, 'actors', actorId));
      if (actorDoc.exists() && actorDoc.data().sostenibilidad) {
        const { actualizadoEn, ...items } = actorDoc.data().sostenibilidad;
        setRespuestas(items);
      }
    } catch (error) {
      console.error('Error cargando sostenibilidad:', error);
    }
  };

  const toggleCriterio = (id) => {
    setRespuestas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalMarcados = CRITERIOS.filter(c => respuestas[c.id]).length;
  const porcentaje = Math.round((totalMarcados / CRITERIOS.length) * 100);
  const tieneInsignia = totalMarcados / CRITERIOS.length >= UMBRAL_INSIGNIA;

  const handleGuardar = async () => {
    setLoading(true);
    try {
      await guardarSostenibilidad(actorId, {
        ...respuestas,
        totalMarcados,
        porcentaje,
        insignia: tieneInsignia
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error guardando:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-terracota">Turismo Ambientalmente Responsable</h2>
        {tieneInsignia && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-300 text-green-700 px-4 py-2 rounded-full font-semibold">
            <Leaf size={20} />
            Hoja Verde
          </div>
        )}
      </div>
      <p className="text-gris text-sm mb-6">
        Marca las prácticas que ya implementas en tu negocio. Al alcanzar el 80% obtienes la insignia "Hoja Verde", visible en tu micrositio público.
      </p>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-6 text-green-700">
          ✓ Autoevaluación guardada correctamente
        </div>
      )}

      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-semibold text-marron mb-1">
          <span>{totalMarcados} de {CRITERIOS.length} prácticas</span>
          <span>{porcentaje}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${tieneInsignia ? 'bg-green-500' : 'bg-terracota'}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {PILARES.map(pilar => (
        <div key={pilar} className="mb-8">
          <h3 className="text-lg font-bold text-marron mb-3">{pilar}</h3>
          <div className="space-y-3">
            {CRITERIOS.filter(c => c.pilar === pilar).map(criterio => (
              <label
                key={criterio.id}
                className="flex items-start gap-3 cursor-pointer bg-crema/50 hover:bg-crema p-3 rounded-lg transition"
              >
                <input
                  type="checkbox"
                  checked={!!respuestas[criterio.id]}
                  onChange={() => toggleCriterio(criterio.id)}
                  className="mt-1"
                />
                <span className="text-sm text-marron flex-1">{criterio.texto}</span>
                {respuestas[criterio.id] && <CheckCircle size={18} className="text-green-600 flex-shrink-0" />}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleGuardar}
        disabled={loading}
        className="w-full bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar Autoevaluación'}
      </button>
    </div>
  );
}