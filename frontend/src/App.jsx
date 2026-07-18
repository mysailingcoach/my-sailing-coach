import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RaceDetail from './pages/RaceDetail';
import './index.css';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/race/:id" element={<RaceDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
