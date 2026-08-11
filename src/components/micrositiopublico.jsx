import React, { useState, useEffect } from 'react';
import { obtenerMicrositioPorSlug } from '../services/firestore';
import {
  MapPin, Phone, Mail, Globe, Leaf, FileText, Download,
  Facebook, Instagram, Youtube, MessageCircle, Music2, Link as LinkIcon, Calendar, Star, X, Clock, Users, ExternalLink, Linkedin
} from 'lucide-react';

const RED_ICONOS = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
  tiktok: Music2,
  youtube: Youtube,
  linkedin: Linkedin,
};
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
  useEffect(() => {
    cargar();
  }, [slug]);

  const cargar = async () => {
    try {
      const result = await obtenerMicrositioPorSlug(slug);
      if (!result) {
        setNotFound(true);
      } else {
        setData(result);
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

  const { actor, fotos, resenas, eventos } = data;
  const info = actor.basicInfo || {};
  const sostenibilidad = actor.sostenibilidad || {};
  const tieneInsignia = sostenibilidad.insignia;
  const documentos = fotos.filter(f => f.tipo === 'documento');
  const imagenes = fotos.filter(f => !f.tipo || f.tipo === 'foto');
  const fotoPortada = imagenes.find(f => f.esPortada) || imagenes[0];
  const redesConValor = Object.entries(info.redesSociales || {}).filter(([_, v]) => v);

  return (
    <div className="min-h-screen bg-crema">
      {/* Portada */}
      {fotoPortada && (
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img src={fotoPortada.url} alt={info.nombre} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      )}

      {/* Header con info principal */}
      <div className={`bg-terracota text-white p-6 md:p-8 ${fotoPortada ? '-mt-16 relative mx-4 md:mx-8 rounded-lg shadow-lg' : ''}`}>
        <div className="max-w-5xl mx-auto flex items-center gap-6">
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

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Columna izquierda: info */}
        <div className="md:col-span-2 space-y-6">
          {info.descripcion && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-marron">{info.descripcion}</p>
            </div>
          )}

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
            </div>

            {redesConValor.length > 0 && (
              <div className="flex gap-3 mt-4">
                {redesConValor.map(([red, valor]) => {
                  const Icono = RED_ICONOS[red];
                  const href = red === 'whatsapp'
                    ? `https://wa.me/${valor.replace(/\D/g, '')}`
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
          </div>

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
                    <LinkIcon size={14} /> {en.etiqueta || en.url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: galería, documentos, eventos, reseñas */}
        <div className="md:col-span-3 space-y-6">
          {imagenes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-terracota mb-4">Galería</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {imagenes.map((foto) => (
                  <img key={foto.id} src={foto.url} alt={foto.titulo} className="w-full h-28 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}

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

          {eventos && eventos.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-terracota mb-4">Próximos eventos</h2>
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
                        {evento.fechaFin && formatFechaEvento(evento.fechaFin) !== formatFechaEvento(evento.fechaInicio || evento.fecha) &&
                          ` — ${formatFechaEvento(evento.fechaFin)}`}
                      </p>
                      <p className="text-xs text-gris">{evento.lugar}{evento.municipio ? `, ${evento.municipio}` : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {resenas && resenas.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-terracota mb-4">Reseñas de visitantes</h2>
              <div className="space-y-4">
                {resenas.map((resena) => (
                  <div key={resena.id} className="border-b border-gris/10 pb-3 last:border-0">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < resena.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                      ))}
                    </div>
                    <p className="text-sm text-marron">{resena.comentario}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
{eventoSeleccionado.ubicacion?.lat && eventoSeleccionado.ubicacion?.lng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${eventoSeleccionado.ubicacion.lat},${eventoSeleccionado.ubicacion.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-terracota text-terracota font-semibold py-2.5 rounded-lg hover:bg-crema transition text-sm"
                >
                  <MapPin size={16} /> Cómo llegar
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
    