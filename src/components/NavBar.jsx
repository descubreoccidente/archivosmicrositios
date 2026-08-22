import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, Store, Calendar, Tag, Flame, HelpCircle, LayoutDashboard } from 'lucide-react';
import { onAuthChange } from '../services/auth';

const ENLACES = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/directorio', label: 'Directorio', icon: Store },
  { to: '/agenda', label: 'Agenda', icon: Calendar },
  { to: '/promociones', label: 'Promociones', icon: Tag },
  { to: '/candela-festival', label: 'Candela Festival', icon: Flame },
  { to: '/faq', label: 'Ayuda', icon: HelpCircle },
];

export default function NavBar() {
  const [abierto, setAbierto] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => setUsuario(user));
    return () => unsubscribe();
  }, []);

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
              <LayoutDashboard size={16} /> Editar mi micrositio
            </Link>
          )}
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
              <LayoutDashboard size={18} /> Editar mi micrositio
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}