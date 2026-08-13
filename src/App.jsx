import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import Login from './components/Login';
import DashboardActor from './components/dashboardactor';
import MicrositioPublico from './components/micrositiopublico';
import AgendaRegional from './components/agendaregional';

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
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/:actorId" element={<DashboardWrapper />} />
        <Route path="/micrositio/:slug" element={<MicrositioPublicoWrapper />} />
        <Route path="/agenda" element={<AgendaRegional />} />
      </Routes>
    </BrowserRouter>
  );
}