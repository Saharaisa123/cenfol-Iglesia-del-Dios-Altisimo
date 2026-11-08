import React, { useState } from 'react';
import { 
  Layers, 
  Users, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  FileSpreadsheet, 
  FileText, 
  ClipboardCheck, 
  MessageSquareShare, 
  ChevronRight,
  Shield,
  Heart,
  Briefcase,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { Ministry, Member, AttendanceRecord, MinistryKey } from '../../types';
import { ExportService } from '../../services/exportService';

interface MinistriesViewProps {
  ministries: Ministry[];
  members: Member[];
  attendanceRecords: AttendanceRecord[];
  onTakeAttendance: (ministryKey: string) => void;
}

export const MinistriesView: React.FC<MinistriesViewProps> = ({
  ministries,
  members,
  attendanceRecords,
  onTakeAttendance
}) => {
  const [activeMinistryKey, setActiveMinistryKey] = useState<MinistryKey>('hombres_verdad');

  const selectedMinistry = ministries.find(m => m.key === activeMinistryKey) || ministries[0];
  const ministryMembers = members.filter(m => m.ministryId === selectedMinistry.key);
  const ministryAttendance = attendanceRecords.filter(a => a.targetId === selectedMinistry.key);

  const avgRate = ministryAttendance.length > 0
    ? Math.round(ministryAttendance.reduce((sum, a) => sum + a.attendanceRate, 0) / ministryAttendance.length)
    : 92;

  const getMinistryIcon = (key: MinistryKey) => {
    switch (key) {
      case 'hombres_verdad': return Shield;
      case 'mujeres_sabias': return Heart;
      case 'vida_estudiantil': return Sparkles;
      case 'profesionales': return Briefcase;
      case 'arca_noe': return Users;
    }
  };

  const handleExportMinistryExcel = () => {
    ExportService.exportMembersToExcel(
      ministryMembers,
      ministries,
      [],
      `Ministerio_${selectedMinistry.name.replace(/\s+/g, '_')}`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Ministerios Oficiales de la Iglesia
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            CENFOL - Iglesia del Dios Altísimo cuenta con 5 áreas estratégicas de pastoreo: Hombres de Verdad, Mujeres Sabias, Vida Estudiantil, Profesionales y Arca de Noé.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMinistryExcel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Ministerio</span>
          </button>
        </div>
      </div>

      {/* Ministry Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ministries.map(min => {
          const Icon = getMinistryIcon(min.key);
          const isSelected = min.key === activeMinistryKey;
          const count = members.filter(m => m.ministryId === min.key).length;

          return (
            <button
              key={min.id}
              onClick={() => setActiveMinistryKey(min.key)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${min.colorScheme.light}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{count} miembros</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  {min.name}
                </h3>
              </div>

              <span className={`text-[10px] font-semibold mt-3 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                {min.meetingDay}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Ministry Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Header Ribbon with Ministry Color */}
        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300">
              Ministerio Oficial CENFOL
            </span>
            <h2 className="text-xl font-extrabold text-white">
              {selectedMinistry.name}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {selectedMinistry.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onTakeAttendance(selectedMinistry.key)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Tomar Asistencia Semanal</span>
            </button>
          </div>
        </div>

        {/* Stats & Leader Info */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 bg-slate-50/50">
          
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Líder Encargado</span>
            <p className="text-sm font-extrabold text-slate-900">{selectedMinistry.leaderName}</p>
            <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {selectedMinistry.leaderPhone}
              </span>
              <a
                href={`https://wa.me/${selectedMinistry.leaderPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-semibold hover:underline"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Reunión & Horario</span>
            <p className="text-sm font-extrabold text-slate-900">{selectedMinistry.meetingDay}</p>
            <p className="text-xs text-slate-600">{selectedMinistry.meetingSchedule}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Población & Asistencia</span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold text-indigo-600">{ministryMembers.length}</span>
              <span className="text-xs text-slate-500">miembros inscritos</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {avgRate}% asiste
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{selectedMinistry.targetAudience}</p>
          </div>

        </div>

        {/* Members Roster of this Ministry */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Miembros Activos en {selectedMinistry.name} ({ministryMembers.length})</span>
            </h3>
            <span className="text-xs text-slate-500">Base centralizada CENFOL</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Miembro</th>
                  <th className="px-4 py-2.5">Teléfono / WhatsApp</th>
                  <th className="px-4 py-2.5">Nivel Capacitación</th>
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5 text-right">Contacto Rápido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ministryMembers.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{m.fullName}</p>
                      <p className="text-[10px] text-slate-400">CC: {m.documentId}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{m.phone}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-indigo-700">Nivel {m.capacitacionLevel}</span>
                      <span className="text-slate-400 text-[10px] ml-1">({m.capacitacionProgressPercent}%)</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        m.status === 'activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola hermano ${m.fullName}, te saludamos del ministerio ${selectedMinistry.name} de CENFOL.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-lg transition-colors border border-emerald-200"
                      >
                        <MessageSquareShare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
