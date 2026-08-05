import React, { useState } from 'react';
import { loginConGoogle, loginConFacebook } from '../services/auth.js';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginConGoogle();
      navigate(`/dashboard/${user.uid}`);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginConFacebook();
      navigate(`/dashboard/${user.uid}`);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-terracota to-terracota-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-terracota mb-2">
            Descubre Occidente
          </h1>
          <p className="text-gris text-sm">Accede a tu micrositio turístico</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border-2 border-terracota text-terracota font-semibold py-3 px-4 rounded-lg hover:bg-terracota hover:text-white transition mb-4 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : '🔵 Entrar con Google'}
        </button>

        <button
          onClick={handleFacebookLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Cargando...' : '👥 Entrar con Facebook'}
        </button>

        <p className="text-center text-gris text-xs mt-6">
          Al entrar aceptas nuestros términos de servicio y política de privacidad
        </p>
      </div>
    </div>
  );
}