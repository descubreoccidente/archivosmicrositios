import React, { useState, useContext } from 'react';
import { crearResena } from '../services/firestore';
import { auth } from '../services/firebase';
import { Star } from 'lucide-react';

export default function SistemaResenas({ actorId, resenas = [] }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    ratingDetalles: { comida: 5, servicio: 5, ambiente: 5, value: 5 },
    texto: '',
    imagen: ''
  });

  const usuarioActual = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuarioActual) {
      alert('Debes iniciar sesión para dejar una reseña');
      return;
    }

    setLoading(true);
    try {
      await crearResena(actorId, usuarioActual.uid, formData);
      setFormData({
        rating: 5,
        ratingDetalles: { comida: 5, servicio: 5, ambiente: 5, value: 5 },
        texto: '',
        imagen: ''
      });
      setMostrarFormulario(false);
      alert('Reseña publicada correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al publicar la reseña');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Formulario */}
      {!mostrarFormulario && usuarioActual && (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="w-full bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition"
        >
          Escribir una reseña
        </button>
      )}

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-terracota mb-6">Tu Reseña</h3>

          {/* Rating General */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-marron mb-2">
              Calificación General
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className="p-1"
                >
                  <Star
                    size={32}
                    className={star <= formData.rating ? 'fill-dorado text-dorado' : 'text-gris/30'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Ratings Detallados */}
          <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-lg">
            {['comida', 'servicio', 'ambiente', 'value'].map(category => (
              <div key={category}>
                <label className="block text-sm font-semibold text-marron mb-2 capitalize">
                  {category === 'value' ? 'Relación precio-calidad' : category}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        ratingDetalles: { ...prev.ratingDetalles, [category]: star }
                      }))}
                      className="p-0.5"
                    >
                      <Star
                        size={20}
                        className={star <= formData.ratingDetalles[category] ? 'fill-dorado text-dorado' : 'text-gris/30'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Texto */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-marron mb-2">
              Tu experiencia (máx 100 palabras)
            </label>
            <textarea
              value={formData.texto}
              onChange={(e) => setFormData(prev => ({ ...prev, texto: e.target.value }))}
              maxLength={100}
              rows={4}
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota resize-none"
              placeholder="Cuéntanos tu experiencia..."
            />
            <p className="text-xs text-gris mt-1">
              {formData.texto.length}/100 palabras
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50"
            >
              {loading ? 'Publicando...' : 'Publicar Reseña'}
            </button>
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="flex-1 bg-gray-200 text-gris font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Listado de Reseñas */}
      <div>
        <h3 className="text-xl font-bold text-terracota mb-4">
          Reseñas ({resenas?.length || 0})
        </h3>
        {resenas && resenas.length > 0 ? (
          <div className="space-y-4">
            {resenas.map((resena, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 border border-gris/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-marron">Usuario</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < resena.rating ? 'fill-dorado text-dorado' : 'text-gris/30'}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gris">
                    {new Date(resena.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gris mt-3">{resena.texto}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center text-gris">
            Sin reseñas aún. ¡Sé el primero en dejar una!
          </div>
        )}
      </div>
    </div>
  );
}