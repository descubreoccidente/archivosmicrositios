import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { loadStripe } from '@stripe/stripe-js';
import { Upload } from 'lucide-react';

const PRECIO_PROMOCION = 10000; // COP

export default function CrearPromocion({ actorId, nombreNegocio, onPromoCreated }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    imagen: '',
    descuento: '',
    precioOriginal: '',
    precioDescuento: '',
    enlace: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const procesarPago = async () => {
    setProcesandoPago(true);
    setError(null);

    try {
      // Aquí iría la integración con Stripe/PayU
      // Por ahora simulamos el pago exitoso
      
      // Crear promoción en Firestore
      const promocionData = {
        actorId,
        nombreNegocio,
        ...formData,
        precioOriginal: formData.precioOriginal ? parseInt(formData.precioOriginal) : null,
        precioDescuento: formData.precioDescuento ? parseInt(formData.precioDescuento) : null,
        descuento: formData.descuento ? parseInt(formData.descuento) : null,
        activa: true,
        fechaCreacion: Timestamp.now(),
        pago: {
          monto: PRECIO_PROMOCION,
          moneda: 'COP',
          estado: 'completado',
          fechaPago: Timestamp.now()
        }
      };

      const docRef = await addDoc(collection(db, 'promociones'), promocionData);

      setSuccess(true);
      setFormData({
        titulo: '', descripcion: '', categoria: '', imagen: '',
        descuento: '', precioOriginal: '', precioDescuento: '', enlace: ''
      });

      if (onPromoCreated) onPromoCreated();

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    }
    setProcesandoPago(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.descripcion || !formData.categoria) {
      setError('Completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    await procesarPago();
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg p-8 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-terracota mb-2">
          Crear Promoción del Día
        </h2>
        <p className="text-gris">
          💰 Costo: ${PRECIO_PROMOCION.toLocaleString()} COP por 24 horas
        </p>
        <p className="text-gris text-sm mt-1">
          Tu promoción aparecerá en la página de Promociones del Día y será visible para todos los visitantes
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 text-red-700">
          ✗ {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-6 text-green-700">
          ✓ ¡Promoción creada y pagada exitosamente! Aparecerá en la página en minutos.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
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

        {/* Descripción */}
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

        {/* Categoría */}
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
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-semibold text-marron mb-2">
            Imagen
          </label>
          <div className="border-2 border-dashed border-terracota rounded p-6 text-center cursor-pointer hover:bg-crema transition">
            <label htmlFor="imagen" className="cursor-pointer">
              <Upload className="mx-auto mb-2 text-terracota" size={32} />
              <p className="text-terracota font-semibold">Sube una imagen</p>
              <p className="text-gris text-sm">JPG o PNG, máx 5MB</p>
              <input
                id="imagen"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setFormData(prev => ({ ...prev, imagen: event.target.result }));
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
          {formData.imagen && (
            <p className="text-xs text-green-600 mt-2">✓ Imagen cargada</p>
          )}
        </div>

        {/* Descuento */}
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

        {/* Precios */}
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

        {/* Enlace */}
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

        {/* Resumen de pago */}
        <div className="bg-terracota/10 border border-terracota rounded p-4">
          <p className="text-sm text-marron font-semibold mb-2">Resumen del pago:</p>
          <div className="flex justify-between mb-2">
            <span className="text-gris">Promoción 24 horas:</span>
            <span className="font-bold text-terracota">${PRECIO_PROMOCION.toLocaleString()} COP</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-terracota/30">
            <span className="font-bold text-marron">Total a pagar:</span>
            <span className="font-bold text-terracota text-lg">${PRECIO_PROMOCION.toLocaleString()} COP</span>
          </div>
        </div>

        {/* Botón de pago */}
        <button
          type="submit"
          disabled={loading || procesandoPago}
          className="w-full bg-terracota text-white font-bold py-4 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {procesandoPago ? 'Procesando pago...' : `Crear Promoción y Pagar $${PRECIO_PROMOCION.toLocaleString()}`}
        </button>

        <p className="text-xs text-gris text-center">
          Al crear tu promoción aceptas que será cobrada de inmediato.
          Promoción válida por 24 horas desde su creación.
        </p>
      </form>
    </div>
  );
}
