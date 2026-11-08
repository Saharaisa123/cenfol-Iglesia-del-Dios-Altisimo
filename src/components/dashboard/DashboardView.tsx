import React from 'react';
import { 
  Users, 
  UserCheck, 
  ClipboardCheck, 
  Home, 
  GraduationCap, 
  Cake, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  PlusCircle, 
  FileSpreadsheet, 
  FileText, 
  MessageSquareShare,
  Calendar,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Member, AttendanceRecord, Ministry, EdificationGroup, TrainingLevel, ChurchEvent, User } from '../../types';
import { ExportService } from '../../services/exportService';

interface DashboardViewProps {
  currentUser: User;
  members: Member[];
  ministries: Ministry[];
  edificationGroups: EdificationGroup[];
  trainingLevels: TrainingLevel[];
  attendanceRecords: AttendanceRecord[];
  events: ChurchEvent[];
  onNavigate: (tab: string) => void;
  onOpenNewAttendance: () => void;
  onOpenNewMember: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  members,
  ministries,
  edificationGroups,
  trainingLevels,
  attendanceRecords,
  events,
  onNavigate,
  onOpenNewAttendance,
  onOpenNewMember
}) => {
  const activeMembers = members.filter(m => m.status === 'activo');
  const followUpMembers = members.filter(m => m.status === 'en_seguimiento');
  
  // Birthdays of this month
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthBirthdays = members.filter(m => {
    if (!m.birthDate) return false;
    const parts = m.birthDate.split('-');
    return parseInt(parts[1], 10) === currentMonth;
  });

  // Calculate average attendance %
  const avgAttendance = attendanceRecords.length > 0
    ? Math.round(attendanceRecords.reduce((sum, r) => sum + r.attendanceRate, 0) / attendanceRecords.length)
    : 88;

  // Training level progress stats
  const studentsInCourse = members.filter(m => m.capacitacionStatus === 'en_curso').length;
  const graduates = members.filter(m => m.capacitacionStatus === 'aprobado' || m.capacitacionStatus === 'graduado').length;

  const handleExportFullExcel = () => {
    ExportService.exportFullChurchDatabaseToExcel(
      members,
      ministries,
      edificationGroups,
      trainingLevels,
      attendanceRecords
    );
  };

  const handleExportPastoralPDF = () => {
    ExportService.generatePastorConsolidatedPDF(
      members,
      ministries,
      edificationGroups,
      attendanceRecords,
      currentUser.name
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <span>CENFOL • Iglesia del Dios Altísimo</span>
              <span>•</span>
              <span>Sistema de Gestión Eclesial</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bienvenido, {currentUser.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Supervisa la asistencia semanal de los 5 ministerios, el crecimiento de los Grupos de Edificación y el avance en los 5 Niveles de Capacitación.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            {currentUser.role !== 'miembro' && (
              <button
                onClick={onOpenNewAttendance}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Registrar Asistencia Semanal</span>
              </button>
            )}

            {currentUser.role === 'admin' && (
              <button
                onClick={handleExportFullExcel}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                title="Descargar base de datos completa de todos los ministerios y niveles en Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Descargar Excel Completo</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Miembros Activos */}
        <div 
          onClick={() => onNavigate('members')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Miembros Activos</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{activeMembers.length}</span>
            <span className="text-xs text-slate-400 ml-1.5">de {members.length} registrados</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600 font-bold">100%</span> en base centralizada
          </div>
        </div>

        {/* Card 2: Asistencia Promedio */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asistencia Promedio</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{avgAttendance}%</span>
            <span className="text-xs text-emerald-600 font-semibold ml-1.5">Efectividad</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {attendanceRecords.length} reportes semanales registrados
          </div>
        </div>

        {/* Card 3: Grupos de Edificación */}
        <div 
          onClick={() => onNavigate('edification')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grupos Edificación</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{edificationGroups.length}</span>
            <span className="text-xs text-slate-400 ml-1.5">Células en hogares</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Reuniones semanales en barrios
          </div>
        </div>

        {/* Card 4: Discipulado y Capacitación */}
        <div 
          onClick={() => onNavigate('training')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Capacitación (1-5)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">{studentsInCourse}</span>
            <span className="text-xs text-purple-600 font-semibold ml-1.5">En Curso</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {graduates} hermanos aprobados / graduados
          </div>
        </div>

      </div>

      {/* Main Grid: Ministries Overview & Quick Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ministries Section (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Ministerios de la Iglesia (CENFOL)
              </h2>
              <p className="text-xs text-slate-500">
                Seguimiento de miembros y líderes por ministerio oficial
              </p>
            </div>
            <button
              onClick={() => onNavigate('ministries')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ministries.map(ministry => {
              const count = members.filter(m => m.ministryId === ministry.key).length;
              return (
                <div
                  key={ministry.id}
                  onClick={() => onNavigate('ministries')}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ministry.colorScheme.light}`}>
                        {ministry.meetingDay}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {count} miembros
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-2">
                      {ministry.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {ministry.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                    <span className="truncate">Líder: <b>{ministry.leaderName}</b></span>
                    <span className="text-indigo-600 font-semibold text-[10px]">Ver detalles</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Attendance Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Últimos Registros de Asistencia Semanal
                </h3>
                <p className="text-xs text-slate-500">
                  Resumen de asistencias tomadas por los líderes
                </p>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Abrir Módulo de Asistencia
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Grupo / Ministerio</th>
                    <th className="px-4 py-3">Líder</th>
                    <th className="px-4 py-3 text-center">Presentes / Total</th>
                    <th className="px-4 py-3 text-center">% Asistencia</th>
                    <th className="px-4 py-3 text-right">Reporte PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceRecords.slice(0, 4).map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{record.date}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{record.targetName}</td>
                      <td className="px-4 py-3 text-slate-600">{record.leaderName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-emerald-700">{record.presentCount}</span> / {record.totalMembers}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          record.attendanceRate >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {record.attendanceRate.toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => ExportService.generateWeeklyAttendancePDF(record)}
                          className="text-slate-600 hover:text-indigo-600 font-medium inline-flex items-center gap-1 p-1 hover:bg-slate-100 rounded"
                          title="Descargar reporte en PDF con firmas"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Alerts, Birthdays, Events, Exports */}
        <div className="space-y-4">
          
          {/* Quick Reports Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Reportes & Exportaciones</span>
            </h3>
            <p className="text-xs text-slate-500">
              Genera documentos oficiales con membrete eclesiástico de CENFOL.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleExportFullExcel}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Base de Datos Completa (.xlsx)</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Admin</span>
              </button>

              <button
                onClick={handleExportPastoralPDF}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <span>Informe Pastoral Consolidado (.pdf)</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">PDF</span>
              </button>
            </div>
          </div>

          {/* Birthdays of this Month */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Cake className="w-4 h-4 text-rose-500" />
                <span>Cumpleaños del Mes ({currentMonthBirthdays.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('notifications')}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Felicitar
              </button>
            </div>

            <div className="space-y-2">
              {currentMonthBirthdays.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay cumpleaños registrados para este mes.</p>
              ) : (
                currentMonthBirthdays.slice(0, 4).map(member => (
                  <div key={member.id} className="p-2 rounded-lg bg-rose-50/40 border border-rose-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{member.fullName}</p>
                      <p className="text-[11px] text-slate-500">{member.phone}</p>
                    </div>
                    <span className="bg-white text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded text-[11px]">
                      {member.birthDate.substring(5)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pastoral Follow-up Alert (Members absent / in follow-up) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Seguimiento Pastoral ({followUpMembers.length})</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Miembros con inasistencias o en proceso de reintegración para visita pastoral.
            </p>

            <div className="space-y-2">
              {followUpMembers.map(m => (
                <div key={m.id} className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/40 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{m.fullName}</span>
                    <a
                      href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola hermano ${m.fullName}, te saludamos con gran aprecio desde la Iglesia del Dios Altísimo CENFOL. Esperamos te encuentres muy bien, te extrañamos en el servicio.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs"
                    >
                      <MessageSquareShare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 italic">{m.notes || 'Inasistencia reportada'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Próximos Eventos</span>
              </h3>
              <button
                onClick={() => onNavigate('events')}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Calendario
              </button>
            </div>

            <div className="space-y-2.5">
              {events.slice(0, 3).map(ev => (
                <div key={ev.id} className="text-xs border-l-2 border-indigo-500 pl-2.5 py-0.5">
                  <p className="font-bold text-slate-800">{ev.title}</p>
                  <p className="text-[11px] text-slate-500">{ev.date} • {ev.time}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
