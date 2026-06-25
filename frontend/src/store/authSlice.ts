import type { StateCreator } from 'zustand';
import type { User } from './types';
import { API_BASE } from './types';

export interface AuthSlice {
  user: User | null;
  employees: { id: string; username: string }[];
  token: string | null;
  login: (username: string, password?: string, role?: User['role'], email?: string, phone?: string) => Promise<void>;
  logout: () => void;
  registerClient: (username: string, email: string, phone: string, password?: string) => Promise<void>;
  addEmployee: (username: string) => Promise<void>;
  fetchEmployees: () => Promise<void>;
}

const getInitialUser = (): User => {
  try {
    const stored = localStorage.getItem('apex_user');
    return stored ? JSON.parse(stored) : { id: 'guest-session', username: 'Gost', role: 'GUEST' };
  } catch {
    return { id: 'guest-session', username: 'Gost', role: 'GUEST' };
  }
};

const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem('apex_token');
  } catch {
    return null;
  }
};

export const createAuthSlice: StateCreator<any, [], [], AuthSlice> = (set, get) => ({
  user: getInitialUser(),
  employees: [
    { id: 'emp1', username: 'marko' },
    { id: 'emp2', username: 'ana' }
  ],
  token: getInitialToken(),

  login: async (username, password, role, _email, _phone) => {
    if (role === 'GUEST' || username === 'Gost') {
      const guestUser = { id: 'guest-session', username: 'Gost', role: 'GUEST' as const };
      try {
        localStorage.setItem('apex_user', JSON.stringify(guestUser));
        localStorage.removeItem('apex_token');
      } catch (e) {
        console.error(e);
      }
      set({ user: guestUser, token: null });
      return;
    }
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Netačni kredencijali ili korisnik ne postoji.');
    }
    const data = await response.json();
    const loggedUser = {
      id: String(data.id),
      username: data.username,
      role: data.role as User['role'],
      email: data.email || '',
      phone: data.phone || ''
    };
    try {
      localStorage.setItem('apex_user', JSON.stringify(loggedUser));
      localStorage.setItem('apex_token', data.token || '');
    } catch (e) {
      console.error(e);
    }
    set({
      user: loggedUser,
      token: data.token
    });
  },

  logout: () => {
    try {
      localStorage.removeItem('apex_user');
      localStorage.removeItem('apex_token');
    } catch (e) {
      console.error(e);
    }
    set({ user: { id: 'guest-session', username: 'Gost', role: 'GUEST' }, token: null, cart: [] });
  },

  registerClient: async (username, email, phone, password) => {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, phone, password: password || 'default' })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Korisničko ime je već zauzeto.');
    }
    const data = await response.json();
    const newUser = {
      id: String(data.id),
      username: data.username,
      role: 'CLIENT' as const,
      email: data.email || '',
      phone: data.phone || ''
    };
    try {
      localStorage.setItem('apex_user', JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }
    set({
      user: newUser
    });
  },

  addEmployee: async (employeeUsername) => {
    const adminUsername = get().user?.username || 'admin';
    const response = await fetch(`${API_BASE}/users/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUsername, employeeUsername })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Greška pri dodavanju zaposlenog');
    }
    const newEmp = await response.json();
    set((state: any) => ({
      employees: [...state.employees, { id: String(newEmp.id), username: newEmp.username }]
    }));
  },

  fetchEmployees: async () => {
    const response = await fetch(`${API_BASE}/users/employees`);
    if (response.ok) {
      const data = await response.json();
      set({ employees: data.map((e: any) => ({ id: String(e.id), username: e.username })) });
    }
  }
});
