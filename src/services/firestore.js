import { db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  collectionGroup,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  writeBatch
} from 'firebase/firestore';

// Crear/actualizar micrositio del actor
export const crearMicrositio = async (actorId, datos) => {
  try {
    const actorRef = doc(db, 'actors', actorId);
    await setDoc(actorRef, {
      uid: actorId,
      basicInfo: datos,
      stats: {
        ratingPromedio: 0,
        totalResenas: 0,
        visitas: 0,
        ultimaActualizacion: new Date()
      },
      config: {
        activo: true,
        pagoPendiente: false
      },
      createdAt: new Date()
    }, { merge: true });
    return { success: true, actorId };
  } catch (error) {
    console.error('Error creando micrositio:', error);
    throw error;
  }
};

// Obtener micrositio completo
export const obtenerMicrositio = async (actorId) => {
  try {
    const actorDoc = await getDoc(doc(db, 'actors', actorId));

    if (!actorDoc.exists()) return null;

    const fotosSnap = await getDocs(
      query(
        collection(db, 'actors', actorId, 'media'),
        orderBy('order')
      )
    );

    const resenas = await getDocs(
      query(
        collection(db, 'reviews'),
        where('actorId', '==', actorId),
        where('activa', '==', true),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
    );

    const eventos = await getDocs(
      query(
        collection(db, 'events'),
        where('actorId', '==', actorId),
        where('fecha', '>=', new Date()),
        orderBy('fecha', 'asc'),
        limit(3)
      )
    );

    const promocionesSnap = await getDocs(
      query(collection(db, 'promociones'), where('actorId', '==', actorId))
    );
    const ahora = new Date();
    const promociones = promocionesSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => !p.fechaVencimiento || p.fechaVencimiento.toDate() > ahora);

    return {
      actor: { id: actorDoc.id, ...actorDoc.data() },
      fotos: fotosSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      resenas: resenas.docs.map(d => ({ id: d.id, ...d.data() })),
      eventos: eventos.docs.map(d => ({ id: d.id, ...d.data() })),
      promociones
    };
  } catch (error) {
    console.error('Error obteniendo micrositio:', error);
    throw error;
  }
};

// Crear evento
export const crearEvento = async (actorId, datosEvento) => {
  try {
    const eventsRef = collection(db, 'events');
    const docRef = await addDoc(eventsRef, {
      actorId,
      actorUid: actorId,
      ...datosEvento,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        publicado: true,
        reportes: 0
      }
    });
    return { success: true, eventId: docRef.id };
  } catch (error) {
    console.error('Error creando evento:', error);
    throw error;
  }
};

// Verificar si el usuario ya dejó reseña para este actor
export const obtenerResenaUsuario = async (actorId, userId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('actorId', '==', actorId),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch (error) {
    console.error('Error verificando reseña:', error);
    return null;
  }
};

// Crear reseña
export const crearResena = async (actorId, userId, datosResena) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const docRef = await addDoc(reviewsRef, {
      actorId,
      userId,
      ...datosResena,
      createdAt: new Date(),
      reportes: 0,
      activa: true
    });

    // Actualizar rating promedio
    await actualizarRatingActor(actorId);

    return { success: true, reviewId: docRef.id };
  } catch (error) {
    console.error('Error creando reseña:', error);
    throw error;
  }
};

// Actualizar rating promedio del actor
const actualizarRatingActor = async (actorId) => {
  try {
    const resenas = await getDocs(
      query(
        collection(db, 'reviews'),
        where('actorId', '==', actorId),
        where('activa', '==', true)
      )
    );

    if (resenas.empty) return;

    const ratingPromedio = resenas.docs.reduce((sum, doc) => sum + doc.data().rating, 0) / resenas.size;

    await updateDoc(doc(db, 'actors', actorId), {
      'stats.ratingPromedio': ratingPromedio,
      'stats.totalResenas': resenas.size,
      'stats.ultimaActualizacion': new Date()
    });
  } catch (error) {
    console.error('Error actualizando rating:', error);
  }
};

// Obtener todos los eventos de un actor (para gestión en su dashboard)
export const obtenerEventosActor = async (actorId) => {
  try {
    const eventos = await getDocs(
      query(
        collection(db, 'events'),
        where('actorId', '==', actorId),
        orderBy('fecha', 'desc')
      )
    );
    return eventos.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error obteniendo eventos del actor:', error);
    throw error;
  }
};

// Eliminar evento
export const eliminarEvento = async (eventId) => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
    return { success: true };
  } catch (error) {
    console.error('Error eliminando evento:', error);
    throw error;
  }
};

// Actualizar evento existente
export const actualizarEvento = async (eventId, datosEvento) => {
  try {
    await updateDoc(doc(db, 'events', eventId), {
      ...datosEvento,
      'metadata.updatedAt': new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error actualizando evento:', error);
    throw error;
  }
};

// Actualizar promoción existente
export const actualizarPromocion = async (promoId, datos) => {
  try {
    await updateDoc(doc(db, 'promociones', promoId), datos);
    return { success: true };
  } catch (error) {
    console.error('Error actualizando promoción:', error);
    throw error;
  }
};

// Obtener agenda regional filtrada
export const obtenerAgendaRegional = async (filtros) => {
  try {
    const fechaInicio = filtros.fechaInicio instanceof Date ? filtros.fechaInicio : new Date(filtros.fechaInicio || new Date());
    const fechaFin = filtros.fechaFin instanceof Date ? filtros.fechaFin : new Date(filtros.fechaFin || new Date(Date.now() + 30*24*60*60*1000));

    const q = query(
      collection(db, 'events'),
      where('fecha', '>=', fechaInicio),
      where('fecha', '<=', fechaFin),
      orderBy('fecha')
    );

    const eventos = await getDocs(q);
    let resultado = eventos.docs.map(d => ({ id: d.id, ...d.data() }));

    if (filtros.categoria) {
      resultado = resultado.filter(e => e.categoria === filtros.categoria);
    }
    if (filtros.municipio) {
      resultado = resultado.filter(e => e.municipio === filtros.municipio);
    }

    return resultado;
  } catch (error) {
    console.error('Error obteniendo agenda:', error);
    throw error;
  }
};

// Guardar autoevaluación de turismo responsable
export const guardarSostenibilidad = async (actorId, datos) => {
  try {
    const actorRef = doc(db, 'actors', actorId);
    await setDoc(actorRef, {
      sostenibilidad: {
        ...datos,
        actualizadoEn: new Date()
      }
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error guardando sostenibilidad:', error);
    throw error;
  }
};

// Generar slug único a partir del nombre
export const generarSlugUnico = async (nombre, actorIdActual) => {
  const base = nombre
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  let slug = base;
  let contador = 1;

  while (true) {
    const q = query(collection(db, 'actors'), where('basicInfo.slug', '==', slug));
    const snap = await getDocs(q);
    const enUso = snap.docs.some(d => d.id !== actorIdActual);
    if (!enUso) break;
    contador++;
    slug = `${base}-${contador}`;
  }

  return slug;
};

// Obtener micrositio publico por slug
export const obtenerMicrositioPorSlug = async (slug) => {
  try {
    const q = query(collection(db, 'actors'), where('basicInfo.slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const actorDoc = snap.docs[0];
    const actorId = actorDoc.id;

    if (actorDoc.data().config?.activo === false) return null;

    return await obtenerMicrositio(actorId);
  } catch (error) {
    console.error('Error obteniendo micrositio por slug:', error);
    throw error;
  }
};
// Identificador de mes (formato YYYY-MM)
function getMonthId(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Guardar reporte mensual de datos de un actor
export const guardarReporteMensual = async (actorId, categoria, subcategoria, datos) => {
  try {
    const monthId = getMonthId();
    const reporteRef = doc(db, 'actors', actorId, 'reportesMensuales', monthId);
    await setDoc(reporteRef, {
      ...datos,
      categoria,
      subcategoria: subcategoria || null,
      mes: monthId,
      actualizadoEn: new Date()
    }, { merge: true });
    return { success: true, monthId };
  } catch (error) {
    console.error('Error guardando reporte mensual:', error);
    throw error;
  }
};

// Obtener el reporte del mes actual de un actor (o null si no existe)
export const obtenerReporteMesActual = async (actorId) => {
  try {
    const monthId = getMonthId();
    const reporteDoc = await getDoc(doc(db, 'actors', actorId, 'reportesMensuales', monthId));
    return reporteDoc.exists() ? { id: reporteDoc.id, ...reporteDoc.data() } : null;
  } catch (error) {
    console.error('Error obteniendo reporte del mes:', error);
    throw error;
  }
};

// Obtener historial de reportes de un actor
export const obtenerHistorialReportes = async (actorId) => {
  try {
    const snap = await getDocs(
      query(collection(db, 'actors', actorId, 'reportesMensuales'), orderBy('mes', 'desc'), limit(12))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    throw error;
  }
};

// Obtener promedio del territorio (mes actual) por categoría/subcategoría
export const obtenerPromedioTerritorio = async (categoria, subcategoria) => {
  try {
    const monthId = getMonthId();
    const q = query(
      collectionGroup(db, 'reportesMensuales'),
      where('mes', '==', monthId),
      where('categoria', '==', categoria)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;

    let reportes = snap.docs.map(d => d.data());
    if (subcategoria) {
      reportes = reportes.filter(r => r.subcategoria === subcategoria);
    } else {
      reportes = reportes.filter(r => !r.subcategoria);
    }
    if (reportes.length === 0) return null;

    const excluir = ['mes', 'categoria', 'subcategoria', 'actualizadoEn', 'actividadPrincipal', 'unidadMaterial'];
    const camposNumericos = Object.keys(reportes[0]).filter(
      k => !excluir.includes(k) && typeof reportes[0][k] === 'number'
    );

    const promedios = {};
    camposNumericos.forEach(campo => {
      const suma = reportes.reduce((s, r) => s + (r[campo] || 0), 0);
      promedios[campo] = Math.round((suma / reportes.length) * 10) / 10;
    });

    return { totalReportantes: reportes.length, promedios };
  } catch (error) {
    console.error('Error obteniendo promedio territorio:', error);
    throw error;
  }
};
// Marcar/quitar asistencia a un evento
export const toggleAsistenciaEvento = async (eventId, userId, datosUsuario) => {
  try {
    const asistenciaRef = doc(db, 'events', eventId, 'asistentes', userId);
    const asistenciaDoc = await getDoc(asistenciaRef);

    if (asistenciaDoc.exists()) {
      await deleteDoc(asistenciaRef);
      return { asistira: false };
    } else {
      await setDoc(asistenciaRef, {
        userId,
        ...datosUsuario,
        fecha: new Date()
      });
      return { asistira: true };
    }
  } catch (error) {
    console.error('Error actualizando asistencia:', error);
    throw error;
  }
};

// Obtener conteo de asistentes y si el usuario actual ya marcó asistencia
export const obtenerAsistenciaEvento = async (eventId, userId) => {
  try {
    const snap = await getDocs(collection(db, 'events', eventId, 'asistentes'));
    const total = snap.size;
    const yaAsiste = userId ? snap.docs.some(d => d.id === userId) : false;
    return { total, yaAsiste };
  } catch (error) {
    console.error('Error obteniendo asistencia:', error);
    return { total: 0, yaAsiste: false };
  }
};
// Verificar si un correo tiene invitación activa, y vincularla al usuario
export const verificarYRegistrarInvitacion = async (email, uid) => {
  try {
    const emailNormalizado = email.trim().toLowerCase();
    const invRef = doc(db, 'invitaciones', emailNormalizado);
    const invSnap = await getDoc(invRef);

    if (!invSnap.exists() || !invSnap.data().autorizado) {
      return { autorizado: false };
    }

    await setDoc(invRef, { usado: true, actorId: uid, fechaUso: new Date() }, { merge: true });
    return { autorizado: true };
  } catch (error) {
    console.error('Error verificando invitación:', error);
    return { autorizado: false };
  }
};
// Obtener todos los actores públicos con datos resumidos para el directorio
export const obtenerActoresPublicos = async () => {
  try {
    const snap = await getDocs(collection(db, 'actors'));
    const actores = await Promise.all(snap.docs.map(async (d) => {
      const data = d.data();
      const info = data.basicInfo || {};
      if (!info.nombre || !info.slug) return null;
      if (data.config?.activo === false) return null;

      let fotoPortada = null;
      try {
        const mediaSnap = await getDocs(
          query(collection(db, 'actors', d.id, 'media'), where('esPortada', '==', true), limit(1))
        );
        if (!mediaSnap.empty) fotoPortada = mediaSnap.docs[0].data().url;
      } catch (e) {
        // sin foto, no pasa nada
      }

      return {
        id: d.id,
        slug: info.slug,
        nombre: info.nombre,
        categoria: info.categoria,
        subcategoria: info.subcategoria,
        municipio: info.municipio,
        logo: info.logo || null,
        fotoPortada,
        rating: data.stats?.ratingPromedio || 0,
        totalResenas: data.stats?.totalResenas || 0
      };
    }));
    return actores.filter(Boolean);
  } catch (error) {
    console.error('Error obteniendo actores públicos:', error);
    throw error;
  }
};
// Obtener promociones activas para la landing, con municipio del actor
export const obtenerPromocionesDestacadas = async () => {
  try {
    const ahora = new Date();
    const snap = await getDocs(collection(db, 'promociones'));
    const promos = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => !p.fechaVencimiento || p.fechaVencimiento.toDate() > ahora);

    const conMunicipio = await Promise.all(promos.map(async (p) => {
      try {
        const actorDoc = await getDoc(doc(db, 'actors', p.actorId));
        return { ...p, municipio: actorDoc.exists() ? actorDoc.data().basicInfo?.municipio : null };
      } catch (e) {
        return { ...p, municipio: null };
      }
    }));

    conMunicipio.sort((a, b) => (b.fechaCreacion?.toMillis?.() || 0) - (a.fechaCreacion?.toMillis?.() || 0));
    return conMunicipio;
  } catch (error) {
    console.error('Error obteniendo promociones destacadas:', error);
    throw error;
  }
};
// Coordenadas centrales aproximadas de cada municipio del Occidente Antioqueño
export const COORDENADAS_MUNICIPIOS = {
  'Abriaquí': { lat: 6.6314, lng: -76.0656 },
  'Anzá': { lat: 6.2803, lng: -75.8983 },
  'Armenia': { lat: 6.1567, lng: -75.7897 },
  'Buriticá': { lat: 6.7203, lng: -75.9089 },
  'Caicedo': { lat: 6.4128, lng: -75.6917 },
  'Cañasgordas': { lat: 6.7508, lng: -76.0269 },
  'Dabeiba': { lat: 7.0189, lng: -76.2622 },
  'Ebéjico': { lat: 6.3269, lng: -75.7683 },
  'Frontino': { lat: 6.7756, lng: -76.1319 },
  'Giraldo': { lat: 6.6939, lng: -75.7381 },
  'Heliconia': { lat: 6.2011, lng: -75.7325 },
  'Liborina': { lat: 6.6772, lng: -75.8161 },
  'Olaya': { lat: 6.6081, lng: -75.8103 },
  'Peque': { lat: 7.0122, lng: -75.9042 },
  'Sabanalarga': { lat: 6.8506, lng: -75.8228 },
  'San Jerónimo': { lat: 6.4433, lng: -75.7256 },
  'Santa Fe de Antioquia': { lat: 6.5564, lng: -75.8281 },
  'Sopetrán': { lat: 6.5011, lng: -75.7439 },
  'Uramita': { lat: 6.8908, lng: -76.1786 },
};

// Obtener puntos de mapa: actores (verde) y eventos (amarillo)
export const obtenerPuntosMapa = async () => {
  try {
    const actoresSnap = await getDocs(collection(db, 'actors'));
    const actores = actoresSnap.docs
      .map(d => {
        const data = d.data();
        const info = data.basicInfo || {};
        if (!info.nombre || !info.slug) return null;
        if (data.config?.activo === false) return null;
        let coords = null;
        const latPropia = parseFloat(info.ubicacion?.lat);
        const lngPropia = parseFloat(info.ubicacion?.lng);
        if (Number.isFinite(latPropia) && Number.isFinite(lngPropia)) {
          coords = { lat: latPropia, lng: lngPropia };
        } else {
          coords = COORDENADAS_MUNICIPIOS[info.municipio];
        }
        if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return null;
        return {
          tipo: 'actor',
          id: d.id,
          nombre: info.nombre,
          categoria: info.categoria,
          municipio: info.municipio,
          slug: info.slug,
          lat: coords.lat,
          lng: coords.lng
        };
      })
      .filter(Boolean);

    const ahora = new Date();
    const eventosSnap = await getDocs(
      query(collection(db, 'events'), where('fecha', '>=', ahora))
    );
    const eventos = eventosSnap.docs
      .map(d => {
        const e = d.data();
        let coords = null;
        const latPropia = parseFloat(e.ubicacion?.lat);
        const lngPropia = parseFloat(e.ubicacion?.lng);
        if (Number.isFinite(latPropia) && Number.isFinite(lngPropia)) {
          coords = { lat: latPropia, lng: lngPropia };
        } else {
          coords = COORDENADAS_MUNICIPIOS[e.municipio];
        }
        if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return null;
        return {
          tipo: 'evento',
          id: d.id,
          nombre: e.nombre,
          categoria: e.categoria,
          municipio: e.municipio,
          lat: coords.lat,
          lng: coords.lng
        };
      })
      .filter(Boolean);

    return [...actores, ...eventos];
  } catch (error) {
    console.error('Error obteniendo puntos del mapa:', error);
    throw error;
  }
};
// ===== CANDELA FESTIVAL =====

// Fecha límite de votación: 4 de octubre de 2026, 11:59 pm
export const CANDELA_FECHA_INICIO = new Date('2026-09-30T19:00:00-05:00');
export const CANDELA_FECHA_LIMITE = new Date('2026-10-04T22:00:00-05:00');

// Obtener todos los participantes del concurso
export const obtenerParticipantesCandela = async () => {
  try {
    const snap = await getDocs(collection(db, 'candelaParticipantes'));
    const participantes = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const votosSnap = await getDocs(collectionGroup(db, 'votos'));
    const conteo = {};
    votosSnap.docs.forEach(v => {
      const pid = v.data().participanteId;
      conteo[pid] = (conteo[pid] || 0) + 1;
    });

    return participantes
      .map(p => ({ ...p, votos: conteo[p.id] || 0 }))
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));
  } catch (error) {
    console.error('Error obteniendo participantes Candela:', error);
    throw error;
  }
};

// Verificar si un usuario ya votó
export const obtenerVotoUsuarioCandela = async (userId) => {
  try {
    const votoDoc = await getDoc(doc(db, 'candelaVotos', userId));
    return votoDoc.exists() ? votoDoc.data() : null;
  } catch (error) {
    console.error('Error verificando voto:', error);
    return null;
  }
};

// Registrar un voto por categoría (hasta 3 votos por usuario: uno por categoría)
export const votarCandela = async (participanteId, categoria, userId, nombreUsuario) => {
  try {
    const votoRef = doc(db, 'candelaVotos', userId);
    const votoDoc = await getDoc(votoRef);
    const votosActuales = votoDoc.exists() ? (votoDoc.data().votos || {}) : {};

    if (votosActuales[categoria]) {
      throw new Error('Ya votaste en esta categoría');
    }

    await setDoc(votoRef, {
      userId,
      nombreUsuario,
      votos: { ...votosActuales, [categoria]: participanteId },
      fecha: new Date()
    }, { merge: true });

    await setDoc(
      doc(db, 'candelaParticipantes', participanteId, 'votos', userId),
      { userId, fecha: new Date() }
    );

    return { success: true };
  } catch (error) {
    console.error('Error registrando voto:', error);
    throw error;
  }
};
// ===== PANEL DE ADMINISTRADOR =====

export const verificarAdmin = async (email) => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', email.trim().toLowerCase()));
    return adminDoc.exists() && adminDoc.data().autorizado === true;
  } catch (error) {
    console.error('Error verificando admin:', error);
    return false;
  }
};

// Obtener todos los actores (para el panel admin, incluye suspendidos)
export const obtenerTodosLosActoresAdmin = async () => {
  try {
    const snap = await getDocs(collection(db, 'actors'));
    return snap.docs
      .map(d => {
        const info = d.data().basicInfo || {};
        return {
          id: d.id,
          nombre: info.nombre || '(Sin nombre)',
          categoria: info.categoria || '',
          municipio: info.municipio || '',
          slug: info.slug || '',
          activo: d.data().config?.activo !== false
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error obteniendo actores (admin):', error);
    throw error;
  }
};

// Suspender / reactivar un actor
export const toggleActivoActor = async (actorId, activo) => {
  try {
    await updateDoc(doc(db, 'actors', actorId), { 'config.activo': activo });
    return { success: true };
  } catch (error) {
    console.error('Error cambiando estado del actor:', error);
    throw error;
  }
};

// Obtener todos los eventos (para el panel admin)
export const obtenerTodosLosEventosAdmin = async () => {
  try {
    const snap = await getDocs(query(collection(db, 'events'), orderBy('fecha', 'desc'), limit(100)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error obteniendo eventos (admin):', error);
    throw error;
  }
};

// Obtener todas las promociones activas (para el panel admin)
export const obtenerTodasLasPromocionesAdmin = async () => {
  try {
    const snap = await getDocs(collection(db, 'promociones'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error obteniendo promociones (admin):', error);
    throw error;
  }
};

// Agregar un correo autorizado a la lista de invitaciones (desde el panel admin)
export const agregarInvitacionAdmin = async (email) => {
  try {
    const emailNormalizado = email.trim().toLowerCase();
    await setDoc(doc(db, 'invitaciones', emailNormalizado), {
      autorizado: true,
      usado: false,
      agregadoPorAdmin: true,
      fecha: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error agregando invitación:', error);
    throw error;
  }
};
// Eliminar una promoción (uso general, incluido admin)
export const eliminarPromocion = async (promoId) => {
  try {
    await deleteDoc(doc(db, 'promociones', promoId));
    return { success: true };
  } catch (error) {
    console.error('Error eliminando promoción:', error);
    throw error;
  }
};
// Obtener todos los votos del concurso Candela (solo admin)
export const obtenerVotosCandelaAdmin = async () => {
  try {
    const snap = await getDocs(collection(db, 'candelaVotos'));
    const conteo = {};
    let totalVotos = 0;
    snap.docs.forEach(d => {
      const votos = d.data().votos || {};
      Object.values(votos).forEach(pid => {
        conteo[pid] = (conteo[pid] || 0) + 1;
        totalVotos++;
      });
    });
    return { total: totalVotos, porParticipante: conteo };
  } catch (error) {
    console.error('Error obteniendo votos Candela:', error);
    throw error;
  }
};
// Obtener todos los reportes mensuales de un mes específico (para el panel admin)
export const obtenerReportesMesAdmin = async (monthId) => {
  try {
    const q = query(collectionGroup(db, 'reportesMensuales'), where('mes', '==', monthId));
    const snap = await getDocs(q);

    const actoresSnap = await getDocs(collection(db, 'actors'));
    const nombresPorId = {};
    actoresSnap.docs.forEach(d => {
      nombresPorId[d.id] = d.data().basicInfo?.nombre || '(Sin nombre)';
    });

    return snap.docs.map(d => {
      const actorId = d.ref.parent.parent.id;
      return {
        actorId,
        nombreActor: nombresPorId[actorId] || '(Actor eliminado)',
        ...d.data()
      };
    });
  } catch (error) {
    console.error('Error obteniendo reportes del mes (admin):', error);
    throw error;
  }
};
// Verificación de solo lectura (sin marcar como "usado"), para proteger el Dashboard
export const verificarInvitacion = async (email) => {
  try {
    const emailNormalizado = email.trim().toLowerCase();
    const invSnap = await getDoc(doc(db, 'invitaciones', emailNormalizado));
    return invSnap.exists() && invSnap.data().autorizado === true;
  } catch (error) {
    console.error('Error verificando invitación:', error);
    return false;
  }
};
// Registrar una visita al micrositio (contador simple, sin datos personales)
export const registrarVisitaMicrositio = async (actorId) => {
  try {
    await updateDoc(doc(db, 'actors', actorId), {
      'stats.visitas': increment(1)
    });
  } catch (error) {
    console.error('Error registrando visita:', error);
  }
};
// ===== PUNTOS DE INTERÉS GENERAL (administrados por el admin) =====

export const TIPOS_PUNTO_INTERES = {
  'terminal': { label: 'Terminal de transporte', emoji: '🚌' },
  'hospital': { label: 'Hospital / Centro de salud', emoji: '🏥' },
  'info': { label: 'Punto de información turística', emoji: 'ℹ️' },
  'parqueadero': { label: 'Parqueadero', emoji: '🅿️' },
  'cambio': { label: 'Cambio de moneda', emoji: '💱' },
  'policia': { label: 'Policía de Turismo', emoji: '👮' },
  'farmacia': { label: 'Farmacia', emoji: '💊' },
  'cajero': { label: 'Cajero / Banco', emoji: '🏧' },
  'banos': { label: 'Baños públicos', emoji: '🚻' },
  'mirador': { label: 'Mirador', emoji: '🔭' },
  'iglesia': { label: 'Iglesia / Templo', emoji: '⛪' },
};

export const crearPuntoInteres = async (datos) => {
  try {
    const docRef = await addDoc(collection(db, 'puntosInteres'), {
      ...datos,
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creando punto de interés:', error);
    throw error;
  }
};

export const obtenerPuntosInteres = async () => {
  try {
    const snap = await getDocs(collection(db, 'puntosInteres'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error obteniendo puntos de interés:', error);
    return [];
  }
};

export const eliminarPuntoInteres = async (id) => {
  try {
    await deleteDoc(doc(db, 'puntosInteres', id));
    return { success: true };
  } catch (error) {
    console.error('Error eliminando punto de interés:', error);
    throw error;
  }
};
// ===== DESCUBRE MÁS (lugares/experiencias especiales para Entes Territoriales) =====

export const crearItemDescubreMas = async (actorId, datos) => {
  try {
    const docRef = await addDoc(collection(db, 'actors', actorId, 'descubreMas'), {
      ...datos,
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creando item Descubre Más:', error);
    throw error;
  }
};

export const obtenerItemsDescubreMas = async (actorId) => {
  try {
    const snap = await getDocs(
      query(collection(db, 'actors', actorId, 'descubreMas'), orderBy('createdAt', 'desc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error obteniendo items Descubre Más:', error);
    return [];
  }
};

export const eliminarItemDescubreMas = async (actorId, itemId) => {
  try {
    await deleteDoc(doc(db, 'actors', actorId, 'descubreMas', itemId));
    return { success: true };
  } catch (error) {
    console.error('Error eliminando item Descubre Más:', error);
    throw error;
  }
};

// Para el mapa: obtener todos los lugares de "Descubre Más" de todos los entes territoriales
export const obtenerLugaresDescubreMasParaMapa = async () => {
  try {
    const snap = await getDocs(collectionGroup(db, 'descubreMas'));
    return snap.docs
      .map(d => ({ id: d.id, actorId: d.ref.parent.parent.id, ...d.data() }))
      .filter(item => item.tipo === 'lugar' && Number.isFinite(item.lat) && Number.isFinite(item.lng));
  } catch (error) {
    console.error('Error obteniendo lugares Descubre Más para mapa:', error);
    return [];
  }
};
export const actualizarPuntoInteres = async (id, datos) => {
  try {
    await updateDoc(doc(db, 'puntosInteres', id), datos);
    return { success: true };
  } catch (error) {
    console.error('Error actualizando punto de interés:', error);
    throw error;
  }
};

export const toggleDestacadoEvento = async (eventId, destacado) => {
  try {
    await updateDoc(doc(db, 'events', eventId), { destacado });
    return { success: true };
  } catch (error) {
    console.error('Error actualizando destacado:', error);
    throw error;
  }
};
export const obtenerEventosDestacados = async () => {
  try {
    const ahora = new Date();
    const q = query(collection(db, 'events'), where('destacado', '==', true));
    const snap = await getDocs(q);
    let eventos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    eventos = eventos.filter(e => {
      const fecha = e.fechaInicio || e.fecha;
      if (!fecha) return true;
      const fechaDate = fecha.toDate ? fecha.toDate() : new Date(fecha);
      return fechaDate >= ahora;
    });
    eventos.sort((a, b) => {
      const fa = (a.fechaInicio || a.fecha)?.toMillis?.() || 0;
      const fb = (b.fechaInicio || b.fecha)?.toMillis?.() || 0;
      return fa - fb;
    });
    return eventos.slice(0, 3);
  } catch (error) {
    console.error('Error obteniendo eventos destacados:', error);
    return [];
  }
};