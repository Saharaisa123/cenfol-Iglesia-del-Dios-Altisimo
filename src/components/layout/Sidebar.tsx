import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Users, 
  Layers, 
  Home, 
  GraduationCap, 
  MessageSquareShare, 
  Calendar, 
  FileBarChart,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  const isLiderMinisterio = currentUser.role === 'lider_ministerio';
  const isLiderEdificacion = currentUser.role === 'lider_edificacion';
  const isMiembro = currentUser.role === 'miembro';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Panel General',
      icon: LayoutDashboard,
      description: 'Estadísticas e indicadores clave',
      show: true
    },
    {
      id: 'attendance',
      label: 'Asistencia Semanal',
      icon: ClipboardCheck,
      description: 'Toma y reportes semanales',
      badge: 'Principal',
      show: !isMiembro
    },
    {
      id: 'members',
      label: 'Base de Datos Miembros',
      icon: Users,
      description: 'Perfiles, teléfonos y grupos',
      show: !isMiembro
    },
    {
      id: 'ministries',
      label: 'Ministerios',
      icon: Layers,
      description: 'Hombres, Mujeres, Jóvenes...',
      show: true
    },
    {
      id: 'edification',
      label: 'Grupos de Edificación',
      icon: Home,
      description: 'Red de células en hogares',
      show: true
    },
    {
      id: 'training',
      label: 'Niveles de Capacitación',
      icon: GraduationCap,
      description: 'Niveles 1 al 5 y discipulado',
      show: true
    },
    {
      id: 'notifications',
      label: 'Notificaciones & Recordatorios',
      icon: MessageSquareShare,
      description: 'WhatsApp masivo y alertas',
      show: !isMiembro
    },
    {
      id: 'events',
      label: 'Eventos & Calendario',
      icon: Calendar,
      description: 'Próximas actividades',
      show: true
    },
    {
      id: 'reports',
      label: 'Reportes y Descargas',
      icon: FileBarChart,
      description: 'Exportar Excel y PDF',
      show: isAdmin || isLiderMinisterio || isLiderEdificacion
    }
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800">
      <div className="p-4 space-y-6">
        
        {/* Church Subheader Card */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <span className="text-indigo-400 font-extrabold text-xs">IDA</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-200 truncate">Iglesia del Dios Altísimo</p>
            <p className="text-[11px] text-slate-400 truncate">Sede Central CENFOL</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Módulos del Sistema
          </p>
          <nav className="space-y-1">
            {menuItems.filter(item => item.show).map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-1.5 py-0.2 rounded font-semibold uppercase">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Role Permissions Card */}
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Permisos Activos</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {isAdmin && 'Acceso total como Administrador. Puedes descargar la base completa en Excel y PDF.'}
            {isLiderMinisterio && 'Acceso habilitado para tu ministerio específico y registro de asistencia semanal.'}
            {isLiderEdificacion && 'Acceso a tu grupo de edificación (célula) y reporte semanal de discípulos.'}
            {isMiembro && 'Vista personalizada de tu grupo, discipulado y próximos eventos eclesiales.'}
          </p>
        </div>

      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-[11px] text-slate-400 font-medium">CENFOL • Edificando Familias</p>
        <p className="text-[10px] text-slate-500">Versión 2.5 • Bogotá, Colombia</p>
      </div>
    </aside>
  );
};
