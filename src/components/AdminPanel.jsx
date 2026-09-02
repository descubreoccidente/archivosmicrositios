import React, { useState, useEffect } from 'react';
import {
  verificarAdmin, obtenerTodosLosActoresAdmin, toggleActivoActor,
  obtenerTodosLosEventosAdmin, eliminarEvento,
  obtenerTodasLasPromocionesAdmin, eliminarPromocion,
  agregarInvitacionAdmin, obtenerVotosCandelaAdmin, obtenerReportesMesAdmin,
  obtenerPuntosInteres, crearPuntoInteres, eliminarPuntoInteres, TIPOS_PUNTO_INTERES
} from '../services/firestore';
import { loginConGoogle, logout, onAuthChange } from '../services/auth';
import { Shield, Store, Calendar, Tag, UserPlus, LogOut, Ban, CheckCircle, Trash2, Flame, BarChart3, Download, MapPin } from 'lucide-react';
import * as XLSX from 'xlsx';

const MUNICIPIOS = [
  'Abriaquí', 'Anzá', 'Armenia', 'Buriticá', 'Caicedo', 'Cañasgordas',
  'Dabeiba', 'Ebéjico', 'Frontino', 'Giraldo', 'Heliconia', 'Liborina',
  'Olaya', 'Peque', 'Sabanalarga', 'San Jerónimo', 'Santa Fe de Antioquia',
  'Sopetrán', 'Uramita'
];

const PUNTO_VACIO = { nombre: '', tipo: '', municipio: '', lat: '', lng: '' };

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
  const [votosCandela, setVotosCandela] = useState(null);
  const [reportesMes, setReportesMes] = useState([]);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [invitacionMsg, setInvitacionMsg] = useState(null);

  const [puntosInteres, setPuntosInteres] = useState([]);
  const [formPunto, setFormPunto] = useState(PUNTO_VACIO);
  const [guardandoPunto, setGuardandoPunto] = useState(false);

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
      if (tab === 'candela') setVotosCandela(await obtenerVotosCandelaAdmin());
      if (tab === 'puntos') setPuntosInteres(await obtenerPuntosInteres());
      if (tab === 'datos') {
        const ahora = new Date();
        const monthId = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
        setReportesMes(await obtenerReportesMesAdmin(monthId));
      }
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

    const correos = nuevoCorreo
      .split(/[\n,;]+/)
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (correos.length === 0) return;

    let exitosos = 0;
    let fallidos = [];

    for (const correo of correos) {
      try {
        await agregarInvitacionAdmin(correo);
        exitosos++;
      } catch (e) {
        fallidos.push(correo);
      }
    }

    if (fallidos.length === 0) {
      setInvitacionMsg({ tipo: 'ok', texto: `${exitosos} correo${exitosos !== 1 ? 's' : ''} autorizado${exitosos !== 1 ? 's' : ''} correctamente.` });
    } else {
      setInvitacionMsg({ tipo: 'error', texto: `${exitosos} autorizados. Fallaron: ${fallidos.join(', ')}` });
    }
    setNuevoCorreo('');
  };

  const handleChangePunto = (e) => {
    const { name, value } = e.target;
    setFormPunto(prev => ({ ...prev, [name]: value }));
  };

  const handleCrearPunto = async (e) => {
    e.preventDefault();
    if (!formPunto.nombre || !formPunto.tipo || !formPunto.lat || !formPunto.lng) {
      setError('Completa nombre, tipo, latitud y longitud');
      return;
    }
    setGuardandoPunto(true);
    setError(null);
    try {
      await crearPuntoInteres({
        nombre: formPunto.nombre,
        tipo: formPunto.tipo,
        municipio: formPunto.municipio || null,
        lat: parseFloat(formPunto.lat),
        lng: parseFloat(formPunto.lng)
      });
      setFormPunto(PUNTO_VACIO);
      cargarDatos();
    } catch (e) {
      setError('No se pudo guardar el punto de interés');
    }
    setGuardandoPunto(false);
  };

  const handleEliminarPunto = async (id) => {
    if (!confirm('¿Eliminar este punto de interés?')) return;
    try {
      await eliminarPuntoInteres(id);
      cargarDatos();
    } catch (e) {
      setError('No se pudo eliminar el punto');
    }
  };

  const gruposReportes = reportesMes.reduce((acc, r) => {
    const clave = `${r.categoria}${r.subcategoria ? ' · ' + r.subcategoria : ''}`;
    if (!acc[clave]) acc[clave] = [];
    acc[clave].push(r);
    return acc;
  }, {});

  const descargarExcel = () => {
    if (reportesMes.length === 0) return;

    const camposExcluir = ['mes', 'actualizadoEn', 'categoria', 'subcategoria'];
    const wb = XLSX.utils.book_new();

    Object.entries(gruposReportes).forEach(([nombreGrupo, reportes]) => {
      const columnas = [...new Set(reportes.flatMap(r => Object.keys(r).filter(k => !camposExcluir.includes(k))))];
      const orden = ['actorId', 'nombreActor'];
      columnas.sort((a, b) => {
        const ai = orden.indexOf(a), bi = orden.indexOf(b);
        if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        return a.localeCompare(b);
      });

      const filas = reportes.map(r =>
        Object.fromEntries(columnas.map(c => [c, typeof r[c] === 'number' ? r[c] : (r[c] ?? '')]))
      );

      const totales = {};
      columnas.forEach(c => {
        const esNumerica = reportes.every(r => typeof r[c] === 'number' || r[c] === undefined);
        totales[c] = esNumerica && c !== 'actorId' && c !== 'nombreActor'
          ? reportes.reduce((s, r) => s + (typeof r[c] === 'number' ? r[c] : 0), 0)
          : (c === 'nombreActor' ? 'TOTAL' : '');
      });
      filas.push(totales);

      const ws = XLSX.utils.json_to_sheet(filas, { header: columnas });
      const nombreHoja = nombreGrupo.replace(/[\\/*?:[\]]/g, '').slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja || 'Datos');
    });

    XLSX.writeFile(wb, `mis-datos-${new Date().toISOString().slice(0, 7)}.xlsx`);
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
    { id: 'candela', label: 'Candela', icon: Flame },
    { id: 'puntos', label: 'Puntos de Interés', icon: MapPin },
    { id: 'datos', label: 'Datos', icon: BarChart3 },
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

        {!loading && tab === 'candela' && votosCandela && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6">
              <p className="text-sm text-gris">Total de votos registrados</p>
              <p className="text-3xl font-bold text-terracota">{votosCandela.total}</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-bold text-terracota mb-4">Votos por participante (ID)</h3>
              {Object.keys(votosCandela.porParticipante).length === 0 ? (
                <p className="text-sm text-gris">Aún no hay votos registrados.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(votosCandela.porParticipante)
                    .sort((a, b) => b[1] - a[1])
                    .map(([pid, votos]) => (
                      <div key={pid} className="flex justify-between items-center border-b border-gris/10 pb-2">
                        <span className="text-sm text-marron">{pid}</span>
                        <span className="font-bold text-terracota">{votos} voto{votos !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && tab === 'puntos' && (
          <div className="space-y-6">
            <form onSubmit={handleCrearPunto} className="bg-white rounded-lg p-6 space-y-4">
              <h3 className="font-bold text-terracota">Agregar punto de interés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="nombre"
                  value={formPunto.nombre}
                  onChange={handleChangePunto}
                  placeholder="Nombre (ej: Terminal Santa Fe de Antioquia)"
                  className="border border-gris/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-terracota"
                />
                <select
                  name="tipo"
                  value={formPunto.tipo}
                  onChange={handleChangePunto}
                  className="border border-gris/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-terracota"
                >
                  <option value="">Tipo de punto...</option>
                  {Object.entries(TIPOS_PUNTO_INTERES).map(([key, info]) => (
                    <option key={key} value={key}>{info.emoji} {info.label}</option>
                  ))}
                </select>
                <select
                  name="municipio"
                  value={formPunto.municipio}
                  onChange={handleChangePunto}
                  className="border border-gris/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-terracota"
                >
                  <option value="">Municipio (opcional)...</option>
                  {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="lat"
                    value={formPunto.lat}
                    onChange={handleChangePunto}
                    placeholder="Latitud"
                    className="border border-gris/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-terracota"
                  />
                  <input
                    type="text"
                    name="lng"
                    value={formPunto.lng}
                    onChange={handleChangePunto}
                    placeholder="Longitud"
                    className="border border-gris/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-terracota"
                  />
                </div>
              </div>
              <p className="text-xs text-gris">
                Tip: usa la <a href="/coordenadas" target="_blank" className="text-terracota underline">herramienta de coordenadas</a> para obtener lat/lng fácilmente.
              </p>
              <button
                type="submit"
                disabled={guardandoPunto}
                className="bg-terracota text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-terracota-dark transition disabled:opacity-50"
              >
                {guardandoPunto ? 'Guardando...' : '+ Agregar punto'}
              </button>
            </form>

            <div className="space-y-2">
              {puntosInteres.length === 0 ? (
                <p className="text-center text-gris text-sm">Aún no hay puntos de interés creados.</p>
              ) : (
                puntosInteres.map((p) => (
                  <div key={p.id} className="bg-white rounded-lg p-4 flex items-center justify-between border border-gris/10">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{TIPOS_PUNTO_INTERES[p.tipo]?.emoji}</span>
                      <div>
                        <p className="font-semibold text-marron">{p.nombre}</p>
                        <p className="text-xs text-gris">{TIPOS_PUNTO_INTERES[p.tipo]?.label}{p.municipio ? ` · ${p.municipio}` : ''}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEliminarPunto(p.id)}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {!loading && tab === 'datos' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gris">Reportes recibidos este mes</p>
                <p className="text-2xl font-bold text-terracota">{reportesMes.length}</p>
              </div>
              <button
                onClick={descargarExcel}
                disabled={reportesMes.length === 0}
                className="flex items-center gap-2 bg-terracota text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-terracota-dark transition disabled:opacity-40"
              >
                <Download size={16} /> Descargar Excel
              </button>
            </div>

            {Object.keys(gruposReportes).length === 0 ? (
              <p className="text-center text-gris text-sm">Aún no hay reportes este mes.</p>
            ) : (
              Object.entries(gruposReportes).map(([categoria, reportes]) => (
                <div key={categoria} className="bg-white rounded-lg p-4 border border-gris/10">
                  <p className="font-bold text-marron mb-2">{categoria} <span className="text-xs text-gris font-normal">({reportes.length} reportante{reportes.length !== 1 ? 's' : ''})</span></p>
                  <div className="space-y-1">
                    {reportes.map(r => (
                      <p key={r.actorId} className="text-xs text-gris">
                        <span className="font-semibold text-marron">{r.nombreActor}</span> ·{' '}
                        {Object.entries(r)
                          .filter(([k, v]) => typeof v === 'number' && v !== 0)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'invitaciones' && (
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="font-bold text-terracota mb-3">Autorizar actores</h3>
            <p className="text-sm text-gris mb-4">
              Pega uno o varios correos (uno por línea, o separados por coma) para autorizarlos de una vez.
            </p>
            {invitacionMsg && (
              <div className={`text-sm rounded p-3 mb-4 ${invitacionMsg.tipo === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {invitacionMsg.texto}
              </div>
            )}
            <form onSubmit={handleAgregarInvitacion} className="space-y-3">
              <textarea
                value={nuevoCorreo}
                onChange={(e) => setNuevoCorreo(e.target.value)}
                required
                rows={5}
                placeholder={'correo1@ejemplo.com\ncorreo2@ejemplo.com\ncorreo3@ejemplo.com'}
                className="w-full border border-gris/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-terracota resize-none"
              />
              <button type="submit" className="w-full bg-terracota text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-terracota-dark transition">
                Autorizar todos
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}