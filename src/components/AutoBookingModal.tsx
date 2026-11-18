import React, { useEffect, useState } from 'react';
import {
  BedDouble,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  PhoneCall,
  User,
  Users,
  X,
} from 'lucide-react';
import { StayResult } from '../types';
import {
  addDaysToIso,
  buildAirbnbDeepLink,
  buildBookingDeepLink,
  clampStayDate,
  getMaxStayIsoDate,
  getTodayIsoDate,
} from '../utils/location';

interface AutoBookingModalProps {
  stay: StayResult | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    stay: StayResult;
    checkIn: string;
    checkOut: string;
    guests: number;
    guestName: string;
    guestEmail: string;
  }) => void;
}

export const AutoBookingModal: React.FC<AutoBookingModalProps> = ({
  stay,
  checkIn: initialCheckIn,
  checkOut: initialCheckOut,
  guests: initialGuests,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const [guestName, setGuestName] = useState('Gość Miękiszon');
  const [guestEmail, setGuestEmail] = useState('Morfi28@gmx.de');
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  const todayIso = getTodayIsoDate();
  const maxDateIso = getMaxStayIsoDate();

  useEffect(() => {
    const safeIn = clampStayDate(initialCheckIn, todayIso);
    const safeOut = clampStayDate(initialCheckOut, addDaysToIso(safeIn, 2));
    setCheckIn(safeIn);
    setCheckOut(safeOut <= safeIn ? addDaysToIso(safeIn, 2) : safeOut);
    setGuests(initialGuests);
  }, [initialCheckIn, initialCheckOut, initialGuests, stay, todayIso]);

  useEffect(() => {
    if (!stay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stay, onClose]);

  if (!stay) return null;

  const liveBookingUrl = buildBookingDeepLink(
    stay.name,
    stay.city || 'Deutschland',
    checkIn,
    checkOut,
    guests
  );
  const liveAirbnbUrl = buildAirbnbDeepLink(
    stay.city || 'Deutschland',
    checkIn,
    checkOut,
    guests
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeIn = clampStayDate(checkIn, todayIso);
    const rawOut = clampStayDate(checkOut, addDaysToIso(safeIn, 2));
    const safeOut = rawOut <= safeIn ? addDaysToIso(safeIn, 1) : rawOut;
    onConfirm({
      stay,
      checkIn: safeIn,
      checkOut: safeOut,
      guests,
      guestName,
      guestEmail,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Automatyczna rezerwacja noclegu"
      className="fixed inset-0 z-[55] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-[#283525] bg-[#0A0D0A] p-5 shadow-2xl space-y-4"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#181E17] pb-3">
          <div className="flex items-start gap-2.5">
            <BedDouble className="mt-0.5 h-5 w-5 text-[#84CC16]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg font-bold text-[#F3F5F2]">
                Automatyczna rezerwacja noclegu
              </h2>
              <p className="text-xs text-[#969F94]">
                {stay.name} · {stay.city} ({stay.approxPriceEur || 'cena w serwisie'})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij formularz rezerwacji"
            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl border border-[#222921] bg-[#111511] text-[#9BA399] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs text-[#9FA89D]">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#84CC16]" />
              Imię i nazwisko gościa
            </span>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="min-h-[40px] w-full rounded-xl border border-[#20261F] bg-[#050505] px-3 text-xs text-[#F3F5F2] focus:border-[#84CC16] focus:outline-none"
            />
          </label>

          <label className="space-y-1 text-xs text-[#9FA89D]">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#84CC16]" />
              E-mail do potwierdzenia
            </span>
            <input
              type="email"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="min-h-[40px] w-full rounded-xl border border-[#20261F] bg-[#050505] px-3 text-xs text-[#F3F5F2] focus:border-[#84CC16] focus:outline-none"
            />
          </label>

          <label className="space-y-1 text-xs text-[#9FA89D]">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#84CC16]" />
              Zameldowanie
            </span>
            <input
              type="date"
              required
              min={todayIso}
              max={maxDateIso}
              value={checkIn}
              onChange={(e) => {
                const safeIn = clampStayDate(e.target.value, checkIn);
                setCheckIn(safeIn);
                if (checkOut <= safeIn) {
                  setCheckOut(addDaysToIso(safeIn, 2));
                }
              }}
              className="min-h-[40px] w-full rounded-xl border border-[#20261F] bg-[#050505] px-3 font-mono-tabular text-xs text-[#F3F5F2] focus:border-[#84CC16] focus:outline-none [color-scheme:dark]"
            />
          </label>

          <label className="space-y-1 text-xs text-[#9FA89D]">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#84CC16]" />
              Wymeldowanie
            </span>
            <input
              type="date"
              required
              min={checkIn || todayIso}
              max={maxDateIso}
              value={checkOut}
              onChange={(e) => {
                const minOut = addDaysToIso(checkIn, 1);
                const safeOut = clampStayDate(e.target.value, minOut);
                setCheckOut(safeOut <= checkIn ? minOut : safeOut);
              }}
              className="min-h-[40px] w-full rounded-xl border border-[#20261F] bg-[#050505] px-3 font-mono-tabular text-xs text-[#F3F5F2] focus:border-[#84CC16] focus:outline-none [color-scheme:dark]"
            />
          </label>
        </div>

        <label className="block space-y-1 text-xs text-[#9FA89D]">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#84CC16]" />
            Liczba gości
          </span>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="min-h-[40px] w-full rounded-xl border border-[#20261F] bg-[#050505] px-3 font-mono-tabular text-xs text-[#F3F5F2] focus:border-[#84CC16] focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-2 border-t border-[#181E17] pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-4 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E] disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>
              {isSubmitting ? 'Rezerwuję automatycznie...' : 'Potwierdź automatyczną rezerwację'}
            </span>
          </button>

          <a
            href={liveBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#252D24] bg-[#111511] px-3.5 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16] whitespace-nowrap"
          >
            <span>Booking.com</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#84CC16]" />
          </a>

          <a
            href={liveAirbnbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#252D24] bg-[#111511] px-3.5 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16] whitespace-nowrap"
          >
            <span>Airbnb</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#84CC16]" />
          </a>

          {stay.phone && (
            <a
              href={`tel:${stay.phone}`}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#252D24] bg-[#111511] px-3.5 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16] whitespace-nowrap"
            >
              <PhoneCall className="h-3.5 w-3.5 text-[#84CC16]" />
              <span>Zadzwoń</span>
            </a>
          )}
        </div>
      </form>
    </div>
  );
};
