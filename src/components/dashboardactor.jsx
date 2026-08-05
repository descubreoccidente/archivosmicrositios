import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { crearMicrositio, obtenerMicrositio } from '../services/firestore';
import { logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import FormularioMicrositio from './FormularioMicrositio';
import GaleriaFotos from './GaleriaFotos';
import CrearEvento from './CrearEvento';
import { LogOut, Eye } from 'lucide-react';

export default function DashboardActor({ actorId }) {
  const [micrositio, setMicrositio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const navigate = useNavigate();

  useEffect(() => {
    cargarMicrositio();
  }, [actorId]);

  const cargarMicrositio = async () => {
    try {
      const data = await obtenerMicrositio(actorId);
      setMicrositio(data);
    } catch (error) {
      console.error('Error cargando micrositio:', error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-terracota text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crema">
      {/* Header */}
      <div className="bg-terracota text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tu Micrositio</h1>
        <div className="flex gap-4">
          {micrositio && (
            <a
              href={`/micrositio/${actorId}`}
              target="_blank"
              className="flex items-center gap-2 bg-white text-terracota px-4 py-2 rounded hover:bg-crema transition"
            >
              <Eye size={18} />
              Ver Público
            </a>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-terracota-dark px-4 py-2 rounded hover:bg-marron transition"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gris/30 sticky top-0 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex gap-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 font-semibold border-b-2 transition ${
              activeTab === 'info'
                ? 'border-terracota text-terracota'
                : 'border-transparent text-gris hover:text-terracota'
            }`}
          >
            Información
          </button>
          <button
            onClick={() => setActiveTab('fotos')}
            className={`py-4 font-semibold border-b-2 transition ${
              activeTab === 'fotos'
                ? 'border-terracota text-terracota'
                : 'border-transparent text-gris hover:text-terracota'
            }`}
          >
            Galería
          </button>
          <button
            onClick={() => setActiveTab('eventos')}
            className={`py-4 font-semibold border-b-2 transition ${
              activeTab === 'eventos'
                ? 'border-terracota text-terracota'
                : 'border-transparent text-gris hover:text-terracota'
            }`}
          >
            Eventos
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'info' && (
          <FormularioMicrositio actorId={actorId} onSave={cargarMicrositio} />
        )}
        {activeTab === 'fotos' && (
          <GaleriaFotos actorId={actorId} onUpdate={cargarMicrositio} />
        )}
        {activeTab === 'eventos' && (
          <CrearEvento actorId={actorId} onEventCreated={cargarMicrositio} />
        )}
      </div>
    </div>
  );
}