import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Key, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { User } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  availableUsers: User[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  availableUsers
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const found = availableUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      setError('No existe un usuario con este correo electrónico. Puedes usar uno de los accesos preconfigurados abajo.');
      return;
    }

    const expectedPass = found.password || (found.role === 'admin' ? 'admin123' : found.role === 'miembro' ? 'miembro123' : 'lider123');
    if (password !== expectedPass) {
      setError(`Contraseña incorrecta para ${found.name}. Por favor verifica o usa la contraseña registrada.`);
      return;
    }

    onLoginSuccess(found);
    onClose();
  };

  const handleQuickSelect = (u: User) => {
    const pass = u.password || (u.role === 'admin' ? 'admin123' : u.role === 'miembro' ? 'miembro123' : 'lider123');
    setEmail(u.email);
    setPassword(pass);
    setError(null);
    onLoginSuccess(u);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/LOGO_CENFOL_1a3cdd0f.jpg" 
              alt="CENFOL" 
              className="w-12 h-12 rounded-lg bg-white p-1 border border-slate-700 object-contain"
            />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">CENFOL</p>
              <h3 className="text-lg font-extrabold text-white">Iglesia del Dios Altísimo</h3>
              <p className="text-xs text-slate-300">Autenticación por Roles y Contraseña</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Regular Login Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej: admin@iglesia.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* Quick Access Roles Section */}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>Accesos Rápidos por Rol (Credenciales Predefinidas):</span>
            </p>

            <div className="space-y-2">
              {availableUsers.map(u => {
                const currentPass = u.password || (u.role === 'admin' ? 'admin123' : u.role === 'miembro' ? 'miembro123' : 'lider123');
                return (
                  <div
                    key={u.id}
                    className="p-2.5 border border-slate-200 hover:border-indigo-300 rounded-xl bg-slate-50 hover:bg-indigo-50/40 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{u.email} • pass: <span className="text-indigo-600 font-bold">{currentPass}</span></p>
                      <p className="text-[10px] text-indigo-700 font-medium capitalize mt-0.5">
                        {u.role === 'admin' ? '★ Acceso Total (Descarga Masiva)' : u.role === 'lider_ministerio' ? 'Líder Ministerio' : u.role === 'lider_edificacion' ? 'Líder G. Edificación' : 'Miembro General'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickSelect(u)}
                      className="shrink-0 bg-white hover:bg-indigo-600 hover:text-white border border-slate-300 hover:border-indigo-600 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs"
                    >
                      Entrar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
