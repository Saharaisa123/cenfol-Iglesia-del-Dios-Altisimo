import React, { useState } from 'react';
import { 
  FileBarChart, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  GraduationCap, 
  ClipboardCheck, 
  Users,
  Award,
  Sparkles
} from 'lucide-react';
import { Member, AttendanceRecord, Ministry, EdificationGroup, TrainingLevel, User } from '../../types';
import { ExportService } from '../../services/exportService';

interface ReportsViewProps {
  currentUser: User;
  members: Member[];
  ministries: Ministry[];
  edificationGroups: EdificationGroup[];
  trainingLevels: TrainingLevel[];
  attendanceRecords: AttendanceRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentUser,
  members,
  ministries,
  edificationGroups,
  trainingLevels,
  attendanceRecords
}) => {
  const [selectedRecordForPDF, setSelectedRecordForPDF] = useState<string>(attendanceRecords[0]?.id || '');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleDownloadFullExcel = () => {
    ExportService.exportFullChurchDatabaseToExcel(
      members,
      ministries,
      edificationGroups,
      trainingLevels,
      attendanceRecords
    );
    triggerSuccess('¡Libro de Excel completo (.xlsx) descargado exitosamente!');
  };

  const handleDownloadPastoralPDF = () => {
    ExportService.generatePastorConsolidatedPDF(
      members,
      ministries,
      edificationGroups,
      attendanceRecords,
      currentUser.name
    );
    triggerSuccess('¡Informe pastoral consolidado (.pdf) generado con éxito!');
  };

  const handleDownloadTrainingPDF = () => {
    ExportService.generateTrainingReportPDF(trainingLevels, members);
    triggerSuccess('¡Reporte de niveles de capacitación (.pdf) generado con éxito!');
  };

  const handleDownloadSpecificAttendancePDF = () => {
    const record = attendanceRecords.find(r => r.id === selectedRecordForPDF);
    if (record) {
      ExportService.generateWeeklyAttendancePDF(record);
      triggerSuccess(`¡Reporte de asistencia semanal de ${record.targetName} generado!`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-900 text-amber-400">
              <FileBarChart className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Centro de Reportes Oficiales & Estadísticas
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Exporta información completa de los ministerios, grupos de edificación, niveles de capacitación y asistencia semanal en formatos Excel (.xlsx) y PDF imprimibles.
          </p>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Admin Highlight: Full Database Download */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Módulo Exclusivo de Administración
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Descargar Toda la Información de los Ministerios y Niveles de Capacitación
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Genera un libro consolidado de Microsoft Excel (.xlsx) con 5 hojas sincronizadas: Base de datos de Miembros, Fichas de los 5 Ministerios, Grupos de Edificación, Escuela de Liderazgo (Niveles 1 al 5) y Bitácora de Asistencia Semanal.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleDownloadFullExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Descargar Base Completa (Excel .xlsx)</span>
            </button>
            <button
              onClick={handleDownloadPastoralPDF}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Informe Pastoral Oficial (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Specialized PDF Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Report 1: Pastoral Consolidado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Informe Pastoral Consolidado
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Resumen ejecutivo con estadísticas generales de membresía, cuadro comparativo de los 5 ministerios y firmas oficiales de control.
            </p>
          </div>

          <button
            onClick={handleDownloadPastoralPDF}
            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Descargar en PDF</span>
          </button>
        </div>

        {/* Report 2: Niveles de Capacitación */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Reporte de Capacitación y Discipulado
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Listado oficial de estudiantes por cada nivel (1 al 5), notas de aprobación, avance porcentual y candidatos a graduación.
            </p>
          </div>

          <button
            onClick={handleDownloadTrainingPDF}
            className="mt-4 w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Descargar en PDF</span>
          </button>
        </div>

        {/* Report 3: Asistencia Semanal por Sesión */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Acta de Asistencia Semanal con Firmas
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Genera el reporte individual de una reunión para la firma del líder y el visto bueno del pastor.
            </p>

            <select
              value={selectedRecordForPDF}
              onChange={(e) => setSelectedRecordForPDF(e.target.value)}
              className="w-full text-xs p-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 font-medium"
            >
              {attendanceRecords.map(r => (
                <option key={r.id} value={r.id}>
                  {r.date} • {r.targetName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadSpecificAttendancePDF}
            className="mt-4 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Descargar Acta Semanal (PDF)</span>
          </button>
        </div>

      </div>

      {/* Analytics & Metrics Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <span>Estadísticas & Métricas de Crecimiento</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Distribution by Ministry */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-700 uppercase">
              Distribución de Miembros por Ministerio:
            </p>
            {ministries.map(min => {
              const count = members.filter(m => m.ministryId === min.key).length;
              const percent = members.length > 0 ? Math.round((count / members.length) * 100) : 0;

              return (
                <div key={min.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-800">{min.name}</span>
                    <span className="text-slate-500 font-bold">{count} miembros ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Capacitacion Distribution */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-700 uppercase">
              Distribución por Nivel de Capacitación:
            </p>
            {trainingLevels.map(lvl => {
              const count = members.filter(m => m.capacitacionLevel === lvl.levelNumber).length;
              const percent = members.length > 0 ? Math.round((count / members.length) * 100) : 0;

              return (
                <div key={lvl.levelNumber} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-800">Nivel {lvl.levelNumber}: {lvl.title.split(':')[1]?.trim()}</span>
                    <span className="text-purple-700 font-bold">{count} alumnos</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full transition-all"
                      style={{ width: `${percent * 1.5}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
};
