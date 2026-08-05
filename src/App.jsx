import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Login from './components/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
}
