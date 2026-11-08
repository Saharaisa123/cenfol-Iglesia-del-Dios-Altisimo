import React, { useState } from 'react';
import { 
  Bell, 
  UserCheck, 
  LogOut, 
  ChevronDown, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Cake, 
  Calendar, 
  ShieldCheck,
  Smartphone,
  Lock
} from 'lucide-react';
import { User, Member, ChurchEvent } from '../../types';

interface NavbarProps {
  currentUser: User;
  onOpenLogin: () => void;
  onLogout: () => void;
  onSwitchUser: (user: User) => void;
  availableUsers: User[];
  members: Member[];
  events: ChurchEvent[];
  onOpenQuickExport: () => void;
  onNavigate: (tab: string) => void;
  onOpenPasswordModal: (tab?: 'my_password' | 'manage_all') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onSwitchUser,
  availableUsers,
  members,
  events,
  onOpenQuickExport,
  onNavigate,
  onOpenPasswordModal
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Calculate birthdays in current month (November 2026 or current)
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const birthdayMembers = members.filter(m => {
    if (!m.birthDate) return false;
    const birthM = parseInt(m.birthDate.split('-')[1], 10);
    return birthM === currentMonth;
  });

  const upcomingImportantEvents = events.filter(e => e.isImportantReminder).slice(0, 3);
  const totalNotifications = birthdayMembers.length + upcomingImportantEvents.length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs px-2.5 py-0.5 rounded-full font-medium">Administrador / Pastor</span>;
      case 'lider_ministerio':
        return <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-medium">Líder de Ministerio</span>;
      case 'lider_edificacion':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium">Líder G. Edificación</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-300 text-xs px-2.5 py-0.5 rounded-full font-medium">Miembro Activo</span>;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Church Brand & Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <img 
              src="/assets/aistudio/LOGO_CENFOL_1a3cdd0f.jpg" 
              alt="CENFOL Logo" 
              className="w-10 h-10 object-contain rounded-md border border-slate-200 p-0.5 bg-white shadow-xs"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">CENFOL</span>
              <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                Iglesia del Dios Altísimo
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            
            {/* Quick Export Button (Visible for Admin & Leaders) */}
            {currentUser.role === 'admin' && (
              <button
                onClick={onOpenQuickExport}
                className="hidden md:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-xs"
                title="Descargar base de datos completa de ministerios y capacitación"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Exportar Todo (Excel / PDF)</span>
              </button>
            )}

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowUserMenu(false);
                }}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Notificaciones automáticas y recordatorios"
              >
                <Bell className="w-5 h-5" />
                {totalNotifications > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {totalNotifications}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      Recordatorios y Alertas
                    </span>
                    <button 
                      onClick={() => {
                        setShowNotifMenu(false);
                        onNavigate('notifications');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Ver centro completo
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {/* Birthdays */}
                    {birthdayMembers.length > 0 && (
                      <div className="p-3 bg-rose-50/50">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1.5">
                          <Cake className="w-3.5 h-3.5" />
                          <span>Cumpleañeros de este Mes ({birthdayMembers.length})</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">Envía un saludo fraterno y felicitaciones en nombre de la iglesia:</p>
                        <div className="space-y-1">
                          {birthdayMembers.slice(0, 3).map(m => (
                            <div key={m.id} className="flex items-center justify-between text-xs bg-white p-1.5 rounded border border-rose-100">
                              <span className="font-medium text-slate-800">{m.fullName}</span>
                              <span className="text-rose-700 font-semibold text-[11px]">{m.birthDate.substring(5)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Events */}
                    {upcomingImportantEvents.map(e => (
                      <div key={e.id} className="p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{e.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{e.date} a las {e.time} • {e.location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-3 pt-2 pb-1 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setShowNotifMenu(false);
                        onNavigate('notifications');
                      }}
                      className="w-full text-center text-xs text-slate-700 hover:text-indigo-600 font-medium py-1.5 rounded hover:bg-slate-50 flex items-center justify-center gap-1"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      Enviar recordatorios masivos por WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <img 
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Sesión iniciada como:</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <div className="mt-1">{getRoleBadge(currentUser.role)}</div>
                    <p className="text-[11px] text-slate-400 mt-1">{currentUser.email}</p>
                  </div>

                  {/* Switch Demo Roles directly */}
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Cambiar de Rol (Prueba Rápida):
                    </p>
                    <div className="space-y-1">
                      {availableUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                            u.id === currentUser.id 
                              ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{u.name}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                            {u.role === 'admin' ? 'Pastor/Admin' : u.role === 'lider_ministerio' ? 'Líder Min.' : u.role === 'lider_edificacion' ? 'Líder G.E.' : 'Miembro'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-2 pt-1 border-t border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenPasswordModal('my_password');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 rounded-lg flex items-center gap-2 font-semibold"
                    >
                      <Lock className="w-4 h-4 text-indigo-600" />
                      <span>Cambiar Mi Contraseña</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenPasswordModal('manage_all');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-amber-800 hover:bg-amber-50 rounded-lg flex items-center gap-2 font-semibold"
                      >
                        <UserCheck className="w-4 h-4 text-amber-600" />
                        <span>Gestionar Usuarios y Contraseñas</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenLogin();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Iniciar con otro Usuario</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
