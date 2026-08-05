import React, { useState } from 'react';
import { crearEvento } from '../services/firestore';
import { Calendar, MapPin } from 'lucide-react';

export default function CrearEvento({ actorId, onEventCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    tipo: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    municipio: '',
    lugar: '',
    ubicacion: { lat: 6.4, lng: -75.5 },
    imagen: '',
    publico: true,
    cobro: false,
    precio: 0,
    boleteria: '',
    parqueo: false,
    alimentacion: [],
    capacidad: 0
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categorias = [
    'Académico', 'Cultural', 'Religioso', 'Formación', 'Foro', 
    'Seminario', 'Panel', 'Feria', 'Festival', 'Musical', 'Institucional'
  ];

  const tipos = [
    'Conferencia', 'Taller', 'Exposición', 'Concierto', 
    'Cine', 'Obra de teatro', 'Competencia', 'Networking'
  ];

  const alimentacionOpciones = [
    'Refrigerio', 'Estación de café', 'Almuerzo', 'Cena', 'Cóctel'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleAlimentacion = (opcion) => {
    setFormData(prev => ({
      ...prev,
      alimentacion: prev.alimentacion.includes(opcion)
        ? prev.alimentacion.filter(a => a !== opcion)
        : [...prev.alimentacion, opcion]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crearEvento(actorId, {
        ...formData,
        fecha: new Date(formData.fecha)
      });
      setSuccess(true);
      setFormData({
        nombre: '', descripcion: '', categoria: '', tipo: '', fecha: '',
        horaInicio: '', horaFin: '', municipio: '', lugar: '',
        ubicacion: { lat: 6.4, lng: -75.5 }, imagen: '',
        publico: true, cobro: false, precio: 0, boleteria: '',
        parqueo: false, alimentacion: [], capacidad: 0
      });
      if (onEventCreated) onEventCreated();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error creando evento:', error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-terracota mb-6">Crear Evento</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-6 text-green-700">
          ✓ Evento creado correctamente
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-marron mb-2">
            Nombre del Evento
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
            placeholder="Ej: Festival de Gastronomía 2024"
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
              Tipo
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
            >
              <option value="">Selecciona...</option>
              {tipos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-marron mb-2">
            Descripción (máx 200 caracteres)
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            maxLength={200}
            rows={3}
            className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota resize-none"
            placeholder="Detalles del evento..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-marron mb-2">
              📅 Fecha
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Hora inicio
              </label>
              <input
                type="time"
                name="horaInicio"
                value={formData.horaInicio}
                onChange={handleChange}
                className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Hora fin
              </label>
              <input
                type="time"
                name="horaFin"
                value={formData.horaFin}
                onChange={handleChange}
                className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-marron mb-2">
              Lugar
            </label>
            <input
              type="text"
              name="lugar"
              value={formData.lugar}
              onChange={handleChange}
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
              placeholder="Ej: Parque Central"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-marron mb-2">
              Capacidad
            </label>
            <input
              type="number"
              name="capacidad"
              value={formData.capacidad}
              onChange={handleChange}
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
              placeholder="Cantidad de personas"
            />
          </div>
        </div>

        {/* Detalles */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="publico"
                checked={formData.publico}
                onChange={handleChange}
              />
              <span className="text-sm font-semibold text-marron">Evento público</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="parqueo"
                checked={formData.parqueo}
                onChange={handleChange}
              />
              <span className="text-sm font-semibold text-marron">Parqueo habilitado</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                name="cobro"
                checked={formData.cobro}
                onChange={handleChange}
              />
              <span className="text-sm font-semibold text-marron">¿Tiene cobro?</span>
            </label>
            {formData.cobro && (
              <div className="ml-6 space-y-2">
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="Precio en COP"
                  className="w-full border border-gris/30 rounded px-4 py-2 text-sm"
                />
                <input
                  type="url"
                  name="boleteria"
                  value={formData.boleteria}
                  onChange={handleChange}
                  placeholder="URL de boletería"
                  className="w-full border border-gris/30 rounded px-4 py-2 text-sm"
                />
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-marron mb-2">Alimentación incluida:</p>
            <div className="flex flex-wrap gap-2">
              {alimentacionOpciones.map(opcion => (
                <button
                  key={opcion}
                  type="button"
                  onClick={() => toggleAlimentacion(opcion)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    formData.alimentacion.includes(opcion)
                      ? 'bg-terracota text-white'
                      : 'bg-gray-200 text-gris hover:bg-gray-300'
                  }`}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50"
        >
          {loading ? 'Creando evento...' : 'Crear Evento'}
        </button>
      </div>
    </form>
  );
}