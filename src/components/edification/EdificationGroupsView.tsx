import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  Plus, 
  Phone, 
  ClipboardCheck, 
  FileText, 
  X, 
  Search,
  MessageSquareShare
} from 'lucide-react';
import { EdificationGroup, Member, User } from '../../types';

interface EdificationGroupsViewProps {
  currentUser: User;
  edificationGroups: EdificationGroup[];
  members: Member[];
  onSaveGroup: (group: EdificationGroup) => void;
  onDeleteGroup: (id: string) => void;
  onTakeAttendanceForGroup: (groupId: string) => void;
}

export const EdificationGroupsView: React.FC<EdificationGroupsViewProps> = ({
  currentUser,
  edificationGroups,
  members,
  onSaveGroup,
  onDeleteGroup,
  onTakeAttendanceForGroup
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<EdificationGroup | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [hostName, setHostName] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [meetingDay, setMeetingDay] = useState('Miércoles');
  const [meetingTime, setMeetingTime] = useState('7:00 PM');
  const [targetZone, setTargetZone] = useState('Zona Norte');

  const openCreateModal = () => {
    setEditingGroup(null);
    setName('');
    setCode(`GE-0${edificationGroups.length + 1}`);
    setLeaderName('');
    setLeaderPhone('+57 ');
    setHostName('');
    setAddress('');
    setNeighborhood('');
    setMeetingDay('Miércoles');
    setMeetingTime('7:00 PM');
    setTargetZone('Zona Norte');
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const groupToSave: EdificationGroup = {
      id: editingGroup ? editingGroup.id : `ge_${Date.now()}`,
      name: name.trim(),
      code: code.trim() || `GE-0${edificationGroups.length + 1}`,
      leaderId: currentUser.id,
      leaderName: leaderName.trim() || currentUser.name,
      leaderPhone: leaderPhone.trim(),
      hostName: hostName.trim() || 'Hogar anfitrión',
      address: address.trim(),
      neighborhood: neighborhood.trim(),
      meetingDay,
      meetingTime,
      targetZone,
      activeMembersCount: 0
    };

    onSaveGroup(groupToSave);
    setShowAddModal(false);
  };

  const filteredGroups = edificationGroups.filter(g => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        g.name.toLowerCase().includes(term) ||
        g.code.toLowerCase().includes(term) ||
        g.leaderName.toLowerCase().includes(term) ||
        g.neighborhood.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Home className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Grupos de Edificación (Células en Hogares)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Red de células familiares para pastoreo cercano, edificación mutua, estudio bíblico semanal y evangelismo relacional en los diferentes sectores de la ciudad.
          </p>
        </div>

        {currentUser.role !== 'miembro' && (
          <button
            onClick={openCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Aperturar Nuevo Grupo</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código, grupo, líder o barrio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <span className="text-xs text-slate-500">
          <b>{filteredGroups.length}</b> células activas
        </span>
      </div>

      {/* Grid of Edification Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map(group => {
          const disciples = members.filter(m => m.edificationGroupId === group.id);

          return (
            <div
              key={group.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-sm transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md">
                    {group.code}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {disciples.length} Discípulos
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">
                  {group.name}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Líder:</span>
                    <span className="font-medium text-slate-900">{group.leaderName}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Anfitrión:</span>
                    <span>{group.hostName}</span>
                  </p>
                  <p className="flex items-start gap-1.5 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{group.address} ({group.neighborhood})</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{group.meetingDay} a las {group.meetingTime}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/${group.leaderPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 border border-emerald-200"
                  title="Contactar al líder por WhatsApp"
                >
                  <MessageSquareShare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                {currentUser.role !== 'miembro' && (
                  <button
                    onClick={() => onTakeAttendanceForGroup(group.id)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tomar Asistencia</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Edification Group */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-extrabold">Aperturar Nuevo Grupo de Edificación</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código Célula</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="GE-06"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre del Grupo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Grupo Betania"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Líder Responsable</label>
                  <input
                    type="text"
                    required
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="Nombre del líder"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono Líder</label>
                  <input
                    type="text"
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value)}
                    placeholder="+57 300 000 0000"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Familia / Hogar Anfitrión</label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Ej: Familia Rodríguez Silva"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dirección de Reunión</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle / Carrera"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barrio / Zona</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Barrio"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Día de Reunión</label>
                  <select
                    value={meetingDay}
                    onChange={(e) => setMeetingDay(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hora</label>
                  <input
                    type="text"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    placeholder="7:00 PM"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Aperturar Célula
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
