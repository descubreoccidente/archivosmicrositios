import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import {
  Mail, FileText, Image, Calendar, Tag, BarChart3, Globe, ArrowRight, CheckCircle
} from 'lucide-react';

const PASOS = [
  {
    numero: 1,
    icono: Mail,
    titulo: 'Recibe tu invitación y crea tu cuenta',
    color: '#b34127',
    puntos: [
      'La Corporación te envía o autoriza tu correo para gestionar tu micrositio.',
      'Entra a descubreoccidente.com/ingresar',
      'Elige "Entrar con Google" (si tu correo es de Gmail) o "Continuar con correo electrónico" (funciona con cualquier correo, incluso institucional o Hotmail).',
      'Si usas correo electrónico, te llegará un enlace — haz clic ahí para entrar, sin necesidad de contraseña.',
    ],
  },
  {
    numero: 2,
    icono: FileText,
    titulo: 'Completa la información de tu negocio',
    color: '#f26631',
    puntos: [
      'En la pestaña "Información", llena tu nombre, categoría, municipio, teléfono y descripción.',
      'Marca los amenities/servicios que ofreces.',
      'Ubica tu negocio en el mapa: haz clic en el punto exacto, o arrastra el marcador para ajustarlo.',
      'No olvides guardar al final del formulario.',
    ],
  },
  {
    numero: 3,
    icono: Image,
    titulo: 'Sube tus fotos',
    color: '#006468',
    puntos: [
      'En la pestaña "Galería", sube hasta 10 fotos de tu negocio.',
      'Elige una como "portada" — es la que se ve primero en tu micrositio y en el directorio.',
      'También puedes subir documentos (PDF) y hasta 2 videos.',
    ],
  },
  {
    numero: 4,
    icono: Calendar,
    titulo: 'Publica tus eventos',
    color: '#e20d77',
    puntos: [
      'En la pestaña "Eventos", crea uno nuevo con nombre, fecha, categoría y ubicación.',
      'Aparecerá automáticamente en la Agenda Regional de toda la plataforma.',
      'Los visitantes podrán marcar "Asistiré" para confirmar su interés.',
    ],
  },
  {
    numero: 5,
    icono: Tag,
    titulo: 'Crea tus promociones',
    color: '#b34127',
    puntos: [
      'En la pestaña "Promociones", crea una oferta con título, descripción, precio y fecha de vencimiento.',
      'Se mostrará en tu micrositio y en la sección general de Promociones.',
      'La promoción desaparece sola cuando llega la fecha de vencimiento que elegiste.',
    ],
  },
  {
    numero: 6,
    icono: BarChart3,
    titulo: 'Reporta tus datos cada mes',
    color: '#f26631',
    puntos: [
      'En la pestaña "Mis Datos", cuéntanos cómo te fue ese mes (visitantes, motivo de viaje, etc. según tu categoría).',
      'Es un reporte corto, toma menos de 2 minutos.',
      'A cambio, puedes ver el promedio de tu categoría en todo el territorio.',
    ],
  },
  {
    numero: 7,
    icono: Globe,
    titulo: '¡Comparte tu micrositio!',
    color: '#006468',
    puntos: [
      'Haz clic en "Ver público" arriba del Dashboard para ver tu micrositio como lo ve un visitante.',
      'Copia ese enlace y compártelo en tus redes sociales, WhatsApp Business, o donde quieras.',
      'Tu micrositio también aparece automáticamente en el Directorio y el mapa del territorio.',
    ],
  },
];

export default function GuiaActores() {
  return (
    <div className="min-h-screen bg-crema">
      <NavBar />

      <div className="bg-gradient-to-r from-terracota to-terracota-dark text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="flex items-center gap-3 text-4xl font-bold mb-2">
            <img src="/logo-teal.png" alt="" className="h-14 brightness-0 invert" /> Guía para Actores
          </h1>
          <p className="text-lg opacity-90">
            Aprende a gestionar tu micrositio paso a paso — no necesitas experiencia técnica.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {PASOS.map((paso) => {
          const Icono = paso.icono;
          return (
            <div key={paso.numero} className="bg-white rounded-lg shadow-sm p-6 border-l-4" style={{ borderColor: paso.color }}>
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: paso.color }}
                >
                  {paso.numero}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Icono size={20} style={{ color: paso.color }} />
                    <h2 className="font-bold text-marron text-lg">{paso.titulo}</h2>
                  </div>
                  <ul className="space-y-2">
                    {paso.puntos.map((punto, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gris">
                        <CheckCircle size={15} className="flex-shrink-0 mt-0.5 text-green-500" />
                        {punto}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}

        <div className="bg-terracota text-white rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-2">¿Listo para empezar?</h3>
          <p className="text-white/90 mb-5 text-sm">Entra ahora y gestiona tu micrositio en minutos.</p>
          <Link
            to="/ingresar"
            className="inline-flex items-center gap-2 bg-white text-terracota font-bold px-6 py-3 rounded-lg hover:bg-crema transition"
          >
            Ir a mi Dashboard <ArrowRight size={18} />
          </Link>
        </div>

        <div className="text-center text-sm text-gris">
          ¿Tienes dudas? Consulta las <Link to="/faq" className="text-terracota underline">Preguntas Frecuentes</Link> o escríbenos por WhatsApp.
        </div>
      </div>
    </div>
  );
}