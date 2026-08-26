import React, { useState } from 'react';
import { loginConGoogle, registrarConEmail, loginConEmailPassword, crearPerfilUsuario, eliminarCuentaActual } from '../services/auth.js';
import { verificarYRegistrarInvitacion } from '../services/firestore.js';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import NavBar from './NavBar';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modo, setModo] = useState('inicial'); // inicial | login | registro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const navigate = useNavigate();

  const procesarAutorizacion = async (user) => {
    const { autorizado } = await verificarYRegistrarInvitacion(user.email, user.uid);
    if (!autorizado) {
      setError('Este correo no tiene una invitación activa para gestionar un micrositio. Contáctanos para solicitar acceso.');
      return;
    }
    navigate(`/dashboard/${user.uid}`);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginConGoogle('actor');
      await procesarAutorizacion(user);
    } catch (err) {
      setError('No pudimos iniciar sesión con Google.');
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await loginConEmailPassword(email.trim().toLowerCase(), password);
      await procesarAutorizacion(user);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Correo o contraseña incorrectos. Si aún no tienes cuenta, crea una abajo.');
      } else {
        setError('No pudimos iniciar sesión. Intenta de nuevo.');
      }
    }
    setLoading(false);
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const emailNormalizado = email.trim().toLowerCase();
      const user = await registrarConEmail(emailNormalizado, password, nombre.trim());

      const { autorizado } = await verificarYRegistrarInvitacion(user.email, user.uid);
      if (!autorizado) {
        await eliminarCuentaActual();
        setError('Este correo no tiene una invitación activa para gestionar un micrositio. Contáctanos para solicitar acceso.');
        setLoading(false);
        return;
      }

      await crearPerfilUsuario(user.uid, user.email, nombre.trim());
      navigate(`/dashboard/${user.uid}`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Ya existe una cuenta con este correo. Usa "Iniciar sesión" en su lugar.');
      } else {
        setError('No pudimos crear tu cuenta. Intenta de nuevo.');
      }
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative bg-cover bg-center"
      style={{ backgroundImage: "url('/fondo-login.png')" }}
    >
      <NavBar />
      <div className="absolute inset-0 bg-terracota/20"></div>
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="/logo-teal.png"
              alt="Descubre Occidente"
              className="h-24 mx-auto mb-4"
            />
            <p className="text-gris text-sm">Accede a tu micrositio turístico</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-6 text-red-700 text-sm">
              {error}
            </div>
          )}

          {modo === 'inicial' && (
            <>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition mb-4 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Cargando...' : 'Entrar con Google'}
              </button>

              <button
                onClick={() => { setModo('login'); setError(null); }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-crema text-terracota font-semibold py-3 px-4 rounded-lg hover:bg-crema/70 transition disabled:opacity-50"
              >
                <Mail size={20} /> Iniciar sesión con correo
              </button>

              <p className="text-center text-sm text-gris mt-4">
                ¿Primera vez?{' '}
                <button onClick={() => { setModo('registro'); setError(null); }} className="text-terracota font-semibold underline">
                  Crea tu cuenta aquí
                </button>
              </p>
            </>
          )}

          {modo === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
                className="w-full border border-gris/30 rounded-lg px-4 py-3 focus:outline-none focus:border-terracota"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Tu contraseña"
                className="w-full border border-gris/30 rounded-lg px-4 py-3 focus:outline-none focus:border-terracota"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Iniciar sesión'}
              </button>
              <button
                type="button"
                onClick={() => { setModo('inicial'); setError(null); }}
                className="w-full text-gris text-sm hover:underline"
              >
                ← Volver a las demás opciones
              </button>
            </form>
          )}

          {modo === 'registro' && (
            <form onSubmit={handleRegistro} className="space-y-4">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Tu nombre"
                className="w-full border border-gris/30 rounded-lg px-4 py-3 focus:outline-none focus:border-terracota"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com (el mismo que fue invitado)"
                className="w-full border border-gris/30 rounded-lg px-4 py-3 focus:outline-none focus:border-terracota"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Crea una contraseña (mín. 6 caracteres)"
                className="w-full border border-gris/30 rounded-lg px-4 py-3 focus:outline-none focus:border-terracota"
              />
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
                placeholder="Confirma tu contraseña"
                className="w-full border border-gris/30 rounded-lg px-4 py-3 focus:outline-none focus:border-terracota"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
              </button>
              <button
                type="button"
                onClick={() => { setModo('inicial'); setError(null); }}
                className="w-full text-gris text-sm hover:underline"
              >
                ← Volver a las demás opciones
              </button>
            </form>
          )}

          <p className="text-center text-gris text-xs mt-4">
            <Link to="/guia-actores" className="text-terracota underline font-semibold">¿Primera vez? Mira la guía paso a paso</Link>
          </p>
          <p className="text-center text-gris text-xs mt-4">
            Al entrar aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
}