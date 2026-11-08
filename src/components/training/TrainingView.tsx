import React, { useState } from 'react';
import { 
  GraduationCap, 
  Award, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Download,
  Search,
  Sparkles,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TrainingLevel, Member, TrainingLevelNumber } from '../../types';
import { ExportService } from '../../services/exportService';

interface TrainingViewProps {
  trainingLevels: TrainingLevel[];
  members: Member[];
  onUpdateMemberProgress: (memberId: string, level: TrainingLevelNumber, status: any, progress: number) => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  trainingLevels,
  members,
  onUpdateMemberProgress
}) => {
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<TrainingLevelNumber>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<Member | null>(null);

  const currentLevel = trainingLevels.find(t => t.levelNumber === selectedLevelNumber) || trainingLevels[0];
  
  // Members enrolled in this level
  const studentsInLevel = members.filter(m => {
    if (m.capacitacionLevel !== selectedLevelNumber) return false;
    if (searchTerm) {
      return (
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.documentId.includes(searchTerm)
      );
    }
    return true;
  });

  const handlePromoteStudent = (student: Member) => {
    const nextLevel = Math.min(student.capacitacionLevel + 1, 5) as TrainingLevelNumber;
    const isMax = student.capacitacionLevel === 5;
    
    onUpdateMemberProgress(
      student.id,
      isMax ? 5 : nextLevel,
      isMax ? 'graduado' : 'en_curso',
      isMax ? 100 : 25
    );

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch (e) {}
  };

  const handleExportPDF = () => {
    ExportService.generateTrainingReportPDF(trainingLevels, members);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Niveles de Capacitación y Escuela de Liderazgo
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Ruta formativa de discipulado de 5 niveles para los creyentes de la Iglesia del Dios Altísimo CENFOL, desde fundamentos hasta maestría pastoral.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            title="Descargar reporte oficial en PDF"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Levels Step Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {trainingLevels.map(lvl => {
          const isSelected = lvl.levelNumber === selectedLevelNumber;
          const count = members.filter(m => m.capacitacionLevel === lvl.levelNumber).length;

          return (
            <button
              key={lvl.levelNumber}
              onClick={() => setSelectedLevelNumber(lvl.levelNumber)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-purple-900 text-white border-purple-950 shadow-md ring-2 ring-purple-600/30'
                  : 'bg-white hover:bg-purple-50/50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800'
                }`}>
                  Nivel {lvl.levelNumber}
                </span>
                <span className={`text-[10px] font-semibold ${isSelected ? 'text-purple-300' : 'text-slate-400'}`}>
                  {count} alumnos
                </span>
              </div>
              <h3 className="text-xs font-bold leading-snug line-clamp-2 mt-1">
                {lvl.title.split(':')[1]?.trim() || lvl.title}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Current Level Details & Syllabus */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
              Currículo Oficial CENFOL
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">
              {currentLevel.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentLevel.subtitle} • Docente a cargo: <b>{currentLevel.instructorName}</b>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs text-slate-600">
            <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
              <Clock className="w-4 h-4 text-purple-600" />
              {currentLevel.durationWeeks} semanas
            </span>
            {currentLevel.prerequisite && (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold">
                Prerrequisito: {currentLevel.prerequisite}
              </span>
            )}
          </div>
        </div>

        {/* Topics List */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Módulos y Temas de Enseñanza:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {currentLevel.topics.map((topic, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-slate-800 font-medium">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Students Table for this Level */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Estudiantes en este Nivel ({studentsInLevel.length})</span>
            </h4>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Estudiante</th>
                  <th className="px-4 py-2.5">Cédula</th>
                  <th className="px-4 py-2.5">Avance del Nivel</th>
                  <th className="px-4 py-2.5 text-center">Estado</th>
                  <th className="px-4 py-2.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsInLevel.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                      No hay estudiantes cursando este nivel actualmente.
                    </td>
                  </tr>
                ) : (
                  studentsInLevel.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {student.fullName}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {student.documentId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-36">
                          <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                            <span className="font-semibold">{student.capacitacionProgressPercent}%</span>
                            <span className="text-slate-400">Completado</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-600 h-full rounded-full transition-all"
                              style={{ width: `${student.capacitacionProgressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          student.capacitacionStatus === 'graduado' ? 'bg-amber-100 text-amber-800' :
                          student.capacitacionStatus === 'aprobado' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {student.capacitacionStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Certificate Preview */}
                          {(student.capacitacionStatus === 'aprobado' || student.capacitacionStatus === 'graduado' || student.capacitacionProgressPercent >= 80) && (
                            <button
                              onClick={() => setSelectedStudentForCert(student)}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                              title="Ver Certificado de Graduación"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                              <span>Certificado</span>
                            </button>
                          )}

                          {/* Promote to Next Level */}
                          {student.capacitacionLevel < 5 && (
                            <button
                              onClick={() => handlePromoteStudent(student)}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                              title="Promover al siguiente nivel de capacitación"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Aprobar Nivel</span>
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal: Graduation Certificate Preview */}
      {selectedStudentForCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-200 max-w-xl w-full p-8 text-center relative overflow-hidden">
            
            <button 
              onClick={() => setSelectedStudentForCert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header with Logo */}
            <div className="flex flex-col items-center">
              <img 
                src="/assets/aistudio/LOGO_CENFOL_1a3cdd0f.jpg" 
                alt="CENFOL" 
                className="w-16 h-16 object-contain mb-2"
              />
              <p className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">CENFOL • IGLESIA DEL DIOS ALTÍSIMO</p>
              <h2 className="text-xl font-serif font-bold text-slate-900 mt-1">CERTIFICADO DE RECONOCIMIENTO</h2>
              <div className="w-24 h-0.5 bg-amber-500 mx-auto my-2" />
            </div>

            <p className="text-xs text-slate-600 mt-2">
              Hace constar con gozo en el Señor que el discípulo:
            </p>

            <h3 className="text-2xl font-serif font-extrabold text-indigo-900 my-2">
              {selectedStudentForCert.fullName}
            </h3>

            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Ha cursado y aprobado satisfactoriamente los requisitos académicos y espirituales correspondientes a:
            </p>

            <div className="my-3 p-3 bg-purple-50 rounded-xl border border-purple-100 max-w-md mx-auto">
              <p className="text-sm font-extrabold text-purple-900">
                {trainingLevels.find(t => t.levelNumber === selectedStudentForCert.capacitacionLevel)?.title}
              </p>
              <p className="text-[11px] text-purple-700">
                Escuela de Liderazgo y Discipulado Bíblico CENFOL
              </p>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              "Procura con diligencia presentarte a Dios aprobado, como obrero que no tiene de qué avergonzarse, que usa bien la palabra de verdad." — 2 Timoteo 2:15
            </p>

            {/* Signature lines */}
            <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-slate-200 text-xs">
              <div>
                <p className="font-bold text-slate-900">Pastor David Morales</p>
                <p className="text-[10px] text-slate-500">Pastor Principal CENFOL</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Dra. Claudia Patricia Rivas</p>
                <p className="text-[10px] text-slate-500">Dirección de Educación Eclesial</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Imprimir / Guardar Certificado</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
