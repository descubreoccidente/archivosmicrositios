import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Send, CheckCircle } from 'lucide-react';

function WhatsAppIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12.001 2C6.478 2 2 6.478 2 12c0 2.096.639 4.06 1.732 5.688L2 22l4.436-1.694A9.955 9.955 0 0012.001 22C17.523 22 22 17.522 22 12S17.523 2 12.001 2zm0 18.148c-1.792 0-3.457-.535-4.85-1.454l-.348-.219-3.607 1.377 1.394-3.514-.227-.36a8.132 8.132 0 01-1.315-4.478c0-4.509 3.669-8.177 8.178-8.177 2.186 0 4.24.851 5.784 2.396a8.116 8.116 0 012.396 5.784c0 4.509-3.668 8.177-8.177 8.177z"/>
    </svg>
  );
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbznlFQjaomm3T5l1MqtpMvs2GmyV7MrtlkNxy5NPhwkTQqig-WGYhcK8chR5Ba5Q6FQ/exec';

export default function Footer() {
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        nombre: formData.nombre,
        categoria: 'Inversionista',
        municipio: '',
        telefono: formData.telefono,
        email: formData.email,
        mensaje: formData.mensaje
      });
      const res = await fetch(`${SCRIPT_URL}?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEnviado(true);
        setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      setError('No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos directamente.');
    }
    setEnviando(false);
  };

  return (
    <footer className="bg-marron text-white">
      {/* Formulario de inversión */}
      <div className="bg-terracota-dark py-14">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">¿Interesado en invertir en la plataforma?</h2>
          <p className="text-white/80 mb-8">Cuéntanos y te contactamos para conversar sobre oportunidades de inversión.</p>

          {enviado ? (
            <div className="bg-white/10 rounded-lg p-6 flex flex-col items-center gap-2">
              <CheckCircle size={32} className="text-green-400" />
              <p className="font-semibold">¡Gracias! Recibimos tu mensaje y te contactaremos pronto.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="text-left space-y-4">
              {error && (
                <div className="bg-red-500/20 border border-red-400 rounded p-3 text-sm">{error}</div>
              )}
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Nombre completo"
                className="w-full rounded-lg px-4 py-3 text-marron focus:outline-none"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Correo electrónico"
                  className="w-full rounded-lg px-4 py-3 text-marron focus:outline-none"
                />
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  placeholder="Teléfono"
                  className="w-full rounded-lg px-4 py-3 text-marron focus:outline-none"
                />
              </div>
              <textarea
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                rows={3}
                placeholder="Cuéntanos brevemente tu interés..."
                className="w-full rounded-lg px-4 py-3 text-marron focus:outline-none resize-none"
              />
              <button
                type="submit"
                disabled={enviando}
                className="w-full flex items-center justify-center gap-2 bg-white text-terracota font-semibold py-3 rounded-lg hover:bg-crema transition disabled:opacity-50"
              >
                <Send size={18} /> {enviando ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer principal */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <img src="/logo-teal.png" alt="Descubre Occidente" className="h-20 brightness-0 invert" />
            <div className="w-px h-16 bg-white/20"></div>
            <img src="/logo-corporacion.png" alt="Corporación de Turismo del Occidente de Antioquia" className="h-24 w-24 object-contain bg-white rounded-lg p-1" />
          </div>
          <p className="text-white/70 text-sm">
            Descubre el Occidente Antioqueño es la plataforma digital oficial de la
            Corporación de Turismo del Occidente de Antioquia.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-3">Explora</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/directorio" className="hover:text-white transition">Directorio de actores</Link></li>
            <li><Link to="/agenda" className="hover:text-white transition">Agenda regional</Link></li>
            <li><Link to="/promociones" className="hover:text-white transition">Promociones</Link></li>
            <li><Link to="/candela-festival" className="hover:text-white transition">Candela Festival</Link></li>
            <li><Link to="/faq" className="hover:text-white transition">Preguntas frecuentes</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3">Para actores</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/ingresar" className="hover:text-white transition">Gestiona tu micrositio</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3">Síguenos</h3>
          <div className="flex gap-3 mb-4">
            <a href="https://wa.me/573041148439" target="_blank" rel="noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
              <WhatsAppIcon size={18} />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61577072152923" target="_blank" rel="noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
              <Facebook size={18} />
            </a>
            <a href="https://www.instagram.com/descubreeloccidenteantioqueno" target="_blank" rel="noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
              <Instagram size={18} />
            </a>
          </div>
          <p className="text-white/70 text-sm">Contacto Telefónico</p>
          <p className="text-white/70 text-sm">+57 304 114 8439</p>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © 2026 Corporación de Turismo del Occidente de Antioquia · 25 años conectando el territorio
      </div>
    </footer>
  );
}