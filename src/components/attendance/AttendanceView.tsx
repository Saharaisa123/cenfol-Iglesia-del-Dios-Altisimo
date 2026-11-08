import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  PlusCircle, 
  Check, 
  X, 
  Clock, 
  UserPlus, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  Search, 
  ChevronRight,
  DollarSign,
  BookOpen,
  Filter,
  Eye,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AttendanceRecord, AttendanceEntry, AttendanceStatus, Member, Ministry, EdificationGroup, User } from '../../types';
import { ExportService } from '../../services/exportService';

interface AttendanceViewProps {
  currentUser: User;
  members: Member[];
  ministries: Ministry[];
  edificationGroups: EdificationGroup[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendanceRecord: (record: AttendanceRecord) => void;
  onDeleteAttendanceRecord: (id: string) => void;
  isTakingAttendanceOpen?: boolean;
  onCloseTakingAttendance?: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  currentUser,
  members,
  ministries,
  edificationGroups,
  attendanceRecords,
  onSaveAttendanceRecord,
  onDeleteAttendanceRecord,
  isTakingAttendanceOpen = false,
  onCloseTakingAttendance
}) => {
  const [showTakeModal, setShowTakeModal] = useState(isTakingAttendanceOpen);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<AttendanceRecord | null>(null);

  // Filter state for history
  const [filterType, setFilterType] = useState<'all' | 'ministerio' | 'edificacion'>('all');
  const [filterTargetId, setFilterTargetId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for taking attendance
  const [sessionType, setSessionType] = useState<'ministerio' | 'edificacion'>('ministerio');
  const [targetId, setTargetId] = useState<string>(
    currentUser.role === 'lider_ministerio' && currentUser.assignedMinistryId 
      ? currentUser.assignedMinistryId 
      : currentUser.role === 'lider_edificacion' && currentUser.assignedGroupId 
        ? currentUser.assignedGroupId 
        : 'hombres_verdad'
  );
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [meetingTopic, setMeetingTopic] = useState('');
  const [offeringAmount, setOfferingAmount] = useState<number>(0);
  const [observations, setObservations] = useState('');
  
  // Entries for current taking
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [visitorName, setVisitorName] = useState('');

  // When opening take modal or changing target, prepare members
  const initTakeModal = (type: 'ministerio' | 'edificacion', targetKey: string) => {
    setSessionType(type);
    setTargetId(targetKey);

    let targetMembers: Member[] = [];
    if (type === 'ministerio') {
      targetMembers = members.filter(m => m.ministryId === targetKey && m.status !== 'inactivo');
    } else {
      targetMembers = members.filter(m => m.edificationGroupId === targetKey && m.status !== 'inactivo');
    }

    const initialEntries: AttendanceEntry[] = targetMembers.map(m => ({
      memberId: m.id,
      memberName: m.fullName,
      status: 'presente' as AttendanceStatus,
      note: ''
    }));

    setEntries(initialEntries);
    setShowTakeModal(true);
  };

  const handleTargetChange = (newTarget: string, newType = sessionType) => {
    setTargetId(newTarget);
    let targetMembers: Member[] = [];
    if (newType === 'ministerio') {
      targetMembers = members.filter(m => m.ministryId === newTarget && m.status !== 'inactivo');
    } else {
      targetMembers = members.filter(m => m.edificationGroupId === newTarget && m.status !== 'inactivo');
    }

    setEntries(targetMembers.map(m => ({
      memberId: m.id,
      memberName: m.fullName,
      status: 'presente',
      note: ''
    })));
  };

  const updateEntryStatus = (memberId: string, status: AttendanceStatus) => {
    setEntries(prev => prev.map(e => e.memberId === memberId ? { ...e, status } : e));
  };

  const updateEntryNote = (memberId: string, note: string) => {
    setEntries(prev => prev.map(e => e.memberId === memberId ? { ...e, note } : e));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setEntries(prev => prev.map(e => ({ ...e, status })));
  };

  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    setEntries(prev => [
      ...prev,
      {
        memberId: `visitor_${Date.now()}`,
        memberName: `${visitorName.trim()} (Nuevo Invitado)`,
        status: 'visitante',
        note: 'Primera visita'
      }
    ]);
    setVisitorName('');
  };

  const handleSaveAttendance = () => {
    const presentCount = entries.filter(e => e.status === 'presente').length;
    const absentCount = entries.filter(e => e.status === 'ausente').length;
    const justifiedCount = entries.filter(e => e.status === 'justificado').length;
    const visitorCount = entries.filter(e => e.status === 'visitante').length;
    const regularTotal = entries.filter(e => e.status !== 'visitante').length;
    const totalMembers = regularTotal > 0 ? regularTotal : entries.length;

    const rate = totalMembers > 0 ? (presentCount / totalMembers) * 100 : 100;

    let targetName = '';
    if (sessionType === 'ministerio') {
      const min = ministries.find(m => m.key === targetId);
      targetName = min ? min.name : targetId;
    } else {
      const ge = edificationGroups.find(g => g.id === targetId);
      targetName = ge ? `${ge.code} - ${ge.name}` : targetId;
    }

    const record: AttendanceRecord = {
      id: `att_${Date.now()}`,
      date: sessionDate,
      sessionType,
      targetId,
      targetName,
      leaderName: currentUser.name,
      leaderId: currentUser.id,
      totalMembers,
      presentCount,
      absentCount,
      justifiedCount,
      visitorCount,
      attendanceRate: rate,
      offeringAmount: Number(offeringAmount) || 0,
      meetingTopic: meetingTopic || 'Reunión Semanal y Estudio Bíblico',
      observations,
      entries,
      createdAt: new Date().toISOString()
    };

    onSaveAttendanceRecord(record);
    setShowTakeModal(false);
    if (onCloseTakingAttendance) onCloseTakingAttendance();

    // Trigger joyful celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  };

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(r => {
    if (filterType !== 'all' && r.sessionType !== filterType) return false;
    if (filterTargetId !== 'all' && r.targetId !== filterTargetId) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.targetName.toLowerCase().includes(term) ||
        r.leaderName.toLowerCase().includes(term) ||
        (r.meetingTopic && r.meetingTopic.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ClipboardCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Seguimiento de Asistencia Semanal
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Registra y audita la asistencia de los 5 ministerios (Hombres de Verdad, Mujeres Sabias, Vida Estudiantil, Profesionales, Arca de Noé) y de los Grupos de Edificación con reportes detallados en PDF para cada líder.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => initTakeModal('ministerio', 'hombres_verdad')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tomar Asistencia Semanal</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Sesiones Registradas</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{attendanceRecords.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Efectividad Global</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">
            {attendanceRecords.length > 0 
              ? `${Math.round(attendanceRecords.reduce((s, a) => s + a.attendanceRate, 0) / attendanceRecords.length)}%` 
              : '100%'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Ofrendas Acumuladas</p>
          <p className="text-xl font-extrabold text-indigo-600 mt-1">
            ${attendanceRecords.reduce((sum, a) => sum + (a.offeringAmount || 0), 0).toLocaleString('es-CO')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Visitantes / Nuevos</p>
          <p className="text-xl font-extrabold text-amber-600 mt-1">
            {attendanceRecords.reduce((sum, a) => sum + a.visitorCount, 0)} personas
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por grupo, líder o tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${filterType === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('ministerio')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${filterType === 'ministerio' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-600'}`}
            >
              Ministerios
            </button>
            <button
              onClick={() => setFilterType('edificacion')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${filterType === 'edificacion' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600'}`}
            >
              G. Edificación
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Mostrando <b>{filteredRecords.length}</b> reportes semanales
        </div>
      </div>

      {/* Attendance Records Cards & Table */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            No se encontraron registros con los filtros seleccionados.
          </div>
        ) : (
          filteredRecords.map(record => (
            <div 
              key={record.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Left: Info */}
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      record.sessionType === 'ministerio' 
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {record.sessionType === 'ministerio' ? 'Ministerio Oficial' : 'Grupo de Edificación'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {record.date}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600">Líder: <b>{record.leaderName}</b></span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {record.targetName}
                  </h3>

                  {record.meetingTopic && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Tema: <i>"{record.meetingTopic}"</i></span>
                    </p>
                  )}

                  {record.observations && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                      Obs: {record.observations}
                    </p>
                  )}
                </div>

                {/* Right: Stats & Actions */}
                <div className="flex flex-wrap items-center gap-4 shrink-0">
                  
                  {/* Attendance Rate Pill */}
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Asistencia:</span>
                      <span className={`text-base font-extrabold ${
                        record.attendanceRate >= 80 ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {record.attendanceRate.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {record.presentCount} presentes / {record.totalMembers} miembros
                      {record.visitorCount > 0 && ` (+${record.visitorCount} visitas)`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRecordDetail(record)}
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 transition-colors"
                      title="Ver lista de miembros y asistencia"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver Lista</span>
                    </button>

                    <button
                      onClick={() => ExportService.generateWeeklyAttendancePDF(record)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Descargar reporte formal en PDF con firmas de líder y pastor"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reporte PDF</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          if (confirm('¿Deseas eliminar este registro de asistencia?')) {
                            onDeleteAttendanceRecord(record.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Taking Attendance Form */}
      {showTakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-indigo-600 text-white">
                  <ClipboardCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Toma de Asistencia Semanal
                  </h3>
                  <p className="text-xs text-slate-300">
                    CENFOL • Iglesia del Dios Altísimo
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowTakeModal(false);
                  if (onCloseTakingAttendance) onCloseTakingAttendance();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Type and Target Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Reunión
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) => {
                      const newType = e.target.value as 'ministerio' | 'edificacion';
                      const defaultTarget = newType === 'ministerio' ? ministries[0].key : edificationGroups[0].id;
                      setSessionType(newType);
                      handleTargetChange(defaultTarget, newType);
                    }}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="ministerio">Ministerio Oficial</option>
                    <option value="edificacion">Grupo de Edificación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {sessionType === 'ministerio' ? 'Ministerio' : 'Grupo de Edificación'}
                  </label>
                  <select
                    value={targetId}
                    onChange={(e) => handleTargetChange(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 font-medium"
                  >
                    {sessionType === 'ministerio' ? (
                      ministries.map(m => (
                        <option key={m.id} value={m.key}>{m.name}</option>
                      ))
                    ) : (
                      edificationGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.code} - {g.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Reunión
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Topic & Offering */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tema Impartido / Estudio Bíblico
                  </label>
                  <input
                    type="text"
                    value={meetingTopic}
                    onChange={(e) => setMeetingTopic(e.target.value)}
                    placeholder="Ej: El fruto del Espíritu en el matrimonio, Josué 24:15..."
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ofrenda Recolectada ($ COP)
                  </label>
                  <input
                    type="number"
                    value={offeringAmount}
                    onChange={(e) => setOfferingAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Batch Actions & Members Roster */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Listado de Miembros ({entries.length})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMarkAll('presente')}
                      className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded font-semibold transition-colors"
                    >
                      ✓ Todos Presentes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkAll('ausente')}
                      className="text-[11px] bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded font-semibold transition-colors"
                    >
                      ✗ Todos Ausentes
                    </button>
                  </div>
                </div>

                {entries.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3 text-center">
                    No hay miembros asignados a este grupo aún. Puedes agregar nuevos miembros en el módulo de Miembros o agregar visitantes abajo.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {entries.map(entry => (
                      <div 
                        key={entry.memberId}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {entry.memberName}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {(['presente', 'ausente', 'justificado'] as AttendanceStatus[]).map(status => {
                            const isSelected = entry.status === status;
                            let style = 'bg-white text-slate-600 border-slate-200';
                            if (isSelected) {
                              if (status === 'presente') style = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                              if (status === 'ausente') style = 'bg-rose-600 text-white border-rose-600 font-bold';
                              if (status === 'justificado') style = 'bg-amber-600 text-white border-amber-600 font-bold';
                            }

                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => updateEntryStatus(entry.memberId, status)}
                                className={`text-[10px] px-2.5 py-1 rounded-md border transition-all capitalize ${style}`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add First-Time Visitor */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                <form onSubmit={handleAddVisitor} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nombre de nuevo invitado o visitante..."
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="flex-1 text-xs p-2 border border-amber-300 rounded-lg focus:outline-none bg-white"
                  />
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-1 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Agregar Visitante</span>
                  </button>
                </form>
              </div>

              {/* Observations */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones Pastorales del Líder
                </label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Comentarios sobre la reunión, motivos de oración especiales o necesidades reportadas..."
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-600">
                Líder responsable: <b>{currentUser.name}</b>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTakeModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Guardar y Emitir Reporte
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal: View Single Record Detail */}
      {selectedRecordDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold">{selectedRecordDetail.targetName}</h3>
                <p className="text-xs text-slate-300">{selectedRecordDetail.date} • Líder: {selectedRecordDetail.leaderName}</p>
              </div>
              <button 
                onClick={() => setSelectedRecordDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-emerald-700 font-extrabold text-sm">{selectedRecordDetail.presentCount}</p>
                  <p className="text-[10px] text-emerald-800">Presentes</p>
                </div>
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-rose-700 font-extrabold text-sm">{selectedRecordDetail.absentCount}</p>
                  <p className="text-[10px] text-rose-800">Ausentes</p>
                </div>
                <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-indigo-700 font-extrabold text-sm">{selectedRecordDetail.attendanceRate.toFixed(0)}%</p>
                  <p className="text-[10px] text-indigo-800">Efectividad</p>
                </div>
              </div>

              {selectedRecordDetail.meetingTopic && (
                <div className="text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800">Tema: </span>
                  <span className="text-slate-700">{selectedRecordDetail.meetingTopic}</span>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Detalle de Asistencia:</p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {selectedRecordDetail.entries.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-800">{entry.memberName}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        entry.status === 'presente' ? 'bg-emerald-100 text-emerald-800' :
                        entry.status === 'ausente' ? 'bg-rose-100 text-rose-800' :
                        entry.status === 'justificado' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => ExportService.generateWeeklyAttendancePDF(selectedRecordDetail)}
                className="bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Descargar PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
