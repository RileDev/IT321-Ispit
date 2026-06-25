import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, Trash2, X, ChevronDown, AlertTriangle, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    user, 
    logout, 
    activeVehicle, 
    setActiveVehicle, 
    cart, 
    removeFromCart, 
    updateCartQuantity,
    clearCart
  } = useStore();
  
  const navigate = useNavigate();
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);

  // Vehicle selector states
  const [make, setMake] = useState('BMW');
  const [model, setModel] = useState('3 Series');
  const [year, setYear] = useState(2018);
  const [engine, setEngine] = useState('2.0L TwinPower Turbo');

  const modelsByMake: Record<string, string[]> = {
    BMW: ['3 Series', '5 Series', 'M4'],
    Volkswagen: ['Golf', 'Passat', 'Tiguan'],
    Audi: ['A4', 'A6', 'Q5']
  };

  const handleApplyVehicle = () => {
    setActiveVehicle({ make, model, year });
    setIsVehicleModalOpen(false);
  };

  const handleClearVehicle = () => {
    setActiveVehicle(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsAuthMenuOpen(false);
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + (item.part.price * item.quantity), 0);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-titanium bg-obsidian/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-technical text-2xl font-bold tracking-wider text-white">
                APEX<span className="text-primary italic">PARTS</span>
              </span>
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </Link>
          </div>

          {/* Vehicle Matcher Widget (Signature Element) */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            {activeVehicle ? (
              <div className="flex items-center justify-between gap-2 px-4 py-2 bg-metallic/80 border border-emerald-500/40 rounded-full glow-emerald transition-all duration-300">
                <div className="flex items-center gap-2 truncate text-sm">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-gray-400 font-mono text-xs">VOZILO:</span>
                  <span className="font-medium text-white truncate font-technical">
                    {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsVehicleModalOpen(true)}
                    className="text-xs text-primary hover:underline hover:text-white font-medium cursor-pointer"
                  >
                    Promeni
                  </button>
                  <button 
                    onClick={handleClearVehicle}
                    className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                    title="Ukloni vozilo"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsVehicleModalOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2 bg-metallic border border-titanium hover:border-primary/50 rounded-full hover:glow-primary transition-all duration-300 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <AlertTriangle size={16} className="text-yellow-500 animate-pulse" />
                  <span className="group-hover:text-white transition-colors duration-200">
                    Izaberi vozilo za proveru kompatibilnosti
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
              </button>
            )}
          </div>

          {/* Actions / Auth / Cart */}
          <div className="flex items-center gap-3">

            {/* Catalog Link */}
            <Link
              to="/"
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Katalog
            </Link>

            {/* Special Order Link */}
            <Link
              to="/special-order"
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Specijalna Narudžbina
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-metallic border border-titanium rounded-full hover:border-primary text-gray-300 hover:text-white hover:glow-primary transition-all cursor-pointer"
            >
              <ShoppingCart size={18} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white font-mono">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAuthMenuOpen(!isAuthMenuOpen)}
                className="flex items-center gap-2 p-2 bg-metallic border border-titanium hover:border-primary rounded-full sm:rounded-full px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <UserIcon size={16} className="text-primary" />
                <span className="hidden sm:inline max-w-[100px] truncate text-xs">
                  {user?.username || 'Prijavi se'}
                </span>
                <ChevronDown size={14} className="opacity-60" />
              </button>

              {isAuthMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-metallic border border-titanium p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {user && user.role !== 'GUEST' ? (
                    <>
                      <div className="px-4 py-2.5 border-b border-titanium">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Uloga</p>
                        <p className="font-semibold text-white truncate text-sm">
                          {user.role === 'ADMIN' ? 'Administrator' : user.role === 'EMPLOYEE' ? 'Zaposleni' : 'Klijent'}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{user.username}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsAuthMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-titanium hover:text-white rounded"
                      >
                        Kontrolna tabla
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-titanium hover:text-red-300 rounded cursor-pointer"
                      >
                        <LogOut size={14} /> Odjavi se
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-titanium">
                        <p className="text-xs text-gray-400 font-semibold">Niste prijavljeni</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Trenutno ste u režimu gosta</p>
                      </div>
                      <Link
                        to="/login"
                        onClick={() => setIsAuthMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-titanium hover:text-white rounded"
                      >
                        Prijavi se
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>

      {/* Vehicle Matcher Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-metallic border border-titanium rounded-xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setIsVehicleModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="font-technical text-xl font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="text-primary" size={20} />
              GARAŽA: Izaberi svoje vozilo
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Izborom vozila filtriraćemo samo one artikle koji u potpunosti odgovaraju specifikaciji Vašeg automobila.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Proizvođač (Marka)</label>
                <select 
                  value={make} 
                  onChange={(e) => {
                    const selectedMake = e.target.value;
                    setMake(selectedMake);
                    setModel(modelsByMake[selectedMake][0]);
                  }}
                  className="w-full px-3 py-2 bg-obsidian border border-titanium text-white rounded focus:border-primary outline-none text-sm"
                >
                  <option value="BMW">BMW</option>
                  <option value="Volkswagen">Volkswagen (VW)</option>
                  <option value="Audi">Audi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Model</label>
                <select 
                  value={model} 
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-titanium text-white rounded focus:border-primary outline-none text-sm"
                >
                  {modelsByMake[make].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Godište</label>
                  <select 
                    value={year} 
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-obsidian border border-titanium text-white rounded focus:border-primary outline-none text-sm"
                  >
                    {[2015, 2016, 2017, 2018, 2019, 2020].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Motor</label>
                  <select 
                    value={engine} 
                    onChange={(e) => setEngine(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-titanium text-white rounded focus:border-primary outline-none text-sm"
                  >
                    <option value="2.0L TwinPower Turbo">2.0L L4 Turbo</option>
                    <option value="3.0L TwinPower L6">3.0L L6 Twin</option>
                    <option value="1.6L TDI Diesel">1.6L TDI</option>
                    <option value="2.0L TFSI Turbo">2.0L TFSI</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-titanium hover:bg-titanium rounded text-sm font-semibold transition-colors cursor-pointer text-center text-gray-400 hover:text-white"
                >
                  Otkaži
                </button>
                <button
                  onClick={handleApplyVehicle}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover rounded text-sm font-semibold text-white transition-colors cursor-pointer text-center"
                >
                  Primeni fitment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Slider (Slide-out Drawer) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md h-full bg-metallic border-l border-titanium flex flex-col p-6 animate-slideIn">
            <div className="flex items-center justify-between border-b border-titanium pb-4 mb-4">
              <h3 className="font-technical text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="text-primary font-bold" size={20} />
                VAŠA KORPA
              </h3>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <ShoppingCart size={48} className="text-gray-600 mb-4 stroke-1" />
                  <p className="font-medium text-gray-300">Vaša korpa je prazna</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                    Dodajte artikle iz našeg kataloga da biste ih poručili.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.part.id} className="flex gap-3 bg-obsidian border border-titanium p-3 rounded-lg relative group">
                    <button
                      onClick={() => removeFromCart(item.part.id)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-white tracking-wide truncate max-w-[200px]">{item.part.name}</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{item.part.partNumber} · {item.part.manufacturer}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-titanium rounded">
                          <button
                            onClick={() => updateCartQuantity(item.part.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-gray-400 hover:text-white cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs text-white font-mono bg-titanium/30">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.part.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-gray-400 hover:text-white cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-primary font-mono">
                          ${(item.part.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-titanium pt-4 mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Ukupno za uplatu:</span>
                  <span className="text-xl font-bold text-white font-mono">${cartSubtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="flex-1 px-4 py-2.5 border border-titanium hover:bg-red-500/10 hover:border-red-500/40 text-gray-400 hover:text-red-400 rounded text-xs font-semibold tracking-wider transition-colors cursor-pointer"
                  >
                    ISPRAZNI KORPU
                  </button>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/checkout');
                    }}
                    className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold tracking-wider transition-colors cursor-pointer text-center font-technical glow-primary"
                  >
                    IDI NA PLAĆANJE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
