import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';

const Home = lazy(() => import('./components/Home'));
const Login = lazy(() => import('./components/Login'));
const DashboardActor = lazy(() => import('./components/dashboardactor'));
const MicrositioPublico = lazy(() => import('./components/micrositiopublico'));
const AgendaRegional = lazy(() => import('./components/agendaregional'));
const PromocionesDelDia = lazy(() => import('./components/PromocionesDelDia'));
const Directorio = lazy(() => import('./components/Directorio'));
const CandelaFestival = lazy(() => import('./components/CandelaFestival'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const FAQ = lazy(() => import('./components/FAQ'));
const GuiaActores = lazy(() => import('./components/GuiaActores'));
const PoliticaDatos = lazy(() => import('./components/PoliticaDatos'));
const HerramientaCoordenadas = lazy(() => import('./components/HerramientaCoordenadas'));

function DashboardWrapper() {
  const { actorId } = useParams();
  return <DashboardActor actorId={actorId} />;
}

function MicrositioPublicoWrapper() {
  const { slug } = useParams();
  return <MicrositioPublico slug={slug} />;
}

function CargandoPagina() {
  return (
    <div className="min-h-screen bg-crema flex items-center justify-center">
      <p className="text-terracota text-lg font-semibold">Cargando...</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<CargandoPagina />}>
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
          <Route path="/faq" element={<FAQ />} />
          <Route path="/guia-actores" element={<GuiaActores />} />
          <Route path="/politica-de-datos" element={<PoliticaDatos />} />
        <Route path="/coordenadas" element={<HerramientaCoordenadas />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}