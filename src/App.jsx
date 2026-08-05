import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import Login from './components/Login';
import DashboardActor from './components/dashboardactor';

function DashboardWrapper() {
  const { actorId } = useParams();
  return <DashboardActor actorId={actorId} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/:actorId" element={<DashboardWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}