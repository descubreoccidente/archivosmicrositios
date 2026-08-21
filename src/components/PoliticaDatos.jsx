import React from 'react';
import NavBar from './NavBar';
import { Shield } from 'lucide-react';

const SECCIONES = [
  {
    t: '1. Introducción',
    c: 'La Corporación de Turismo del Occidente de Antioquia ("la Corporación"), en cumplimiento del artículo 15 de la Constitución Política de Colombia, la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013, el Decreto Único Reglamentario 1074 de 2015 y demás normas concordantes, adopta la presente Política de Tratamiento de Datos Personales, Corporativos y Digitales, con el fin de garantizar el adecuado manejo, protección, confidencialidad y seguridad de la información suministrada por sus afiliados, actores turísticos, aliados, patrocinadores, visitantes, votantes de sus concursos y festivales, proveedores, empleados y demás personas que tengan relación con la Corporación, ya sea de forma presencial o a través de la plataforma digital "Descubre el Occidente Antioqueño" (descubreoccidente.com).'
  },
  {
    t: '2. Marco legal',
    c: 'Esta política se fundamenta en la Constitución Política (art. 15), la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013, el Decreto Único Reglamentario 1074 de 2015 (Título 2, Capítulos 25 y 26), el Decreto 090 de 2018, la Ley 1273 de 2009, la Ley 527 de 1999, la Circular Única de la SIC, los lineamientos de MinTIC y del Viceministerio de Turismo, y las directrices de la OCDE sobre protección de la privacidad, en su calidad de país miembro.'
  },
  {
    t: '3. Categorías de titulares',
    c: 'La plataforma trata datos de: actores turísticos que gestionan un micrositio; visitantes registrados que dejan reseñas, confirman asistencia a eventos o votan; participantes y votantes del Candela Festival; proveedores, aliados y patrocinadores; y personal y colaboradores de la Corporación.'
  },
  {
    t: '4. Datos recolectados',
    c: 'Según la categoría del titular: datos de identificación y contacto, datos del negocio (categoría, ubicación, fotos, documentos), datos de autenticación digital, interacciones en la plataforma (reseñas, asistencia, votos), y datos estadísticos agregados de caracterización turística (sin fines de identificación individual).'
  },
  {
    t: '5. Principios',
    c: 'El tratamiento se rige por los principios de Legalidad, Finalidad, Libertad, Veracidad o calidad, Transparencia, Acceso y circulación restringida, Seguridad y Confidencialidad, conforme al artículo 4 de la Ley 1581 de 2012.'
  },
  {
    t: '6. Finalidades',
    c: 'Gestionar micrositios y cuentas de visitantes; administrar concursos y votaciones; generar el directorio, la agenda y el mapa interactivo; producir estadísticas territoriales agregadas; invitar a eventos; enviar información promocional (solo con autorización); cumplir obligaciones legales y contables; y atender consultas y reclamos.'
  },
  {
    t: '7. Proveedores tecnológicos y transferencia internacional',
    c: 'La plataforma utiliza servicios de Google (autenticación, Firebase, Google Cloud) y Mapbox, que pueden almacenar información fuera de Colombia. Esta transferencia es necesaria para la prestación del servicio, conforme al artículo 26 de la Ley 1581 de 2012, y se acepta al utilizar la plataforma.'
  },
  {
    t: '8. Cookies',
    c: 'La plataforma usa únicamente cookies técnicas necesarias para mantener la sesión del usuario. No se usan cookies de publicidad de terceros.'
  },
  {
    t: '9. Menores de edad',
    c: 'La plataforma no está diseñada para recolectar datos de menores de edad sin autorización de sus padres o representantes legales. Si se identifica este caso, los datos serán eliminados.'
  },
  {
    t: '10. Derechos de los titulares',
    c: 'Conforme al artículo 8 de la Ley 1581 de 2012, usted tiene derecho a: conocer, actualizar y rectificar sus datos; solicitar prueba de la autorización otorgada; ser informado sobre el uso de sus datos; presentar quejas ante la SIC; revocar la autorización o solicitar la supresión de sus datos; y acceder gratuitamente a su información.'
  },
  {
    t: '11. Procedimiento para consultas y reclamos',
    c: 'Puede ejercer sus derechos escribiendo a contacto@descubreoccidente.com o al WhatsApp +57 304 114 8439. Las consultas se resuelven en máximo 10 días hábiles; los reclamos, en máximo 15 días hábiles, prorrogables por 8 días adicionales.'
  },
  {
    t: '12. Consentimiento en la plataforma',
    c: 'Todo actor turístico acepta esta política al guardar la información de su micrositio. Todo visitante que inicia sesión para dejar reseñas, confirmar asistencia o votar acepta esta política mediante dicho inicio de sesión.'
  },
  {
    t: '13. Vigencia y modificaciones',
    c: 'Esta política entra en vigencia desde su publicación y permanecerá vigente mientras la Corporación realice tratamiento de datos personales. Podrá modificarse en cualquier momento; los cambios se publicarán en esta misma página.'
  },
];

export default function PoliticaDatos() {
  return (
    <div className="min-h-screen bg-crema">
      <NavBar />

      <div className="bg-gradient-to-r from-terracota to-terracota-dark text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white rounded-full p-2 shadow-md flex-shrink-0">
              <img src="/logo-corporacion.png" alt="Corporación de Turismo del Occidente de Antioquia" className="h-12 md:h-16 object-contain" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold">
              Política de Tratamiento de Datos
            </h1>
          </div>
          <p className="text-lg opacity-90">
            Corporación de Turismo del Occidente de Antioquia
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6 text-sm text-gris">
          Elaborada con base en la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013, el Decreto Único Reglamentario 1074 de 2015 y demás normas concordantes de la República de Colombia. Última actualización: 2026.
        </div>

        {SECCIONES.map((s) => (
          <div key={s.t}>
            <h2 className="font-bold text-terracota text-lg mb-2">{s.t}</h2>
            <p className="text-marron text-sm leading-relaxed">{s.c}</p>
          </div>
        ))}

        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="font-semibold text-marron mb-1">¿Tienes dudas sobre el uso de tus datos?</p>
          <p className="text-sm text-gris">
            Escríbenos a <a href="mailto:contacto@descubreoccidente.com" className="text-terracota underline">contacto@descubreoccidente.com</a> o al WhatsApp <a href="https://wa.me/573041148439" className="text-terracota underline">+57 304 114 8439</a>
          </p>
        </div>
      </div>
    </div>
  );
}