import React, { useState, useEffect } from 'react';
import { obtenerMicrositioPorSlug } from '../services/firestore';
import {
  MapPin, Phone, Mail, Globe, Leaf, FileText, Download,
  Facebook, Instagram, Youtube, MessageCircle, Music2, Link as LinkIcon, Calendar, Star
} from 'lucide-react';

const RED_ICONOS = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
  tiktok: Music2,
  youtube: Youtube,
};

export default function MicrositioPublico({ slug }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
  const redesConValor = Object.entries(info.redesSociales || {}).filter(([_, v]) => v);

  return (
    <div className="min-h-screen bg-crema">
      {/* Header */}
      <div className="bg-terracota text-white p-8">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          {info.logo && (
            <img src={info.logo} alt={info.nombre} className="h-24 w-24 object-cover rounded-full border-4 border-white" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{info.nombre}</h1>
            <p className="text-white/90">{info.categoria}{info.subcategoria ? ` · ${info.subcategoria}` : ''}</p>
            <div className="flex items-center gap-3 mt-2">
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
                  RNT vigente
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Descripción */}
        {info.descripcion && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-marron">{info.descripcion}</p>
          </div>
        )}

        {/* Contacto */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-terracota mb-4">Contacto</h2>
          <div className="space-y-2 text-sm">
            {info.telefono && (
              <p className="flex items-center gap-2 text-marron"><Phone size={16} className="text-terracota" /> {info.telefono}</p>
            )}
            {info.email && (
              <p className="flex items-center gap-2 text-marron"><Mail size={16} className="text-terracota" /> {info.email}</p>
            )}
            {info.paginaWeb && (
              <p className="flex items-center gap-2 text-marron">
                <Globe size={16} className="text-terracota" />
                <a href={info.paginaWeb} target="_blank" rel="noreferrer" className="hover:underline">{info.paginaWeb}</a>
              </p>
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

        {/* Enlaces de interés */}
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

        {/* Fotos */}
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

        {/* Documentos */}
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

        {/* Próximos eventos */}
        {eventos && eventos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-terracota mb-4">Próximos eventos</h2>
            <div className="space-y-3">
              {eventos.map((evento) => (
                <div key={evento.id} className="flex items-center gap-3 border border-gris/20 rounded-lg p-3">
                  <Calendar size={18} className="text-terracota flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-marron text-sm">{evento.nombre}</p>
                    <p className="text-xs text-gris">{evento.lugar}{evento.municipio ? `, ${evento.municipio}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reseñas */}
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
  );
}