import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { COORDENADAS_MUNICIPIOS } from '../services/firestore';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function SelectorUbicacionMapa({ lat, lng, municipio, onChange }) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;

    const tieneCoords = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
    const centroMunicipio = municipio && COORDENADAS_MUNICIPIOS[municipio];
    const centroInicial = tieneCoords
      ? [parseFloat(lng), parseFloat(lat)]
      : centroMunicipio
        ? [centroMunicipio.lng, centroMunicipio.lat]
        : [-75.85, 6.55];

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: centroInicial,
      zoom: tieneCoords ? 15 : 12
    });

    mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const colocarMarcador = (lngVal, latVal) => {
      if (markerRef.current) {
        markerRef.current.setLngLat([lngVal, latVal]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: '#b34127', draggable: true })
          .setLngLat([lngVal, latVal])
          .addTo(mapInstance.current);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLngLat();
          onChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
        });
      }
    };

    if (tieneCoords) {
      colocarMarcador(parseFloat(lng), parseFloat(lat));
    }

    mapInstance.current.on('click', (e) => {
      const { lng: clickLng, lat: clickLat } = e.lngLat;
      colocarMarcador(clickLng, clickLat);
      onChange(clickLat.toFixed(6), clickLng.toFixed(6));
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div>
      <div ref={mapContainer} className="w-full h-64 rounded-lg overflow-hidden border border-gris/30" />
      <p className="text-xs text-gris mt-2">
        Haz clic en el mapa para marcar tu ubicación exacta. Puedes arrastrar el punto para ajustarlo.
      </p>
    </div>
  );
}