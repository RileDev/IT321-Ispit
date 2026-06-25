import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { Part } from '../store/useStore';
import { Search, SlidersHorizontal, Check, AlertCircle, Bell, Mail, Phone, ShoppingCart } from 'lucide-react';

export const Catalog: React.FC = () => {
  const { parts, activeVehicle, addToCart, registerNotification, fetchParts, error } = useStore();

  React.useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedManufacturer, setSelectedManufacturer] = useState('All');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyCompatible, setOnlyCompatible] = useState(false);

  // Notify Me Modal State
  const [notifyingPart, setNotifyingPart] = useState<Part | null>(null);
  const [contactType, setContactType] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [contactValue, setContactValue] = useState('');
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  const categories = useMemo(() => {
    const list = new Set(parts.map((p) => p.category));
    return ['All', ...Array.from(list)];
  }, [parts]);

  const manufacturers = useMemo(() => {
    const list = new Set(parts.map((p) => p.manufacturer));
    return ['All', ...Array.from(list)];
  }, [parts]);

  const checkCompatibility = (part: Part) => {
    if (!activeVehicle) return null;
    const currentVehicleStr = `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}`;
    
    // Check match
    const isCompatible = part.compatibility.includes(currentVehicleStr) || part.compatibility.includes('Universal');
    return isCompatible;
  };

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      // 1. Search Query
      const matchesSearch = 
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Category
      const matchesCategory = selectedCategory === 'All' || part.category === selectedCategory;

      // 3. Manufacturer
      const matchesMfg = selectedManufacturer === 'All' || part.manufacturer === selectedManufacturer;

      // 4. In Stock
      const matchesStock = !onlyInStock || part.status === 'IN_STOCK';

      // 5. Compatibility
      const matchesCompatibility = !onlyCompatible || !activeVehicle || checkCompatibility(part) === true;

      return matchesSearch && matchesCategory && matchesMfg && matchesStock && matchesCompatibility;
    });
  }, [parts, searchQuery, selectedCategory, selectedManufacturer, onlyInStock, onlyCompatible, activeVehicle]);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyingPart || !contactValue.trim()) return;

    registerNotification(notifyingPart.id, contactType, contactValue);
    setNotificationSuccess(true);
    setTimeout(() => {
      setNotificationSuccess(false);
      setNotifyingPart(null);
      setContactValue('');
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* HUD Welcome / Breadcrumb banner */}
      <div className="mb-8 rounded-xl border border-titanium bg-metallic/40 p-6 glass-panel flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-technical text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            KATALOG REZERVNIH DELOVA
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Pretražite našu bazu premijum delova, proverite kompatibilnost sa Vašim automobilom i dodajte željene stavke u korpu.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-obsidian border border-titanium px-4 py-2 rounded font-mono text-center">
            <span className="block text-[10px] text-gray-500 uppercase">Artikala u bazi</span>
            <span className="text-lg font-bold text-primary">{parts.length}</span>
          </div>
          <div className="bg-obsidian border border-titanium px-4 py-2 rounded font-mono text-center">
            <span className="block text-[10px] text-gray-500 uppercase">Kompatibilno</span>
            <span className="text-lg font-bold text-emerald-400">
              {activeVehicle 
                ? parts.filter(p => checkCompatibility(p) === true).length 
                : parts.filter(p => p.compatibility.includes('Universal')).length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-metallic border border-titanium rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-2 border-b border-titanium pb-3 mb-4">
              <SlidersHorizontal size={16} className="text-primary" />
              <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-technical">Filteri Pretrage</h2>
            </div>

            {/* Search Box */}
            <div className="mb-5">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Pretraga</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Naziv, šifra, brend..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                />
                <Search size={14} className="absolute left-3 top-3 text-gray-500" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-5">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Kategorija</label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-primary text-white font-semibold'
                        : 'text-gray-400 hover:bg-titanium/30 hover:text-white'
                    }`}
                  >
                    {cat === 'All' ? 'Sve Kategorije' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Manufacturer Filter */}
            <div className="mb-5">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Proizvođač</label>
              <div className="space-y-1">
                {manufacturers.map((mfg) => (
                  <button
                    key={mfg}
                    onClick={() => setSelectedManufacturer(mfg)}
                    className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      selectedManufacturer === mfg
                        ? 'bg-primary text-white font-semibold'
                        : 'text-gray-400 hover:bg-titanium/30 hover:text-white'
                    }`}
                  >
                    {mfg === 'All' ? 'Svi Proizvođači' : mfg}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter Toggle */}
            <div className="border-t border-titanium pt-4 mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-400">Samo na stanju</span>
              <button
                type="button"
                onClick={() => setOnlyInStock(!onlyInStock)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer relative ${
                  onlyInStock ? 'bg-primary' : 'bg-titanium'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  onlyInStock ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Compatibility Filter Toggle */}
            {activeVehicle && (
              <div className="border-t border-titanium pt-4 mt-4 flex items-center justify-between animate-fadeIn">
                <span className="text-xs text-gray-400">Kompatibilno za vozilo</span>
                <button
                  type="button"
                  onClick={() => setOnlyCompatible(!onlyCompatible)}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer relative ${
                    onlyCompatible ? 'bg-primary' : 'bg-titanium'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    onlyCompatible ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Parts Catalog Grid */}
        <div className="lg:col-span-3">
          {error ? (
            <div className="border border-red-500/30 bg-red-500/10 rounded-xl p-12 text-center flex flex-col items-center justify-center animate-fadeIn" data-testid="error-container">
              <AlertCircle size={40} className="text-red-400 mb-3" />
              <p className="font-semibold text-red-200">Greška pri povezivanju</p>
              <p className="text-xs text-red-300/80 mt-1 max-w-sm">
                {error}
              </p>
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="border border-titanium bg-metallic/35 rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <AlertCircle size={40} className="text-gray-600 mb-3" />
              <p className="font-semibold text-gray-300">Nema pronađenih artikala</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Nije pronađen nijedan artikal koji ispunjava zadate filtere. Pokušajte da izmenite kriterijume pretrage.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredParts.map((part) => {
                const isCompatible = checkCompatibility(part);
                
                return (
                  <div
                    key={part.id}
                    className="flex flex-col bg-metallic border border-titanium rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:glow-card hover:scale-[1.01] duration-300 relative group"
                  >
                    {/* Header Image simulation (Stylized with category icon & gradient) */}
                    <div className="h-32 bg-gradient-to-br from-obsidian to-titanium/50 relative flex items-center justify-center p-4 border-b border-titanium/40">
                      <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-300">
                        {part.category === 'Brakes' && '🔴'}
                        {part.category === 'Engine' && '⚙️'}
                        {part.category === 'Suspension' && '🔩'}
                        {part.category === 'Exhaust' && '💨'}
                        {part.category === 'Fluids' && '🧪'}
                        {part.category === 'Filters' && '🕸️'}
                      </span>
                      <span className="absolute top-3 left-3 bg-obsidian/80 border border-titanium text-[9px] font-semibold text-gray-400 px-2 py-0.5 rounded font-mono">
                        {part.partNumber}
                      </span>
                      
                      {/* Availability Badge */}
                      <span className={`absolute top-3 right-3 text-[9px] font-semibold px-2 py-0.5 rounded font-mono ${
                        part.status === 'IN_STOCK' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {part.status === 'IN_STOCK' ? 'NA STANJU' : 'NEMA NA STANJU'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wide">{part.category}</span>
                          <span className="text-xs font-semibold text-gray-400">{part.manufacturer}</span>
                        </div>
                        <h3 className="font-technical font-bold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {part.name}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-2 leading-relaxed h-8">
                          {part.description}
                        </p>
                      </div>

                      {/* Compatibility Alert (If vehicle selector is active) */}
                      {isCompatible !== null && (
                        <div className={`mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border ${
                          isCompatible 
                            ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-500/5 text-red-400 border-red-500/20'
                        }`}>
                          {isCompatible ? (
                            <>
                              <Check size={12} className="stroke-2 shrink-0 text-emerald-400" />
                              <span className="truncate">Kompatibilno: Odgovara Vašem vozilu</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={12} className="shrink-0 text-red-400" />
                              <span className="truncate">Nije kompatibilno sa Vašim vozilom</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Pricing and Action Footer */}
                      <div className="border-t border-titanium/40 pt-3 mt-4 flex items-center justify-between">
                        <span className="font-mono font-bold text-white text-lg">${part.price}</span>
                        
                        {part.status === 'IN_STOCK' ? (
                          <button
                            onClick={() => addToCart(part)}
                            className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded transition-all cursor-pointer glow-primary hover:scale-105 duration-200"
                          >
                            <ShoppingCart size={13} />
                            Dodaj
                          </button>
                        ) : (
                          <button
                            onClick={() => setNotifyingPart(part)}
                            className="flex items-center gap-1 border border-titanium hover:border-yellow-500/50 hover:text-yellow-400 text-gray-400 text-xs font-semibold px-3 py-1.5 rounded transition-all cursor-pointer"
                          >
                            <Bell size={13} />
                            Obavesti me
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Notify Me Modal */}
      {notifyingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-metallic border border-titanium rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setNotifyingPart(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
            <h3 className="font-technical text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Bell className="text-primary" size={18} />
              OBRAZAC OBAVEŠTENJA
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Prijavite se da dobijete obaveštenje na e-mail ili telefon čim artikal <span className="font-semibold text-white">"{notifyingPart.name}"</span> ponovo bude dostupan.
            </p>

            {notificationSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-4 text-center my-6">
                <Check size={28} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-white font-semibold">Uspešno ste se prijavili!</p>
                <p className="text-[10px] text-gray-400 mt-1">Obavestićemo Vas čim artikal bude na stanju.</p>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-4">
                <div className="flex gap-2 p-1 bg-obsidian border border-titanium rounded-lg">
                  <button
                    type="button"
                    onClick={() => { setContactType('EMAIL'); setContactValue(''); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs cursor-pointer ${
                      contactType === 'EMAIL' ? 'bg-primary text-white font-medium' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Mail size={13} />
                    E-mail
                  </button>
                  <button
                    type="button"
                    onClick={() => { setContactType('PHONE'); setContactValue(''); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs cursor-pointer ${
                      contactType === 'PHONE' ? 'bg-primary text-white font-medium' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Phone size={13} />
                    Telefon
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1.5">
                    {contactType === 'EMAIL' ? 'E-mail Adresa' : 'Broj Telefona (SMS)'}
                  </label>
                  <input
                    type={contactType === 'EMAIL' ? 'email' : 'tel'}
                    required
                    placeholder={contactType === 'EMAIL' ? 'marko@example.com' : '060 123 4567'}
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-titanium text-white rounded text-xs focus:border-primary outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold tracking-wider transition-colors cursor-pointer glow-primary"
                >
                  AKTIVIRAJ OBAVEŠTENJE
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
