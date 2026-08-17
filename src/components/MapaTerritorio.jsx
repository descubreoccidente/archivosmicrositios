import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { obtenerPuntosMapa } from '../services/firestore';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapaTerritorio() {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (mapInstance.current) return;

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [-75.85, 6.55],
      zoom: 9.2
    });

    mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    cargarPuntos();

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  const cargarPuntos = async () => {
    setLoading(true);
    try {
      const puntos = await obtenerPuntosMapa();

      puntos.forEach((punto) => {
       try {
        const color = punto.tipo === 'actor' ? '#22c55e' : '#eab308';

        const el = document.createElement('div');
        el.style.width = '18px';
        el.style.height = '18px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = color;
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.4)';
       el.style.cursor = 'pointer';
        el.title = `${punto.nombre}${punto.municipio ? ' · ' + punto.municipio : ''}`;

        const popupHtml = `
          <div style="font-family: sans-serif; min-width: 160px;">
            <p style="font-weight: bold; margin: 0 0 4px 0; color: #2C1810;">${punto.nombre}</p>
            <p style="font-size: 12px; margin: 0; color: #6B5B52;">${punto.categoria || ''}</p>
            <p style="font-size: 12px; margin: 0; color: #6B5B52;">${punto.municipio || ''}</p>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 14 }).setHTML(popupHtml);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([punto.lng, punto.lat])
          .setPopup(popup)
          .addTo(mapInstance.current);

        if (punto.tipo === 'actor' && punto.slug) {
          el.addEventListener('click', () => {
            setTimeout(() => navigate(`/micrositio/${punto.slug}`), 200);
          });
        } else if (punto.tipo === 'evento') {
          el.addEventListener('click', () => {
            setTimeout(() => navigate('/agenda'), 200);
          });
        }
       } catch (e) {
         console.warn('Punto con coordenadas inválidas, se omitió:', punto.nombre);
       }
      });
    } catch (error) {
      console.error('Error cargando puntos del mapa:', error);
    }
    setLoading(false);
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-terracota mb-2 text-center">Mapa del territorio</h2>
        <p className="text-gris text-center mb-6">Ubica actores y eventos en el Occidente Antioqueño</p>

        <div className="flex items-center justify-center gap-6 mb-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Actores turísticos
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Eventos
          </span>
        </div>

        <div className="relative rounded-lg overflow-hidden shadow-md border border-gris/10">
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <p className="text-terracota font-semibold">Cargando mapa...</p>
            </div>
          )}
          <div ref={mapContainer} className="w-full h-[450px] md:h-[550px]" />
        </div>
      </div>
    </section>
  );
}