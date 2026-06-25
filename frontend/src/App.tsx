import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Catalog } from './pages/Catalog';
import { Checkout } from './pages/Checkout';
import { SpecialOrder } from './pages/SpecialOrder';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-obsidian text-gray-100 flex flex-col font-sans selection:bg-primary selection:text-white">
        
        {/* Navigation HUD */}
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/special-order" element={<SpecialOrder />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            {/* Fallback to catalog */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-titanium/60 bg-metallic/20 py-6 text-center text-xs text-gray-500 font-mono">
          <p>© 2026 APEXPARTS d.o.o. Sva prava zadržana.</p>
          <p className="mt-1 text-[10px] opacity-60">Sistem za obuku i testiranje softvera · IT321 Ispit</p>
        </footer>
        
      </div>
    </BrowserRouter>
  );
}

export default App;
