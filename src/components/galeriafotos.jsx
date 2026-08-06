import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, X } from 'lucide-react';

function obtenerEmbedUrl(url) {
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export default function GaleriaFotos({ actorId, onUpdate }) {
  const [fotos, setFotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');

  useEffect(() => {
    cargarMedia();
  }, [actorId]);

  const cargarMedia = async () => {
    try {
      const mediaSnap = await getDocs(
        query(collection(db, 'actors', actorId, 'media'), orderBy('order'))
      );
      const fotosData = [];
      const videosData = [];

      mediaSnap.docs.forEach(docSnap => {
        const data = { id: docSnap.id, ...docSnap.data() };
        if (data.tipo === 'foto') fotosData.push(data);
        else videosData.push(data);
      });

      setFotos(fotosData);
      setVideos(videosData);
    } catch (error) {
      console.error('Error cargando media:', error);
    }
  };

  const handleFotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (fotos.length + files.length > 10) {
      alert('Máximo 10 fotos permitidas');
      return;
    }

    setLoading(true);
    for (let file of files) {
      try {
        const storageRef = ref(storage, `actors/${actorId}/fotos/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        await addDoc(collection(db, 'actors', actorId, 'media'), {
          url,
          tipo: 'foto',
          titulo: file.name,
          order: fotos.length + 1,
          createdAt: new Date()
        });
      } catch (error) {
        console.error('Error subiendo foto:', error);
      }
    }
    setLoading(false);
    cargarMedia();
    if (onUpdate) onUpdate();
  };

  const handleDeleteFoto = async (fotoId) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      await deleteDoc(doc(db, 'actors', actorId, 'media', fotoId));
      cargarMedia();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error eliminando foto:', error);
    }
  };

  const handleAddVideo = async () => {
    setVideoError('');
    if (videos.length >= 2) {
      setVideoError('Máximo 2 videos permitidos');
      return;
    }
    const embedUrl = obtenerEmbedUrl(videoUrl.trim());
    if (!embedUrl) {
      setVideoError('El enlace debe ser de YouTube o Vimeo');
      return;
    }

    try {
      await addDoc(collection(db, 'actors', actorId, 'media'), {
        url: videoUrl.trim(),
        embedUrl,
        tipo: 'video',
        order: videos.length + 1,
        createdAt: new Date()
      });
      setVideoUrl('');
      cargarMedia();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error agregando video:', error);
      setVideoError('Ocurrió un error al guardar el video');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('¿Eliminar este video?')) return;
    try {
      await deleteDoc(doc(db, 'actors', actorId, 'media', videoId));
      cargarMedia();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error eliminando video:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Fotos */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h3 className="text-xl font-bold text-terracota mb-6">
          Galería de Fotos ({fotos.length}/10)
        </h3>

        <div className="border-2 border-dashed border-terracota rounded-lg p-8 text-center mb-6 cursor-pointer hover:bg-crema transition">
          <label htmlFor="foto-upload" className="cursor-pointer">
            <Upload className="mx-auto mb-2 text-terracota" size={32} />
            <p className="text-terracota font-semibold">Sube tus fotos aquí</p>
            <p className="text-gris text-sm">Máximo 10 fotos, formato JPG/PNG</p>
            <input
              id="foto-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFotoUpload}
              disabled={loading || fotos.length >= 10}
              className="hidden"
            />
          </label>
          {loading && <p className="text-terracota text-sm mt-3">Subiendo...</p>}
        </div>

        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          {fotos.map((foto) => (
            <div key={foto.id} className="relative group">
              <img
                src={foto.url}
                alt={foto.titulo || 'Foto del micrositio'}
                className="w-full h-24 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                <button
                  onClick={() => handleDeleteFoto(foto.id)}
                  className="text-white hover:bg-red-600 p-2 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Videos */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h3 className="text-xl font-bold text-terracota mb-6">
          Videos ({videos.length}/2)
        </h3>

        <div className="bg-crema p-6 rounded-lg mb-6">
          <p className="text-gris text-sm mb-4">
            Pega los URLs de tus videos (YouTube o Vimeo)
          </p>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
            disabled={videos.length >= 2}
            className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota mb-3 disabled:opacity-50"
          />
          {videoError && <p className="text-red-600 text-sm mb-3">{videoError}</p>}
          <button
            onClick={handleAddVideo}
            disabled={videos.length >= 2 || !videoUrl.trim()}
            className="bg-terracota text-white font-semibold px-4 py-2 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50"
          >
            Agregar Video
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="relative group">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={video.embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video del micrositio"
                />
              </div>
              <button
                onClick={() => handleDeleteVideo(video.id)}
                className="absolute top-2 right-2 bg-black/60 text-white hover:bg-red-600 p-2 rounded-full transition opacity-0 group-hover:opacity-100"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}