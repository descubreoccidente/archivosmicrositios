import React, { useState, useEffect } from 'react';
import { crearResena, obtenerResenaUsuario } from '../services/firestore';
import { onAuthChange } from '../services/auth';
import ModalLoginVisitante from './modallogivisitante';
import { Star } from 'lucide-react';

export default function SistemaResenas({ actorId, resenas = [], onResenaCreada }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [mostrarLoginVisitante, setMostrarLoginVisitante] = useState(false);
  const [yaReseno, setYaReseno] = useState(false);
  const [rating, setRating] = useState(5);
  const [texto, setTexto] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => setUsuario(user));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (usuario) {
      obtenerResenaUsuario(actorId, usuario.uid).then(r => setYaReseno(!!r));
    } else {
      setYaReseno(false);
    }
  }, [usuario, actorId]);

  const abrirFormulario = () => {
    if (!usuario) {
      setMostrarLoginVisitante(true);
      return;
    }
    setMostrarFormulario(true);
  };

  const handleLoginExitoso = (user) => {
    setUsuario(user);
    setMostrarLoginVisitante(false);
    setMostrarFormulario(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario) return;

    setLoading(true);
    try {
      await crearResena(actorId, usuario.uid, {
        rating,
        texto,
        nombreUsuario: usuario.displayName || 'Visitante'
      });
      setTexto('');
      setRating(5);
      setMostrarFormulario(false);
      setYaReseno(true);
      if (onResenaCreada) onResenaCreada();
    } catch (error) {
      console.error('Error publicando reseña:', error);
    }
    setLoading(false);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {!mostrarFormulario && !yaReseno && (
        <button
          onClick={abrirFormulario}
          className="w-full bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition"
        >
          Escribir una reseña
        </button>
      )}

      {yaReseno && !mostrarFormulario && (
        <p className="text-center text-sm text-gris bg-crema rounded-lg py-3">
          Ya dejaste tu reseña. ¡Gracias por compartir tu experiencia!
        </p>
      )}

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gris/20">
          <h3 className="text-lg font-bold text-terracota mb-4">Tu Reseña</h3>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-marron mb-2">
              Calificación
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    size={32}
                    className={star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-marron mb-2">
              Tu experiencia (máx 300 caracteres)
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={300}
              rows={4}
              required
              className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota resize-none"
              placeholder="Cuéntanos tu experiencia..."
            />
            <p className="text-xs text-gris mt-1">{texto.length}/300</p>
          </div>

          <div className="flex gap-3">
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
              className="px-6 border border-gris/30 text-gris font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div>
        <h3 className="text-lg font-bold text-terracota mb-4">
          Reseñas ({resenas?.length || 0})
        </h3>
        {resenas && resenas.length > 0 ? (
          <div className="space-y-3">
            {resenas.map((resena) => (
              <div key={resena.id} className="bg-white rounded-lg p-4 border border-gris/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-marron text-sm">{resena.nombreUsuario || 'Visitante'}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < resena.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gris">{formatFecha(resena.createdAt)}</span>
                </div>
                <p className="text-marron text-sm mt-2">{resena.texto}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 text-center text-gris text-sm border border-gris/20">
            Sin reseñas aún. ¡Sé el primero en dejar una!
          </div>
        )}
      </div>

      {mostrarLoginVisitante && (
        <ModalLoginVisitante
          onClose={() => setMostrarLoginVisitante(false)}
          onSuccess={handleLoginExitoso}
        />
      )}
    </div>
  );
}