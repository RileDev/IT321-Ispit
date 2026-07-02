const RegisterForm = ({ handleClientRegister, username, setUsername, email, setEmail, phone, setPhone, password, setPassword }) => {
    return <form onSubmit={handleClientRegister} className="space-y-4">
        <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Korisničko ime</label>
            <input
                type="text"
                required
                placeholder="markom"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-obsidian border border-titanium text-white text-xs rounded focus:border-primary outline-none"
            />
        </div>
        <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">E-mail Adresa</label>
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
            <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Broj Telefona</label>
            <input
                type="tel"
                required
                placeholder="060 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
            REGISTRUJ SE I PRIJAVI
        </button>
    </form>
}

export default RegisterForm;