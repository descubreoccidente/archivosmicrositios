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
  increment
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
        orderBy('fecha'),
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

    return await obtenerMicrositio(actorId);
  } catch (error) {
    console.error('Error obteniendo micrositio por slug:', error);
    throw error;
  }
};
// Identificador de semana (formato YYYY-Www)
function getWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// Guardar reporte semanal de datos de un actor
export const guardarReporteSemanal = async (actorId, categoria, subcategoria, datos) => {
  try {
    const weekId = getWeekId();
    const reporteRef = doc(db, 'actors', actorId, 'reportesSemanales', weekId);
    await setDoc(reporteRef, {
      ...datos,
      categoria,
      subcategoria: subcategoria || null,
      semana: weekId,
      actualizadoEn: new Date()
    }, { merge: true });
    return { success: true, weekId };
  } catch (error) {
    console.error('Error guardando reporte semanal:', error);
    throw error;
  }
};
// Obtener el reporte de la semana actual de un actor (o null si no existe)
export const obtenerReporteSemanaActual = async (actorId) => {
  try {
    const weekId = getWeekId();
    const reporteDoc = await getDoc(doc(db, 'actors', actorId, 'reportesSemanales', weekId));
    return reporteDoc.exists() ? { id: reporteDoc.id, ...reporteDoc.data() } : null;
  } catch (error) {
    console.error('Error obteniendo reporte de la semana:', error);
    throw error;
  }
};

// Obtener historial de reportes de un actor
export const obtenerHistorialReportes = async (actorId) => {
  try {
    const snap = await getDocs(
      query(collection(db, 'actors', actorId, 'reportesSemanales'), orderBy('semana', 'desc'), limit(12))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    throw error;
  }
};
// Obtener promedio del territorio (semana actual) por categoría/subcategoría
export const obtenerPromedioTerritorio = async (categoria, subcategoria) => {
  try {
    const weekId = getWeekId();
    const q = query(
      collectionGroup(db, 'reportesSemanales'),
      where('semana', '==', weekId),
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

    const excluir = ['semana', 'categoria', 'subcategoria', 'actualizadoEn', 'actividadPrincipal', 'unidadMaterial'];
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