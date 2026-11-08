import React, { useState } from 'react';
import { 
  MessageSquareShare, 
  Cake, 
  Calendar, 
  AlertTriangle, 
  Send, 
  Smartphone, 
  CheckCircle2, 
  Users, 
  Mail, 
  Clock, 
  History,
  Sparkles,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Member, ChurchEvent, NotificationLog, Ministry, User, MinistryKey } from '../../types';

interface NotificationsViewProps {
  currentUser: User;
  members: Member[];
  events: ChurchEvent[];
  ministries: Ministry[];
  notificationLogs: NotificationLog[];
  onAddNotificationLog: (log: NotificationLog) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  currentUser,
  members,
  events,
  ministries,
  notificationLogs,
  onAddNotificationLog
}) => {
  const [activeTab, setActiveTab] = useState<'cumpleanos' | 'reuniones' | 'eventos' | 'redactar' | 'historial'>('cumpleanos');

  // Custom composer state
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'todos' | MinistryKey | 'cumpleaneros'>('todos');
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  // Month birthdays
  const currentMonth = new Date().getMonth() + 1;
  const birthdayMembers = members.filter(m => {
    if (!m.birthDate) return false;
    const parts = m.birthDate.split('-');
    return parseInt(parts[1], 10) === currentMonth;
  });

  const handleSendCustomNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    let count = members.length;
    let summary = 'Toda la congregación';
    if (targetAudience === 'cumpleaneros') {
      count = birthdayMembers.length;
      summary = `Cumpleañeros del mes (${birthdayMembers.map(m => m.fullName).join(', ')})`;
    } else if (targetAudience !== 'todos') {
      const min = ministries.find(m => m.key === targetAudience);
      const filtered = members.filter(m => m.ministryId === targetAudience);
      count = filtered.length;
      summary = `Miembros de ${min?.name || targetAudience} (${count} personas)`;
    }

    const log: NotificationLog = {
      id: `notif_${Date.now()}`,
      title: customTitle.trim() || 'Aviso Pastoral Importante',
      message: customMessage.trim(),
      type: 'evento',
      recipientCount: count,
      recipientsSummary: summary,
      sentAt: new Date().toISOString(),
      sentBy: currentUser.name,
      channel
    };

    onAddNotificationLog(log);
    setIsSentSuccess(true);
    setCustomTitle('');
    setCustomMessage('');

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch (e) {}

    setTimeout(() => setIsSentSuccess(false), 4000);
  };

  const generateWhatsAppBirthdayLink = (m: Member) => {
    const text = `¡Feliz Cumpleaños estimado/a ${m.fullName}! 🎉🎂 De parte del Pastor David Morales y toda la familia de la Iglesia del Dios Altísimo (CENFOL), oramos que el Dios Altísimo derrame sobre ti abundantes bendiciones, gozo y paz en este nuevo año de vida. "El Señor te bendiga y te guarde; el Señor haga resplandecer su rostro sobre ti" (Números 6:24-25). ¡Un gran abrazo!`;
    return `https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  const generateWhatsAppReminderLink = (m: Member, eventTitle: string, eventDate: string, eventTime: string) => {
    const text = `Hola estimado/a ${m.fullName}, te saludamos con gran aprecio desde la Iglesia del Dios Altísimo CENFOL. Te recordamos con mucho cariño nuestra próxima cita: *${eventTitle}*, que se llevará a cabo el *${eventDate}* a las *${eventTime}*. ¡Te esperamos para compartir juntos en la presencia de Dios!`;
    return `https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquareShare className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Centro de Notificaciones Automáticas & Recordatorios
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Automatiza felicitaciones de cumpleaños, recordatorios semanales para ministerios y grupos de edificación, y difunde alertas de eventos por WhatsApp y correo.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('cumpleanos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'cumpleanos' ? 'bg-white shadow-xs text-rose-600 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cake className="w-4 h-4 text-rose-500" />
          <span>Cumpleaños del Mes ({birthdayMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('eventos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'eventos' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>Recordatorios de Eventos ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('redactar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'redactar' ? 'bg-white shadow-xs text-emerald-600 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send className="w-4 h-4 text-emerald-500" />
          <span>Redactar Notificación Masiva</span>
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'historial' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4 text-slate-500" />
          <span>Historial de Envíos ({notificationLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: Cumpleaños */}
      {activeTab === 'cumpleanos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Cake className="w-5 h-5 text-rose-500" />
                <span>Cumpleañeros de este Mes (Noviembre)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Envía bendiciones y felicitaciones pastorales personalizadas con un solo clic a través de WhatsApp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {birthdayMembers.map(member => (
              <div 
                key={member.id}
                className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{member.fullName}</span>
                    <span className="bg-rose-200 text-rose-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                      {member.birthDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {ministries.find(m => m.key === member.ministryId)?.name} • Tel: {member.phone}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-rose-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 italic">Mensaje bíblico preparado</span>
                  <a
                    href={generateWhatsAppBirthdayLink(member)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Felicitar por WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Eventos */}
      {activeTab === 'eventos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Recordatorios de Eventos Importantes</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Difunde las fechas de retiros, conferencias, graduaciones y vigilias a los miembros correspondientes.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {events.map(event => (
              <div 
                key={event.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {event.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{event.date} • {event.time}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                  <p className="text-xs text-slate-600">{event.description}</p>
                  <p className="text-[11px] text-slate-400">Lugar: {event.location} • Expositor: {event.speaker || 'Equipo Pastoral'}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const msg = `Recordatorio CENFOL: No te pierdas este evento especial: *${event.title}* el día ${event.date} a las ${event.time} en ${event.location}. ¡Te esperamos con toda tu familia!`;
                      onAddNotificationLog({
                        id: `notif_${Date.now()}`,
                        title: `Recordatorio: ${event.title}`,
                        message: msg,
                        type: 'evento',
                        recipientCount: members.length,
                        recipientsSummary: `Difusión a miembros activos`,
                        sentAt: new Date().toISOString(),
                        sentBy: currentUser.name,
                        channel: 'whatsapp'
                      });
                      alert(`Recordatorio emitido con éxito para: ${event.title}`);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Emitir Recordatorio Masivo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Redactar Notificación Masiva */}
      {activeTab === 'redactar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              <span>Redactor de Notificaciones Eclesiales</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Envía comunicados oficiales, devocionales o recordatorios urgentes a la congregación de CENFOL.
            </p>
          </div>

          {isSentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>¡Notificación enviada exitosamente y registrada en el historial!</span>
            </div>
          )}

          <form onSubmit={handleSendCustomNotification} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destinatarios</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="todos">Toda la Congregación (Todos los miembros)</option>
                  <option value="hombres_verdad">Solo Hombres de Verdad</option>
                  <option value="mujeres_sabias">Solo Mujeres Sabias</option>
                  <option value="vida_estudiantil">Solo Vida Estudiantil (Jóvenes)</option>
                  <option value="profesionales">Solo Profesionales</option>
                  <option value="arca_noe">Solo Arca de Noé (Padres y Maestros)</option>
                  <option value="cumpleaneros">Solo Cumpleañeros de este Mes</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Canal de Envío</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="whatsapp">WhatsApp Directo</option>
                  <option value="sms">Mensaje de Texto SMS</option>
                  <option value="email">Correo Electrónico Masivo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Título del Mensaje</label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Ej: Invitación a Vigilia de Oración y Alabanza"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contenido del Mensaje</label>
              <textarea
                rows={4}
                required
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Escribe el cuerpo del mensaje que recibirán los hermanos..."
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Despachar Notificación</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: Historial de Envíos */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-600" />
                <span>Bitácora de Notificaciones Despachadas</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Registro de comunicaciones pastorales enviadas a los miembros.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Fecha & Hora</th>
                  <th className="px-4 py-2.5">Título</th>
                  <th className="px-4 py-2.5">Destinatarios</th>
                  <th className="px-4 py-2.5">Canal</th>
                  <th className="px-4 py-2.5">Remitente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notificationLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {log.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="font-semibold">{log.recipientCount}</span> personas ({log.recipientsSummary})
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase text-[10px]">
                        {log.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {log.sentBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
