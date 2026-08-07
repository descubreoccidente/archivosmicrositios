import React, { useState, useEffect } from 'react';
import { crearMicrositio, obtenerMicrositio } from '../services/firestore';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const CATEGORIAS_SUBCATEGORIAS = {
  'Hotel': ['Familiar', 'Bienestar/Holístico', 'Parejas', 'Rumba/Fiesta', 'Regenerativo', 'Eventos', 'Ecohotel', 'Boutique', 'Campestre/Finca'],
  'Gastronomía': ['Típica/Tradicional', 'Gourmet', 'Rápida', 'Vegetariana/Vegana', 'Cafetería', 'Repostería', 'Comida internacional', 'Parrilla', 'Nikkei'],
  'Tour operador': ['Tours de un día', 'Paquetes multidía', 'Aventura/Extremo', 'Cultural/Patrimonial', 'Ecoturismo'],
  'Ente territorial': ['Alcaldía', 'Secretaría de Turismo', 'Casa de Cultura', 'Oficina de Turismo'],
  'Institución': ['Caja de compensación', 'Cámara de comercio', 'Religiosa', 'Fundación', 'Adscrita a ministerio', 'Cooperativa', 'Corporación'],
  'Microempresa': ['Artesanías', 'Souvenirs', 'Productos agroalimentarios', 'Confecciones'],
  'Bares y pubs': ['Coctelería', 'Vinos', 'Música en vivo', 'Ambiente chill', 'Cerveza artesanal', 'Deportivo', 'Karaoke', 'Ambiente familiar'],
  'Recuperadora de residuos': ['Reciclaje', 'Compostaje', 'Educación ambiental'],
};

const CATEGORIAS = Object.keys(CATEGORIAS_SUBCATEGORIAS);

const MUNICIPIOS = [
  'Abriaquí', 'Anzá', 'Armenia', 'Buriticá', 'Caicedo', 'Cañasgordas',
  'Dabeiba', 'Ebéjico', 'Frontino', 'Giraldo', 'Heliconia', 'Liborina',
  'Olaya', 'Peque', 'Sabanalarga', 'San Jerónimo', 'Santa Fe de Antioquia',
  'Sopetrán', 'Uramita'
];

export default function FormularioMicrositio({ actorId, onSave }) {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    subcategoria: '',
    municipio: '',
    telefono: '',
    email: '',
    paginaWeb: '',
    descripcion: '',
    logo: '',
    ubicacion: { lat: '', lng: '' }
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
        setFormData(prev => ({ ...prev, ...actorDoc.data().basicInfo }));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'categoria') {
      setFormData(prev => ({ ...prev, categoria: value, subcategoria: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUbicacionChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      ubicacion: { ...prev.ubicacion, [name]: value }
    }));
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

  const subcategoriasDisponibles = formData.categoria ? CATEGORIAS_SUBCATEGORIAS[formData.categoria] : [];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 max-w-2xl">
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
              name="subcategoria"
              value={formData.subcategoria}
              onChange={handleChange}
              required
              disabled={!formData.categoria}
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota disabled:opacity-50 disabled:bg-gray-50"
            >
              <option value="">
                {formData.categoria ? 'Selecciona...' : 'Elige una categoría primero'}
              </option>
              {subcategoriasDisponibles.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
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
            {MUNICIPIOS.map(mun => (
              <option key={mun} value={mun}>{mun}</option>
            ))}
          </select>
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
            Página web <span className="text-gris font-normal">(opcional)</span>
          </label>
          <input
            type="url"
            name="paginaWeb"
            value={formData.paginaWeb}
            onChange={handleChange}
            className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
            placeholder="https://tunegocio.com"
          />
        </div>

        <div className="bg-crema p-4 rounded-lg">
          <label className="block text-sm font-semibold text-marron mb-2">
            Ubicación (coordenadas)
          </label>
          <p className="text-xs text-gris mb-3">
            Puedes obtener tus coordenadas buscando tu negocio en Google Maps, clic derecho sobre el punto exacto y copiar los números que aparecen primero.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="lat"
              value={formData.ubicacion.lat}
              onChange={handleUbicacionChange}
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
              placeholder="Latitud, ej: 6.5570"
            />
            <input
              type="text"
              name="lng"
              value={formData.ubicacion.lng}
              onChange={handleUbicacionChange}
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
              placeholder="Longitud, ej: -75.8353"
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