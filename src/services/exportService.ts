import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Member, AttendanceRecord, Ministry, EdificationGroup, TrainingLevel } from '../types';

// Extend jsPDF interface for autoTable plugin
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

export class ExportService {
  /**
   * Generates a multi-sheet complete Excel (.xlsx) workbook for the Administrator
   * containing all church members, ministries, edification groups, training levels, and attendance.
   */
  static exportFullChurchDatabaseToExcel(
    members: Member[],
    ministries: Ministry[],
    edificationGroups: EdificationGroup[],
    trainingLevels: TrainingLevel[],
    attendance: AttendanceRecord[]
  ): void {
    const workbook = XLSX.utils.book_new();

    // 1. Members Sheet
    const membersData = members.map(m => {
      const min = ministries.find(min => min.key === m.ministryId);
      const ge = edificationGroups.find(g => g.id === m.edificationGroupId);
      return {
        'Cédula / Documento': m.documentId,
        'Nombres y Apellidos': m.fullName,
        'Teléfono / WhatsApp': m.phone,
        'Correo Electrónico': m.email,
        'Ministerio': min ? min.name : m.ministryId,
        'Grupo de Edificación': ge ? `${ge.code} - ${ge.name}` : 'Sin asignar',
        'Nivel Capacitación': `Nivel ${m.capacitacionLevel}`,
        'Estado Capacitación': m.capacitacionStatus.toUpperCase(),
        'Avance %': `${m.capacitacionProgressPercent}%`,
        'Estado Membresía': m.status.toUpperCase(),
        'Fecha Nacimiento': m.birthDate,
        'Fecha Bautismo': m.baptismDate || 'No registrado',
        'Fecha Ingreso': m.joinedDate,
        'Dirección': m.address,
        'Barrio': m.neighborhood,
        'Contacto Emergencia': m.emergencyContact || 'N/A',
        'Tel. Emergencia': m.emergencyPhone || 'N/A',
        'Notas Pastorales': m.notes || ''
      };
    });
    const wsMembers = XLSX.utils.json_to_sheet(membersData);
    XLSX.utils.book_append_sheet(workbook, wsMembers, 'Miembros');

    // 2. Ministries Sheet
    const ministriesData = ministries.map(m => {
      const membersInMinistry = members.filter(mem => mem.ministryId === m.key).length;
      return {
        'Código': m.key,
        'Nombre del Ministerio': m.name,
        'Líder Encargado': m.leaderName,
        'Teléfono Líder': m.leaderPhone,
        'Correo Líder': m.leaderEmail,
        'Día de Reunión': m.meetingDay,
        'Horario y Frecuencia': m.meetingSchedule,
        'Población Objetivo': m.targetAudience,
        'Miembros Activos Registrados': membersInMinistry,
        'Descripción': m.description
      };
    });
    const wsMinistries = XLSX.utils.json_to_sheet(ministriesData);
    XLSX.utils.book_append_sheet(workbook, wsMinistries, 'Ministerios');

    // 3. Edification Groups Sheet
    const geData = edificationGroups.map(g => {
      const disciplesCount = members.filter(m => m.edificationGroupId === g.id).length;
      return {
        'Código Célula': g.code,
        'Nombre del Grupo': g.name,
        'Líder Responsable': g.leaderName,
        'Teléfono Líder': g.leaderPhone,
        'Anfitrión del Hogar': g.hostName,
        'Dirección del Grupo': g.address,
        'Barrio': g.neighborhood,
        'Zona Pastoral': g.targetZone,
        'Día de Reunión': g.meetingDay,
        'Hora': g.meetingTime,
        'Miembros Asignados': disciplesCount
      };
    });
    const wsGE = XLSX.utils.json_to_sheet(geData);
    XLSX.utils.book_append_sheet(workbook, wsGE, 'Grupos de Edificación');

    // 4. Training Levels Sheet
    const trainingData = trainingLevels.map(t => {
      const enrolled = members.filter(m => m.capacitacionLevel === t.levelNumber && m.capacitacionStatus === 'en_curso').length;
      const graduated = members.filter(m => m.capacitacionLevel === t.levelNumber && (m.capacitacionStatus === 'aprobado' || m.capacitacionStatus === 'graduado')).length;
      return {
        'Nivel': t.levelNumber,
        'Título': t.title,
        'Subtítulo': t.subtitle,
        'Duración (Semanas)': t.durationWeeks,
        'Instructor': t.instructorName,
        'Prerrequisito': t.prerequisite || 'Ninguno',
        'Estudiantes en Curso': enrolled,
        'Graduados / Aprobados': graduated,
        'Temas Principales': t.topics.join('; ')
      };
    });
    const wsTraining = XLSX.utils.json_to_sheet(trainingData);
    XLSX.utils.book_append_sheet(workbook, wsTraining, 'Niveles Capacitación');

    // 5. Attendance History Sheet
    const attendanceData = attendance.map(a => ({
      'Fecha': a.date,
      'Tipo de Reunión': a.sessionType.toUpperCase(),
      'Ministerio / Grupo': a.targetName,
      'Líder que Registró': a.leaderName,
      'Total Miembros': a.totalMembers,
      'Presentes': a.presentCount,
      'Ausentes': a.absentCount,
      'Justificados': a.justifiedCount,
      'Nuevos Visitantes': a.visitorCount,
      '% Asistencia': `${a.attendanceRate.toFixed(1)}%`,
      'Ofrenda Recolectada ($)': a.offeringAmount || 0,
      'Tema Impartido': a.meetingTopic || 'N/A',
      'Observaciones': a.observations || ''
    }));
    const wsAttendance = XLSX.utils.json_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(workbook, wsAttendance, 'Historial Asistencia');

    const fileName = `CENFOL_Base_Datos_General_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Exports single table of members to Excel
   */
  static exportMembersToExcel(members: Member[], ministries: Ministry[], edificationGroups: EdificationGroup[], filenameSuffix = 'Miembros'): void {
    const data = members.map(m => {
      const min = ministries.find(min => min.key === m.ministryId);
      const ge = edificationGroups.find(g => g.id === m.edificationGroupId);
      return {
        'Cédula': m.documentId,
        'Nombre': m.fullName,
        'Teléfono': m.phone,
        'Correo': m.email,
        'Ministerio': min?.name || m.ministryId,
        'Grupo Edificación': ge?.name || 'N/A',
        'Nivel Capacitación': `Nivel ${m.capacitacionLevel} (${m.capacitacionStatus})`,
        'Avance': `${m.capacitacionProgressPercent}%`,
        'Estado': m.status,
        'Cumpleaños': m.birthDate,
        'Bautismo': m.baptismDate || 'No'
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Miembros');
    XLSX.writeFile(wb, `CENFOL_${filenameSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Generates a formal consolidated PDF pastoral report
   */
  static generatePastorConsolidatedPDF(
    members: Member[],
    ministries: Ministry[],
    edificationGroups: EdificationGroup[],
    attendance: AttendanceRecord[],
    userName: string
  ): void {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header Banner
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CENFOL - IGLESIA DEL DIOS ALTÍSIMO', 14, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('SISTEMA INTEGRAL DE GESTIÓN PASTORAL Y MINISTERIAL', 14, 18);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CO', { dateStyle: 'full' })}`, 14, 23);

    doc.text(`Generado por: ${userName}`, pageWidth - 14, 18, { align: 'right' });
    doc.text('Confidencial / Uso Interno', pageWidth - 14, 23, { align: 'right' });

    // Document Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME GENERAL CONSOLIDADO DE LA IGLESIA', 14, 38);

    // Summary Statistics Cards (Simulated in PDF)
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'activo').length;
    const inFollowUp = members.filter(m => m.status === 'en_seguimiento').length;
    const totalGE = edificationGroups.length;
    const avgAttendance = attendance.length > 0 
      ? Math.round(attendance.reduce((sum, a) => sum + a.attendanceRate, 0) / attendance.length) 
      : 0;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 43, pageWidth - 28, 22, 3, 3, 'F');

    doc.setTextColor(51, 65, 85);
    doc.text(`Total Miembros: ${totalMembers} (${activeMembers} Activos | ${inFollowUp} En Seguimiento)`, 20, 52);
    doc.text(`Grupos de Edificación: ${totalGE} Células activas  |  Promedio Asistencia General: ${avgAttendance}%`, 20, 59);

    // Section 1: Distribution by Ministry
    let currentY = 72;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. Resumen por Ministerios', 14, currentY);

    const ministryRows = ministries.map(m => {
      const count = members.filter(mem => mem.ministryId === m.key).length;
      const att = attendance.filter(a => a.targetId === m.key);
      const avgRate = att.length > 0 
        ? `${Math.round(att.reduce((s, a) => s + a.attendanceRate, 0) / att.length)}%` 
        : '90%';
      return [m.name, m.leaderName, m.meetingDay, count.toString(), avgRate];
    });

    (doc as any).autoTable({
      startY: currentY + 4,
      head: [['Ministerio', 'Líder Encargado', 'Día Reunión', 'Miembros', 'Asistencia Prom.']],
      body: ministryRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2.5 },
      margin: { left: 14, right: 14 },
    });

    // Section 2: Grupos de Edificación
    currentY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Estado de Grupos de Edificación', 14, currentY);

    const geRows = edificationGroups.map(g => {
      const disciples = members.filter(m => m.edificationGroupId === g.id).length;
      return [g.code, g.name, g.leaderName, g.neighborhood, `${g.meetingDay} ${g.meetingTime}`, disciples.toString()];
    });

    (doc as any).autoTable({
      startY: currentY + 4,
      head: [['Código', 'Grupo de Edificación', 'Líder', 'Barrio / Sector', 'Horario', 'Discípulos']],
      body: geRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      styles: { fontSize: 8.5, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    });

    // Signature Area
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    if (finalY < 260) {
      doc.setDrawColor(148, 163, 184);
      doc.line(25, finalY, 85, finalY);
      doc.line(pageWidth - 85, finalY, pageWidth - 25, finalY);

      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.text('Pastor Principal David Morales', 55, finalY + 5, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text('CENFOL Iglesia del Dios Altísimo', 55, finalY + 9, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.text(userName, pageWidth - 55, finalY + 5, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text('Líder Responsable de Reporte', pageWidth - 55, finalY + 9, { align: 'center' });
    }

    doc.save(`CENFOL_Reporte_Pastoral_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Generates a detailed weekly attendance PDF report for leaders
   */
  static generateWeeklyAttendancePDF(record: AttendanceRecord, churchName = 'CENFOL - IGLESIA DEL DIOS ALTÍSIMO'): void {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header Banner
    doc.setFillColor(15, 23, 42); // Navy slate
    doc.rect(0, 0, pageWidth, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(churchName, 14, 11);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('REPORTE OFICIAL DE ASISTENCIA SEMANAL', 14, 17);
    doc.text(`Fecha de Reunión: ${record.date}`, pageWidth - 14, 14, { align: 'right' });
    doc.text(`ID Registro: #${record.id}`, pageWidth - 14, 20, { align: 'right' });

    // Details box
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 32, pageWidth - 28, 28, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.text(`Grupo / Ministerio:`, 20, 39);
    doc.setFont('helvetica', 'normal');
    doc.text(record.targetName, 65, 39);

    doc.setFont('helvetica', 'bold');
    doc.text(`Líder a Cargo:`, 20, 46);
    doc.setFont('helvetica', 'normal');
    doc.text(record.leaderName, 65, 46);

    doc.setFont('helvetica', 'bold');
    doc.text(`Tema Impartido:`, 20, 53);
    doc.setFont('helvetica', 'normal');
    doc.text(record.meetingTopic || 'No registrado', 65, 53);

    // Attendance stats row
    doc.text(`Presentes: ${record.presentCount}`, pageWidth - 65, 39);
    doc.text(`Ausentes: ${record.absentCount}`, pageWidth - 65, 46);
    doc.text(`Efectividad: ${record.attendanceRate.toFixed(1)}%`, pageWidth - 65, 53);

    // Entries Table
    const tableRows = record.entries.map((entry, index) => [
      (index + 1).toString(),
      entry.memberName,
      entry.status.toUpperCase(),
      entry.note || '-'
    ]);

    (doc as any).autoTable({
      startY: 66,
      head: [['#', 'Miembro / Discípulo', 'Estado Asistencia', 'Observaciones / Motivo']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2.5 },
      margin: { left: 14, right: 14 }
    });

    let lastY = (doc as any).lastAutoTable.finalY + 10;

    // Leader remarks
    if (record.observations) {
      doc.setFont('helvetica', 'bold');
      doc.text('Observaciones del Líder:', 14, lastY);
      doc.setFont('helvetica', 'normal');
      doc.text(record.observations, 14, lastY + 6, { maxWidth: pageWidth - 28 });
      lastY += 20;
    }

    // Signatures
    if (lastY < 250) {
      doc.setDrawColor(148, 163, 184);
      doc.line(25, lastY + 25, 85, lastY + 25);
      doc.line(pageWidth - 85, lastY + 25, pageWidth - 25, lastY + 25);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Firma del Líder de Grupo', 55, lastY + 30, { align: 'center' });
      doc.text('Visto Bueno Pastoral / Coordinación', pageWidth - 55, lastY + 30, { align: 'center' });
    }

    doc.save(`CENFOL_Asistencia_${record.targetName.replace(/\s+/g, '_')}_${record.date}.pdf`);
  }

  /**
   * Generates Training / Discipulado Level Progress PDF Report
   */
  static generateTrainingReportPDF(trainingLevels: TrainingLevel[], members: Member[]): void {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Banner
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CENFOL - IGLESIA DEL DIOS ALTÍSIMO', 14, 11);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('REPORTE OFICIAL DE NIVELES DE CAPACITACIÓN Y DISCIPULADO', 14, 17);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, pageWidth - 14, 14, { align: 'right' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Cuadro de Honor y Estudiantes por Nivel', 14, 36);

    const rows = members.map(m => {
      const levelObj = trainingLevels.find(t => t.levelNumber === m.capacitacionLevel);
      return [
        m.documentId,
        m.fullName,
        levelObj ? `Nivel ${m.capacitacionLevel} - ${levelObj.title.split(':')[1]?.trim() || ''}` : `Nivel ${m.capacitacionLevel}`,
        m.capacitacionStatus.toUpperCase(),
        `${m.capacitacionProgressPercent}%`,
        levelObj?.instructorName || 'Pastor David Morales'
      ];
    });

    (doc as any).autoTable({
      startY: 42,
      head: [['Documento', 'Estudiante', 'Nivel Cursando', 'Estado', 'Progreso', 'Docente / Pastor']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2 },
      margin: { left: 14, right: 14 }
    });

    doc.save(`CENFOL_Niveles_Capacitacion_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
