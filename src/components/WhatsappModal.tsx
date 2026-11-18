import React, { useEffect, useState } from 'react';
import {
  MessageCircle,
  Send,
  RotateCcw,
  UserPlus,
  Trash2,
  X,
} from 'lucide-react';
import { WhatsappContact } from '../types';
import { buildWhatsappUrl, sanitizePhoneForTel } from '../utils/location';

interface WhatsappModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: WhatsappContact[];
  onUpdateContacts: (contacts: WhatsappContact[]) => void;
  message: string;
  onChangeMessage: (msg: string) => void;
}

export const WhatsappModal: React.FC<WhatsappModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onUpdateContacts,
  message,
  onChangeMessage,
}) => {
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedContacts = contacts.filter((c) => c.selected);
  const validSelected = selectedContacts.filter(
    (c) => sanitizePhoneForTel(c.phone).length >= 8
  );
  const nextPending = validSelected.find((c) => !c.sent);

  const handleToggleSelect = (id: string) => {
    onUpdateContacts(
      contacts.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleMarkSent = (id: string) => {
    onUpdateContacts(
      contacts.map((c) => (c.id === id ? { ...c, sent: true } : c))
    );
  };

  const handleResetSent = () => {
    onUpdateContacts(contacts.map((c) => ({ ...c, sent: false })));
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    onUpdateContacts([
      ...contacts,
      {
        id: `wa_${Date.now()}`,
        name: newName.trim(),
        phone: newPhone.trim(),
        role: 'Kontakt',
        selected: true,
        sent: false,
      },
    ]);
    setNewName('');
    setNewPhone('');
  };

  const handleRemoveContact = (id: string) => {
    if (contacts.length <= 5) return;
    onUpdateContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wysyłka WhatsApp (uruchomiono głosem)"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-[#253023] bg-[#090B09] p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-[#181E17] pb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#84CC16]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg font-bold text-[#F3F5F2]">
                Wysyłka WhatsApp
              </h2>
              <p className="text-xs text-[#8C948A]">
                Obsługiwane głosowo — wyślij wiadomość do wybranych osób
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij okno WhatsApp"
            className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-xl border border-[#222921] bg-[#111511] text-[#9BA399] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <textarea
          rows={3}
          value={message}
          onChange={(e) => onChangeMessage(e.target.value)}
          placeholder="Treść wiadomości WhatsApp..."
          aria-label="Treść wiadomości WhatsApp"
          className="w-full rounded-xl border border-[#20261F] bg-[#050505] p-3 text-sm text-[#F3F5F2] placeholder-[#656D63] focus:border-[#84CC16] focus:outline-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          {nextPending ? (
            <a
              href={buildWhatsappUrl(nextPending.phone, message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleMarkSent(nextPending.id)}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-4 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E]"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>Wyślij w WhatsApp do: {nextPending.name}</span>
            </a>
          ) : (
            <div className="flex flex-1 items-center justify-between rounded-xl border border-[#1E2B1B] bg-[#0B1209] px-3 py-2.5 text-xs text-[#A3E635]">
              <span>Wysłano do zaznaczonych osób.</span>
              <button
                type="button"
                onClick={handleResetSent}
                className="inline-flex items-center gap-1 rounded-lg border border-[#2C3E27] px-2.5 py-1 text-xs text-white hover:bg-[#172315] cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Resetuj</span>
              </button>
            </div>
          )}
        </div>

        <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {contacts.map((c) => {
            const valid = sanitizePhoneForTel(c.phone).length >= 8;
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-[#181E17] bg-[#060706] px-3 py-2 text-xs"
              >
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={c.selected}
                    onChange={() => handleToggleSelect(c.id)}
                    className="h-4 w-4 accent-[#84CC16]"
                  />
                  <div>
                    <span className="font-semibold text-[#F3F5F2]">{c.name}</span>
                    <span className="ml-2 font-mono-tabular text-[#8C948A]">
                      {c.phone}
                    </span>
                  </div>
                </label>

                <div className="flex items-center gap-1.5">
                  {valid && (
                    <a
                      href={buildWhatsappUrl(c.phone, message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleMarkSent(c.id)}
                      className={`rounded-lg px-2.5 py-1.5 font-semibold ${
                        c.sent
                          ? 'border border-[#232D21] text-[#A3E635]'
                          : 'bg-[#84CC16] text-[#050505]'
                      }`}
                    >
                      {c.sent ? 'Ponów' : 'Wyślij'}
                    </a>
                  )}
                  {contacts.length > 5 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(c.id)}
                      aria-label={`Usuń ${c.name}`}
                      className="p-1.5 text-[#7D857B] hover:text-[#FCA5A5] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleAddContact} className="flex flex-wrap gap-2 border-t border-[#181E17] pt-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nowa osoba..."
            className="min-h-[38px] flex-1 rounded-lg border border-[#20261F] bg-[#050505] px-3 text-xs text-[#F3F5F2] placeholder-[#656D63] focus:border-[#84CC16] focus:outline-none"
          />
          <input
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="+49 176 ..."
            className="min-h-[38px] w-40 rounded-lg border border-[#20261F] bg-[#050505] px-3 font-mono-tabular text-xs text-[#F3F5F2] placeholder-[#656D63] focus:border-[#84CC16] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newName.trim() || !newPhone.trim()}
            className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-[#2A3329] bg-[#141914] px-3 text-xs font-semibold text-[#F3F5F2] hover:border-[#84CC16] disabled:opacity-50 cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5 text-[#84CC16]" />
            <span>Dodaj</span>
          </button>
        </form>
      </div>
    </div>
  );
};
