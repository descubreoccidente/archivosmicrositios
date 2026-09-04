import React, { useState, useEffect } from 'react';
import { crearItemDescubreMas, obtenerItemsDescubreMas, eliminarItemDescubreMas } from '../services/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import { Upload, Trash2, MapPin, Package } from 'lucide-react';

const FORM_VACIO = { titulo: '', descripcion: '', tipo: 'lugar', foto: '', lat: '', lng: '' };

export default function DescubreMas({ actorId }) {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(FORM_VACIO);
  const [coordenadasTexto, setCoordenadasTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarItems();
  }, [actorId]);

  const cargarItems = async () => {
    const data = await obtenerItemsDescubreMas(actorId);
    setItems(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCoordenadasChange = (e) => {
    const texto = e.target.value;
    setCoordenadasTexto(texto);

    const partes = texto.split(/[,\t]+/).map(p => p.trim()).filter(Boolean);
    if (partes.length === 2 && !isNaN(parseFloat(partes[0])) && !isNaN(parseFloat(partes[1]))) {
      setFormData(prev => ({ ...prev, lat: partes[0], lng: partes[1] }));
    } else {
      setFormData(prev => ({ ...prev, lat: '', lng: '' }));
    }
  };

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoFoto(true);
    try {
      const storageRef = ref(storage, `actors/${actorId}/descubreMas/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, foto: url }));
    } catch (err) {
      console.error('Error subiendo foto:', err);
    }
    setSubiendoFoto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.titulo || !formData.descripcion) {
      setError('Completa el título y la descripción');
      return;
    }
    if (formData.tipo === 'lugar' && (!formData.lat || !formData.lng)) {
      setError('Si es un lugar, pega las coordenadas en formato "latitud, longitud"');
      return;
    }

    setLoading(true);
    try {
      await crearItemDescubreMas(actorId, {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        foto: formData.foto,
        lat: formData.tipo === 'lugar' ? parseFloat(formData.lat) : null,
        lng: formData.tipo === 'lugar' ? parseFloat(formData.lng) : null,
      });
      setFormData(FORM_VACIO);
      setCoordenadasTexto('');
      setMostrarForm(false);
      cargarItems();
    } catch (err) {
      setError('Ocurrió un error al guardar');
    }
    setLoading(false);
  };

  const handleDelete = async (itemId) => {
    if (!confirm('¿Eliminar este item?')) return;
    try {
      await eliminarItemDescubreMas(actorId, itemId);
      cargarItems();
    } catch (err) {
      console.error('Error eliminando:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-terracota">Descubre Más ({items.length})</h3>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-terracota text-white font-semibold px-4 py-2 rounded-lg hover:bg-terracota-dark transition text-sm"
        >
          {mostrarForm ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>
      <p className="text-sm text-gris mb-6">
        Comparte lugares, productos o experiencias de interés turístico especial de tu municipio.
        Si es un lugar físico, aparecerá también en el mapa interactivo con un marcador especial.
      </p>

      {mostrarForm && (
        <form onSubmit={handleSubmit} className="bg-crema p-6 rounded-lg mb-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-semibold text-marron mb-2">¿Qué tipo de contenido es?</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tipo: 'lugar' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition ${
                  formData.tipo === 'lugar' ? 'bg-terracota text-white' : 'bg-white text-gris border border-gris/30'
                }`}
              >
                <MapPin size={16} /> Lugar (va al mapa)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tipo: 'experiencia' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition ${
                  formData.tipo === 'experiencia' ? 'bg-terracota text-white' : 'bg-white text-gris border border-gris/30'
                }`}
              >
                <Package size={16} /> Producto / Experiencia
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-marron mb-2">Título *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              maxLength={60}
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
              placeholder={formData.tipo === 'lugar' ? 'Ej: Puente de Occidente' : 'Ej: Dulces artesanales de guayaba'}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-marron mb-2">Descripción corta *</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              maxLength={300}
              rows={3}
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota resize-none"
              placeholder="Cuenta brevemente qué lo hace especial..."
            />
            <p className="text-xs text-gris mt-1">{formData.descripcion.length}/300</p>
          </div>

          {formData.tipo === 'lugar' && (
            <div>
              <label className="block text-sm font-semibold text-marron mb-2">Coordenadas</label>
              <input
                type="text"
                value={coordenadasTexto}
                onChange={handleCoordenadasChange}
                placeholder="Pega aquí: 6.501903, -75.743388"
                className={`w-full border rounded px-4 py-2 text-sm focus:outline-none ${
                  coordenadasTexto && !formData.lat ? 'border-red-300 focus:border-red-400' : 'border-gris/30 focus:border-terracota'
                }`}
              />
              <p className="text-xs text-gris mt-1">
                Copia y pega directo desde la <a href="/coordenadas" target="_blank" className="text-terracota underline">herramienta de coordenadas</a> — ya viene lista en el formato correcto.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-marron mb-2">Foto</label>
            {formData.foto ? (
              <div className="relative inline-block">
                <img src={formData.foto} alt="" className="h-28 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, foto: '' }))}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-terracota rounded-lg p-5 cursor-pointer hover:bg-white transition">
                <Upload className="text-terracota mb-1" size={22} />
                <span className="text-terracota text-sm font-semibold">
                  {subiendoFoto ? 'Subiendo...' : 'Subir foto'}
                </span>
                <input type="file" accept="image/*" onChange={handleFotoUpload} disabled={subiendoFoto} className="hidden" />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Publicar'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className="border border-gris/20 rounded-lg overflow-hidden flex">
            {item.foto && <img src={item.foto} alt={item.titulo} className="w-24 h-24 object-cover flex-shrink-0" />}
            <div className="p-3 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-marron text-sm">{item.titulo}</p>
                <button onClick={() => handleDelete(item.id)} className="text-gris hover:text-red-600 flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-terracota bg-terracota/10 px-2 py-0.5 rounded-full mt-1">
                {item.tipo === 'lugar' ? <><MapPin size={10} /> Lugar</> : <><Package size={10} /> Experiencia</>}
              </span>
              <p className="text-xs text-gris mt-1 line-clamp-2">{item.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}