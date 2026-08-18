import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import DashboardActor from './components/dashboardactor';
import MicrositioPublico from './components/micrositiopublico';
import AgendaRegional from './components/agendaregional';
import PromocionesDelDia from './components/PromocionesDelDia';
import Directorio from './components/Directorio';
import CandelaFestival from './components/CandelaFestival';
import AdminPanel from './components/AdminPanel';

function DashboardWrapper() {
  const { actorId } = useParams();
  return <DashboardActor actorId={actorId} />;
}

function MicrositioPublicoWrapper() {
  const { slug } = useParams();
  return <MicrositioPublico slug={slug} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ingresar" element={<Login />} />
        <Route path="/dashboard/:actorId" element={<DashboardWrapper />} />
        <Route path="/micrositio/:slug" element={<MicrositioPublicoWrapper />} />
        <Route path="/agenda" element={<AgendaRegional />} />
        <Route path="/promociones" element={<PromocionesDelDia />} />
        <Route path="/directorio" element={<Directorio />} />
        <Route path="/candela-festival" element={<CandelaFestival />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}