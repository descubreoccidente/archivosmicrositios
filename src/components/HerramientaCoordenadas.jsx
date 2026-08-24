import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import NavBar from './NavBar';
import { Search, Copy, CheckCircle, MapPin } from 'lucide-react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function HerramientaCoordenadas() {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const [coords, setCoords] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (mapInstance.current) return;

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [-75.85, 6.55],
      zoom: 9.2
    });

    mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapInstance.current.on('click', (e) => {
      colocarMarcador(e.lngLat.lat, e.lngLat.lng);
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  const colocarMarcador = (lat, lng) => {
    if (markerInstance.current) {
      markerInstance.current.setLngLat([lng, lat]);
    } else {
      markerInstance.current = new mapboxgl.Marker({ color: '#f26631', draggable: true })
        .setLngLat([lng, lat])
        .addTo(mapInstance.current);

      markerInstance.current.on('dragend', () => {
        const pos = markerInstance.current.getLngLat();
        setCoords({ lat: pos.lat, lng: pos.lng });
        setCopiado(false);
      });
    }
    setCoords({ lat, lng });
    setCopiado(false);
  };

  const buscarDireccion = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;
    setBuscando(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(busqueda)}.json?access_token=${mapboxgl.accessToken}&country=CO&proximity=-75.85,6.55&limit=5`
      );
      const data = await res.json();
      setResultados(data.features || []);
    } catch (error) {
      console.error('Error buscando dirección:', error);
    }
    setBuscando(false);
  };

  const seleccionarResultado = (feature) => {
    const [lng, lat] = feature.center;
    mapInstance.current.flyTo({ center: [lng, lat], zoom: 16 });
    colocarMarcador(lat, lng);
    setResultados([]);
    setBusqueda(feature.place_name);
  };

  const copiarCoordenadas = () => {
    if (!coords) return;
    const texto = `${coords.lat.toFixed(6)}\t${coords.lng.toFixed(6)}`;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="min-h-screen bg-crema">
      <NavBar />

      <div className="bg-gradient-to-r from-terracota to-terracota-dark text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="flex items-center gap-3 text-2xl md:text-3xl font-bold mb-1">
            <MapPin size={28} /> Herramienta de Coordenadas
          </h1>
          <p className="text-sm opacity-90">Busca un lugar o haz clic en el mapa para obtener su latitud y longitud</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <form onSubmit={buscarDireccion} className="flex gap-2 mb-3">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Busca un negocio, dirección o municipio..."
            className="flex-1 border border-gris/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-terracota"
          />
          <button
            type="submit"
            disabled={buscando}
            className="flex items-center gap-2 bg-terracota text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50"
          >
            <Search size={16} /> {buscando ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {resultados.length > 0 && (
          <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
            {resultados.map((r) => (
              <button
                key={r.id}
                onClick={() => seleccionarResultado(r)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-crema border-b border-gris/10 last:border-0 transition"
              >
                {r.place_name}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-lg overflow-hidden shadow-md border border-gris/10 mb-4">
          <div ref={mapContainer} className="w-full h-[450px] md:h-[500px]" />
        </div>

        {coords ? (
          <div className="bg-white rounded-lg shadow-sm p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-gris text-xs">Latitud</p>
                <p className="font-bold text-marron">{coords.lat.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-gris text-xs">Longitud</p>
                <p className="font-bold text-marron">{coords.lng.toFixed(6)}</p>
              </div>
            </div>
            <button
              onClick={copiarCoordenadas}
              className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-lg transition ${
                copiado ? 'bg-green-100 text-green-700' : 'bg-terracota text-white hover:bg-terracota-dark'
              }`}
            >
              {copiado ? <><CheckCircle size={16} /> Copiado</> : <><Copy size={16} /> Copiar lat y lng</>}
            </button>
          </div>
        ) : (
          <p className="text-center text-gris text-sm">Busca un lugar arriba, o haz clic directo en el mapa para colocar el punto.</p>
        )}

        <p className="text-center text-xs text-gris mt-4">
          Al copiar, quedan listos para pegar directo en las columnas "lat" y "lng" de tu Sheet (separados por tabulación).
        </p>
      </div>
    </div>
  );
}