import React, { useState, useEffect } from 'react';
import {
  verificarAdmin, obtenerTodosLosActoresAdmin, toggleActivoActor,
  obtenerTodosLosEventosAdmin, eliminarEvento,
  obtenerTodasLasPromocionesAdmin, eliminarPromocion,
  agregarInvitacionAdmin
} from '../services/firestore';
import { loginConGoogle, logout, onAuthChange } from '../services/auth';
import { Shield, Store, Calendar, Tag, UserPlus, LogOut, Ban, CheckCircle, Trash2 } from 'lucide-react';

function formatFecha(fecha) {
  if (!fecha) return '';
  const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminPanel() {
  const [usuario, setUsuario] = useState(null);
  const [esAdmin, setEsAdmin] = useState(null);
  const [tab, setTab] = useState('actores');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [actores, setActores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [invitacionMsg, setInvitacionMsg] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setUsuario(user);
      if (user) {
        const admin = await verificarAdmin(user.email);
        setEsAdmin(admin);
      } else {
        setEsAdmin(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (esAdmin) cargarDatos();
  }, [esAdmin, tab]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'actores') setActores(await obtenerTodosLosActoresAdmin());
      if (tab === 'eventos') setEventos(await obtenerTodosLosEventosAdmin());
      if (tab === 'promociones') setPromociones(await obtenerTodasLasPromocionesAdmin());
    } catch (e) {
      setError('Error cargando datos');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setError(null);
    try {
      await loginConGoogle('admin');
    } catch (e) {
      setError('No pudimos iniciar sesión');
    }
  };

  const handleToggleActivo = async (actorId, activoActual) => {
    try {
      await toggleActivoActor(actorId, !activoActual);
      cargarDatos();
    } catch (e) {
      setError('No se pudo actualizar el actor');
    }
  };

  const handleEliminarEvento = async (eventId) => {
    if (!confirm('¿Eliminar este evento definitivamente?')) return;
    try {
      await eliminarEvento(eventId);
      cargarDatos();
    } catch (e) {
      setError('No se pudo eliminar el evento');
    }
  };

  const handleEliminarPromocion = async (promoId) => {
    if (!confirm('¿Eliminar esta promoción definitivamente?')) return;
    try {
      await eliminarPromocion(promoId);
      cargarDatos();
    } catch (e) {
      setError('No se pudo eliminar la promoción');
    }
  };

  const handleAgregarInvitacion = async (e) => {
    e.preventDefault();
    setInvitacionMsg(null);
    try {
      await agregarInvitacionAdmin(nuevoCorreo);
      setInvitacionMsg({ tipo: 'ok', texto: `${nuevoCorreo} fue autorizado correctamente.` });
      setNuevoCorreo('');
    } catch (e) {
      setInvitacionMsg({ tipo: 'error', texto: 'No se pudo agregar la invitación.' });
    }
  };

  // Sin sesión iniciada
  if (!usuario) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
          <Shield size={40} className="mx-auto text-terracota mb-3" />
          <h1 className="text-xl font-bold text-terracota mb-2">Panel de Administrador</h1>
          <p className="text-sm text-gris mb-6">Acceso exclusivo para el equipo de Corpoturismo.</p>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition"
          >
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
  }

  // Con sesión pero verificando o sin permiso
  if (esAdmin === null) {
    return <div className="min-h-screen bg-crema flex items-center justify-center"><p className="text-terracota">Verificando acceso...</p></div>;
  }

  if (esAdmin === false) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
          <Shield size={40} className="mx-auto text-red-500 mb-3" />
          <p className="font-semibold text-marron mb-4">Tu cuenta ({usuario.email}) no tiene acceso de administrador.</p>
          <button onClick={() => logout()} className="text-terracota text-sm underline">Cerrar sesión</button>
        </div>
      </div>
    );
  }

  // Panel completo
  const tabs = [
    { id: 'actores', label: 'Actores', icon: Store },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'promociones', label: 'Promociones', icon: Tag },
    { id: 'invitaciones', label: 'Invitaciones', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-crema">
      <div className="bg-terracota text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="flex items-center gap-2 text-lg font-bold"><Shield size={20} /> Panel de Administrador</h1>
        <button onClick={() => logout()} className="flex items-center gap-2 bg-terracota-dark px-4 py-2 rounded-lg text-sm font-semibold hover:bg-marron transition">
          <LogOut size={16} /> Salir
        </button>
      </div>

      <div className="bg-white border-b border-gris/20">
        <div className="max-w-5xl mx-auto px-4 flex gap-2 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 py-3 px-3 font-semibold border-b-2 whitespace-nowrap transition ${
                tab === id ? 'border-terracota text-terracota' : 'border-transparent text-gris hover:text-terracota'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {error && <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-red-700 text-sm">{error}</div>}
        {loading && <p className="text-center text-terracota">Cargando...</p>}

        {!loading && tab === 'actores' && (
          <div className="space-y-2">
            {actores.map((a) => (
              <div key={a.id} className="bg-white rounded-lg p-4 flex items-center justify-between border border-gris/10">
                <div>
                  <p className="font-semibold text-marron">{a.nombre}</p>
                  <p className="text-xs text-gris">{a.categoria} · {a.municipio}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${a.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {a.activo ? 'Activo' : 'Suspendido'}
                  </span>
                  <button
                    onClick={() => handleToggleActivo(a.id, a.activo)}
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg transition ${
                      a.activo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {a.activo ? <><Ban size={14} /> Suspender</> : <><CheckCircle size={14} /> Reactivar</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'eventos' && (
          <div className="space-y-2">
            {eventos.map((e) => (
              <div key={e.id} className="bg-white rounded-lg p-4 flex items-center justify-between border border-gris/10">
                <div>
                  <p className="font-semibold text-marron">{e.nombre}</p>
                  <p className="text-xs text-gris">{e.categoria} · {formatFecha(e.fechaInicio || e.fecha)} · {e.nombreNegocio || ''}</p>
                </div>
                <button
                  onClick={() => handleEliminarEvento(e.id)}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'promociones' && (
          <div className="space-y-2">
            {promociones.map((p) => (
              <div key={p.id} className="bg-white rounded-lg p-4 flex items-center justify-between border border-gris/10">
                <div>
                  <p className="font-semibold text-marron">{p.titulo}</p>
                  <p className="text-xs text-gris">{p.categoria} · {p.nombreNegocio || ''}</p>
                </div>
                <button
                  onClick={() => handleEliminarPromocion(p.id)}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'invitaciones' && (
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="font-bold text-terracota mb-3">Autorizar nuevo actor</h3>
            <p className="text-sm text-gris mb-4">
              Agrega el correo con el que un actor podrá crear su micrositio.
            </p>
            {invitacionMsg && (
              <div className={`text-sm rounded p-3 mb-4 ${invitacionMsg.tipo === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {invitacionMsg.texto}
              </div>
            )}
            <form onSubmit={handleAgregarInvitacion} className="flex gap-2">
              <input
                type="email"
                value={nuevoCorreo}
                onChange={(e) => setNuevoCorreo(e.target.value)}
                required
                placeholder="correo@ejemplo.com"
                className="flex-1 border border-gris/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-terracota"
              />
              <button type="submit" className="bg-terracota text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-terracota-dark transition">
                Autorizar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}