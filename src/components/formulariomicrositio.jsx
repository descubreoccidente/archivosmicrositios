import React, { useState, useEffect } from 'react';
import { crearMicrositio, generarSlugUnico } from '../services/firestore';
import { db, storage } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, Trash2, Plus, X, Facebook, Instagram, Youtube, MessageCircle, Music2, Link as LinkIcon } from 'lucide-react';

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
const CATEGORIAS_CON_ENLACES = ['Institución', 'Ente territorial'];

const MUNICIPIOS = [
  'Abriaquí', 'Anzá', 'Armenia', 'Buriticá', 'Caicedo', 'Cañasgordas',
  'Dabeiba', 'Ebéjico', 'Frontino', 'Giraldo', 'Heliconia', 'Liborina',
  'Olaya', 'Peque', 'Sabanalarga', 'San Jerónimo', 'Santa Fe de Antioquia',
  'Sopetrán', 'Uramita'
];

const RED_ICONOS = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
  tiktok: Music2,
  youtube: Youtube,
};

const RED_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp (número o link)',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

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
    rntVigente: false,
    numeroRnt: '',
    enlacesInteres: [],
    redesSociales: { facebook: '', instagram: '', whatsapp: '', tiktok: '', youtube: '' },
    ubicacion: { lat: '', lng: '' }
  });
  const [loading, setLoading] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [actorId]);

  const cargarDatos = async () => {
    try {
      const actorDoc = await getDoc(doc(db, 'actors', actorId));
      if (actorDoc.exists() && actorDoc.data().basicInfo) {
        setFormData(prev => ({
          ...prev,
          ...actorDoc.data().basicInfo,
          redesSociales: { ...prev.redesSociales, ...(actorDoc.data().basicInfo.redesSociales || {}) },
          enlacesInteres: actorDoc.data().basicInfo.enlacesInteres || []
        }));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'categoria') {
      setFormData(prev => ({ ...prev, categoria: value, subcategoria: '' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUbicacionChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      ubicacion: { ...prev.ubicacion, [name]: value }
    }));
  };

  const handleRedSocialChange = (red, value) => {
    setFormData(prev => ({
      ...prev,
      redesSociales: { ...prev.redesSociales, [red]: value }
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendoLogo(true);
    try {
      const storageRef = ref(storage, `actors/${actorId}/logo/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, logo: url }));
    } catch (error) {
      console.error('Error subiendo logo:', error);
    }
    setSubiendoLogo(false);
  };

  const agregarEnlace = () => {
    if (formData.enlacesInteres.length >= 5) return;
    setFormData(prev => ({
      ...prev,
      enlacesInteres: [...prev.enlacesInteres, { etiqueta: '', url: '' }]
    }));
  };

  const actualizarEnlace = (idx, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      enlacesInteres: prev.enlacesInteres.map((en, i) => i === idx ? { ...en, [campo]: valor } : en)
    }));
  };

  const eliminarEnlace = (idx) => {
    setFormData(prev => ({
      ...prev,
      enlacesInteres: prev.enlacesInteres.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slug = await generarSlugUnico(formData.nombre, actorId);
      await crearMicrositio(actorId, { ...formData, slug });
      setSuccess(true);
      if (onSave) onSave();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error guardando:', error);
    }
    setLoading(false);
  };

  const subcategoriasDisponibles = formData.categoria ? CATEGORIAS_SUBCATEGORIAS[formData.categoria] : [];
  const mostrarEnlacesInteres = CATEGORIAS_CON_ENLACES.includes(formData.categoria);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-terracota mb-2">Información para su Micrositio</h2>
      <p className="text-sm text-gris mb-6">
        Usted es un Actor importante para la región occidente de Antioquia. Recuerde llenar toda la información posible para que su contenido sea interesante y cumpla su función. Actualícelo y solicite soporte de ser necesario.
      </p>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-6 text-green-700">
          ✓ Información guardada correctamente
        </div>
      )}

      <div className="space-y-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-semibold text-marron mb-2">
            Logo del Actor
          </label>
          {formData.logo ? (
            <div className="relative inline-block">
              <img src={formData.logo} alt="Logo" className="h-24 w-24 object-cover rounded-lg border border-gris/20" />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label htmlFor="logo-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-terracota rounded-lg p-6 w-40 cursor-pointer hover:bg-crema transition">
              <Upload className="text-terracota mb-1" size={22} />
              <span className="text-terracota text-xs font-semibold text-center">
                {subiendoLogo ? 'Subiendo...' : 'Subir logo'}
              </span>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={subiendoLogo}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-marron mb-2">
            Nombre o razón Social del Actor
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

        {/* RNT */}
        <div className="bg-crema p-4 rounded-lg space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rntVigente"
              checked={formData.rntVigente}
              onChange={handleChange}
            />
            <span className="text-sm font-semibold text-marron">RNT vigente (Registro Nacional de Turismo)</span>
          </label>
          {formData.rntVigente && (
            <input
              type="text"
              name="numeroRnt"
              value={formData.numeroRnt}
              onChange={handleChange}
              placeholder="Número de RNT"
              className="w-full border border-gris/30 rounded px-4 py-2 text-sm"
            />
          )}
        </div>

        {/* Enlaces de interés (solo Institución / Ente territorial) */}
        {mostrarEnlacesInteres && (
          <div className="bg-crema p-4 rounded-lg space-y-3">
            <p className="text-sm font-semibold text-marron">Enlaces de interés para el público (máx 5)</p>
            {formData.enlacesInteres.map((enlace, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={enlace.etiqueta}
                  onChange={(e) => actualizarEnlace(idx, 'etiqueta', e.target.value)}
                  placeholder="Nombre (ej: Trámites municipales)"
                  className="w-1/3 border border-gris/30 rounded px-3 py-2 text-sm"
                />
                <input
                  type="url"
                  value={enlace.url}
                  onChange={(e) => actualizarEnlace(idx, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 border border-gris/30 rounded px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => eliminarEnlace(idx)}
                  className="text-gris hover:text-red-600 p-2 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {formData.enlacesInteres.length < 5 && (
              <button
                type="button"
                onClick={agregarEnlace}
                className="flex items-center gap-1 text-terracota text-sm font-semibold hover:underline"
              >
                <Plus size={16} /> Agregar enlace
              </button>
            )}
          </div>
        )}

        {/* Redes sociales */}
        <div className="bg-crema p-4 rounded-lg space-y-3">
          <p className="text-sm font-semibold text-marron mb-1">Redes sociales <span className="text-gris font-normal">(opcional)</span></p>
          {Object.keys(RED_ICONOS).map(red => {
            const Icono = RED_ICONOS[red];
            return (
              <div key={red} className="flex items-center gap-2">
                <Icono size={18} className="text-terracota flex-shrink-0" />
                <input
                  type="text"
                  value={formData.redesSociales[red]}
                  onChange={(e) => handleRedSocialChange(red, e.target.value)}
                  placeholder={RED_LABELS[red]}
                  className="flex-1 border border-gris/30 rounded px-3 py-2 text-sm"
                />
              </div>
            );
          })}
        </div>

        <div className="bg-crema p-4 rounded-lg">
          <label className="block text-sm font-semibold text-marron mb-2">
            Ubicación (coordenadas)
          </label>
          <p className="text-xs text-gris mb-3">
            Puedes obtener tus coordenadas buscando tu perfil de negocio en Google Maps, clic derecho sobre el punto exacto y copiar los números que aparecen primero.
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