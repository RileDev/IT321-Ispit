import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { Wrench, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';

export const SpecialOrder: React.FC = () => {
  const { createSpecialOrder, user } = useStore();
  
  // Page states: 'FORM' | 'SUCCESS'
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');

  // Fields
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2018);
  const [engine, setEngine] = useState('');
  const [partsDesc, setPartsDesc] = useState('');
  const [clientEmail, setClientEmail] = useState(user?.email || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make.trim() || !model.trim() || !partsDesc.trim() || !clientEmail.trim()) return;

    try {
      // Save special order
      await createSpecialOrder({
        carDetails: {
          make,
          model,
          year,
          engine
        },
        neededPartsDescription: partsDesc,
        clientEmail
      });

      setStep('SUCCESS');
    } catch (err: any) {
      alert(err.message || 'Greška prilikom slanja specijalnog upita.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {step === 'FORM' ? (
        <div className="bg-metallic border border-titanium rounded-xl p-6 md:p-8 shadow-2xl">
          <div className="border-b border-titanium pb-4 mb-6">
            <h1 className="font-technical text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <Wrench className="text-primary animate-pulse" size={24} />
              SPECIJALNO PORUČIVANJE DELOVA
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Ukoliko deo koji tražite trenutno ne postoji na našem sajtu, možete pisati direktno prodavnici. Naš tim će proveriti sa glavnim dobavljačem i poslati Vam ponudu u najkraćem roku.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Info warning */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg flex gap-3">
              <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-gray-400">
                <span className="font-semibold text-white">Napomena:</span> Molimo Vas da unesete tačne podatke o vozilu kako bismo izbegli nekompatibilnost delova. VIN broj ili tačnu oznaku motora možete dodati u opis.
              </div>
            </div>

            {/* Vehicle spec section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest">
                SPECIFIKACIJA AUTOMOBILA
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Marka Automobila</label>
                  <input
                    type="text"
                    required
                    placeholder="npr. BMW, Audi, VW"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="npr. 3 Series, A4, Golf"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Godište Proizvodnje</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                  >
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Kubikaža / Snaga / Oznaka motora</label>
                  <input
                    type="text"
                    placeholder="npr. 2.0 TDI (110kW) CAGA"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Part request details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest">
                POTREBNI DELOVI I OPIS
              </h3>
              
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Opis dela ili delova koji su Vam potrebni</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Navedite tačan naziv delova, po mogućstvu serijske brojeve ukoliko ih znate, ili bilo koji dodatni komentar o kvaru..."
                  value={partsDesc}
                  onChange={(e) => setPartsDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Vaša E-mail adresa za povratnu informaciju</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="marko@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                  />
                  <Mail size={14} className="absolute left-3 top-3 text-gray-500" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded text-xs font-bold tracking-wider transition-colors cursor-pointer glow-primary text-center font-technical uppercase"
            >
              POŠALJI ZAHTEV PRODAVNICI
            </button>

          </form>
        </div>
      ) : (
        /* Success screen */
        <div className="border border-titanium bg-metallic rounded-xl p-8 shadow-2xl text-center max-w-xl mx-auto animate-fadeIn">
          <CheckCircle2 className="text-emerald-400 mx-auto mb-3 animate-bounce" size={48} />
          <h2 className="font-technical text-xl font-black text-white">UPIT JE USPEŠNO POSLAT!</h2>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Hvala Vam. Vaš zahtev za specijalno poručivanje je primljen. 
            Naši zaposleni će u najkraćem roku kontaktirati glavnog dobavljača radi provere dostupnosti delova.
          </p>
          <div className="bg-obsidian border border-titanium p-4 rounded-lg text-left text-xs my-6 space-y-2">
            <p className="text-gray-400">
              <span className="font-semibold text-white uppercase text-[10px] tracking-wider block">Auto:</span>
              {year} {make} {model} {engine ? `(${engine})` : ''}
            </p>
            <p className="text-gray-400 border-t border-titanium/50 pt-2">
              <span className="font-semibold text-white uppercase text-[10px] tracking-wider block">Odgovor stiže na:</span>
              {clientEmail}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/"
              className="flex-1 px-4 py-2 border border-titanium hover:bg-titanium text-gray-300 hover:text-white rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              NAZAD NA PRODAVNICU
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
