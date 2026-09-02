import React, { useState, useEffect } from 'react';
import { obtenerMicrositioPorSlug, toggleAsistenciaEvento, obtenerAsistenciaEvento, registrarVisitaMicrositio, obtenerItemsDescubreMas } from '../services/firestore';
import { useSEO } from '../hooks/useSEO';
import { onAuthChange, agregarContactoBrevo } from '../services/auth';
import ModalLoginVisitante from './modallogivisitante';
import SistemaResenas from './sistemaresenas';
import NavBar from './NavBar';
import {
  MapPin, Phone, Mail, Globe, Leaf, FileText, Download,
  Facebook, Instagram, Youtube, Music2, Link as LinkIcon, Calendar, Star, X, Clock, Users, ExternalLink, Linkedin, Award, Tag,
  ChevronLeft, ChevronRight, Video, Package, Compass
} from 'lucide-react';

function WhatsAppIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12.001 2C6.478 2 2 6.478 2 12c0 2.096.639 4.06 1.732 5.688L2 22l4.436-1.694A9.955 9.955 0 0012.001 22C17.523 22 22 17.522 22 12S17.523 2 12.001 2zm0 18.148c-1.792 0-3.457-.535-4.85-1.454l-.348-.219-3.607 1.377 1.394-3.514-.227-.36a8.132 8.132 0 01-1.315-4.478c0-4.509 3.669-8.177 8.178-8.177 2.186 0 4.24.851 5.784 2.396a8.116 8.116 0 012.396 5.784c0 4.509-3.668 8.177-8.177 8.177z"/>
    </svg>
  );
}

const RED_ICONOS = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: WhatsAppIcon,
  tiktok: Music2,
  youtube: Youtube,
  linkedin: Linkedin,
};

const CATEGORIA_COLORES = {
  'Comidas rápidas': { badge: 'bg-red-500', accent: 'border-red-500', tag: 'bg-red-50 text-red-600' },
  'Comida Gourmet': { badge: 'bg-red-500', accent: 'border-red-500', tag: 'bg-red-50 text-red-600' },
  'Bebidas y licores': { badge: 'bg-orange-500', accent: 'border-orange-500', tag: 'bg-orange-50 text-orange-600' },
  'Dulces y postres': { badge: 'bg-pink-500', accent: 'border-pink-500', tag: 'bg-pink-50 text-pink-600' },
  'Happy hour': { badge: 'bg-orange-500', accent: 'border-orange-500', tag: 'bg-orange-50 text-orange-600' },
  'Alojamiento': { badge: 'bg-blue-500', accent: 'border-blue-500', tag: 'bg-blue-50 text-blue-600' },
  'Tours': { badge: 'bg-teal-500', accent: 'border-teal-500', tag: 'bg-teal-50 text-teal-600' },
  'Paquetes turísticos': { badge: 'bg-teal-500', accent: 'border-teal-500', tag: 'bg-teal-50 text-teal-600' },
  'Escapadas': { badge: 'bg-teal-500', accent: 'border-teal-500', tag: 'bg-teal-50 text-teal-600' },
  'Día de sol': { badge: 'bg-yellow-500', accent: 'border-yellow-500', tag: 'bg-yellow-50 text-yellow-600' },
  'Noche de luna': { badge: 'bg-indigo-500', accent: 'border-indigo-500', tag: 'bg-indigo-50 text-indigo-600' },
  'Lunas de miel': { badge: 'bg-pink-500', accent: 'border-pink-500', tag: 'bg-pink-50 text-pink-600' },
  'Entrada a show': { badge: 'bg-purple-500', accent: 'border-purple-500', tag: 'bg-purple-50 text-purple-600' },
  'Karaoke': { badge: 'bg-purple-500', accent: 'border-purple-500', tag: 'bg-purple-50 text-purple-600' },
  'Entrada a museo': { badge: 'bg-amber-600', accent: 'border-amber-600', tag: 'bg-amber-50 text-amber-700' },
  'Joyería en filigrana': { badge: 'bg-amber-600', accent: 'border-amber-600', tag: 'bg-amber-50 text-amber-700' },
  'Afiliación': { badge: 'bg-green-500', accent: 'border-green-500', tag: 'bg-green-50 text-green-600' },
  'Formación': { badge: 'bg-green-500', accent: 'border-green-500', tag: 'bg-green-50 text-green-600' },
  'Gimnasio': { badge: 'bg-green-500', accent: 'border-green-500', tag: 'bg-green-50 text-green-600' },
  'Clases y talleres': { badge: 'bg-green-500', accent: 'border-green-500', tag: 'bg-green-50 text-green-600' },
  'Oportunidad tributaria': { badge: 'bg-slate-600', accent: 'border-slate-600', tag: 'bg-slate-50 text-slate-700' },
  'Asesoría profesional': { badge: 'bg-slate-600', accent: 'border-slate-600', tag: 'bg-slate-50 text-slate-700' },
};

function colorPromo(categoria) {
  return CATEGORIA_COLORES[categoria] || { badge: 'bg-terracota', accent: 'border-terracota', tag: 'bg-crema text-terracota' };
}

function formatearNumeroWhatsApp(numero) {
  const digitos = numero.replace(/\D/g, '');
  if (digitos.startsWith('57') && digitos.length >= 12) return digitos;
  if (digitos.length === 10) return `57${digitos}`;
  return digitos;
}

function formatFechaEvento(fecha) {
  if (!fecha) return '';
  const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function MicrositioPublico({ slug }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [indiceGaleria, setIndiceGaleria] = useState(null);
  const [promoSeleccionada, setPromoSeleccionada] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [mostrarLoginVisitante, setMostrarLoginVisitante] = useState(false);
  const [asistencia, setAsistencia] = useState({ total: 0, yaAsiste: false });
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [descubreMasItems, setDescubreMasItems] = useState([]);

  useEffect(() => {
    cargar();
    const unsubscribe = onAuthChange((user) => setUsuario(user));
    return () => unsubscribe();
  }, [slug]);
  useSEO(
    data?.actor?.basicInfo?.nombre
      ? `${data.actor.basicInfo.nombre} — ${data.actor.basicInfo.categoria}${data.actor.basicInfo.municipio ? ' en ' + data.actor.basicInfo.municipio : ''} | Descubre Occidente`
      : 'Descubre Occidente Antioqueño',
    data?.actor?.basicInfo?.descripcion ||
      (data?.actor?.basicInfo?.nombre
        ? `Conoce ${data.actor.basicInfo.nombre}, ${data.actor.basicInfo.categoria} en ${data.actor.basicInfo.municipio || 'el Occidente Antioqueño'}.`
        : undefined)
  );

  useEffect(() => {
    if (eventoSeleccionado) {
      cargarAsistencia(eventoSeleccionado.id);
    }
  }, [eventoSeleccionado, usuario]);

  const cargarAsistencia = async (eventId) => {
    const data = await obtenerAsistenciaEvento(eventId, usuario?.uid);
    setAsistencia(data);
  };

  const handleAsistire = async (eventId) => {
    if (!usuario) {
      setAccionPendiente(() => () => handleAsistire(eventId));
      setMostrarLoginVisitante(true);
      return;
    }
    try {
      await toggleAsistenciaEvento(eventId, usuario.uid, {
        nombre: usuario.displayName,
        email: usuario.email
      });
      agregarContactoBrevo(usuario.email, usuario.displayName, 5); // Lista "Asiste Eventos"
      cargarAsistencia(eventId);
    } catch (error) {
      console.error('Error marcando asistencia:', error);
    }
  };

  const handleLoginExitoso = (user) => {
    setUsuario(user);
    setMostrarLoginVisitante(false);
    if (accionPendiente) {
      accionPendiente();
      setAccionPendiente(null);
    }
  };

  const cargar = async () => {
    try {
      const result = await obtenerMicrositioPorSlug(slug);
      if (!result) {
        setNotFound(true);
      } else {
        setData(result);
        registrarVisitaMicrositio(result.actor.id);
        if (result.actor.basicInfo?.categoria === 'Ente territorial') {
          const items = await obtenerItemsDescubreMas(result.actor.id);
          setDescubreMasItems(items);
        }
      }
    } catch (error) {
      console.error('Error cargando micrositio público:', error);
      setNotFound(true);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <p className="text-terracota text-xl font-semibold">Cargando...</p>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <p className="text-marron text-xl">No se encontró este micrositio.</p>
      </div>
    );
  }

  const { actor, fotos, resenas, eventos, promociones } = data;
  const info = actor.basicInfo || {};
  const sostenibilidad = actor.sostenibilidad || {};
  const tieneInsignia = sostenibilidad.insignia;
  const documentos = fotos.filter(f => f.tipo === 'documento');
  const imagenes = fotos.filter(f => !f.tipo || f.tipo === 'foto');
  const videos = fotos.filter(f => f.tipo === 'video');
  const fotoPortada = imagenes.find(f => f.esPortada) || imagenes[0];
  const redesConValor = Object.entries(info.redesSociales || {}).filter(([_, v]) => v);

  const fotoAmpliada = indiceGaleria !== null ? imagenes[indiceGaleria] : null;

  const irAnterior = () => {
    if (indiceGaleria === null) return;
    setIndiceGaleria((indiceGaleria - 1 + imagenes.length) % imagenes.length);
  };
  const irSiguiente = () => {
    if (indiceGaleria === null) return;
    setIndiceGaleria((indiceGaleria + 1) % imagenes.length);
  };

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (deltaX > 50) irAnterior();
    else if (deltaX < -50) irSiguiente();
    setTouchStartX(null);
  };

  return (
    <div className="min-h-screen bg-crema">
      <NavBar />
      {/* Portada */}
      {fotoPortada && (
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img src={fotoPortada.url} alt={info.nombre} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      )}

      {/* Header con info principal */}
      <div className={`bg-terracota text-white p-6 md:p-8 ${fotoPortada ? '-mt-16 relative mx-4 md:mx-8 rounded-lg shadow-lg' : ''}`}>
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          {info.logo && (
            <div className="h-24 w-24 rounded-full bg-white border-4 border-white flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img src={info.logo} alt={info.nombre} className="h-full w-full object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{info.nombre}</h1>
            <p className="text-white/90">{info.categoria}{info.subcategoria ? ` · ${info.subcategoria}` : ''}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {info.municipio && (
                <span className="flex items-center gap-1 text-sm">
                  <MapPin size={14} /> {info.municipio}
                </span>
              )}
              {tieneInsignia && (
                <span className="flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  <Leaf size={14} /> Hoja Verde
                </span>
              )}
              {info.rntVigente && (
                <span className="bg-white/20 text-xs font-semibold px-2 py-1 rounded-full">
                  RNT vigente{info.numeroRnt ? ` · N° ${info.numeroRnt}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* FILA SUPERIOR: Galería | Promociones | Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Galería */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-terracota mb-4">Galería</h2>
            {imagenes.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {imagenes.map((foto, idx) => (
                  <button
                    key={foto.id}
                    onClick={() => setIndiceGaleria(idx)}
                    className="block"
                  >
                    <img
                      src={foto.url}
                      alt={foto.titulo}
                      className="w-full h-20 object-cover rounded-lg hover:opacity-80 transition cursor-pointer"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gris text-sm">Sin fotos disponibles.</p>
            )}
          </div>

          {/* Promociones */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-terracota mb-4">
              <img src="/medalla-promocion.png" alt="" className="h-6" /> Promociones activas
            </h2>
            {promociones && promociones.length > 0 ? (
              <div className="space-y-4">
                {promociones.map((promo) => {
                  const color = colorPromo(promo.categoria);
                  return (
                    <button
                      key={promo.id}
                      onClick={() => setPromoSeleccionada(promo)}
                      className={`w-full text-left rounded-lg overflow-hidden border-t-4 ${color.accent} shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all bg-white`}
                    >
                      <div className="relative aspect-video bg-gray-100">
                        {promo.imagen ? (
                          <img src={promo.imagen} alt={promo.titulo} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${color.tag}`}>
                            <Tag size={28} />
                          </div>
                        )}
                        {promo.descuento && (
                          <span className={`absolute top-2 left-2 ${color.badge} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                            -{promo.descuento}%
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <span className={`inline-block ${color.tag} text-xs font-semibold px-2 py-0.5 rounded-full mb-2`}>
                          {promo.categoria}
                        </span>
                        <p className="font-bold text-marron text-base leading-snug">{promo.titulo}</p>
                        <p className="text-xs text-gris mt-1 line-clamp-2">{promo.descripcion}</p>
                        {promo.precioOriginal && promo.precioDescuento && (
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-gris line-through text-xs">
                              ${promo.precioOriginal.toLocaleString()}
                            </span>
                            <span className="text-terracota font-bold text-lg">
                              ${promo.precioDescuento.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className={`mt-3 ${color.badge} text-white text-center text-sm font-semibold py-2 rounded-lg`}>
                          Ver oferta →
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-gris text-sm">Sin promociones activas.</p>
            )}
          </div>

          {/* Eventos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-terracota mb-4">Próximos eventos</h2>
            {eventos && eventos.length > 0 ? (
              <div className="space-y-3">
                {eventos.map((evento) => (
                  <button
                    key={evento.id}
                    onClick={() => setEventoSeleccionado(evento)}
                    className="w-full flex items-center gap-3 border border-gris/20 rounded-lg p-3 hover:border-terracota hover:bg-crema/50 transition text-left"
                  >
                    {evento.imagen ? (
                      <img src={evento.imagen} alt={evento.nombre} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                    ) : (
                      <Calendar size={18} className="text-terracota flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-marron text-sm">{evento.nombre}</p>
                      <p className="text-xs text-terracota font-semibold">
                        {formatFechaEvento(evento.fechaInicio || evento.fecha)}
                      </p>
                      <p className="text-xs text-gris">{evento.lugar}{evento.municipio ? `, ${evento.municipio}` : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gris text-sm">Sin eventos próximos.</p>
            )}
          </div>
        </div>

        {/* Descubre más (solo Entes territoriales con items) */}
        {descubreMasItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-terracota mb-1">
              <Compass size={20} /> Descubre más
            </h2>
            <p className="text-xs text-gris mb-4">Lugares, productos y experiencias de interés turístico especial en {info.municipio || 'este municipio'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {descubreMasItems.map((item) => (
                <div key={item.id} className="border border-gris/20 rounded-lg overflow-hidden">
                  {item.foto && (
                    <div className="aspect-video bg-crema">
                      <img src={item.foto} alt={item.titulo} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-terracota bg-terracota/10 px-2 py-0.5 rounded-full mb-2">
                      {item.tipo === 'lugar' ? <><MapPin size={10} /> Lugar</> : <><Package size={10} /> Experiencia</>}
                    </span>
                    <p className="font-bold text-marron text-sm mb-1">{item.titulo}</p>
                    <p className="text-xs text-gris line-clamp-3">{item.descripcion}</p>
                    {item.tipo === 'lugar' && item.lat && item.lng && (
                      <a
                        href={`/?lat=${item.lat}&lng=${item.lng}&nombre=${encodeURIComponent(item.titulo)}#mapa-territorio`}
                        className="flex items-center justify-center gap-1 w-full mt-3 text-xs font-semibold py-1.5 rounded border border-terracota text-terracota hover:bg-crema transition"
                      >
                        <MapPin size={12} /> Ver en el mapa
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FILA INFERIOR: Contacto+Amenities | Descripción+Enlaces | Documentos+Videos+Certificaciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna izquierda: Contacto + Amenities */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-terracota mb-4">Contacto</h2>
              <div className="space-y-2 text-sm">
                {info.telefono && (
                  <a href={`tel:${info.telefono.replace(/\s/g, '')}`} className="flex items-center gap-2 text-marron hover:text-terracota transition">
                    <Phone size={16} className="text-terracota" /> {info.telefono}
                  </a>
                )}
                {info.email && (
                  <a href={`mailto:${info.email}`} className="flex items-center gap-2 text-marron hover:text-terracota transition">
                    <Mail size={16} className="text-terracota" /> {info.email}
                  </a>
                )}
                {info.paginaWeb && (
                  <a href={info.paginaWeb} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-marron hover:text-terracota transition">
                    <Globe size={16} className="text-terracota" /> {info.paginaWeb}
                  </a>
                )}
                {info.horarioAtencion && (
                  <p className="flex items-start gap-2 text-marron">
                    <Clock size={16} className="text-terracota flex-shrink-0 mt-0.5" /> {info.horarioAtencion}
                  </p>
                )}
              </div>

              {redesConValor.length > 0 && (
                <div className="flex gap-3 mt-4">
                  {redesConValor.map(([red, valor]) => {
                    const Icono = RED_ICONOS[red];
                    if (!Icono) return null;
                    const href = red === 'whatsapp'
                      ? `https://wa.me/${formatearNumeroWhatsApp(valor)}`
                      : valor;
                    return (
                      <a
                        key={red}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-terracota text-white p-2 rounded-full hover:bg-terracota-dark transition"
                      >
                        <Icono size={18} />
                      </a>
                    );
                  })}
                </div>
              )}
              {info.ubicacion?.lat && info.ubicacion?.lng && (
                <a
                  href={`/?lat=${info.ubicacion.lat}&lng=${info.ubicacion.lng}&nombre=${encodeURIComponent(info.nombre)}#mapa-territorio`}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-terracota text-white font-semibold py-2.5 rounded-lg hover:bg-terracota-dark transition text-sm"
                >
                  <MapPin size={16} /> Ver en el mapa
                </a>
              )}
            </div>

            {info.amenities && info.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-terracota mb-4">Amenities y servicios</h2>
                <div className="flex flex-wrap gap-2">
                  {info.amenities.map((amenity, idx) => (
                    <span key={idx} className="bg-crema text-terracota px-3 py-1 rounded-full text-sm font-semibold">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna central: Descripción + Enlaces de interés + Videos */}
          <div className="space-y-6">
            {info.descripcion && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-terracota mb-4">Sobre nosotros</h2>
                <p className="text-marron">{info.descripcion}</p>
              </div>
            )}

            {info.enlacesInteres && info.enlacesInteres.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-terracota mb-4">Enlaces de interés</h2>
                <div className="space-y-2">
                  {info.enlacesInteres.map((en, idx) => (
                    <a
                      key={idx}
                      href={en.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-terracota hover:underline text-sm"
                    >
                      <LinkIcon size={14} className="flex-shrink-0" /> {en.etiqueta || en.url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {videos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold text-terracota mb-4">
                  <Video size={20} /> Videos
                </h2>
                <div className="space-y-4">
                  {videos.map((video) => (
                    <div key={video.id} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        src={video.embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`Video de ${info.nombre}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha: Documentos + Certificaciones */}
          <div className="space-y-6">
            {documentos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-terracota mb-4">Documentos</h2>
                <div className="space-y-2">
                  {documentos.map((docItem) => (
                    <a
                      key={docItem.id}
                      href={docItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-terracota hover:underline text-sm"
                    >
                      <FileText size={16} /> {docItem.titulo} <Download size={14} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {info.certificaciones && info.certificaciones.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-terracota mb-4">Certificaciones</h2>
                <div className="space-y-3">
                  {info.certificaciones.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-2 border-b border-gris/10 pb-3 last:border-0">
                      <Award size={16} className="text-terracota flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-marron text-sm">{cert.nombre}</p>
                        <p className="text-xs text-gris">
                          {cert.entidad}
                          {cert.fecha && ` · ${new Date(cert.fecha + 'T00:00:00').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reseñas (ancho completo) */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SistemaResenas actorId={actor.id} resenas={resenas} onResenaCreada={cargar} />
        </div>
      </div>

      {/* Botón flotante de WhatsApp */}
      {info.redesSociales?.whatsapp && (
        <a
          href={`https://wa.me/${formatearNumeroWhatsApp(info.redesSociales.whatsapp)}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20BD5A] text-white p-4 rounded-full shadow-lg transition z-40"
          title="Escríbenos por WhatsApp"
        >
          <WhatsAppIcon size={28} />
        </a>
      )}

      {/* Modal de galería (carrusel con flechas y deslizamiento) */}
      {fotoAmpliada && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setIndiceGaleria(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setIndiceGaleria(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition z-10"
          >
            <X size={32} />
          </button>

          {imagenes.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); irAnterior(); }}
              className="absolute left-2 md:left-6 text-white hover:text-gray-300 transition bg-black/30 hover:bg-black/50 rounded-full p-2 z-10"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <img
            src={fotoAmpliada.url}
            alt={fotoAmpliada.titulo}
            className="max-w-full max-h-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {imagenes.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); irSiguiente(); }}
              className="absolute right-2 md:right-6 text-white hover:text-gray-300 transition bg-black/30 hover:bg-black/50 rounded-full p-2 z-10"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {imagenes.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
              {indiceGaleria + 1} / {imagenes.length}
            </div>
          )}
        </div>
      )}

      {/* Modal de promoción */}
      {promoSeleccionada && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setPromoSeleccionada(null)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {promoSeleccionada.imagen && (
              <div className="aspect-video bg-gray-100">
                <img src={promoSeleccionada.imagen} alt={promoSeleccionada.titulo} className="w-full h-full object-cover rounded-t-lg" />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-terracota">{promoSeleccionada.titulo}</h3>
                <button onClick={() => setPromoSeleccionada(null)} className="text-gris hover:text-terracota p-1">
                  <X size={22} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {promoSeleccionada.categoria && (
                  <span className={`inline-flex items-center gap-1 ${colorPromo(promoSeleccionada.categoria).tag} px-3 py-1 rounded-full text-xs font-semibold`}>
                    <Tag size={12} /> {promoSeleccionada.categoria}
                  </span>
                )}
                {promoSeleccionada.modalidadEntrega && (
                  <span className="inline-block bg-gray-100 text-gris px-3 py-1 rounded-full text-xs font-semibold">
                    {promoSeleccionada.modalidadEntrega}
                  </span>
                )}
              </div>

              {promoSeleccionada.descripcion && (
                <p className="text-marron text-sm mb-4">{promoSeleccionada.descripcion}</p>
              )}

              {promoSeleccionada.precioOriginal && promoSeleccionada.precioDescuento && (
                <div className="mb-4">
                  <span className="text-gris line-through text-sm mr-2">
                    ${promoSeleccionada.precioOriginal.toLocaleString()}
                  </span>
                  <span className="text-terracota font-bold text-2xl">
                    ${promoSeleccionada.precioDescuento.toLocaleString()}
                  </span>
                </div>
              )}

              {promoSeleccionada.fechaVencimiento && (
                <p className="flex items-center gap-2 text-sm text-marron mb-4">
                  <Clock size={16} className="text-terracota" />
                  Vence: {formatFechaEvento(promoSeleccionada.fechaVencimiento)}
                </p>
              )}

              <div className="space-y-2">
                {info.redesSociales?.whatsapp && (
                  <a
                    href={`https://wa.me/${formatearNumeroWhatsApp(info.redesSociales.whatsapp)}?text=${encodeURIComponent(`Hola, quiero más información sobre la promoción "${promoSeleccionada.titulo}"`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold py-3 rounded-lg hover:bg-[#20BD5A] transition"
                  >
                    <WhatsAppIcon size={18} /> Escribir por WhatsApp
                  </a>
                )}
                {info.telefono && (
                  <a
                    href={`tel:${info.telefono.replace(/\s/g, '')}`}
                    className="w-full flex items-center justify-center gap-2 bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition"
                  >
                    <Phone size={18} /> Llamar ahora
                  </a>
                )}
                {promoSeleccionada.enlace && (
                  <a
                    href={promoSeleccionada.enlace}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 border-2 border-terracota text-terracota font-semibold py-3 rounded-lg hover:bg-crema transition"
                  >
                    Ver más <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarLoginVisitante && (
        <ModalLoginVisitante
          onClose={() => setMostrarLoginVisitante(false)}
          onSuccess={handleLoginExitoso}
        />
      )}

      {/* Modal de evento */}
      {eventoSeleccionado && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setEventoSeleccionado(null)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {eventoSeleccionado.imagen && (
              <img src={eventoSeleccionado.imagen} alt={eventoSeleccionado.nombre} className="w-full h-48 object-cover rounded-t-lg" />
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-terracota">{eventoSeleccionado.nombre}</h3>
                <button onClick={() => setEventoSeleccionado(null)} className="text-gris hover:text-terracota p-1">
                  <X size={22} />
                </button>
              </div>

              {(eventoSeleccionado.categoria || eventoSeleccionado.tipo) && (
                <span className="inline-block bg-crema text-terracota px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  {eventoSeleccionado.categoria}{eventoSeleccionado.tipo ? ` · ${eventoSeleccionado.tipo}` : ''}
                </span>
              )}

              {eventoSeleccionado.descripcion && (
                <p className="text-marron text-sm mb-4">{eventoSeleccionado.descripcion}</p>
              )}

              <div className="space-y-2 text-sm text-marron">
                <p className="flex items-center gap-2">
                  <Calendar size={16} className="text-terracota" />
                  {formatFechaEvento(eventoSeleccionado.fechaInicio || eventoSeleccionado.fecha)}
                  {eventoSeleccionado.fechaFin && eventoSeleccionado.fechaFin !== eventoSeleccionado.fechaInicio &&
                    ` — ${formatFechaEvento(eventoSeleccionado.fechaFin)}`}
                </p>
                {(eventoSeleccionado.horaInicio || eventoSeleccionado.horaFin) && (
                  <p className="flex items-center gap-2">
                    <Clock size={16} className="text-terracota" />
                    {eventoSeleccionado.horaInicio}{eventoSeleccionado.horaFin ? ` - ${eventoSeleccionado.horaFin}` : ''}
                  </p>
                )}
                {(eventoSeleccionado.lugar || eventoSeleccionado.municipio) && (
                  <p className="flex items-center gap-2">
                    <MapPin size={16} className="text-terracota" />
                    {[eventoSeleccionado.lugar, eventoSeleccionado.municipio].filter(Boolean).join(', ')}
                  </p>
                )}
                {eventoSeleccionado.modalidad && (
                  <p className="flex items-center gap-2">
                    <Users size={16} className="text-terracota" />
                    {eventoSeleccionado.modalidad}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleAsistire(eventoSeleccionado.id)}
                className={`mt-4 w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-lg transition ${
                  asistencia.yaAsiste
                    ? 'bg-green-100 text-green-700 border-2 border-green-400'
                    : 'border-2 border-terracota text-terracota hover:bg-crema'
                }`}
              >
                {asistencia.yaAsiste ? '✓ Asistiré' : 'Asistiré'} {asistencia.total > 0 && `· ${asistencia.total} interesados`}
              </button>

              {eventoSeleccionado.ubicacion?.lat && eventoSeleccionado.ubicacion?.lng && (
                <a
                  href={`/?lat=${eventoSeleccionado.ubicacion.lat}&lng=${eventoSeleccionado.ubicacion.lng}&nombre=${encodeURIComponent(eventoSeleccionado.nombre)}#mapa-territorio`}
                  className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-terracota text-terracota font-semibold py-2.5 rounded-lg hover:bg-crema transition text-sm"
                >
                  <MapPin size={16} /> Ver en el mapa
                </a>
              )}
              {eventoSeleccionado.requiereInscripcion && eventoSeleccionado.linkInscripcion && (
                <a
                  href={eventoSeleccionado.linkInscripcion}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition"
                >
                  Inscribirme <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}