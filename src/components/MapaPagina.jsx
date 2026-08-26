import React from 'react';
import NavBar from './NavBar';
import MapaTerritorio from './MapaTerritorio';

export default function MapaPagina() {
  return (
    <div className="min-h-screen bg-crema">
      <NavBar />
      <MapaTerritorio />
    </div>
  );
}