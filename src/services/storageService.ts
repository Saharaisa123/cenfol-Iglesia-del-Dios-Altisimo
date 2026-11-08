import { Member, AttendanceRecord, ChurchEvent, NotificationLog, User, Ministry, EdificationGroup, TrainingLevel } from '../types';
import { 
  INITIAL_USERS, 
  MINISTRIES_DATA, 
  EDIFICATION_GROUPS_DATA, 
  TRAINING_LEVELS_DATA, 
  INITIAL_MEMBERS, 
  INITIAL_ATTENDANCE_RECORDS, 
  INITIAL_EVENTS, 
  INITIAL_NOTIFICATION_LOGS 
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'cenfol_users',
  CURRENT_USER: 'cenfol_current_user',
  MINISTRIES: 'cenfol_ministries',
  EDIFICATION_GROUPS: 'cenfol_edification_groups',
  TRAINING_LEVELS: 'cenfol_training_levels',
  MEMBERS: 'cenfol_members',
  ATTENDANCE: 'cenfol_attendance',
  EVENTS: 'cenfol_events',
  NOTIFICATIONS: 'cenfol_notifications'
};

export class StorageService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data);
    } catch (e) {
      console.warn(`Error reading ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
    }
  }

  // --- Users & Auth ---
  static getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getCurrentUser(): User {
    return this.getItem<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  static setCurrentUser(user: User): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  static saveUser(user: User): void {
    const list = this.getUsers();
    const index = list.findIndex(u => u.id === user.id);
    if (index >= 0) {
      list[index] = user;
    } else {
      list.push(user);
    }
    this.setItem(STORAGE_KEYS.USERS, list);

    // If current user was updated, also update current user
    const current = this.getCurrentUser();
    if (current.id === user.id) {
      this.setCurrentUser(user);
    }
  }

  static updateUserPassword(userId: string, newPass: string): void {
    const list = this.getUsers();
    const found = list.find(u => u.id === userId);
    if (found) {
      found.password = newPass;
      this.setItem(STORAGE_KEYS.USERS, list);
      const current = this.getCurrentUser();
      if (current.id === userId) {
        current.password = newPass;
        this.setCurrentUser(current);
      }
    }
  }

  // --- Ministries ---
  static getMinistries(): Ministry[] {
    return this.getItem<Ministry[]>(STORAGE_KEYS.MINISTRIES, MINISTRIES_DATA);
  }

  static updateMinistry(ministry: Ministry): void {
    const list = this.getMinistries().map(m => m.id === ministry.id ? ministry : m);
    this.setItem(STORAGE_KEYS.MINISTRIES, list);
  }

  // --- Edification Groups ---
  static getEdificationGroups(): EdificationGroup[] {
    return this.getItem<EdificationGroup[]>(STORAGE_KEYS.EDIFICATION_GROUPS, EDIFICATION_GROUPS_DATA);
  }

  static saveEdificationGroup(group: EdificationGroup): void {
    const list = this.getEdificationGroups();
    const index = list.findIndex(g => g.id === group.id);
    if (index >= 0) {
      list[index] = group;
    } else {
      list.push(group);
    }
    this.setItem(STORAGE_KEYS.EDIFICATION_GROUPS, list);
  }

  static deleteEdificationGroup(id: string): void {
    const list = this.getEdificationGroups().filter(g => g.id !== id);
    this.setItem(STORAGE_KEYS.EDIFICATION_GROUPS, list);
  }

  // --- Training Levels ---
  static getTrainingLevels(): TrainingLevel[] {
    return this.getItem<TrainingLevel[]>(STORAGE_KEYS.TRAINING_LEVELS, TRAINING_LEVELS_DATA);
  }

  // --- Members ---
  static getMembers(): Member[] {
    return this.getItem<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  }

  static saveMember(member: Member): void {
    const list = this.getMembers();
    const index = list.findIndex(m => m.id === member.id);
    if (index >= 0) {
      list[index] = member;
    } else {
      list.push(member);
    }
    this.setItem(STORAGE_KEYS.MEMBERS, list);
  }

  static deleteMember(id: string): void {
    const list = this.getMembers().filter(m => m.id !== id);
    this.setItem(STORAGE_KEYS.MEMBERS, list);
  }

  // --- Attendance ---
  static getAttendanceRecords(): AttendanceRecord[] {
    return this.getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE_RECORDS);
  }

  static saveAttendanceRecord(record: AttendanceRecord): void {
    const list = this.getAttendanceRecords();
    const index = list.findIndex(r => r.id === record.id);
    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);
    }
    this.setItem(STORAGE_KEYS.ATTENDANCE, list);
  }

  static deleteAttendanceRecord(id: string): void {
    const list = this.getAttendanceRecords().filter(r => r.id !== id);
    this.setItem(STORAGE_KEYS.ATTENDANCE, list);
  }

  // --- Events ---
  static getEvents(): ChurchEvent[] {
    return this.getItem<ChurchEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }

  static saveEvent(event: ChurchEvent): void {
    const list = this.getEvents();
    const index = list.findIndex(e => e.id === event.id);
    if (index >= 0) {
      list[index] = event;
    } else {
      list.push(event);
    }
    this.setItem(STORAGE_KEYS.EVENTS, list);
  }

  static deleteEvent(id: string): void {
    const list = this.getEvents().filter(e => e.id !== id);
    this.setItem(STORAGE_KEYS.EVENTS, list);
  }

  // --- Notifications ---
  static getNotificationLogs(): NotificationLog[] {
    return this.getItem<NotificationLog[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATION_LOGS);
  }

  static addNotificationLog(log: NotificationLog): void {
    const list = this.getNotificationLogs();
    list.unshift(log);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // --- Reset to seed ---
  static resetAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
}
