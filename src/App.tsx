/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import { ExportService } from './services/exportService';
import { 
  User, 
  Member, 
  AttendanceRecord, 
  Ministry, 
  EdificationGroup, 
  TrainingLevel, 
  ChurchEvent, 
  NotificationLog, 
  TrainingLevelNumber 
} from './types';

// Layout & Auth
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginModal } from './components/auth/LoginModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { MembersView } from './components/members/MembersView';
import { MinistriesView } from './components/ministries/MinistriesView';
import { EdificationGroupsView } from './components/edification/EdificationGroupsView';
import { TrainingView } from './components/training/TrainingView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { EventsView } from './components/events/EventsView';
import { ReportsView } from './components/reports/ReportsView';
import { PasswordAndUsersModal } from './components/users/PasswordAndUsersModal';

export default function App() {
  // Global persistent states
  const [availableUsers, setAvailableUsers] = useState<User[]>(() => StorageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [ministries, setMinistries] = useState<Ministry[]>(() => StorageService.getMinistries());
  const [edificationGroups, setEdificationGroups] = useState<EdificationGroup[]>(() => StorageService.getEdificationGroups());
  const [trainingLevels, setTrainingLevels] = useState<TrainingLevel[]>(() => StorageService.getTrainingLevels());
  const [members, setMembers] = useState<Member[]>(() => StorageService.getMembers());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => StorageService.getAttendanceRecords());
  const [events, setEvents] = useState<ChurchEvent[]>(() => StorageService.getEvents());
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => StorageService.getNotificationLogs());

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals & Action Shortcuts
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTakingAttendanceOpen, setIsTakingAttendanceOpen] = useState(false);
  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordModalInitialTab, setPasswordModalInitialTab] = useState<'my_password' | 'manage_all'>('my_password');

  // Sync current user change to storage
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsLoginModalOpen(true);
  };

  // --- Handlers for User Credentials & Passwords ---
  const handleUpdateUserPassword = (userId: string, newPassword: string) => {
    StorageService.updateUserPassword(userId, newPassword);
    setAvailableUsers(StorageService.getUsers());
    setCurrentUser(StorageService.getCurrentUser());
  };

  const handleSaveUser = (user: User) => {
    StorageService.saveUser(user);
    setAvailableUsers(StorageService.getUsers());
    setCurrentUser(StorageService.getCurrentUser());
  };

  // --- Handlers for Ministry & Leader Editing ---
  const handleUpdateMinistry = (updatedMinistry: Ministry) => {
    StorageService.updateMinistry(updatedMinistry);
    setMinistries(StorageService.getMinistries());

    // If an existing leader user is assigned to this ministry, sync their display name
    const currentUsers = StorageService.getUsers();
    const userToUpdate = currentUsers.find(u => u.assignedMinistryId === updatedMinistry.key);
    if (userToUpdate && userToUpdate.name !== updatedMinistry.leaderName) {
      userToUpdate.name = updatedMinistry.leaderName;
      StorageService.saveUser(userToUpdate);
      setAvailableUsers(StorageService.getUsers());
      const active = StorageService.getCurrentUser();
      if (active.id === userToUpdate.id) {
        setCurrentUser(userToUpdate);
      }
    }
  };

  // --- Handlers for Member CRUD ---
  const handleSaveMember = (member: Member) => {
    StorageService.saveMember(member);
    setMembers(StorageService.getMembers());
  };

  const handleDeleteMember = (id: string) => {
    StorageService.deleteMember(id);
    setMembers(StorageService.getMembers());
  };

  // --- Handlers for Attendance ---
  const handleSaveAttendanceRecord = (record: AttendanceRecord) => {
    StorageService.saveAttendanceRecord(record);
    setAttendanceRecords(StorageService.getAttendanceRecords());
  };

  const handleDeleteAttendanceRecord = (id: string) => {
    StorageService.deleteAttendanceRecord(id);
    setAttendanceRecords(StorageService.getAttendanceRecords());
  };

  // --- Handlers for Edification Groups ---
  const handleSaveEdificationGroup = (group: EdificationGroup) => {
    StorageService.saveEdificationGroup(group);
    setEdificationGroups(StorageService.getEdificationGroups());
  };

  const handleDeleteEdificationGroup = (id: string) => {
    StorageService.deleteEdificationGroup(id);
    setEdificationGroups(StorageService.getEdificationGroups());
  };

  // --- Handlers for Training Progress ---
  const handleUpdateMemberProgress = (
    memberId: string, 
    level: TrainingLevelNumber, 
    status: any, 
    progress: number
  ) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      const updated: Member = {
        ...member,
        capacitacionLevel: level,
        capacitacionStatus: status,
        capacitacionProgressPercent: progress
      };
      StorageService.saveMember(updated);
      setMembers(StorageService.getMembers());
    }
  };

  // --- Handlers for Events ---
  const handleSaveEvent = (event: ChurchEvent) => {
    StorageService.saveEvent(event);
    setEvents(StorageService.getEvents());
  };

  const handleDeleteEvent = (id: string) => {
    StorageService.deleteEvent(id);
    setEvents(StorageService.getEvents());
  };

  // --- Handlers for Notifications ---
  const handleAddNotificationLog = (log: NotificationLog) => {
    StorageService.addNotificationLog(log);
    setNotificationLogs(StorageService.getNotificationLogs());
  };

  // Quick action from other views
  const handleTakeAttendanceForMinistryOrGroup = (targetKey: string) => {
    setCurrentTab('attendance');
    setIsTakingAttendanceOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Global Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        availableUsers={availableUsers}
        members={members}
        events={events}
        onOpenQuickExport={() => {
          ExportService.exportFullChurchDatabaseToExcel(
            members,
            ministries,
            edificationGroups,
            trainingLevels,
            attendanceRecords
          );
        }}
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenPasswordModal={(tab) => {
          setPasswordModalInitialTab(tab || 'my_password');
          setIsPasswordModalOpen(true);
        }}
      />

      {/* Main Layout Area: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          currentUser={currentUser}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              members={members}
              ministries={ministries}
              edificationGroups={edificationGroups}
              trainingLevels={trainingLevels}
              attendanceRecords={attendanceRecords}
              events={events}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenNewAttendance={() => {
                setCurrentTab('attendance');
                setIsTakingAttendanceOpen(true);
              }}
              onOpenNewMember={() => {
                setCurrentTab('members');
                setIsNewMemberOpen(true);
              }}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendanceView
              currentUser={currentUser}
              members={members}
              ministries={ministries}
              edificationGroups={edificationGroups}
              attendanceRecords={attendanceRecords}
              onSaveAttendanceRecord={handleSaveAttendanceRecord}
              onDeleteAttendanceRecord={handleDeleteAttendanceRecord}
              isTakingAttendanceOpen={isTakingAttendanceOpen}
              onCloseTakingAttendance={() => setIsTakingAttendanceOpen(false)}
            />
          )}

          {currentTab === 'members' && (
            <MembersView
              members={members}
              ministries={ministries}
              edificationGroups={edificationGroups}
              trainingLevels={trainingLevels}
              onSaveMember={handleSaveMember}
              onDeleteMember={handleDeleteMember}
              isNewMemberOpen={isNewMemberOpen}
              onCloseNewMember={() => setIsNewMemberOpen(false)}
            />
          )}

          {currentTab === 'ministries' && (
            <MinistriesView
              currentUser={currentUser}
              ministries={ministries}
              members={members}
              attendanceRecords={attendanceRecords}
              onTakeAttendance={handleTakeAttendanceForMinistryOrGroup}
              onUpdateMinistry={handleUpdateMinistry}
            />
          )}

          {currentTab === 'edification' && (
            <EdificationGroupsView
              currentUser={currentUser}
              edificationGroups={edificationGroups}
              members={members}
              onSaveGroup={handleSaveEdificationGroup}
              onDeleteGroup={handleDeleteEdificationGroup}
              onTakeAttendanceForGroup={handleTakeAttendanceForMinistryOrGroup}
            />
          )}

          {currentTab === 'training' && (
            <TrainingView
              trainingLevels={trainingLevels}
              members={members}
              onUpdateMemberProgress={handleUpdateMemberProgress}
            />
          )}

          {currentTab === 'notifications' && (
            <NotificationsView
              currentUser={currentUser}
              members={members}
              events={events}
              ministries={ministries}
              notificationLogs={notificationLogs}
              onAddNotificationLog={handleAddNotificationLog}
            />
          )}

          {currentTab === 'events' && (
            <EventsView
              currentUser={currentUser}
              events={events}
              ministries={ministries}
              onSaveEvent={handleSaveEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              currentUser={currentUser}
              members={members}
              ministries={ministries}
              edificationGroups={edificationGroups}
              trainingLevels={trainingLevels}
              attendanceRecords={attendanceRecords}
            />
          )}

        </main>
      </div>

      {/* Global Login & Role Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleSwitchUser}
        availableUsers={availableUsers}
      />

      {/* Password & User Management Modal */}
      <PasswordAndUsersModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        currentUser={currentUser}
        availableUsers={availableUsers}
        ministries={ministries}
        onUpdateUserPassword={handleUpdateUserPassword}
        onSaveUser={handleSaveUser}
        initialTab={passwordModalInitialTab}
      />

    </div>
  );
}
