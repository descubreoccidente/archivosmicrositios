import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { actualizarPromocion } from '../services/firestore';
import { Upload, Trash2, Clock, Pencil } from 'lucide-react';

const CATEGORIAS = [
  'Alojamiento', 'Comidas rápidas', 'Comida Gourmet', 'Tours', 'Entrada a show',
  'Bebidas y licores', 'Paquetes turísticos', 'Joyería en filigrana', 'Dulces y postres',
  'Happy hour', 'Día de sol', 'Noche de luna', 'Lunas de miel', 'Escapadas', 'Karaoke',
  'Entrada a museo', 'Afiliación', 'Formación', 'Gimnasio', 'Clases y talleres',
  'Oportunidad tributaria', 'Asesoría profesional'
];

const FORM_VACIO = {
  titulo: '', descripcion: '', categoria: '', imagen: '',
  descuento: '', precioOriginal: '', precioDescuento: '', enlace: '', fechaVencimiento: '',
  modalidadEntrega: 'Presencial o domicilio'
};

function timestampAInput(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function CrearPromocion({ actorId, nombreNegocio, onPromoCreated }) {
  const [formData, setFormData] = useState(FORM_VACIO);
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [promoEditandoId, setPromoEditandoId] = useState(null);

  useEffect(() => {
    cargarPromociones();
  }, [actorId]);

  const cargarPromociones = async () => {
    try {
      const ahora = Timestamp.now();
      const q = query(
        collection(db, 'promociones'),
        where('actorId', '==', actorId)
      );
      const snap = await getDocs(q);
      const todas = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const vencidas = todas.filter(p => p.fechaVencimiento && p.fechaVencimiento.toMillis() <= ahora.toMillis());
      for (const promo of vencidas) {
        await deleteDoc(doc(db, 'promociones', promo.id));
      }

      const vigentes = todas.filter(p => !p.fechaVencimiento || p.fechaVencimiento.toMillis() > ahora.toMillis());
      vigentes.sort((a, b) => (b.fechaCreacion?.toMillis?.() || 0) - (a.fechaCreacion?.toMillis?.() || 0));
      setPromociones(vigentes);
    } catch (err) {
      console.error('Error cargando promociones:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagenUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendoImagen(true);
    try {
      const storageRef = ref(storage, `promociones/${actorId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, imagen: url }));
    } catch (err) {
      console.error('Error subiendo imagen:', err);
    }
    setSubiendoImagen(false);
  };

  const iniciarEdicion = (promo) => {
    setFormData({
      titulo: promo.titulo || '',
      descripcion: promo.descripcion || '',
      categoria: promo.categoria || '',
      imagen: promo.imagen || '',
      descuento: promo.descuento || '',
      precioOriginal: promo.precioOriginal || '',
      precioDescuento: promo.precioDescuento || '',
      enlace: promo.enlace || '',
      fechaVencimiento: timestampAInput(promo.fechaVencimiento),
      modalidadEntrega: promo.modalidadEntrega || 'Presencial o domicilio'
    });
    setPromoEditandoId(promo.id);
    setMostrarForm(true);
  };

  const cancelarFormulario = () => {
    setMostrarForm(false);
    setPromoEditandoId(null);
    setFormData(FORM_VACIO);
    setError(null);
  };

  const handleDelete = async (promoId) => {
    if (!confirm('¿Eliminar esta promoción?')) return;
    try {
      await deleteDoc(doc(db, 'promociones', promoId));
      cargarPromociones();
      if (onPromoCreated) onPromoCreated();
    } catch (err) {
      console.error('Error eliminando promoción:', err);
    }
  };

  const formatVencimiento = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('es-CO', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.titulo || !formData.descripcion || !formData.categoria || !formData.fechaVencimiento) {
      setError('Completa todos los campos obligatorios, incluyendo la fecha de vencimiento');
      return;
    }

    const fechaVencimiento = new Date(formData.fechaVencimiento);
    if (fechaVencimiento <= new Date()) {
      setError('La fecha de vencimiento debe ser posterior a ahora');
      return;
    }

    setLoading(true);
    try {
      const datosPromo = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        imagen: formData.imagen,
        enlace: formData.enlace,
        precioOriginal: formData.precioOriginal ? parseInt(formData.precioOriginal) : null,
        precioDescuento: formData.precioDescuento ? parseInt(formData.precioDescuento) : null,
        descuento: formData.descuento ? parseInt(formData.descuento) : null,
        fechaVencimiento: Timestamp.fromDate(fechaVencimiento),
        modalidadEntrega: formData.modalidadEntrega
      };

      if (promoEditandoId) {
        await actualizarPromocion(promoEditandoId, datosPromo);
      } else {
        await addDoc(collection(db, 'promociones'), {
          actorId,
          nombreNegocio,
          ...datosPromo,
          activa: true,
          fechaCreacion: Timestamp.now()
        });
      }

      setSuccess(true);
      cancelarFormulario();
      cargarPromociones();
      if (onPromoCreated) onPromoCreated();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError('Ocurrió un error al guardar la promoción');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-700">
          ✓ Promoción guardada correctamente
        </div>
      )}

      {/* Lista de promociones existentes */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-terracota">
            Tus Promociones ({promociones.length})
          </h3>
          <button
            onClick={() => mostrarForm ? cancelarFormulario() : setMostrarForm(true)}
            className="bg-terracota text-white font-semibold px-4 py-2 rounded-lg hover:bg-terracota-dark transition"
          >
            {mostrarForm ? 'Cancelar' : '+ Nueva Promoción'}
          </button>
        </div>

        {promociones.length === 0 && !mostrarForm && (
          <p className="text-gris text-sm">Aún no tienes promociones activas.</p>
        )}

        <div className="space-y-3">
          {promociones.map((promo) => (
            <div key={promo.id} className="flex justify-between items-center border border-gris/20 rounded-lg p-4">
              <div className="flex items-center gap-4">
                {promo.imagen && (
                  <img src={promo.imagen} alt={promo.titulo} className="w-16 h-16 object-cover rounded-lg" />
                )}
                <div>
                  <p className="font-semibold text-marron">{promo.titulo}</p>
                  <p className="text-xs text-gris flex items-center gap-1 mt-1">
                    <Clock size={12} /> Vence: {formatVencimiento(promo.fechaVencimiento)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => iniciarEdicion(promo)}
                  className="text-gris hover:text-terracota p-2 rounded-lg hover:bg-crema transition"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="text-gris hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold text-terracota mb-6">
            {promoEditandoId ? 'Editar Promoción' : 'Crear Promoción'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Título de la Promoción *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                maxLength={60}
                className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                placeholder="Ej: 50% descuento en comida"
              />
              <p className="text-xs text-gris mt-1">{formData.titulo.length}/60</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
                maxLength={150}
                rows={3}
                className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota resize-none"
                placeholder="Describe tu oferta..."
              />
              <p className="text-xs text-gris mt-1">{formData.descripcion.length}/150</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Categoría *
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
                ¿Cómo se accede a la promoción?
              </label>
              <select
                name="modalidadEntrega"
                value={formData.modalidadEntrega}
                onChange={handleChange}
                className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
              >
                <option value="Solo presencial">Solo presencial</option>
                <option value="Solo domicilio">Solo domicilio</option>
                <option value="Presencial o domicilio">Presencial o domicilio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Vence el * <span className="text-gris font-normal">(fecha y hora)</span>
              </label>
              <input
                type="datetime-local"
                name="fechaVencimiento"
                value={formData.fechaVencimiento}
                onChange={handleChange}
                required
                className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Imagen
              </label>
              {formData.imagen ? (
                <div className="relative inline-block">
                  <img src={formData.imagen} alt="Promoción" className="h-32 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imagen: '' }))}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label htmlFor="imagen-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-terracota rounded-lg p-6 cursor-pointer hover:bg-crema transition">
                  <Upload className="text-terracota mb-1" size={24} />
                  <span className="text-terracota text-sm font-semibold">
                    {subiendoImagen ? 'Subiendo...' : 'Subir imagen (JPG/PNG)'}
                  </span>
                  <input
                    id="imagen-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImagenUpload}
                    disabled={subiendoImagen}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Porcentaje de Descuento (%)
              </label>
              <input
                type="number"
                name="descuento"
                value={formData.descuento}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                placeholder="Ej: 50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Precio Original
                </label>
                <input
                  type="number"
                  name="precioOriginal"
                  value={formData.precioOriginal}
                  onChange={handleChange}
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                  placeholder="Ej: 100000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Precio con Descuento
                </label>
                <input
                  type="number"
                  name="precioDescuento"
                  value={formData.precioDescuento}
                  onChange={handleChange}
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                  placeholder="Ej: 50000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Enlace (opcional)
              </label>
              <input
                type="url"
                name="enlace"
                value={formData.enlace}
                onChange={handleChange}
                className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                placeholder="https://ejemplo.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (promoEditandoId ? 'Guardar Cambios' : 'Crear Promoción')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}