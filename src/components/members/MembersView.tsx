import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Edit3, 
  Trash2, 
  MessageSquareShare, 
  CheckCircle, 
  AlertCircle, 
  GraduationCap, 
  Home, 
  X,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { Member, Ministry, EdificationGroup, TrainingLevel, MemberStatus, CapacitacionStatus, MinistryKey, TrainingLevelNumber } from '../../types';
import { ExportService } from '../../services/exportService';

interface MembersViewProps {
  members: Member[];
  ministries: Ministry[];
  edificationGroups: EdificationGroup[];
  trainingLevels: TrainingLevel[];
  onSaveMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  isNewMemberOpen?: boolean;
  onCloseNewMember?: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  ministries,
  edificationGroups,
  trainingLevels,
  onSaveMember,
  onDeleteMember,
  isNewMemberOpen = false,
  onCloseNewMember
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(isNewMemberOpen);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<Member | null>(null);

  // Form Fields
  const [documentId, setDocumentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('1995-05-15');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [civilStatus, setCivilStatus] = useState<'soltero' | 'casado' | 'union_libre' | 'viudo'>('soltero');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [ministryId, setMinistryId] = useState<MinistryKey>('hombres_verdad');
  const [edificationGroupId, setEdificationGroupId] = useState('ge_01');
  const [capacitacionLevel, setCapacitacionLevel] = useState<TrainingLevelNumber>(1);
  const [capacitacionStatus, setCapacitacionStatus] = useState<CapacitacionStatus>('en_curso');
  const [capacitacionProgress, setCapacitacionProgress] = useState<number>(50);
  const [status, setStatus] = useState<MemberStatus>('activo');
  const [baptismDate, setBaptismDate] = useState('');
  const [notes, setNotes] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const openCreateModal = () => {
    setEditingMember(null);
    setDocumentId('');
    setFullName('');
    setEmail('');
    setPhone('+57 ');
    setBirthDate('1995-01-01');
    setGender('M');
    setCivilStatus('soltero');
    setAddress('');
    setNeighborhood('');
    setMinistryId('hombres_verdad');
    setEdificationGroupId(edificationGroups[0]?.id || 'ge_01');
    setCapacitacionLevel(1);
    setCapacitacionStatus('en_curso');
    setCapacitacionProgress(20);
    setStatus('activo');
    setBaptismDate('');
    setNotes('');
    setEmergencyContact('');
    setEmergencyPhone('');
    setShowFormModal(true);
  };

  const openEditModal = (m: Member) => {
    setEditingMember(m);
    setDocumentId(m.documentId);
    setFullName(m.fullName);
    setEmail(m.email);
    setPhone(m.phone);
    setBirthDate(m.birthDate);
    setGender(m.gender);
    setCivilStatus(m.civilStatus);
    setAddress(m.address);
    setNeighborhood(m.neighborhood);
    setMinistryId(m.ministryId);
    setEdificationGroupId(m.edificationGroupId);
    setCapacitacionLevel(m.capacitacionLevel);
    setCapacitacionStatus(m.capacitacionStatus);
    setCapacitacionProgress(m.capacitacionProgressPercent);
    setStatus(m.status);
    setBaptismDate(m.baptismDate || '');
    setNotes(m.notes || '');
    setEmergencyContact(m.emergencyContact || '');
    setEmergencyPhone(m.emergencyPhone || '');
    setShowFormModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const memberToSave: Member = {
      id: editingMember ? editingMember.id : `mem_${Date.now()}`,
      documentId: documentId.trim() || `${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      birthDate,
      gender,
      civilStatus,
      address,
      neighborhood,
      ministryId,
      edificationGroupId,
      capacitacionLevel,
      capacitacionStatus,
      capacitacionProgressPercent: Number(capacitacionProgress) || 0,
      status,
      baptismDate: baptismDate || undefined,
      joinedDate: editingMember ? editingMember.joinedDate : new Date().toISOString().split('T')[0],
      notes,
      emergencyContact,
      emergencyPhone,
      avatarUrl: editingMember?.avatarUrl
    };

    onSaveMember(memberToSave);
    setShowFormModal(false);
    if (onCloseNewMember) onCloseNewMember();
  };

  // Filter members
  const filteredMembers = members.filter(m => {
    if (selectedMinistry !== 'all' && m.ministryId !== selectedMinistry) return false;
    if (selectedGroup !== 'all' && m.edificationGroupId !== selectedGroup) return false;
    if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;
    if (selectedLevel !== 'all' && m.capacitacionLevel.toString() !== selectedLevel) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        m.fullName.toLowerCase().includes(term) ||
        m.documentId.toLowerCase().includes(term) ||
        m.phone.toLowerCase().includes(term) ||
        m.neighborhood.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Base de Datos Centralizada de Miembros
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Directorio eclesial completo con perfiles activos, asignación de ministerio, grupo de edificación y nivel de capacitación en la Iglesia del Dios Altísimo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => ExportService.exportMembersToExcel(filteredMembers, ministries, edificationGroups, 'Directorio_Miembros')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            title="Exportar listado actual a Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Miembro</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Nombre, cédula, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Ministry Filter */}
          <div>
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="w-full text-xs p-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            >
              <option value="all">Todos los Ministerios</option>
              {ministries.map(m => (
                <option key={m.id} value={m.key}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full text-xs p-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            >
              <option value="all">Todos los G. Edificación</option>
              {edificationGroups.map(g => (
                <option key={g.id} value={g.id}>{g.code} - {g.name}</option>
              ))}
            </select>
          </div>

          {/* Training Level */}
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full text-xs p-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            >
              <option value="all">Cualquier Nivel</option>
              <option value="1">Nivel 1: Fundamentos</option>
              <option value="2">Nivel 2: Sanidad Interior</option>
              <option value="3">Nivel 3: Doctrinas</option>
              <option value="4">Nivel 4: Líderes Célula</option>
              <option value="5">Nivel 5: Liderazgo Pastoral</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            >
              <option value="all">Todos los Estados</option>
              <option value="activo">Activo</option>
              <option value="en_seguimiento">En Seguimiento</option>
              <option value="inactivo">Inactivo</option>
              <option value="nuevo">Nuevo Creyente</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Mostrando <b>{filteredMembers.length}</b> perfiles encontrados</span>
          {(searchTerm || selectedMinistry !== 'all' || selectedGroup !== 'all' || selectedStatus !== 'all' || selectedLevel !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedMinistry('all');
                setSelectedGroup('all');
                setSelectedStatus('all');
                setSelectedLevel('all');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Members Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Miembro</th>
                <th className="px-4 py-3">Ministerio</th>
                <th className="px-4 py-3">Grupo Edificación</th>
                <th className="px-4 py-3">Capacitación</th>
                <th className="px-4 py-3">Teléfono / WhatsApp</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map(member => {
                const ministry = ministries.find(m => m.key === member.ministryId);
                const group = edificationGroups.find(g => g.id === member.edificationGroupId);

                return (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Name & Doc */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                          alt={member.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{member.fullName}</p>
                          <p className="text-[11px] text-slate-400">CC: {member.documentId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Ministry */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ministry?.colorScheme.light || 'bg-slate-100'}`}>
                        {ministry?.name || member.ministryId}
                      </span>
                    </td>

                    {/* Edification Group */}
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {group ? `${group.code} • ${group.name.split('(')[0]}` : 'Sin Asignar'}
                    </td>

                    {/* Capacitacion */}
                    <td className="px-4 py-3">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                          <span className="font-semibold">Nivel {member.capacitacionLevel}</span>
                          <span>{member.capacitacionProgressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${member.capacitacionProgressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola hermano ${member.fullName}, te saludamos de la Iglesia del Dios Altísimo CENFOL.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageSquareShare className="w-3.5 h-3.5" />
                        </a>
                        <span>{member.phone}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        member.status === 'activo' ? 'bg-emerald-100 text-emerald-800' :
                        member.status === 'en_seguimiento' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {member.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedMemberProfile(member)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Ver Perfil Completo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar Miembro"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar perfil de ${member.fullName}?`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar Miembro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Full Member Profile Card */}
      {selectedMemberProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            
            {/* Header with Church Logo & User Avatar */}
            <div className="bg-slate-900 p-6 text-white relative">
              <button 
                onClick={() => setSelectedMemberProfile(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src={selectedMemberProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'}
                  alt={selectedMemberProfile.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-md"
                />
                <div>
                  <h3 className="text-lg font-extrabold text-white">{selectedMemberProfile.fullName}</h3>
                  <p className="text-xs text-slate-300">CC: {selectedMemberProfile.documentId} • Membresía Activa</p>
                  <p className="text-xs text-amber-300 font-semibold mt-1">CENFOL - Iglesia del Dios Altísimo</p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Ministerio</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {ministries.find(m => m.key === selectedMemberProfile.ministryId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Grupo Edificación</span>
                  <span className="font-bold text-slate-900">
                    {edificationGroups.find(g => g.id === selectedMemberProfile.edificationGroupId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Discipulado / Nivel</span>
                  <span className="font-bold text-indigo-700">
                    Nivel {selectedMemberProfile.capacitacionLevel} ({selectedMemberProfile.capacitacionStatus})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Cumpleaños</span>
                  <span className="font-bold text-slate-900">{selectedMemberProfile.birthDate}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{selectedMemberProfile.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{selectedMemberProfile.email || 'Sin correo registrado'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{selectedMemberProfile.address} ({selectedMemberProfile.neighborhood})</span>
                </div>
              </div>

              {selectedMemberProfile.notes && (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-900 uppercase block mb-1">Notas Pastorales</span>
                  <p className="text-slate-700 italic">{selectedMemberProfile.notes}</p>
                </div>
              )}

              {/* Direct WhatsApp Call to Action */}
              <a
                href={`https://wa.me/${selectedMemberProfile.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${selectedMemberProfile.fullName}, te saludamos de la Iglesia del Dios Altísimo CENFOL. Esperamos te encuentres en gran bendición.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageSquareShare className="w-4 h-4" />
                <span>Enviar Saludo por WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Create or Edit Member Form */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between shrink-0">
              <h3 className="text-base font-extrabold">
                {editingMember ? 'Editar Perfil de Miembro' : 'Registrar Nuevo Miembro'}
              </h3>
              <button 
                onClick={() => {
                  setShowFormModal(false);
                  if (onCloseNewMember) onCloseNewMember();
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombres y Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Daniel Morales"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cédula / Documento *</label>
                  <input
                    type="text"
                    required
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    placeholder="Ej: 1020304050"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 300 000 0000"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@correo.com"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Género</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado Civil</label>
                  <select
                    value={civilStatus}
                    onChange={(e) => setCivilStatus(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="soltero">Soltero(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="union_libre">Unión Libre</option>
                    <option value="viudo">Viudo(a)</option>
                  </select>
                </div>
              </div>

              {/* Ministry & Edification Group Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-indigo-900 mb-1">Ministerio Asignado *</label>
                  <select
                    value={ministryId}
                    onChange={(e) => setMinistryId(e.target.value as MinistryKey)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 font-medium"
                  >
                    {ministries.map(m => (
                      <option key={m.id} value={m.key}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-emerald-900 mb-1">Grupo de Edificación *</label>
                  <select
                    value={edificationGroupId}
                    onChange={(e) => setEdificationGroupId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 font-medium"
                  >
                    {edificationGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.code} - {g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Training Level & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nivel Capacitación</label>
                  <select
                    value={capacitacionLevel}
                    onChange={(e) => setCapacitacionLevel(Number(e.target.value) as TrainingLevelNumber)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value={1}>Nivel 1: Fundamentos</option>
                    <option value={2}>Nivel 2: Sanidad Interior</option>
                    <option value={3}>Nivel 3: Doctrinas</option>
                    <option value={4}>Nivel 4: Líderes Célula</option>
                    <option value={5}>Nivel 5: Liderazgo Pastoral</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado Capacitación</label>
                  <select
                    value={capacitacionStatus}
                    onChange={(e) => setCapacitacionStatus(e.target.value as CapacitacionStatus)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="en_curso">En Curso</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="graduado">Graduado</option>
                    <option value="no_iniciado">No Iniciado</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Avance (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={capacitacionProgress}
                    onChange={(e) => setCapacitacionProgress(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dirección de Residencia</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle 123 # 45-67"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barrio / Sector</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ej: Cedritos, Modelia..."
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas y Observaciones Pastorales</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dones espirituales, talentos, peticiones de oración o recomendaciones..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  {editingMember ? 'Actualizar Miembro' : 'Guardar Miembro'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
