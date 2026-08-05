import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Trash2, Eye } from 'lucide-react';

export default function PromocionesDelDia() {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    cargarPromociones();
    // Recargar cada minuto para actualizar duraciones
    const interval = setInterval(cargarPromociones, 60000);
    return () => clearInterval(interval);
  }, []);

  const cargarPromociones = async () => {
    try {
      const ahora = new Date();
      const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

      const q = query(
        collection(db, 'promociones'),
        where('activa', '==', true),
        where('fechaCreacion', '>=', Timestamp.fromDate(hace24Horas)),
        orderBy('fechaCreacion', 'desc')
      );

      const snap = await getDocs(q);
      const promos = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tiempoRestante: calcularTiempoRestante(doc.data().fechaCreacion)
      }));

      setPromociones(promos);
    } catch (error) {
      console.error('Error cargando promociones:', error);
    }
    setLoading(false);
  };

  const calcularTiempoRestante = (fechaCreacion) => {
    const ahora = new Date();
    const fecha = fechaCreacion.toDate ? fechaCreacion.toDate() : new Date(fechaCreacion);
    const fin = new Date(fecha.getTime() + 24 * 60 * 60 * 1000);
    const diferencia = fin - ahora;

    if (diferencia <= 0) return 'Expirada';

    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    return `${horas}h ${minutos}m`;
  };

  const filtradas = filtro === 'todas' 
    ? promociones 
    : promociones.filter(p => p.categoria === filtro);

  if (loading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <p className="text-terracota text-xl">Cargando promociones...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crema">
      {/* Header */}
      <div className="bg-gradient-to-r from-terracota to-terracota-dark text-white py-12">
        <div className="max-w-6xl mx-auto px-8">
          <h1 className="text-4xl font-bold mb-2">🎉 Promociones del Día</h1>
          <p className="text-lg opacity-90">
            Ofertas exclusivas por 24 horas del Occidente Antioqueño
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gris/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-full font-semibold transition whitespace-nowrap ${
                filtro === 'todas'
                  ? 'bg-terracota text-white'
                  : 'bg-gray-200 text-gris hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            {['Hotel', 'Gastronomía', 'Tour operador', 'Ente territorial'].map(cat => (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                className={`px-4 py-2 rounded-full font-semibold transition whitespace-nowrap ${
                  filtro === cat
                    ? 'bg-terracota text-white'
                    : 'bg-gray-200 text-gris hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Promociones */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {filtradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtradas.map((promo) => (
              <div key={promo.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
                {/* Imagen */}
                {promo.imagen && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={promo.imagen}
                      alt={promo.titulo}
                      className="w-full h-full object-cover"
                    />
                    {/* Badge de tiempo */}
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ⏰ {promo.tiempoRestante}
                    </div>
                    {/* Badge de descuento */}
                    {promo.descuento && (
                      <div className="absolute top-4 left-4 bg-dorado text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{promo.descuento}%
                      </div>
                    )}
                  </div>
                )}

                {/* Contenido */}
                <div className="p-6">
                  {/* Negocio */}
                  <p className="text-gris text-sm font-semibold mb-2">
                    {promo.nombreNegocio}
                  </p>

                  {/* Título */}
                  <h3 className="text-xl font-bold text-marron mb-2">
                    {promo.titulo}
                  </h3>

                  {/* Descripción */}
                  <p className="text-gris text-sm mb-4 line-clamp-2">
                    {promo.descripcion}
                  </p>

                  {/* Categoría */}
                  <div className="mb-4">
                    <span className="inline-block bg-terracota/10 text-terracota px-3 py-1 rounded text-xs font-semibold">
                      {promo.categoria}
                    </span>
                  </div>

                  {/* Precio Original y Descuento */}
                  {promo.precioOriginal && promo.precioDescuento && (
                    <div className="mb-4">
                      <p className="text-gris line-through text-sm">
                        ${promo.precioOriginal.toLocaleString()}
                      </p>
                      <p className="text-2xl font-bold text-terracota">
                        ${promo.precioDescuento.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Botón */}
                  <button className="w-full bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition">
                    Ver Oferta
                  </button>

                  {/* Link externo */}
                  {promo.enlace && (
                    <a
                      href={promo.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center mt-3 text-terracota hover:underline text-sm font-semibold"
                    >
                      Ir al sitio →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gris text-lg">
              No hay promociones disponibles en este momento.
            </p>
            <p className="text-gris text-sm mt-2">
              ¡Vuelve pronto para descubrir nuevas ofertas!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
