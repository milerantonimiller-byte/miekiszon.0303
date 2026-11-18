import React, { useState } from 'react';
import {
  BedDouble,
  Calendar,
  ExternalLink,
  MapPin,
  PhoneCall,
  Users,
  AlertCircle,
  Maximize2,
  Zap,
  CheckCircle2,
  Trash2,
  Loader2,
  Navigation,
  Search,
} from 'lucide-react';
import {
  DialTarget,
  StayBookingRecord,
  StayResult,
  StayType,
  StaysSearchResponse,
} from '../types';
import {
  buildAirbnbDeepLink,
  buildBookingDeepLink,
  buildExpediaDeepLink,
  buildFewoDeepLink,
  buildHrsDeepLink,
  countStayNights,
  formatPolishDateDisplay,
  getCurrentStayDates,
  getMaxStayIsoDate,
  getNextWeekendDates,
  getTodayIsoDate,
  sanitizePhoneForTel,
  stripHyphensForCodeOnly,
} from '../utils/location';

interface StaysTabProps {
  stayType: StayType;
  onSelectStayType: (type: StayType) => void;
  locationInput: string;
  onLocationInputChange: (val: string) => void;
  onSearchByLocation: () => void;
  onUseMyLocation: () => void;
  hasGpsLock: boolean;
  isLocating: boolean;
  checkIn: string;
  checkOut: string;
  guests: number;
  onChangeCheckIn: (val: string) => void;
  onChangeCheckOut: (val: string) => void;
  onApplyDatePreset: (checkIn: string, checkOut: string) => void;
  onChangeGuests: (val: number) => void;
  data: StaysSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  bookings: StayBookingRecord[];
  isAutoBooking: boolean;
  onOpenAutoBookModal: (stay: StayResult) => void;
  onAutoBookBest: () => void;
  onRemoveBooking: (id: string) => void;
  onOpenDialer: (target: DialTarget) => void;
  onRetrySearch: () => void;
  onOpenDetached?: () => void;
}

const STAY_TYPES: { id: StayType; label: string }[] = [
  { id: 'all', label: 'Wszystkie noclegi' },
  { id: 'hotel', label: 'Hotele' },
  { id: 'apartment', label: 'Apartamenty' },
  { id: 'budget', label: 'Budżetowe' },
];

export const StaysTab: React.FC<StaysTabProps> = ({
  stayType,
  onSelectStayType,
  locationInput,
  onLocationInputChange,
  onSearchByLocation,
  onUseMyLocation,
  hasGpsLock,
  isLocating,
  checkIn,
  checkOut,
  guests,
  onChangeCheckIn,
  onChangeCheckOut,
  onApplyDatePreset,
  onChangeGuests,
  data,
  isLoading,
  error,
  bookings,
  isAutoBooking,
  onOpenAutoBookModal,
  onAutoBookBest,
  onRemoveBooking,
  onOpenDialer,
  onRetrySearch,
  onOpenDetached,
}) => {
  const todayIso = getTodayIsoDate();
  const maxDateIso = getMaxStayIsoDate();
  const nightsCount = countStayNights(checkIn, checkOut);
  const normalizedCodeQuery = stripHyphensForCodeOnly(locationInput).toUpperCase();
  const activeSearchCity =
    locationInput.trim() || data?.resolvedLocation || 'Europe';

  const portalBookingUrl = buildBookingDeepLink(
    '',
    activeSearchCity,
    checkIn,
    checkOut,
    guests
  );
  const portalAirbnbUrl = buildAirbnbDeepLink(
    activeSearchCity,
    checkIn,
    checkOut,
    guests
  );
  const portalHrsUrl = buildHrsDeepLink(
    '',
    activeSearchCity,
    checkIn,
    checkOut,
    guests
  );
  const portalFewoUrl = buildFewoDeepLink(
    activeSearchCity,
    checkIn,
    checkOut,
    guests
  );
  const portalExpediaUrl = buildExpediaDeepLink(
    '',
    activeSearchCity,
    checkIn,
    checkOut,
    guests
  );

  return (
    <div className="space-y-6">
      {/* Standalone Stays Location Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearchByLocation();
        }}
        className="flex flex-col gap-2.5 rounded-2xl border border-[#1A1E1A] bg-[#090B09] p-3.5 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#84CC16]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={locationInput}
            onChange={(e) => onLocationInputChange(e.target.value)}
            placeholder="Kod pocztowy lub miasto w dowolnym kraju (np. 10115 DE, 00-001 PL, 75001)"
            aria-label="Lokalizacja do wyszukania noclegów"
            className="min-h-[42px] w-full rounded-xl border border-[#1E241D] bg-[#050505] pl-9 pr-3 text-xs text-[#F3F5F2] placeholder-[#6B7369] focus:border-[#84CC16] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={onUseMyLocation}
            disabled={isLocating || isLoading}
            className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#232922] bg-[#101310] px-3.5 text-xs font-medium text-[#D1D7D0] hover:border-[#84CC16] hover:text-white disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            <Navigation className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
            <span>
              {isLocating
                ? 'Namierzam...'
                : hasGpsLock
                  ? 'Szukaj po GPS'
                  : 'Użyj lokalizacji'}
            </span>
          </button>

          <button
            type="submit"
            disabled={isLoading || (!locationInput.trim() && !hasGpsLock)}
            className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#84CC16] px-4 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E] disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Szukaj noclegów</span>
          </button>
        </div>
      </form>

      {/* Bilingual Polish & German Light Intro + Quick Auto-Book Action */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1B211A] bg-[#0A0C0A] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#F3F5F2]">
            Wynajem pokoi, apartamentów i hoteli po kodzie pocztowym na całym świecie (Niemcy bez myślników) — Booking.com, Airbnb, HRS, FeWo-direkt, Expedia.
          </p>
          <p className="mt-1 text-xs text-[#969F94]">
            Zimmervermietung & Unterkünfte weltweit nach PLZ (Deutschland ohne Bindestriche) — Booking.com, Airbnb, HRS, FeWo-direkt & Expedia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onAutoBookBest}
            disabled={isAutoBooking || isLoading}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#84CC16] px-3.5 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E] disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {isAutoBooking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{isAutoBooking ? 'Rezerwuję...' : 'Zarezerwuj automatycznie'}</span>
          </button>

          {onOpenDetached && (
            <button
              type="button"
              onClick={onOpenDetached}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#252D24] bg-[#111511] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16] cursor-pointer whitespace-nowrap"
            >
              <Maximize2 className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
              <span>Osobne okno</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmed Automatic Reservations List */}
      {bookings.length > 0 && (
        <section
          aria-label="Moje automatyczne rezerwacje noclegów"
          className="rounded-2xl border border-[#2C3A27] bg-[#0B100A] p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[#D9F99D]">
            <CheckCircle2 className="h-4 w-4 text-[#84CC16]" aria-hidden="true" />
            <span>Moje automatyczne rezerwacje ({bookings.length})</span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {bookings.map((bk) => {
              const telHref = sanitizePhoneForTel(bk.phone);
              const cleanCode = stripHyphensForCodeOnly(bk.confirmationCode);
              const isCodeMatched =
                Boolean(normalizedCodeQuery) &&
                cleanCode.toUpperCase().includes(normalizedCodeQuery);
              return (
                <div
                  key={bk.id}
                  className={`flex flex-col justify-between rounded-xl border bg-[#070907] p-4 text-xs space-y-2.5 ${
                    isCodeMatched ? 'border-[#84CC16]' : 'border-[#202B1D]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono-tabular text-[11px] font-semibold text-[#84CC16]">
                          Kod: {cleanCode}
                        </span>
                        <h3 className="mt-0.5 font-display text-base font-bold text-[#F3F5F2]">
                          {bk.stayName}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveBooking(bk.id)}
                        aria-label="Usuń rezerwację"
                        className="text-[#7D857B] hover:text-[#FCA5A5] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="mt-1 text-[#9FA89D]">
                      {bk.address} · {bk.city}
                    </p>
                    <p className="mt-1 font-mono-tabular text-[#E2E7E0]">
                      Termin: {bk.checkIn} → {bk.checkOut} · Goście: {bk.guests}
                    </p>
                    <p className="mt-0.5 text-[#8C948A]">
                      Gość: {bk.guestName} ({bk.guestEmail})
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-[#151B14] pt-2.5">
                    <a
                      href={bk.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#84CC16] px-3 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E]"
                    >
                      <span>Dokończ na Booking.com</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {telHref && (
                      <a
                        href={`tel:${telHref}`}
                        onClick={() =>
                          onOpenDialer({
                            name: bk.stayName,
                            phone: telHref,
                            address: bk.address,
                          })
                        }
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#242D22] bg-[#111511] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16]"
                      >
                        <PhoneCall className="h-3 w-3 text-[#84CC16]" />
                        <span>Zadzwoń</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter Controls & Booking Parameters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#1A1E1A] bg-[#090B09] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label="Typ noclegów"
            className="flex flex-wrap gap-1.5"
          >
            {STAY_TYPES.map((t) => {
              const isActive = stayType === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => onSelectStayType(t.id)}
                  className={`min-h-[40px] rounded-lg px-3.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#84CC16] text-[#050505]'
                      : 'border border-[#1D221D] bg-[#0E110E] text-[#9BA399] hover:text-[#F3F5F2]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <label className="flex items-center gap-1.5 rounded-lg border border-[#1E241D] bg-[#050505] px-2.5 py-1.5 text-[#9FA89D]">
              <Calendar className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
              <span>Od:</span>
              <input
                type="date"
                min={todayIso}
                max={maxDateIso}
                value={checkIn}
                onChange={(e) => onChangeCheckIn(e.target.value)}
                className="bg-transparent font-mono-tabular text-xs text-[#F3F5F2] focus:outline-none [color-scheme:dark]"
              />
            </label>
            <label className="flex items-center gap-1.5 rounded-lg border border-[#1E241D] bg-[#050505] px-2.5 py-1.5 text-[#9FA89D]">
              <Calendar className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
              <span>Do:</span>
              <input
                type="date"
                min={checkIn || todayIso}
                max={maxDateIso}
                value={checkOut}
                onChange={(e) => onChangeCheckOut(e.target.value)}
                className="bg-transparent font-mono-tabular text-xs text-[#F3F5F2] focus:outline-none [color-scheme:dark]"
              />
            </label>
            <label className="flex items-center gap-1.5 rounded-lg border border-[#1E241D] bg-[#050505] px-2.5 py-1.5 text-[#9FA89D]">
              <Users className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
              <span>Goście:</span>
              <select
                value={guests}
                onChange={(e) => onChangeGuests(Number(e.target.value))}
                className="bg-[#050505] font-mono-tabular text-xs text-[#F3F5F2] focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Quick Current-Date Presets & Active Range Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#141814] pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#8C948A]">Szybkie daty:</span>
            <button
              type="button"
              onClick={() => {
                const { checkIn: dIn, checkOut: dOut } = getCurrentStayDates(0, 2);
                onApplyDatePreset(dIn, dOut);
              }}
              className="min-h-[30px] rounded-lg border border-[#222921] bg-[#101410] px-2.5 font-medium text-[#D9F99D] hover:border-[#84CC16] cursor-pointer"
            >
              Od dziś (2 noce)
            </button>
            <button
              type="button"
              onClick={() => {
                const { checkIn: dIn, checkOut: dOut } = getCurrentStayDates(1, 2);
                onApplyDatePreset(dIn, dOut);
              }}
              className="min-h-[30px] rounded-lg border border-[#222921] bg-[#101410] px-2.5 font-medium text-[#D1D7D0] hover:border-[#84CC16] cursor-pointer"
            >
              Od jutra
            </button>
            <button
              type="button"
              onClick={() => {
                const { checkIn: dIn, checkOut: dOut } = getNextWeekendDates();
                onApplyDatePreset(dIn, dOut);
              }}
              className="min-h-[30px] rounded-lg border border-[#222921] bg-[#101410] px-2.5 font-medium text-[#D1D7D0] hover:border-[#84CC16] cursor-pointer"
            >
              Weekend
            </button>
          </div>

          <span className="font-mono-tabular text-[#A3E635]">
            Wybrano: {formatPolishDateDisplay(checkIn)} → {formatPolishDateDisplay(checkOut)} ({nightsCount}{' '}
            {nightsCount === 1 ? 'noc' : nightsCount < 5 ? 'noce' : 'nocy'})
          </span>
        </div>

        {/* Connected Room Rental Portals for Selected Dates & Location */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#141814] pt-3">
          <span className="text-xs font-medium text-[#9FA89D]">
            Szukaj pokoi bezpośrednio w portalach ({activeSearchCity}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            <a
              href={portalBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#243022] bg-[#101610] px-3 text-xs font-semibold text-[#D9F99D] hover:border-[#84CC16]"
            >
              <span>Booking.com</span>
              <ExternalLink className="h-3 w-3 text-[#84CC16]" />
            </a>
            <a
              href={portalAirbnbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#243022] bg-[#101610] px-3 text-xs font-semibold text-[#D9F99D] hover:border-[#84CC16]"
            >
              <span>Airbnb</span>
              <ExternalLink className="h-3 w-3 text-[#84CC16]" />
            </a>
            <a
              href={portalHrsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#243022] bg-[#101610] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16]"
            >
              <span>HRS</span>
              <ExternalLink className="h-3 w-3 text-[#84CC16]" />
            </a>
            <a
              href={portalFewoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#243022] bg-[#101610] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16]"
            >
              <span>FeWo-direkt</span>
              <ExternalLink className="h-3 w-3 text-[#84CC16]" />
            </a>
            <a
              href={portalExpediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#243022] bg-[#101610] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16]"
            >
              <span>Expedia</span>
              <ExternalLink className="h-3 w-3 text-[#84CC16]" />
            </a>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="h-56 animate-pulse rounded-2xl border border-[#181C18] bg-[#0A0C0A] p-5"
            >
              <div className="h-5 w-2/3 rounded bg-[#161B16]" />
              <div className="mt-3 h-3 w-1/2 rounded bg-[#141814]" />
              <div className="mt-6 h-12 w-full rounded bg-[#121612]" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-[#3B1D1D] bg-[#130A0A] p-5 text-sm text-[#FCA5A5]">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
            <div>
              <p className="font-medium text-white">Nie udało się pobrać noclegów</p>
              <p className="mt-1 text-xs text-[#E5B4B4]">{error}</p>
              <button
                type="button"
                onClick={onRetrySearch}
                className="mt-3 min-h-[40px] rounded-lg border border-[#4C2424] bg-[#1F0F0F] px-4 text-xs font-semibold text-white hover:bg-[#2B1515] cursor-pointer"
              >
                Spróbuj ponownie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && !data && (
        <div className="rounded-2xl border border-[#1A1E1A] bg-[#0A0C0A] p-8 text-center">
          <p className="font-display text-base font-semibold text-[#F3F5F2]">
            Wpisz kod pocztowy lub miejscowość w dowolnym kraju albo użyj GPS
          </p>
          <p className="mt-1 text-xs text-[#8C948A]">
            Możesz też kliknąć „Zarezerwuj automatycznie”, aby Miękiszon od razu wybrał i przygotował najlepszy nocleg (dla Niemiec kody bez myślników).
          </p>
        </div>
      )}

      {/* Stays Grid — Pure Stays + Automatic Booking */}
      {!isLoading && !error && data?.validGermany && data.results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.results.map((stay) => {
            const telHref = sanitizePhoneForTel(stay.phone);
            return (
              <article
                key={stay.id || stay.name}
                className="flex flex-col justify-between rounded-2xl border border-[#1B211A] bg-[#0A0C0A] p-5 transition-colors hover:border-[#2C362A]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold text-[#F3F5F2]">
                      {stay.name}
                    </h3>
                    {stay.approxPriceEur && (
                      <span className="font-mono-tabular text-sm font-semibold text-[#84CC16] whitespace-nowrap">
                        {stay.approxPriceEur}
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#969F94]">
                    <span className="font-medium text-[#D0D7CE]">
                      {stay.stayTypeLabel || stay.stayType}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">
                      {stay.rating ? `Ocena ${stay.rating}` : 'Sprawdź oceny'}
                    </span>
                    {stay.distanceInfo && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{stay.distanceInfo}</span>
                      </>
                    )}
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-[#C7CFC5]">
                    {stay.highlight}
                  </p>

                  <div className="mt-3 flex items-start gap-2 text-xs text-[#8E978C]">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#65A30D]" />
                    <span>
                      {stay.address}
                      {stay.postalCode ? `, ${stay.postalCode}` : ''} {stay.city || ''}
                    </span>
                  </div>
                </div>

                {/* Automatic Booking + Portals & Phone Controls */}
                <div className="mt-5 space-y-2 border-t border-[#161A16] pt-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenAutoBookModal(stay)}
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-4 text-xs font-semibold text-[#050505] transition-colors hover:bg-[#9BE12E] whitespace-nowrap cursor-pointer"
                    >
                      <Zap className="h-4 w-4" aria-hidden="true" />
                      <span>Rezerwuj automatycznie</span>
                    </button>

                    <a
                      href={stay.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#232922] bg-[#111411] px-3.5 text-xs font-medium text-[#E2E7E0] hover:border-[#65A30D] hover:text-white whitespace-nowrap"
                    >
                      <BedDouble className="h-3.5 w-3.5 text-[#84CC16]" />
                      <span>Booking</span>
                    </a>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={stay.airbnbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#232922] bg-[#111411] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#65A30D] whitespace-nowrap"
                    >
                      <span>Airbnb</span>
                      <ExternalLink className="h-3 w-3 text-[#84CC16]" />
                    </a>

                    <a
                      href={
                        stay.hrsUrl ||
                        buildHrsDeepLink(
                          stay.name,
                          stay.city || activeSearchCity,
                          checkIn,
                          checkOut,
                          guests
                        )
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#232922] bg-[#111411] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#65A30D] whitespace-nowrap"
                    >
                      <span>HRS</span>
                      <ExternalLink className="h-3 w-3 text-[#84CC16]" />
                    </a>

                    <a
                      href={
                        stay.fewoUrl ||
                        buildFewoDeepLink(
                          stay.city || activeSearchCity,
                          checkIn,
                          checkOut,
                          guests
                        )
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#232922] bg-[#111411] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#65A30D] whitespace-nowrap"
                    >
                      <span>FeWo</span>
                      <ExternalLink className="h-3 w-3 text-[#84CC16]" />
                    </a>

                    <a
                      href={
                        stay.expediaUrl ||
                        buildExpediaDeepLink(
                          stay.name,
                          stay.city || activeSearchCity,
                          checkIn,
                          checkOut,
                          guests
                        )
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#232922] bg-[#111411] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#65A30D] whitespace-nowrap"
                    >
                      <span>Expedia</span>
                      <ExternalLink className="h-3 w-3 text-[#84CC16]" />
                    </a>

                    {telHref && (
                      <a
                        href={`tel:${telHref}`}
                        onClick={() =>
                          onOpenDialer({
                            name: stay.name,
                            phone: telHref,
                            address: `${stay.address}, ${stay.postalCode} ${stay.city}`,
                          })
                        }
                        className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#232922] bg-[#111411] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16] whitespace-nowrap"
                      >
                        <PhoneCall className="h-3.5 w-3.5 text-[#84CC16]" />
                        <span className="font-mono-tabular">Zadzwoń</span>
                      </a>
                    )}

                    <a
                      href={stay.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#232922] bg-[#111411] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#65A30D] whitespace-nowrap"
                    >
                      <MapPin className="h-3.5 w-3.5 text-[#84CC16]" />
                      <span>Mapa</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Grounding Sources */}
      {!isLoading && data?.groundingLinks && data.groundingLinks.length > 0 && (
        <div className="rounded-2xl border border-[#161A16] bg-[#070807] p-4">
          <p className="text-xs font-medium text-[#7D857B]">
            Źródła Google Maps i wyszukiwarki:
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {data.groundingLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#9DC85B] underline decoration-[#3A4D22] underline-offset-4 hover:text-[#B8EA6B]"
                >
                  <span>{link.title}</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
