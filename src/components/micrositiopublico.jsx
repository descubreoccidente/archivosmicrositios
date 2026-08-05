import React, { useState, useEffect } from 'react';

export default function MicrositioPublico({ actorId }) {
  return (
    <div className="min-h-screen bg-crema p-8">
      <h1 className="text-4xl font-bold text-terracota mb-4">Micrositio Público</h1>
      <p className="text-gris">Actor ID: {actorId}</p>
      <p className="text-gris mt-4">Este es un micrositio de prueba. Funcionará después de conectar Firebase.</p>
    </div>
  );
}