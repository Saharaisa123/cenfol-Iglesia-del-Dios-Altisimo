import React, { useState } from 'react';
import { 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  UserCheck, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Plus, 
  UserPlus, 
  Mail, 
  Users 
} from 'lucide-react';
import { User, UserRole, Ministry } from '../../types';

interface PasswordAndUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  availableUsers: User[];
  ministries: Ministry[];
  onUpdateUserPassword: (userId: string, newPassword: string) => void;
  onSaveUser: (user: User) => void;
  initialTab?: 'my_password' | 'manage_all';
}

export const PasswordAndUsersModal: React.FC<PasswordAndUsersModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  availableUsers,
  ministries,
  onUpdateUserPassword,
  onSaveUser,
  initialTab = 'my_password'
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [activeTab, setActiveTab] = useState<'my_password' | 'manage_all'>(
    isAdmin && initialTab === 'manage_all' ? 'manage_all' : 'my_password'
  );

  // My Password Tab state
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showMyPass, setShowMyPass] = useState(false);
  const [myPassSuccess, setMyPassSuccess] = useState(false);
  const [myPassError, setMyPassError] = useState<string | null>(null);

  // Manage all users state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('lider_ministerio');
  const [editMinistryId, setEditMinistryId] = useState<string>('hombres_verdad');
  const [showEditPass, setShowEditPass] = useState(false);
  const [manageSuccess, setManageSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdateMyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMyPassError(null);

    if (newPassword.length < 4) {
      setMyPassError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMyPassError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    onUpdateUserPassword(currentUser.id, newPassword);
    setMyPassSuccess(true);
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPassInput('');
    setTimeout(() => {
      setMyPassSuccess(false);
      onClose();
    }, 2000);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword(user.password || 'lider123');
    setEditRole(user.role);
    setEditMinistryId(user.assignedMinistryId || 'hombres_verdad');
  };

  const openNewUser = () => {
    setEditingUser({
      id: `user_${Date.now()}`,
      name: '',
      email: '',
      password: 'lider123',
      role: 'lider_ministerio',
      assignedMinistryId: 'hombres_verdad'
    });
    setEditName('');
    setEditEmail('');
    setEditPassword('lider123');
    setEditRole('lider_ministerio');
    setEditMinistryId('hombres_verdad');
  };

  const handleSaveUserModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim() || !editEmail.trim()) return;

    const userToSave: User = {
      ...editingUser,
      name: editName.trim(),
      email: editEmail.trim(),
      password: editPassword.trim() || 'lider123',
      role: editRole,
      assignedMinistryId: editRole === 'lider_ministerio' ? editMinistryId : undefined
    };

    onSaveUser(userToSave);
    setEditingUser(null);
    setManageSuccess(`Usuario ${userToSave.name} actualizado con éxito.`);
    setTimeout(() => setManageSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-indigo-600 text-white">
              <Key className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Seguridad, Usuarios y Contraseñas
              </h3>
              <p className="text-xs text-slate-300">
                CENFOL • Iglesia del Dios Altísimo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection if Admin */}
        {isAdmin && (
          <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('my_password')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'my_password'
                  ? 'bg-white shadow-xs text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cambiar Mi Contraseña
            </button>
            <button
              onClick={() => setActiveTab('manage_all')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'manage_all'
                  ? 'bg-white shadow-xs text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Gestionar Todos los Usuarios y Contraseñas</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-bold">Admin</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* TAB 1: Mi Contraseña */}
          {activeTab === 'my_password' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{currentUser.name}</p>
                  <p className="text-slate-500">{currentUser.email}</p>
                  <p className="text-[10px] text-indigo-700 font-semibold uppercase mt-0.5">{currentUser.role.replace('_', ' ')}</p>
                </div>
              </div>

              {myPassSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Contraseña actualizada exitosamente!</span>
                </div>
              )}

              {myPassError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{myPassError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateMyPassword} className="space-y-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showMyPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMyPass(!showMyPass)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {showMyPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirmar Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showMyPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs"
                  >
                    Guardar Nueva Contraseña
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Administrar Todos los Usuarios y Contraseñas */}
          {activeTab === 'manage_all' && (
            <div className="space-y-4 text-xs">
              
              {manageSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{manageSuccess}</span>
                </div>
              )}

              {/* Editing User Sub-modal / Card */}
              {editingUser ? (
                <form onSubmit={handleSaveUserModal} className="p-4 bg-slate-50 border border-indigo-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Editar Usuario / Líder y Asignar Contraseña
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nombre Completo del Líder *</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Ej: Diác. Carlos Mendoza"
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico (Login) *</label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="ejemplo@iglesia.com"
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nueva Contraseña de Acceso *</label>
                      <div className="relative">
                        <input
                          type={showEditPass ? 'text' : 'password'}
                          required
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Contraseña"
                          className="w-full p-2 pr-10 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPass(!showEditPass)}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                        >
                          {showEditPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Rol en el Sistema *</label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                      >
                        <option value="admin">Pastor / Administrador General</option>
                        <option value="lider_ministerio">Líder de Ministerio</option>
                        <option value="lider_edificacion">Líder de Grupo de Edificación</option>
                        <option value="miembro">Miembro Activo</option>
                      </select>
                    </div>
                  </div>

                  {editRole === 'lider_ministerio' && (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Ministerio Asignado</label>
                      <select
                        value={editMinistryId}
                        onChange={(e) => setEditMinistryId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                      >
                        {ministries.map(m => (
                          <option key={m.id} value={m.key}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                    >
                      Guardar Cambios de Usuario
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-600">
                      Como Administrador puedes cambiar nombres de líderes, reasignar ministerios y cambiar las contraseñas de cualquier rol:
                    </p>
                    <button
                      onClick={openNewUser}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Crear Nuevo Líder</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Usuario / Líder</th>
                          <th className="px-3 py-2">Correo de Acceso</th>
                          <th className="px-3 py-2">Rol</th>
                          <th className="px-3 py-2">Contraseña Actual</th>
                          <th className="px-3 py-2 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {availableUsers.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/70">
                            <td className="px-3 py-2.5 font-bold text-slate-900">
                              {u.name}
                            </td>
                            <td className="px-3 py-2.5 text-slate-600 font-mono">
                              {u.email}
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded text-[10px] capitalize">
                                {u.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-indigo-600 font-bold">
                              {u.password || 'lider123'}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <button
                                onClick={() => openEditUser(u)}
                                className="bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 inline-flex"
                              >
                                <Edit3 className="w-3 h-3 text-indigo-600" />
                                <span>Editar / Contraseña</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
