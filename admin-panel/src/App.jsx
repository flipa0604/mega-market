import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ShopView from './views/ShopView';
import AdminApp from './AdminApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShopView />} />
        <Route path="/admin" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}
