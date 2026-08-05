import React, { useState, useEffect } from 'react';
import { crearMicrositio, obtenerMicrositio } from '../services/firestore';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function FormularioMicrositio({ actorId, onSave }) {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    municipio: '',
    telefono: '',
    email: '',
    descripcion: '',
    logo: '',
    ubicacion: { lat: 0, lng: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [actorId]);

  const cargarDatos = async () => {
    try {
      const actorDoc = await getDoc(doc(db, 'actors', actorId));
      if (actorDoc.exists() && actorDoc.data().basicInfo) {
        setFormData(actorDoc.data().basicInfo);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crearMicrositio(actorId, formData);
      setSuccess(true);
      if (onSave) onSave();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error guardando:', error);
    }
    setLoading(false);
  };

  const categorias = [
    'Hotel',
    'Gastronomía',
    'Tour operador',
    'Ente territorial',
    'Institución',
    'Corporación',
    'Microempresa',
    'Bar lounge',
    'Pub-cervecería',
    'Recuperadora de residuos'
  ];

  const municipios = [
    'Santa Fe de Antioquia',
    'Caramanta',
    'Jericó',
    'Támesis',
    'Valdivia',
    'Yarumal',
    'Olaya',
    'Sopetrán',
    'Ebéjico'
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-terracota mb-6">Información del Micrositio</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-6 text-green-700">
          ✓ Información guardada correctamente
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-marron mb-2">
            Nombre del Negocio
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
            placeholder="Ej: Hotel Las Montañas"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-marron mb-2">
              Categoría
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
            >
              <option value="">Selecciona...</option>
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
              value={formData.municipio}
              onChange={handleChange}
              required
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
            >
              <option value="">Selecciona...</option>
              {municipios.map(mun => (
                <option key={mun} value={mun}>{mun}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-marron mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
              placeholder="+57 3XX XXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-marron mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-marron mb-2">
            Descripción (máx 500 caracteres)
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            maxLength={500}
            rows={4}
            className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota resize-none"
            placeholder="Cuéntanos sobre tu negocio..."
          />
          <p className="text-xs text-gris mt-1">
            {formData.descripcion.length}/500 caracteres
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Información'}
        </button>
      </div>
    </form>
  );
}