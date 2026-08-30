import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Home, Store, Calendar, Tag, Flame, HelpCircle, LayoutDashboard, Building2, Globe } from 'lucide-react';
import { onAuthChange } from '../services/auth';

const IDIOMAS = [
  { codigo: 'es', label: 'ES' },
  { codigo: 'en', label: 'EN' },
  { codigo: 'fr', label: 'FR' },
];

const CORPORACION_SLUG = 'corporacion-de-turismo-del-occidente-de-antioquia';

export default function NavBar() {
  const [abierto, setAbierto] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => setUsuario(user));
    return () => unsubscribe();
  }, []);

  const cambiarIdioma = (codigo) => {
    i18n.changeLanguage(codigo);
    localStorage.setItem('idioma', codigo);
  };

  const ENLACES = [
    { to: '/', label: t('nav.inicio'), icon: Home },
    { to: '/directorio', label: t('nav.directorio'), icon: Store },
    { to: '/agenda', label: t('nav.agenda'), icon: Calendar },
    { to: '/promociones', label: t('nav.promociones'), icon: Tag },
    { to: '/candela-festival', label: t('nav.candela'), icon: Flame },
    { to: `/micrositio/${CORPORACION_SLUG}`, label: t('nav.nosotros'), icon: Building2 },
    { to: '/faq', label: t('nav.ayuda'), icon: HelpCircle },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setAbierto(false)}>
          <img src="/logo-teal.png" alt="Descubre Occidente" className="h-9" />
        </Link>

        {/* Menú escritorio */}
        <div className="hidden md:flex items-center gap-1">
          {ENLACES.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-marron hover:bg-crema hover:text-terracota transition"
            >
              {label}
            </Link>
          ))}
          {usuario && (
            <Link
              to={`/dashboard/${usuario.uid}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-terracota text-white hover:bg-terracota-dark transition"
            >
              <LayoutDashboard size={16} /> {t('nav.dashboard')}
            </Link>
          )}

          {/* Selector de idioma */}
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gris/20">
            <Globe size={14} className="text-gris" />
            {IDIOMAS.map(({ codigo, label }) => (
              <button
                key={codigo}
                onClick={() => cambiarIdioma(codigo)}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  i18n.language === codigo ? 'bg-terracota text-white' : 'text-gris hover:bg-crema'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Botón menú móvil */}
        <button
          onClick={() => setAbierto(!abierto)}
          className="md:hidden text-terracota p-2"
        >
          {abierto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú desplegable móvil */}
      {abierto && (
        <div className="md:hidden bg-white border-t border-gris/10 px-4 py-2">
          {ENLACES.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setAbierto(false)}
              className="flex items-center gap-3 px-2 py-3 text-sm font-semibold text-marron border-b border-gris/5 last:border-0"
            >
              <Icon size={18} className="text-terracota" /> {label}
            </Link>
          ))}
          {usuario && (
            <Link
              to={`/dashboard/${usuario.uid}`}
              onClick={() => setAbierto(false)}
              className="flex items-center gap-3 px-2 py-3 text-sm font-semibold text-terracota"
            >
              <LayoutDashboard size={18} /> {t('nav.dashboard')}
            </Link>
          )}

          {/* Selector de idioma móvil */}
          <div className="flex items-center gap-2 px-2 py-3">
            <Globe size={16} className="text-gris" />
            {IDIOMAS.map(({ codigo, label }) => (
              <button
                key={codigo}
                onClick={() => cambiarIdioma(codigo)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                  i18n.language === codigo ? 'bg-terracota text-white' : 'text-gris bg-crema'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}