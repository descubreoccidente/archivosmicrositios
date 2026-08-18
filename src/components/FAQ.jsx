import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, Users, Store } from 'lucide-react';

const PREGUNTAS_VISITANTES = [
  {
    p: '¿Qué es Descubre el Occidente Antioqueño?',
    r: 'Es la plataforma digital oficial de la Corporación de Turismo del Occidente de Antioquia, donde puedes explorar actores turísticos, eventos, promociones y toda la oferta del territorio en un solo lugar.'
  },
  {
    p: '¿Cómo encuentro un negocio o experiencia turística?',
    r: 'Desde el inicio puedes explorar los micrositios destacados, o ir al Directorio completo (/directorio) para filtrar por categoría y municipio. También puedes usar el mapa del territorio para ubicarlos geográficamente.'
  },
  {
    p: '¿Cómo dejo una reseña?',
    r: 'Entra al micrositio del actor que visitaste, baja hasta la sección de reseñas, haz clic en "Escribir una reseña" e inicia sesión con Google o Facebook. Solo puedes dejar una reseña por actor.'
  },
  {
    p: '¿Cómo confirmo mi asistencia a un evento?',
    r: 'En la Agenda Regional o en el micrositio del actor organizador, abre el evento y haz clic en "Asistiré". Te pedirá iniciar sesión la primera vez.'
  },
  {
    p: '¿Las promociones tienen costo para mí?',
    r: 'No, ver y aprovechar las promociones es completamente gratis para los visitantes. El costo (cuando aplique) es únicamente para el actor que las publica.'
  },
];

const PREGUNTAS_ACTORES = [
  {
    p: '¿Cómo puedo unirme a la plataforma?',
    r: 'La vinculación es por invitación de la Corporación de Turismo del Occidente de Antioquia. Escríbenos por WhatsApp o el formulario de contacto para solicitar tu acceso.'
  },
  {
    p: '¿Tiene algún costo tener mi micrositio?',
    r: 'Consulta las condiciones vigentes directamente con la Corporación de Turismo del Occidente de Antioquia.'
  },
  {
    p: '¿Qué son los reportes semanales ("Mis Datos") y por qué son obligatorios?',
    r: 'Es información que cada actor comparte semanalmente (visitantes, motivo de viaje, entre otros según tu categoría) para que el territorio tome mejores decisiones de turismo. A cambio, puedes ver el promedio comparativo de tu categoría.'
  },
  {
    p: '¿Cómo publico una promoción o evento?',
    r: 'Desde tu Dashboard, entra a la pestaña "Promociones" o "Eventos", completa el formulario y guarda. Aparecerá automáticamente en tu micrositio y en las secciones generales del sitio.'
  },
  {
    p: '¿Puedo editar mi información en cualquier momento?',
    r: 'Sí, entra a tu Dashboard cuando quieras y actualiza tu información, fotos, amenities, o cualquier otro dato desde la pestaña "Información".'
  },
  {
    p: '¿Puedo agregar un evento o promoción de otra región diferente al Occidente Antioqueño?',
    r: 'No. La plataforma está geolocalizada exclusivamente para el Occidente Antioqueño. Si tienes una experiencia en otra región, puedes agregar el enlace a tu propio sitio web o redes sociales en la sección "Enlaces de interés" de tu micrositio.'
  },
  {
    p: '¿Cómo puedo publicitar mi marca en esta plataforma?',
    r: 'Por medio de banners y eventos especiales. Llena el formulario de contacto al final de esta página y personal de la Corporación de Turismo del Occidente de Antioquia te contactará.'
  },
];

function Acordeon({ preguntas }) {
  const [abierta, setAbierta] = useState(null);

  return (
    <div className="space-y-3">
      {preguntas.map((item, idx) => (
        <div key={idx} className="bg-white rounded-lg border border-gris/15 overflow-hidden">
          <button
            onClick={() => setAbierta(abierta === idx ? null : idx)}
            className="w-full flex items-center justify-between gap-3 p-4 text-left"
          >
            <span className="font-semibold text-marron text-sm md:text-base">{item.p}</span>
            <ChevronDown
              size={18}
              className={`text-terracota flex-shrink-0 transition-transform ${abierta === idx ? 'rotate-180' : ''}`}
            />
          </button>
          {abierta === idx && (
            <div className="px-4 pb-4 text-sm text-gris leading-relaxed">
              {item.r}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FAQ() {
  const [tab, setTab] = useState('visitantes');

  return (
    <div className="min-h-screen bg-crema">
      <div className="bg-gradient-to-r from-terracota to-terracota-dark text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="flex items-center gap-3 text-4xl font-bold mb-2">
            <img src="/logo-teal.png" alt="" className="h-12 brightness-0 invert" /> Preguntas Frecuentes
          </h1>
          <p className="text-lg opacity-90">Resolvemos tus dudas sobre la plataforma</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setTab('visitantes')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
              tab === 'visitantes' ? 'bg-terracota text-white' : 'bg-white text-gris border border-gris/20'
            }`}
          >
            <Users size={16} /> Para visitantes
          </button>
          <button
            onClick={() => setTab('actores')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
              tab === 'actores' ? 'bg-terracota text-white' : 'bg-white text-gris border border-gris/20'
            }`}
          >
            <Store size={16} /> Para actores turísticos
          </button>
        </div>

        <Acordeon preguntas={tab === 'visitantes' ? PREGUNTAS_VISITANTES : PREGUNTAS_ACTORES} />

        <div className="mt-10 bg-white rounded-lg p-6 text-center border border-gris/15">
          <HelpCircle size={28} className="mx-auto text-terracota mb-2" />
          <p className="text-marron font-semibold mb-1">¿No encontraste lo que buscabas?</p>
          <p className="text-sm text-gris mb-4">Escríbenos directamente y te ayudamos.</p>
          <a
            href="https://wa.me/573041148439"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-terracota text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-terracota-dark transition"
          >
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}