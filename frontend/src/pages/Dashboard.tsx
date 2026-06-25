import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Part, SpecialOrder } from '../store/useStore';
import { 
  ClipboardList, 
  Package, 
  FileCheck, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Activity
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    user, 
    orders, 
    specialOrders, 
    parts, 
    employees,
    addEmployee, 
    addPart, 
    updatePart, 
    deletePart,
    updateOrderStatus, 
    respondToSpecialOrder,
    fetchOrders,
    fetchSpecialOrders,
    fetchParts,
    fetchEmployees
  } = useStore();

  React.useEffect(() => {
    if (user) {
      fetchParts();
      fetchOrders();
      fetchSpecialOrders();
      if (user.role === 'ADMIN' || user.role === 'EMPLOYEE') {
        fetchEmployees();
      }
    }
  }, [user, fetchParts, fetchOrders, fetchSpecialOrders, fetchEmployees]);

  // Active Tab
  // Employees see: 'ORDERS' | 'INVENTORY' | 'SPECIAL_ORDERS' | 'EMPLOYEES' (if admin)
  // Clients see: 'CLIENT_ORDERS' | 'CLIENT_SPECIALS'
  const isStaff = user && (user.role === 'EMPLOYEE' || user.role === 'ADMIN');
  const isAdmin = user && user.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<string>(
    isStaff ? 'ORDERS' : 'CLIENT_ORDERS'
  );

  // Filter state for orders
  const [orderFilter, setOrderFilter] = useState<'NOT_DELIVERED' | 'DELIVERED' | 'CANCELLED'>('NOT_DELIVERED');

  // New Part Form State (Inventory CRUD)
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [partDesc, setPartDesc] = useState('');
  const [partPrice, setPartPrice] = useState(0);
  const [partMfg, setPartMfg] = useState('');
  const [partCat, setPartCat] = useState('Engine');
  const [partStatus, setPartStatus] = useState<'IN_STOCK' | 'OUT_OF_STOCK'>('IN_STOCK');
  const [partComp, setPartComp] = useState(''); // Comma separated, e.g. "BMW 3 Series 2018, Audi A4 2017"

  // Edit Part Modal State
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  // Special Order Response Dialog State
  const [supplierCheckOrder, setSupplierCheckOrder] = useState<SpecialOrder | null>(null);
  const [estDeliveryDate, setEstDeliveryDate] = useState('');
  const [pickupLoc, setPickupLoc] = useState('Glavni magacin (Bulevar Oslobođenja 45)');
  const [priceEst, setPriceEst] = useState(0);

  // Add Employee Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [empAddSuccess, setEmpAddSuccess] = useState(false);

  const handleAddPartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName || !partNumber || !partMfg) return;

    try {
      await addPart({
        name: partName,
        partNumber,
        description: partDesc,
        price: Number(partPrice),
        manufacturer: partMfg,
        category: partCat,
        status: partStatus,
        compatibility: partComp.split(',').map(s => s.trim()).filter(Boolean)
      });

      // Reset Form
      setPartName('');
      setPartNumber('');
      setPartDesc('');
      setPartPrice(0);
      setPartMfg('');
      setPartComp('');
      setIsAddPartOpen(false);
    } catch (err: any) {
      alert(err.message || 'Greška pri dodavanju dela.');
    }
  };

  const handleEditPartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPart) return;

    try {
      await updatePart(editingPart.id, {
        name: editingPart.name,
        partNumber: editingPart.partNumber,
        description: editingPart.description,
        price: Number(editingPart.price),
        manufacturer: editingPart.manufacturer,
        category: editingPart.category,
        status: editingPart.status,
        compatibility: typeof editingPart.compatibility === 'string' 
          ? (editingPart.compatibility as string).split(',').map((s: string) => s.trim()).filter(Boolean)
          : editingPart.compatibility
      });

      setEditingPart(null);
    } catch (err: any) {
      alert(err.message || 'Greška pri izmeni dela.');
    }
  };

  const handleSupplierSubmit = async (status: 'APPROVED' | 'REJECTED') => {
    if (!supplierCheckOrder) return;

    try {
      await respondToSpecialOrder(supplierCheckOrder.id, {
        status,
        estimatedDeliveryDate: status === 'APPROVED' ? estDeliveryDate : undefined,
        pickupLocation: status === 'APPROVED' ? pickupLoc : undefined,
        priceEstimate: status === 'APPROVED' ? Number(priceEst) : undefined
      });

      setSupplierCheckOrder(null);
      setEstDeliveryDate('');
      setPriceEst(0);
    } catch (err: any) {
      alert(err.message || 'Greška pri slanju odgovora.');
    }
  };

  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    try {
      await addEmployee(newEmpName);
      setNewEmpName('');
      setEmpAddSuccess(true);
      setTimeout(() => setEmpAddSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Greška pri dodavanju zaposlenog.');
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: any) => {
    try {
      await updateOrderStatus(id, status);
    } catch (err: any) {
      alert(err.message || 'Greška pri izmeni statusa porudžbine.');
    }
  };

  const handleDeletePart = async (id: string) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj artikal?')) {
      try {
        await deletePart(id);
      } catch (err: any) {
        alert(err.message || 'Greška pri brisanju artikla.');
      }
    }
  };

  const getNextStatus = (currentStatus: string): string => {
    if (currentStatus === 'CREATED') return 'PROCESSING';
    if (currentStatus === 'PROCESSING') return 'SHIPPED';
    if (currentStatus === 'SHIPPED') return 'DELIVERED';
    return currentStatus;
  };

  const getNextStatusTitle = (currentStatus: string): string => {
    if (currentStatus === 'CREATED') return 'Započni obradu (PROCESSING)';
    if (currentStatus === 'PROCESSING') return 'Pošalji porudžbinu (SHIPPED)';
    if (currentStatus === 'SHIPPED') return 'Označi kao isporučeno (DELIVERED)';
    return 'Sledeći status';
  };

  // Filter orders by role
  const clientOrders = orders.filter(
    (o) => o.clientName.toLowerCase() === user?.username.toLowerCase() || 
           o.contactEmail === user?.email
  );

  const clientSpecials = specialOrders.filter(
    (so) => so.clientEmail === user?.email
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Title HUD panel */}
      <div className="mb-8 rounded-xl border border-titanium bg-metallic/40 p-6 glass-panel flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-technical text-2xl font-extrabold text-white tracking-tight uppercase">
            {isStaff ? 'ADMINISTRATIVNI PORTAL ZA ZAPOSLENE' : 'MOJ KORISNIČKI PORTAL'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Ulogovani ste kao: <span className="text-primary font-semibold font-mono">{user?.username} ({user?.role})</span>. Ovde možete vršiti nadzor i upravljanje resursima.
          </p>
        </div>
        
        {isStaff && (
          <div className="flex gap-4">
            <div className="bg-obsidian border border-titanium px-4 py-2 rounded text-center">
              <span className="block text-[10px] text-gray-500 uppercase font-mono">Porudžbine</span>
              <span className="text-lg font-bold text-white">{orders.length}</span>
            </div>
            <div className="bg-obsidian border border-titanium px-4 py-2 rounded text-center">
              <span className="block text-[10px] text-gray-500 uppercase font-mono">Specijalni Upiti</span>
              <span className="text-lg font-bold text-yellow-500">{specialOrders.length}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {isStaff ? (
            <>
              <button
                onClick={() => setActiveTab('ORDERS')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-technical transition-all cursor-pointer ${
                  activeTab === 'ORDERS' 
                    ? 'bg-primary text-white glow-primary' 
                    : 'text-gray-400 hover:text-white bg-metallic border border-titanium'
                }`}
              >
                <ClipboardList size={16} />
                PORUDŽBINE ({orders.length})
              </button>

              <button
                onClick={() => setActiveTab('INVENTORY')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-technical transition-all cursor-pointer ${
                  activeTab === 'INVENTORY' 
                    ? 'bg-primary text-white glow-primary' 
                    : 'text-gray-400 hover:text-white bg-metallic border border-titanium'
                }`}
              >
                <Package size={16} />
                KATALOG & CRUD ({parts.length})
              </button>

              <button
                onClick={() => setActiveTab('SPECIAL_ORDERS')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-technical transition-all cursor-pointer ${
                  activeTab === 'SPECIAL_ORDERS' 
                    ? 'bg-primary text-white glow-primary' 
                    : 'text-gray-400 hover:text-white bg-metallic border border-titanium'
                }`}
              >
                <FileCheck size={16} />
                SPECIJALNI UPITI ({specialOrders.length})
              </button>

              {isStaff && (
                <button
                  onClick={() => setActiveTab('EMPLOYEES')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-technical transition-all cursor-pointer ${
                    activeTab === 'EMPLOYEES' 
                      ? 'bg-primary text-white glow-primary' 
                      : 'text-gray-400 hover:text-white bg-metallic border border-titanium'
                  }`}
                >
                  <Users size={16} />
                  DODAJ ZAPOSLENOG ({employees.length})
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('CLIENT_ORDERS')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-technical transition-all cursor-pointer ${
                  activeTab === 'CLIENT_ORDERS' 
                    ? 'bg-primary text-white glow-primary' 
                    : 'text-gray-400 hover:text-white bg-metallic border border-titanium'
                }`}
              >
                <ClipboardList size={16} />
                MOJE PORUDŽBINE ({clientOrders.length})
              </button>

              <button
                onClick={() => setActiveTab('CLIENT_SPECIALS')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-technical transition-all cursor-pointer ${
                  activeTab === 'CLIENT_SPECIALS' 
                    ? 'bg-primary text-white glow-primary' 
                    : 'text-gray-400 hover:text-white bg-metallic border border-titanium'
                }`}
              >
                <FileCheck size={16} />
                SPECIJALNE NARUDŽBINE ({clientSpecials.length})
              </button>
            </>
          )}
        </div>

        {/* Contents Area */}
        <div className="lg:col-span-3">
          
          {/* TAB: Staff Orders Management */}
          {isStaff && activeTab === 'ORDERS' && (
            <div className="bg-metallic border border-titanium rounded-xl p-6 shadow-lg space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-titanium pb-4 gap-4">
                <h2 className="font-technical text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="text-primary" size={18} />
                  Nadzor Porudžbina
                </h2>
                
                {/* Status Switcher Buttons */}
                <div className="flex gap-2 p-1 bg-obsidian border border-titanium rounded-lg w-full sm:w-auto">
                  <button
                    onClick={() => setOrderFilter('NOT_DELIVERED')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      orderFilter === 'NOT_DELIVERED' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Naručeno
                  </button>
                  <button
                    onClick={() => setOrderFilter('DELIVERED')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      orderFilter === 'DELIVERED' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Isporučeno
                  </button>
                  <button
                    onClick={() => setOrderFilter('CANCELLED')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      orderFilter === 'CANCELLED' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Poništeno
                  </button>
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-titanium text-gray-500 font-mono">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">Kupac / Adresa</th>
                      <th className="py-3 px-2">Stavke</th>
                      <th className="py-3 px-2 font-mono">Ukupno</th>
                      <th className="py-3 px-2 text-right">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter((o) => {
                        if (orderFilter === 'NOT_DELIVERED') {
                          return o.status === 'CREATED' || o.status === 'PROCESSING' || o.status === 'SHIPPED';
                        }
                        return o.status === orderFilter;
                      })
                      .map((o) => (
                        <tr key={o.id} className="border-b border-titanium/50 hover:bg-obsidian/30 transition-colors">
                          <td className="py-4 px-2 font-mono text-white font-bold">{o.id}</td>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white">{o.clientName}</span>
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                o.status === 'CREATED' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                o.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                o.status === 'SHIPPED' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                o.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {o.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">{o.shippingAddress}</p>
                            <p className="text-[9px] text-gray-600 mt-0.5">{o.contactEmail} · {o.contactPhone}</p>
                          </td>
                          <td className="py-4 px-2">
                            <div className="max-w-[200px] truncate" title={o.items.map(i => `${i.part.name} (${i.quantity}x)`).join(', ')}>
                              {o.items.map((i) => (
                                <span key={i.part.id} className="inline-block bg-titanium/40 border border-titanium text-[10px] text-gray-300 px-1.5 py-0.5 rounded mr-1 mb-1 font-mono">
                                  {i.part.manufacturer} x{i.quantity}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-2 font-mono font-semibold text-primary">${o.totalPrice.toFixed(2)}</td>
                          <td className="py-4 px-2 text-right">
                            {(o.status === 'CREATED' || o.status === 'PROCESSING' || o.status === 'SHIPPED') && (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, getNextStatus(o.status))}
                                  className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/30 rounded cursor-pointer transition-all"
                                  title={getNextStatusTitle(o.status)}
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 rounded cursor-pointer transition-all"
                                  title="Poništi porudžbinu"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                            {(o.status === 'DELIVERED' || o.status === 'CANCELLED') && (
                              <span className="text-[9px] uppercase font-bold text-gray-500 bg-obsidian border border-titanium px-2 py-1 rounded">
                                {o.status === 'DELIVERED' ? 'ISPORUČENO' : 'PONIŠTENO'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    {orders.filter((o) => {
                      if (orderFilter === 'NOT_DELIVERED') {
                        return o.status === 'CREATED' || o.status === 'PROCESSING' || o.status === 'SHIPPED';
                      }
                      return o.status === orderFilter;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          Nema porudžbina u ovoj kategoriji.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Inventory CRUD */}
          {isStaff && activeTab === 'INVENTORY' && (
            <div className="bg-metallic border border-titanium rounded-xl p-6 shadow-lg space-y-6 animate-fadeIn">
              
              <div className="flex justify-between items-center border-b border-titanium pb-4">
                <h2 className="font-technical text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Package className="text-primary" size={18} />
                  Katalog i Upravljanje Artiklima
                </h2>
                
                <button
                  onClick={() => setIsAddPartOpen(true)}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-2 rounded transition-all cursor-pointer glow-primary"
                >
                  <Plus size={14} />
                  Novi Artikal
                </button>
              </div>

              {/* Add Part Modal */}
              {isAddPartOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
                  <div className="w-full max-w-lg bg-metallic border border-titanium rounded-xl shadow-2xl p-6 relative">
                    <button
                      onClick={() => setIsAddPartOpen(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                    
                    <h3 className="font-technical text-lg font-bold text-white mb-4">
                      DODAJ NOVI ARTIKAL U KATALOG
                    </h3>

                    <form onSubmit={handleAddPartSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Naziv artikla</label>
                          <input
                            type="text"
                            required
                            placeholder="npr. Brembo Kočione pločice"
                            value={partName}
                            onChange={(e) => setPartName(e.target.value)}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Šifra (Kataloški broj)</label>
                          <input
                            type="text"
                            required
                            placeholder="npr. BRM-9801"
                            value={partNumber}
                            onChange={(e) => setPartNumber(e.target.value)}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Proizvođač</label>
                          <input
                            type="text"
                            required
                            placeholder="Brembo"
                            value={partMfg}
                            onChange={(e) => setPartMfg(e.target.value)}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Cena ($)</label>
                          <input
                            type="number"
                            required
                            step="0.01"
                            placeholder="45.99"
                            value={partPrice}
                            onChange={(e) => setPartPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Kategorija</label>
                          <select
                            value={partCat}
                            onChange={(e) => setPartCat(e.target.value)}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                          >
                            <option value="Brakes">Brakes</option>
                            <option value="Engine">Engine</option>
                            <option value="Suspension">Suspension</option>
                            <option value="Exhaust">Exhaust</option>
                            <option value="Fluids">Fluids</option>
                            <option value="Filters">Filters</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Stanje</label>
                          <select
                            value={partStatus}
                            onChange={(e) => setPartStatus(e.target.value as any)}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                          >
                            <option value="IN_STOCK">Na stanju</option>
                            <option value="OUT_OF_STOCK">Nema na stanju</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Kompatibilnost (Vozila)</label>
                          <input
                            type="text"
                            placeholder="BMW 3 Series 2018, Audi A4 2017"
                            value={partComp}
                            onChange={(e) => setPartComp(e.target.value)}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Opis artikla</label>
                        <textarea
                          rows={3}
                          placeholder="Opis performansi i tehničke specifikacije..."
                          value={partDesc}
                          onChange={(e) => setPartDesc(e.target.value)}
                          className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none resize-none"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4">
                        <button
                          type="button"
                          onClick={() => setIsAddPartOpen(false)}
                          className="px-4 py-2 border border-titanium text-gray-400 hover:text-white rounded text-xs transition-colors cursor-pointer"
                        >
                          Otkaži
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Sačuvaj u bazu
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Part Modal */}
              {editingPart && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
                  <div className="w-full max-w-lg bg-metallic border border-titanium rounded-xl shadow-2xl p-6 relative">
                    <button
                      onClick={() => setEditingPart(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                    
                    <h3 className="font-technical text-lg font-bold text-white mb-4">
                      IZMENI ARTIKAL
                    </h3>

                    <form onSubmit={handleEditPartSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Naziv artikla</label>
                          <input
                            type="text"
                            required
                            value={editingPart.name}
                            onChange={(e) => setEditingPart({ ...editingPart, name: e.target.value })}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Šifra</label>
                          <input
                            type="text"
                            required
                            value={editingPart.partNumber}
                            onChange={(e) => setEditingPart({ ...editingPart, partNumber: e.target.value })}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Proizvođač</label>
                          <input
                            type="text"
                            required
                            value={editingPart.manufacturer}
                            onChange={(e) => setEditingPart({ ...editingPart, manufacturer: e.target.value })}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Cena ($)</label>
                          <input
                            type="number"
                            required
                            step="0.01"
                            value={editingPart.price}
                            onChange={(e) => setEditingPart({ ...editingPart, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Kategorija</label>
                          <select
                            value={editingPart.category}
                            onChange={(e) => setEditingPart({ ...editingPart, category: e.target.value })}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                          >
                            <option value="Brakes">Brakes</option>
                            <option value="Engine">Engine</option>
                            <option value="Suspension">Suspension</option>
                            <option value="Exhaust">Exhaust</option>
                            <option value="Fluids">Fluids</option>
                            <option value="Filters">Filters</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Stanje na lageru</label>
                          <select
                            value={editingPart.status}
                            onChange={(e) => setEditingPart({ ...editingPart, status: e.target.value as any })}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                          >
                            <option value="IN_STOCK">Na stanju</option>
                            <option value="OUT_OF_STOCK">Nema na stanju</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Kompatibilnost</label>
                          <input
                            type="text"
                            value={
                              Array.isArray(editingPart.compatibility) 
                                ? editingPart.compatibility.join(', ') 
                                : editingPart.compatibility
                            }
                            onChange={(e) => setEditingPart({ ...editingPart, compatibility: e.target.value as any })}
                            className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Opis</label>
                        <textarea
                          rows={3}
                          value={editingPart.description}
                          onChange={(e) => setEditingPart({ ...editingPart, description: e.target.value })}
                          className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none resize-none"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4">
                        <button
                          type="button"
                          onClick={() => setEditingPart(null)}
                          className="px-4 py-2 border border-titanium text-gray-400 hover:text-white rounded text-xs transition-colors cursor-pointer"
                        >
                          Otkaži
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Sačuvaj Izmene
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Parts Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-titanium text-gray-500 font-mono">
                      <th className="py-3 px-2">Kataloški Broj</th>
                      <th className="py-3 px-2">Naziv / Opis</th>
                      <th className="py-3 px-2">Kategorija / Brend</th>
                      <th className="py-3 px-2">Cena</th>
                      <th className="py-3 px-2">Stanje</th>
                      <th className="py-3 px-2 text-right">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((p) => (
                      <tr key={p.id} className="border-b border-titanium/50 hover:bg-obsidian/30 transition-colors">
                        <td className="py-4 px-2 font-mono text-white font-bold">{p.partNumber}</td>
                        <td className="py-4 px-2 max-w-sm">
                          <p className="font-semibold text-white">{p.name}</p>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5" title={p.description}>{p.description}</p>
                        </td>
                        <td className="py-4 px-2 text-gray-400">
                          <span className="font-semibold text-primary">{p.category}</span>
                          <span className="block text-[10px] text-gray-500 mt-0.5">{p.manufacturer}</span>
                        </td>
                        <td className="py-4 px-2 font-mono font-semibold">${p.price}</td>
                        <td className="py-4 px-2 font-mono">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.status === 'IN_STOCK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {p.status === 'IN_STOCK' ? 'Na stanju' : 'Nema na stanju'}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setEditingPart(p)}
                              className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500 hover:text-black text-yellow-400 border border-yellow-500/20 rounded cursor-pointer transition-all"
                              title="Izmeni artikal"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeletePart(p.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 rounded cursor-pointer transition-all"
                              title="Obriši artikal"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB: Special Orders Administration */}
          {isStaff && activeTab === 'SPECIAL_ORDERS' && (
            <div className="bg-metallic border border-titanium rounded-xl p-6 shadow-lg space-y-6 animate-fadeIn">
              
              <div className="border-b border-titanium pb-4">
                <h2 className="font-technical text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="text-primary" size={18} />
                  Upravljanje Specijalnim Upitima Delova
                </h2>
              </div>

              {/* Special Orders List */}
              <div className="space-y-4">
                {specialOrders.map((so) => (
                  <div key={so.id} className="border border-titanium bg-obsidian/30 p-5 rounded-xl space-y-4 relative">
                    <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded border ${
                      so.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse' :
                      so.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {so.status === 'PENDING' ? 'ČEKA PROVERU' : 
                       so.status === 'APPROVED' ? 'ODOBRENO' : 'ODBIJENO'}
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-500 uppercase tracking-widest text-[9px] font-mono">Automobil klijenta:</p>
                        <p className="font-semibold text-white text-sm mt-0.5">
                          {so.carDetails.year} {so.carDetails.make} {so.carDetails.model}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Motor: {so.carDetails.engine || 'N/A'}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-mono">Kontakt: {so.clientEmail}</p>
                      </div>

                      <div>
                        <p className="text-gray-500 uppercase tracking-widest text-[9px] font-mono">Traženi delovi / Opis:</p>
                        <p className="text-xs text-gray-300 font-sans mt-0.5 leading-relaxed bg-obsidian p-2 rounded border border-titanium/50">
                          {so.neededPartsDescription}
                        </p>
                      </div>
                    </div>

                    {/* Approved delivery receipt review */}
                    {so.status === 'APPROVED' && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg text-xs grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-gray-500 text-[10px]">Isporuka dobavljača:</p>
                          <p className="font-mono text-white mt-0.5">{so.estimatedDeliveryDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-[10px]">Lokacija preuzimanja:</p>
                          <p className="font-mono text-white mt-0.5">{so.pickupLocation}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-[10px]">Procenjena cena:</p>
                          <p className="font-mono text-primary font-bold mt-0.5">${so.priceEstimate}</p>
                        </div>
                      </div>
                    )}

                    {/* Pending review controls */}
                    {so.status === 'PENDING' && (
                      <div className="border-t border-titanium/60 pt-4 flex flex-col md:flex-row justify-between gap-4">
                        <div className="text-[11px] text-gray-400 max-w-md flex items-center gap-1.5">
                          <AlertCircle size={14} className="text-yellow-500" />
                          <span>Zaposleni treba da kontaktira dobavljača da proveri dostupnost dela. Ako je moguće naručiti, popunite detalje:</span>
                        </div>
                        <button
                          onClick={() => setSupplierCheckOrder(so)}
                          className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded cursor-pointer transition-colors text-center"
                        >
                          Odgovori na upit (Dobavljač)
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {specialOrders.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-6">Nema primljenih specijalnih upita.</p>
                )}
              </div>

              {/* Special Order Response Modal */}
              {supplierCheckOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
                  <div className="w-full max-w-md bg-metallic border border-titanium rounded-xl shadow-2xl p-6 relative">
                    <button
                      onClick={() => setSupplierCheckOrder(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                    
                    <h3 className="font-technical text-base font-bold text-white mb-2 flex items-center gap-2">
                      <Activity className="text-primary" size={16} />
                      PROVERA KOD GLAVNOG DOBAVLJAČA
                    </h3>
                    <p className="text-[11px] text-gray-400 mb-4">
                      Popunjavanjem ovog obrasca odobravate uvoz dela. Klijentu se automatski šalje e-mail sa detaljima isporuke i lokacijom preuzimanja.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Procenjeni datum isporuke u Srbiju</label>
                        <input
                          type="date"
                          required
                          value={estDeliveryDate}
                          onChange={(e) => setEstDeliveryDate(e.target.value)}
                          className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Cena nabavke + carina ($)</label>
                        <input
                          type="number"
                          required
                          value={priceEst}
                          onChange={(e) => setPriceEst(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Lokacija za preuzimanje delova</label>
                        <select
                          value={pickupLoc}
                          onChange={(e) => setPickupLoc(e.target.value)}
                          className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                        >
                          <option value="Glavni magacin (Bulevar Oslobođenja 45)">Glavni magacin (Bulevar Oslobođenja 45)</option>
                          <option value="Severni magacin (Zrenjaninski put bb)">Severni magacin (Zrenjaninski put bb)</option>
                          <option value="Južni magacin (Vojvode Stepe 301)">Južni magacin (Vojvode Stepe 301)</option>
                        </select>
                      </div>

                      <div className="pt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSupplierSubmit('REJECTED')}
                          className="flex-1 py-2 bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-400 hover:text-white rounded text-xs font-semibold transition-all cursor-pointer text-center"
                        >
                          Nije dostupno (Odbij)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSupplierSubmit('APPROVED')}
                          className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-400 hover:text-white rounded text-xs font-semibold transition-all cursor-pointer text-center"
                        >
                          Odobri i pošalji mejl
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: Admin Add Employees */}
          {isStaff && activeTab === 'EMPLOYEES' && (
            <div className="bg-metallic border border-titanium rounded-xl p-6 shadow-lg space-y-6 animate-fadeIn">
              
              <div className="border-b border-titanium pb-4">
                <h2 className="font-technical text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="text-primary" size={18} />
                  Upravljanje Zaposlenima (Zaposleni i Administratori)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form */}
                <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest">
                    DODAJ NOVOG ZAPOSLENOG
                  </h3>

                  {empAddSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded text-xs text-center">
                      Novi zaposleni je uspešno dodat u sistem! Može se odmah prijaviti.
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Korisničko Ime Zaposlenog</label>
                    <input
                      type="text"
                      required
                      placeholder="npr. jovan"
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value.toLowerCase())}
                      className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold tracking-wider transition-colors cursor-pointer text-center"
                  >
                    REGISTRUJ U SISTEM
                  </button>
                </form>

                {/* Employees List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    LISTA AKTIVNIH ZAPOSLENIH
                  </h3>
                  <div className="bg-obsidian border border-titanium rounded-lg divide-y divide-titanium/40 font-mono text-xs text-gray-300">
                    <div className="p-3 flex justify-between items-center text-primary font-bold">
                      <span>admin (Administrator)</span>
                      <span className="text-[10px] text-gray-500 uppercase">SISTEM</span>
                    </div>
                    {employees.map((emp) => (
                      <div key={emp.id} className="p-3 flex justify-between items-center">
                        <span>{emp.username} (Zaposleni)</span>
                        <span className="text-[9px] text-gray-500">ID: {emp.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: Client orders dashboard */}
          {!isStaff && activeTab === 'CLIENT_ORDERS' && (
            <div className="bg-metallic border border-titanium rounded-xl p-6 shadow-lg space-y-6">
              
              <div className="border-b border-titanium pb-4">
                <h2 className="font-technical text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="text-primary" size={18} />
                  Istorija Moje Kupovine
                </h2>
              </div>

              <div className="space-y-4">
                {clientOrders.map((o) => (
                  <div key={o.id} className="border border-titanium bg-obsidian/30 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-white">Porudžbina: <span className="text-primary">{o.id}</span></span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        (o.status === 'CREATED' || o.status === 'PROCESSING' || o.status === 'SHIPPED') ? 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/20' :
                        o.status === 'DELIVERED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                        'bg-red-500/15 text-red-400 border border-red-500/20'
                      }`}>
                        {(o.status === 'CREATED' || o.status === 'PROCESSING' || o.status === 'SHIPPED') ? 'U OBRADI' :
                         o.status === 'DELIVERED' ? 'ISPORUČENO' : 'PONIŠTENO'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 font-mono flex flex-wrap gap-x-4 gap-y-1">
                      <p>Datum: {new Date(o.createdAt).toLocaleDateString()}</p>
                      <p>Plaćanje: {o.paymentMethod === 'CARD' ? 'Kartica' : 'Pouzećem'}</p>
                      <p className="text-white font-bold">Ukupno: ${o.totalPrice.toFixed(2)}</p>
                    </div>

                    <div className="border-t border-titanium/40 pt-2 flex flex-wrap gap-2">
                      {o.items.map((i) => (
                        <div key={i.part.id} className="bg-obsidian border border-titanium text-[10px] px-2.5 py-1 rounded text-gray-300">
                          {i.part.name} <span className="text-primary ml-1">x{i.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {clientOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nemate zabeleženih porudžbina pod ovim nalogom.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: Client special orders dashboard */}
          {!isStaff && activeTab === 'CLIENT_SPECIALS' && (
            <div className="bg-metallic border border-titanium rounded-xl p-6 shadow-lg space-y-6">
              
              <div className="border-b border-titanium pb-4">
                <h2 className="font-technical text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="text-primary" size={18} />
                  Upiti za Specijalno Poručivanje
                </h2>
              </div>

              <div className="space-y-4">
                {clientSpecials.map((so) => (
                  <div key={so.id} className="border border-titanium bg-obsidian/30 p-4 rounded-xl space-y-3 relative">
                    <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded border ${
                      so.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      so.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {so.status === 'PENDING' ? 'ČEKA SE PROVERA' : 
                       so.status === 'APPROVED' ? 'ODOBRENO / U TRANZITU' : 'NABAVKA NEMOGUĆA'}
                    </span>

                    <div className="text-xs">
                      <p className="text-gray-500 font-mono text-[9px] uppercase">Zatraženo za automobil:</p>
                      <p className="font-semibold text-white mt-0.5">
                        {so.carDetails.year} {so.carDetails.make} {so.carDetails.model} {so.carDetails.engine ? `(${so.carDetails.engine})` : ''}
                      </p>
                      <p className="text-gray-400 mt-2 text-xs bg-obsidian p-2 rounded border border-titanium/50">
                        {so.neededPartsDescription}
                      </p>
                    </div>

                    {so.status === 'APPROVED' && (
                      <div className="mt-3 border-t border-emerald-500/20 pt-3 bg-emerald-500/5 p-3 rounded text-xs space-y-2">
                        <p className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check size={14} /> Nabavka je potvrđena od strane dobavljača!
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] text-gray-300">
                          <p><span className="text-gray-500 block">Procenjeno stizanje:</span> {so.estimatedDeliveryDate}</p>
                          <p><span className="text-gray-500 block">Mesto preuzimanja:</span> {so.pickupLocation}</p>
                          <p><span className="text-gray-500 block">Procenjena cena:</span> <span className="text-primary font-bold">${so.priceEstimate}</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {clientSpecials.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nemate upućenih specijalnih upita za delove.
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
