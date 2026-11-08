export type UserRole = 
  | 'admin' 
  | 'lider_ministerio' 
  | 'lider_edificacion' 
  | 'miembro';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  assignedMinistryId?: string; // If lider_ministerio
  assignedGroupId?: string;    // If lider_edificacion
  memberProfileId?: string;    // If linked to a member profile
}

export type MinistryKey = 
  | 'hombres_verdad' 
  | 'mujeres_sabias' 
  | 'vida_estudiantil' 
  | 'profesionales' 
  | 'arca_noe';

export interface Ministry {
  id: string;
  key: MinistryKey;
  name: string;
  description: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  targetAudience: string;
  meetingSchedule: string;
  meetingDay: string;
  colorScheme: {
    primary: string;
    light: string;
    border: string;
    text: string;
  };
}

export interface EdificationGroup {
  id: string;
  name: string;
  code: string;
  leaderId: string;
  leaderName: string;
  leaderPhone: string;
  hostName: string;
  address: string;
  neighborhood: string;
  meetingDay: string;
  meetingTime: string;
  targetMinistry?: MinistryKey;
  targetZone: string;
  activeMembersCount?: number;
}

export type TrainingLevelNumber = 1 | 2 | 3 | 4 | 5;

export interface TrainingLevel {
  levelNumber: TrainingLevelNumber;
  title: string;
  subtitle: string;
  durationWeeks: number;
  objective: string;
  instructorName: string;
  prerequisite?: string;
  topics: string[];
}

export type MemberStatus = 'activo' | 'en_seguimiento' | 'inactivo' | 'nuevo';
export type CapacitacionStatus = 'no_iniciado' | 'en_curso' | 'aprobado' | 'graduado';

export interface Member {
  id: string;
  documentId: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'M' | 'F';
  civilStatus: 'soltero' | 'casado' | 'union_libre' | 'viudo';
  address: string;
  neighborhood: string;
  ministryId: MinistryKey;
  edificationGroupId: string; // references EdificationGroup.id
  capacitacionLevel: TrainingLevelNumber;
  capacitacionStatus: CapacitacionStatus;
  capacitacionProgressPercent: number;
  status: MemberStatus;
  baptismDate?: string;
  joinedDate: string;
  notes?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  avatarUrl?: string;
}

export type AttendanceStatus = 'presente' | 'ausente' | 'justificado' | 'visitante';

export interface AttendanceEntry {
  memberId: string;
  memberName: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  sessionType: 'ministerio' | 'edificacion' | 'culto_dominical';
  targetId: string; // MinistryKey or EdificationGroupId
  targetName: string;
  leaderName: string;
  leaderId: string;
  totalMembers: number;
  presentCount: number;
  absentCount: number;
  justifiedCount: number;
  visitorCount: number;
  attendanceRate: number; // percentage 0-100
  offeringAmount?: number;
  meetingTopic?: string;
  observations?: string;
  entries: AttendanceEntry[];
  createdAt: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'ministerio' | 'capacitacion' | 'oracion';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  targetMinistry?: MinistryKey | 'todos';
  speaker?: string;
  isImportantReminder: boolean;
}

export interface NotificationLog {
  id: string;
  title: string;
  message: string;
  type: 'cumpleanos' | 'reunion_semanal' | 'evento' | 'seguimiento_ausencia' | 'capacitacion';
  recipientCount: number;
  recipientsSummary: string;
  sentAt: string;
  sentBy: string;
  channel: 'whatsapp' | 'sms' | 'email' | 'in_app';
}
