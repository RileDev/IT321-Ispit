import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import RegisterForm from '../components/RegisterForm';

export const Login: React.FC = () => {
  const { login, registerClient } = useStore();
  const navigate = useNavigate();

  // Active Main Tab: 'CLIENT' | 'EMPLOYEE'
  const [activeRole, setActiveRole] = useState<'CLIENT' | 'EMPLOYEE'>('CLIENT');

  // Client Sub-tab: 'LOGIN' | 'REGISTER'
  const [clientTab, setClientTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Netačni kredencijali ili korisnik ne postoji.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleClientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !phone.trim() || !password.trim()) return;

    try {
      await registerClient(username, email, phone, password);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Korisničko ime je već zauzeto.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Netačni kredencijali ili zaposleni ne postoji u sistemu.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleGuestContinue = () => {
    login('Gost', 'GUEST');
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="bg-metallic border border-titanium rounded-xl p-6 md:p-8 shadow-2xl animate-fadeIn">

        {/* Logo indicator */}
        <div className="text-center mb-6">
          <span className="font-technical text-xl font-bold tracking-wider text-white block">
            APEX<span className="text-primary italic">PARTS</span> SECURE
          </span>
          <p className="text-[10px] text-gray-500 uppercase mt-0.5 tracking-widest font-mono">Prijavni portal sistema</p>
        </div>

        {/* Role Select Tabs */}
        <div className="flex border border-titanium rounded-lg p-1 bg-obsidian mb-6">
          <button
            onClick={() => { setActiveRole('CLIENT'); setErrorMsg(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold cursor-pointer transition-all ${activeRole === 'CLIENT'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <UserCheck size={14} />
            Klijent / Kupac
          </button>
          <button
            onClick={() => { setActiveRole('EMPLOYEE'); setErrorMsg(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold cursor-pointer transition-all ${activeRole === 'EMPLOYEE'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <ShieldAlert size={14} />
            Zaposleni
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded text-red-400 p-3 text-xs text-center mb-4">
            {errorMsg}
          </div>
        )}

        {/* Render forms based on activeRole tab */}
        {activeRole === 'CLIENT' ? (
          <div>
            {/* Login / Register subtab switcher */}
            <div className="flex justify-center gap-4 text-xs font-semibold mb-6 border-b border-titanium/50 pb-2">
              <button
                onClick={() => setClientTab('LOGIN')}
                className={`pb-1 cursor-pointer transition-colors ${clientTab === 'LOGIN' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'
                  }`}
              >
                Prijavi Se
              </button>
              <button
                onClick={() => setClientTab('REGISTER')}
                className={`pb-1 cursor-pointer transition-colors ${clientTab === 'REGISTER' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'
                  }`}
              >
                Registruj Nalog
              </button>
            </div>

            {clientTab === 'LOGIN' ? (
              <form onSubmit={handleClientLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Korisničko ime ili Email</label>
                  <input
                    type="text"
                    required
                    placeholder="klijent123 ili klijent@example.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Lozinka</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold tracking-wider transition-colors cursor-pointer glow-primary"
                >
                  PRIJAVI SE
                </button>
              </form>
            ) : (
              // RegisterForm
              <RegisterForm
                handleClientRegister={handleClientRegister}
                username={username}
                setUsername={setUsername}
                email={email}
                setEmail={setEmail}
                phone={phone}
                setPhone={setPhone}
                password={password}
                setPassword={setPassword}
              />
            )}

            {/* Guest Action */}
            <div className="border-t border-titanium pt-4 mt-6">
              <button
                type="button"
                onClick={handleGuestContinue}
                className="w-full flex items-center justify-center gap-1 py-2 border border-titanium hover:bg-titanium/50 text-gray-300 hover:text-white rounded text-xs font-semibold transition-colors cursor-pointer"
              >
                Nastavi kao Gost <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Employee Form */
          <form onSubmit={handleEmployeeLogin} className="space-y-4">
            <div className="bg-titanium/10 border border-titanium p-3 rounded text-[10px] text-gray-400 leading-relaxed">
              <span className="font-semibold text-white block uppercase tracking-wider mb-0.5">Napomena za zaposlene:</span>
              Nove zaposlene dodaje isključivo administrator sistema u administratorskom panelu kontrolne table.
              <div className="mt-1 font-mono text-[9px]">
                Demo zaposleni: <span className="text-white">marko</span> (ili <span className="text-white">admin</span>)
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Korisničko ime ili Email zaposlenog</label>
              <input
                type="text"
                required
                placeholder="marko ili marko@apexparts.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Lozinka zaposlenog</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold tracking-wider transition-colors cursor-pointer glow-primary font-technical uppercase"
            >
              AUTORIZUJ PRISTUP
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
