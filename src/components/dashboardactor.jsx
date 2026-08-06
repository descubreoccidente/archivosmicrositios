import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { crearMicrositio, obtenerMicrositio } from '../services/firestore';
import { logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import FormularioMicrositio from './formulariomicrositio';
import GaleriaFotos from './galeriafotos';
import CrearEvento from './crearevento';
import { LogOut, Eye, Info, Image, Calendar } from 'lucide-react';

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
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-terracota text-xl font-semibold">Cargando...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Información', icon: Info },
    { id: 'fotos', label: 'Galería', icon: Image },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-crema">
      {/* Header */}
      <div className="bg-terracota text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <img src="/logo-teal.png" alt="Descubre Occidente" className="h-20 brightness-0 invert" />
          <h1 className="text-xl font-bold">Tu Micrositio</h1>
        </div>
        <div className="flex gap-3">
          {micrositio && (
            <a
              href={`/micrositio/${actorId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-white text-terracota px-4 py-2 rounded-lg font-semibold hover:bg-crema transition"
            >
              <Eye size={18} />
              Ver público
            </a>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-terracota-dark px-4 py-2 rounded-lg font-semibold hover:bg-marron transition"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gris/20 sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-6xl mx-auto px-4 flex gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 py-4 px-3 font-semibold border-b-2 transition ${
                activeTab === id
                  ? 'border-terracota text-terracota'
                  : 'border-transparent text-gris hover:text-terracota'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
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