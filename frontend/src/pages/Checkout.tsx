import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle2, ShoppingBag, ShieldCheck, UserPlus, Key } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, user, createOrder, registerClient } = useStore();

  // Screen state: 'FORM' | 'SUCCESS'
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  
  // Payment Type
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH_ON_DELIVERY'>('CARD');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Guest post-checkout registration
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Subtotal & Shipping calculation
  const subtotal = cart.reduce((acc, item) => acc + (item.part.price * item.quantity), 0);
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + shipping;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      // Create Order object in Zustand store
      const order = await createOrder({
        clientName: name,
        contactEmail: email,
        contactPhone: phone,
        shippingAddress: `${address}, ${city} ${zip}`,
        paymentMethod,
        totalPrice: total,
        items: [...cart]
      });

      setCreatedOrder(order);
      setStep('SUCCESS');
    } catch (err: any) {
      alert(err.message || 'Greška prilikom kreiranja porudžbine.');
    }
  };

  const handlePostCheckoutRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regPassword.trim()) return;

    try {
      // Register user with their checkout details
      await registerClient(regUsername, email, phone, regPassword);
      setRegSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Greška pri registraciji.');
    }
  };

  if (cart.length === 0 && step === 'FORM') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="border border-titanium bg-metallic/30 rounded-xl p-12 max-w-md mx-auto flex flex-col items-center">
          <ShoppingBag size={48} className="text-gray-600 mb-4" />
          <h2 className="font-technical text-xl font-bold text-white mb-2">Vaša korpa je prazna</h2>
          <p className="text-xs text-gray-500 mb-6">
            Nemate nijedan artikal u korpi za plaćanje. Vratite se na katalog.
          </p>
          <Link
            to="/"
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded font-technical glow-primary cursor-pointer"
          >
            NAZAD NA KATALOG
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {step === 'FORM' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Middle: Shipping & Payment Info */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-2 space-y-6">
            
            {/* Shipping Info Card */}
            <div className="bg-metallic border border-titanium rounded-xl p-6 shadow-lg">
              <h2 className="font-technical text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-titanium pb-3">
                <Truck className="text-primary" size={18} />
                1. INFORMACIJE O ISPORUCI
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Ime i Prezime</label>
                  <input
                    type="text"
                    required
                    placeholder="Marko Marković"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">E-mail Adresa</label>
                    <input
                      type="email"
                      required
                      placeholder="marko@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Telefon</label>
                    <input
                      type="tel"
                      required
                      placeholder="060123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Adresa Isporuke</label>
                  <input
                    type="text"
                    required
                    placeholder="Bulevar Kralja Aleksandra 120 / Stan 5"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Grad</label>
                    <input
                      type="text"
                      required
                      placeholder="Beograd"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Poštanski Broj</label>
                    <input
                      type="text"
                      required
                      placeholder="11000"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info Card */}
            <div className="bg-metallic border border-titanium rounded-xl p-6 shadow-lg">
              <h2 className="font-technical text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-titanium pb-3">
                <CreditCard className="text-primary" size={18} />
                2. NAČIN PLAĆANJA
              </h2>

              <div className="grid grid-cols-2 gap-4 p-1 bg-obsidian border border-titanium rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex flex-col items-center justify-center gap-2 py-4 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'CARD' 
                      ? 'bg-primary text-white border border-primary/20 shadow-md' 
                      : 'text-gray-400 hover:text-white hover:bg-titanium/20'
                  }`}
                >
                  <CreditCard size={20} />
                  <span className="text-xs font-semibold">Plaćanje Karticom</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className={`flex flex-col items-center justify-center gap-2 py-4 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'CASH_ON_DELIVERY' 
                      ? 'bg-primary text-white border border-primary/20 shadow-md' 
                      : 'text-gray-400 hover:text-white hover:bg-titanium/20'
                  }`}
                >
                  <Truck size={20} />
                  <span className="text-xs font-semibold">Plaćanje Pouzećem</span>
                </button>
              </div>

              {paymentMethod === 'CARD' ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-titanium/20 border border-titanium p-4 rounded-lg flex items-center gap-3 mb-2">
                    <ShieldCheck className="text-emerald-400" size={24} />
                    <div>
                      <p className="text-xs font-semibold text-white">Sigurno plaćanje (SSL Encrypted)</p>
                      <p className="text-[10px] text-gray-500">Vaši podaci su enkriptovani i potpuno sigurni.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Ime na Kartici</label>
                    <input
                      type="text"
                      required={paymentMethod === 'CARD'}
                      placeholder="MARKO MARKOVIC"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Broj Kartice</label>
                    <input
                      type="text"
                      required={paymentMethod === 'CARD'}
                      placeholder="4111 2222 3333 4444"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Ističe (MM/GG)</label>
                      <input
                        type="text"
                        required={paymentMethod === 'CARD'}
                        placeholder="12/28"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        required={paymentMethod === 'CARD'}
                        placeholder="***"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-obsidian border border-titanium p-5 rounded-lg flex items-center gap-3 animate-fadeIn">
                  <Truck className="text-primary shrink-0" size={24} />
                  <div>
                    <p className="text-xs font-semibold text-white">Kurirska dostava</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Plaćanje ćete izvršiti gotovinom kuriru kurirske službe prilikom preuzimanja paketa na adresi isporuke.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded text-sm font-bold tracking-wider transition-colors cursor-pointer glow-primary text-center font-technical uppercase"
            >
              POTVRDI I PORUČI (Započni Plaćanje)
            </button>

          </form>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-metallic border border-titanium rounded-xl p-5 shadow-lg">
              <h3 className="font-technical text-sm font-bold text-white border-b border-titanium pb-3 mb-4">
                PREGLED PORUDŽBINE
              </h3>

              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.part.id} className="flex justify-between items-start gap-2 bg-obsidian/40 border border-titanium/50 p-2.5 rounded">
                    <div>
                      <p className="text-xs font-semibold text-white truncate max-w-[150px]">{item.part.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">količina: {item.quantity} · ${item.part.price}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary font-mono">${(item.part.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-titanium/80 pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Suma artikala:</span>
                  <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Dostava:</span>
                  <span className="font-mono text-white">
                    {shipping === 0 ? 'BESPLATNA' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[9px] text-yellow-500 font-mono">Besplatna dostava za porudžbine preko $150.00!</p>
                )}
                
                <div className="border-t border-titanium pt-3 mt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-white">UKUPNO ZA UPLATU:</span>
                  <span className="text-lg font-bold text-primary font-mono">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Success Screen */
        <div className="max-w-2xl mx-auto border border-titanium bg-metallic rounded-xl p-8 shadow-2xl animate-fadeIn">
          <div className="text-center pb-6 border-b border-titanium">
            <CheckCircle2 className="text-emerald-400 mx-auto mb-3" size={56} />
            <h2 className="font-technical text-2xl font-black text-white">PORUDŽBINA USPEŠNO PRIMLJENA!</h2>
            <p className="text-xs text-gray-400 mt-1">
              Hvala Vam na poverenju. Vaša porudžbina je zavedena pod brojem: 
              <span className="font-mono text-primary font-bold ml-1 text-sm bg-obsidian border border-titanium px-2 py-0.5 rounded">
                {createdOrder?.id}
              </span>
            </p>
          </div>

          <div className="py-6 space-y-4">
            <h3 className="font-technical text-xs font-bold text-gray-400 uppercase tracking-widest">
              DETALJI DOSTAVE
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs bg-obsidian border border-titanium/80 p-4 rounded-lg">
              <div>
                <p className="text-gray-500">Naručilac:</p>
                <p className="font-semibold text-white mt-0.5">{createdOrder?.clientName}</p>
              </div>
              <div>
                <p className="text-gray-500">Način Plaćanja:</p>
                <p className="font-semibold text-white mt-0.5">
                  {createdOrder?.paymentMethod === 'CARD' ? 'Kreditna Kartica' : 'Pouzećem'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Adresa isporuke:</p>
                <p className="font-semibold text-white mt-0.5">{createdOrder?.shippingAddress}</p>
              </div>
              <div>
                <p className="text-gray-500">Kontakt E-mail:</p>
                <p className="font-semibold text-white mt-0.5">{createdOrder?.contactEmail}</p>
              </div>
              <div>
                <p className="text-gray-500">Ukupno Naplaćeno:</p>
                <p className="font-semibold text-primary font-mono mt-0.5">${createdOrder?.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* GUEST OPT-IN REGISTRATION SHORTCUT */}
          {user?.role === 'GUEST' && (
            <div className="border border-primary/30 bg-primary/5 rounded-lg p-6 mt-4">
              <h4 className="font-technical text-sm font-bold text-white flex items-center gap-2 mb-2">
                <UserPlus size={16} className="text-primary" />
                SAČUVAJTE NALOG I PRATITE PORUDŽBINU
              </h4>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Pošto ste poručili kao gost, možete pretvoriti ovaj nalog u zvanični klijentski nalog. Unesite željeno korisničko ime i šifru, a mi ćemo sačuvati Vašu istoriju kupovina!
              </p>

              {regSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded text-center text-xs font-semibold">
                  Nalog uspešno kreiran! Logovani ste kao registrovani klijent.
                </div>
              ) : (
                <form onSubmit={handlePostCheckoutRegister} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Željeno korisničko ime"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      required
                      placeholder="Lozinka"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Key size={13} /> Registruj se
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="pt-6 flex gap-4 border-t border-titanium mt-6">
            <Link
              to="/"
              className="flex-1 px-4 py-2 border border-titanium hover:bg-titanium/50 text-gray-300 hover:text-white rounded text-center text-xs font-semibold tracking-wider transition-colors cursor-pointer"
            >
              VRATI SE NA KATALOG
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded text-center text-xs font-semibold tracking-wider transition-colors cursor-pointer font-technical glow-primary"
            >
              PRATI PORUDŽBINU (DASHBOARD)
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
