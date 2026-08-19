import React from 'react';

export default function Banner({ imagen, enlace, alt = 'Publicidad', aspecto = '8/1', className = '' }) {
  const contenido = (
    <div className={`w-full ${className}`} style={{ aspectRatio: aspecto }}>
      <img src={imagen} alt={alt} className="w-full h-full object-cover rounded-lg" />
    </div>
  );

  if (!enlace) return contenido;

  return (
    <a href={enlace} target="_blank" rel="noreferrer" className="block hover:opacity-95 transition">
      {contenido}
    </a>
  );
}