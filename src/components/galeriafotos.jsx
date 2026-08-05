import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, X } from 'lucide-react';

export default function GaleriaFotos({ actorId, onUpdate }) {
  const [fotos, setFotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    cargarMedia();
  }, [actorId]);

  const cargarMedia = async () => {
    try {
      const mediaSnap = await getDocs(
        query(collection(db, 'actors', actorId, 'media'), orderBy('order'))
      );
      const fotos = [];
      const videos = [];
      
      mediaSnap.docs.forEach(doc => {
        if (doc.data().tipo === 'foto') fotos.push(doc.data());
        else videos.push(doc.data());
      });
      
      setFotos(fotos);
      setVideos(videos);
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

  return (
    <div className="space-y-8">
      {/* Fotos */}
      <div className="bg-white rounded-lg p-8">
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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {fotos.map((foto, idx) => (
            <div key={idx} className="relative group">
              <img
                src={foto.url}
                alt={`Foto ${idx + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                <button className="text-white hover:bg-red-600 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Videos */}
      <div className="bg-white rounded-lg p-8">
        <h3 className="text-xl font-bold text-terracota mb-6">
          Videos ({videos.length}/2)
        </h3>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <p className="text-gris text-sm mb-4">
            Pega los URLs de tus videos (YouTube o Vimeo)
          </p>
          <input
            type="url"
            placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
            className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota mb-3"
          />
          <button className="bg-terracota text-white px-4 py-2 rounded hover:bg-terracota-dark transition">
            Agregar Video
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video, idx) => (
            <div key={idx} className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <p className="absolute inset-0 flex items-center justify-center text-gris">
                Video {idx + 1}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}