import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Simulation from './pages/Simulation';
import WorkingPrinciple from './pages/WorkingPrinciple';
import Knowledge from './pages/Knowledge';
import Applications from './pages/Applications';
import About from './pages/About';

export default function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen flex-col bg-[#050914] text-slate-100">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/working-principle" element={<WorkingPrinciple />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}
