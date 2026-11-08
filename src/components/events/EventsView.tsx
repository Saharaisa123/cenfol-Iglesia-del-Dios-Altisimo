import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  Users, 
  Sparkles, 
  FileText, 
  X, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { ChurchEvent, Ministry, User } from '../../types';

interface EventsViewProps {
  currentUser: User;
  events: ChurchEvent[];
  ministries: Ministry[];
  onSaveEvent: (event: ChurchEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  currentUser,
  events,
  ministries,
  onSaveEvent,
  onDeleteEvent
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'ministerio' | 'capacitacion' | 'general'>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'general' | 'ministerio' | 'capacitacion' | 'oracion'>('ministerio');
  const [date, setDate] = useState('2026-11-20');
  const [time, setTime] = useState('07:00 PM');
  const [location, setLocation] = useState('Templo Mayor CENFOL');
  const [targetMinistry, setTargetMinistry] = useState<string>('todos');
  const [speaker, setSpeaker] = useState('Pastor David Morales');
  const [isImportant, setIsImportant] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEv: ChurchEvent = {
      id: `ev_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      date,
      time,
      location: location.trim(),
      targetMinistry: targetMinistry as any,
      speaker: speaker.trim(),
      isImportantReminder: isImportant
    };

    onSaveEvent(newEv);
    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  const filteredEvents = events.filter(e => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Calendario de Eventos & Actividades Eclesiales
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Programación de vigilias, desayunos de hombres, noches de té para mujeres sabias, campamentos juveniles, graduaciones y cultos especiales.
          </p>
        </div>

        {currentUser.role !== 'miembro' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Programar Nuevo Evento</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-fit">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${filterCategory === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
        >
          Todos los Eventos ({events.length})
        </button>
        <button
          onClick={() => setFilterCategory('ministerio')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${filterCategory === 'ministerio' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-600'}`}
        >
          Por Ministerio
        </button>
        <button
          onClick={() => setFilterCategory('capacitacion')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${filterCategory === 'capacitacion' ? 'bg-white shadow-xs text-purple-700' : 'text-slate-600'}`}
        >
          Capacitación / Graduación
        </button>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map(event => (
          <div
            key={event.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {event.category}
                </span>
                {event.isImportantReminder && (
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    Recordatorio Activo
                  </span>
                )}
              </div>

              <h3 className="text-base font-extrabold text-slate-900">
                {event.title}
              </h3>

              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {event.description}
              </p>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <p className="flex items-center gap-1.5 text-indigo-900 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{event.date} • {event.time}</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{event.location}</span>
                </p>
                {event.speaker && (
                  <p className="text-[11px] text-slate-500">
                    Invitado / Expositor: <b>{event.speaker}</b>
                  </p>
                )}
              </div>
            </div>

            {currentUser.role === 'admin' && (
              <div className="mt-4 pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar evento ${event.title}?`)) {
                      onDeleteEvent(event.id);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal New Event */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-extrabold">Programar Evento Eclesial</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Evento</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Desayuno de Varones, Conferencia de Mujeres..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles de la reunión..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hora</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="07:00 PM"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lugar</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expositor / Speaker</label>
                  <input
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="importantReminder"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="importantReminder" className="text-xs text-slate-700 font-medium">
                  Marcar como Recordatorio Importante en la barra superior
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
