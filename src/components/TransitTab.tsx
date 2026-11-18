import React, { useMemo, useState } from 'react';
import {
  Train,
  Bus,
  Fuel,
  Car,
  Search,
  ExternalLink,
  MapPin,
  Clock,
  AlertCircle,
  Maximize2,
  Route,
  Navigation,
} from 'lucide-react';
import { TransitMode, TransitSearchResponse } from '../types';
import { FuelPriceChart, parseFuelPriceEur } from './FuelPriceChart';
import { PlacesMapPanel } from './PlacesMapPanel';
import { CarRouteMapPanel } from './CarRouteMapPanel';
import { buildGoogleMapsDrivingRouteUrl } from '../utils/location';

interface TransitTabProps {
  mode: TransitMode;
  onSelectMode: (mode: TransitMode) => void;
  fromInput: string;
  toInput: string;
  onChangeFrom: (val: string) => void;
  onChangeTo: (val: string) => void;
  onSearch: () => void;
  data: TransitSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  coordinates?: { lat: number; lng: number };
  globalLocationInput: string;
  hasMapsProvider: boolean;
  onUseMyLocation?: () => void;
  onQuickFuelNearby?: () => void;
  isLocating?: boolean;
  onOpenDetached?: () => void;
}

const TRANSIT_MODES: { id: TransitMode; label: string; icon: React.ReactNode }[] = [
  { id: 'trains', label: 'Pociągi', icon: <Train className="h-3.5 w-3.5" /> },
  { id: 'sbahn', label: 'S-Bahn', icon: <Train className="h-3.5 w-3.5" /> },
  { id: 'buses', label: 'Autobusy', icon: <Bus className="h-3.5 w-3.5" /> },
  { id: 'car', label: 'Jazda samochodem', icon: <Car className="h-3.5 w-3.5" /> },
  { id: 'fuel', label: 'Ceny paliw', icon: <Fuel className="h-3.5 w-3.5" /> },
];

export const TransitTab: React.FC<TransitTabProps> = ({
  mode,
  onSelectMode,
  fromInput,
  toInput,
  onChangeFrom,
  onChangeTo,
  onSearch,
  data,
  isLoading,
  error,
  coordinates,
  globalLocationInput,
  hasMapsProvider,
  onUseMyLocation,
  onQuickFuelNearby,
  isLocating,
  onOpenDetached,
}) => {
  const [routeSearchNonce, setRouteSearchNonce] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRouteSearchNonce((n) => n + 1);
    onSearch();
  };

  const cheapestStationKey = useMemo(() => {
    if (!data || data.mode !== 'fuel' || data.fuelStations.length === 0) return null;
    let bestKey: string | null = null;
    let bestPrice = Infinity;
    for (const s of data.fuelStations) {
      const prices = [
        parseFuelPriceEur(s.e10Eur),
        parseFuelPriceEur(s.dieselEur),
        parseFuelPriceEur(s.e5Eur),
      ].filter((v): v is number => v !== null);
      if (prices.length === 0) continue;
      const minForStation = Math.min(...prices);
      if (minForStation < bestPrice) {
        bestPrice = minForStation;
        bestKey = s.id || s.stationName;
      }
    }
    return bestKey;
  }, [data]);

  const customFromTyped =
    Boolean(fromInput.trim()) &&
    fromInput.trim().toLowerCase() !== globalLocationInput.trim().toLowerCase();
  const effectiveMapQuery = fromInput.trim() || globalLocationInput.trim();
  const directCarMapsUrl = buildGoogleMapsDrivingRouteUrl(
    effectiveMapQuery,
    toInput.trim() || 'Berlin'
  );

  return (
    <div className="space-y-6">
      {/* Mode Selector & Quick Nearby Fuel Switcher */}
      <div className="space-y-4 rounded-2xl border border-[#1A1E1A] bg-[#090B09] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label="Tryb przejazdów i tras"
            className="flex flex-wrap gap-1.5"
          >
            {TRANSIT_MODES.map((m) => {
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => onSelectMode(m.id)}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#84CC16] text-[#050505]'
                      : 'border border-[#1D221D] bg-[#0E110E] text-[#9BA399] hover:text-[#F3F5F2]'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onQuickFuelNearby && (
              <button
                type="button"
                onClick={onQuickFuelNearby}
                disabled={isLocating || isLoading}
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 ${
                  mode === 'fuel'
                    ? 'border-[#84CC16] bg-[#162212] text-[#D9F99D]'
                    : 'border-[#2B3726] bg-[#0E140D] text-[#B8EA6B] hover:border-[#84CC16]'
                }`}
              >
                <Fuel className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
                <span>
                  {isLocating
                    ? 'Namierzam lokalizację...'
                    : 'Ceny paliw w okolicy (GPS)'}
                </span>
              </button>
            )}

            {onOpenDetached && (
              <button
                type="button"
                onClick={onOpenDetached}
                className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl border border-[#252D24] bg-[#111511] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16] cursor-pointer whitespace-nowrap"
              >
                <Maximize2 className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
                <span>Osobne okno</span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex flex-1 items-center">
            {mode !== 'fuel' && (
              <span className="pointer-events-none absolute left-3 text-[11px] font-semibold uppercase tracking-wide text-[#84CC16]">
                z
              </span>
            )}
            <input
              type="text"
              value={fromInput}
              onChange={(e) => onChangeFrom(e.target.value)}
              placeholder={
                mode === 'fuel'
                  ? 'Kod pocztowy lub miasto (dowolny kraj, domyślnie GPS)'
                  : mode === 'sbahn'
                    ? 'Stacja S-Bahn lub kod pocztowy (np. Berlin 10115, München)'
                    : mode === 'car'
                      ? 'np. 10115 DE, 00-001 PL lub GPS'
                      : 'Punkt początkowy lub kod pocztowy (domyślnie GPS)'
              }
              aria-label={mode === 'fuel' ? 'Lokalizacja stacji paliw' : 'Punkt początkowy z'}
              className={`min-h-[42px] w-full rounded-xl border border-[#1E241D] bg-[#050505] pr-3.5 text-xs text-[#F3F5F2] placeholder-[#6B7369] focus:border-[#84CC16] focus:outline-none ${
                mode !== 'fuel' ? 'pl-7' : 'pl-3.5'
              }`}
            />
          </div>

          {mode !== 'fuel' && (
            <div className="relative flex flex-1 items-center">
              <span className="pointer-events-none absolute left-3 text-[11px] font-semibold uppercase tracking-wide text-[#38BDF8]">
                do
              </span>
              <input
                type="text"
                value={toInput}
                onChange={(e) => onChangeTo(e.target.value)}
                placeholder={
                  mode === 'sbahn'
                    ? 'Stacja docelowa S-Bahn (np. Alexanderplatz, Ostbahnhof)'
                    : mode === 'car'
                      ? 'np. Monachium, Warszawa, Praga, 75001'
                      : 'Cel podróży lub kod pocztowy'
                }
                aria-label="Punkt docelowy do"
                className="min-h-[42px] w-full rounded-xl border border-[#1E241D] bg-[#050505] pl-9 pr-3.5 text-xs text-[#F3F5F2] placeholder-[#6B7369] focus:border-[#84CC16] focus:outline-none"
              />
            </div>
          )}

          {onUseMyLocation && (
            <button
              type="button"
              onClick={onUseMyLocation}
              disabled={isLocating || isLoading}
              className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#232922] bg-[#101310] px-3.5 text-xs font-medium text-[#D1D7D0] hover:border-[#84CC16] hover:text-white disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Navigation className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
              <span>{isLocating ? 'GPS...' : 'Użyj GPS'}</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-5 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {isLoading
                ? 'Sprawdzam...'
                : mode === 'fuel'
                  ? 'Sprawdź ceny paliw'
                  : mode === 'car'
                    ? 'Wyznacz trasę'
                    : 'Sprawdź rozkład'}
            </span>
          </button>
        </form>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="h-44 animate-pulse rounded-2xl border border-[#181C18] bg-[#0A0C0A] p-5"
            >
              <div className="h-4 w-1/2 rounded bg-[#161B16]" />
              <div className="mt-3 h-3 w-2/3 rounded bg-[#141814]" />
              <div className="mt-6 h-10 w-full rounded bg-[#121612]" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-[#3B1D1D] bg-[#130A0A] p-5 text-sm text-[#FCA5A5]">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
            <div>
              <p className="font-medium text-white">Błąd pobierania danych na żywo</p>
              <p className="mt-1 text-xs text-[#E5B4B4]">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Car Driving Routes Results */}
      {!isLoading && !error && data && data.mode === 'car' && (
        <div className="space-y-4">
          {data.carRoutes && data.carRoutes.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.carRoutes.map((route) => (
                <article
                  key={route.id || route.routeName}
                  className="flex flex-col justify-between rounded-2xl border border-[#1B211A] bg-[#0A0C0A] p-5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-[#84CC16]">
                          Trasa samochodowa · {route.highways}
                        </p>
                        <h3 className="mt-1 font-display text-lg font-bold text-[#F3F5F2]">
                          {route.routeName}
                        </h3>
                      </div>
                      <span className="font-mono-tabular text-sm font-bold text-[#A3E635] whitespace-nowrap">
                        {route.distanceKm}
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#969F94]">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#E2E7E0]">
                        <Clock className="h-3.5 w-3.5 text-[#84CC16]" />
                        {route.durationText}
                      </span>
                      {route.estimatedFuelCostEur && (
                        <span>Paliwo ok. {route.estimatedFuelCostEur}</span>
                      )}
                    </div>

                    {route.trafficNote && (
                      <p className="mt-2 rounded-lg border border-[#242D20] bg-[#0E130D] px-3 py-1.5 text-xs text-[#D9F99D]">
                        Ruch na trasie: {route.trafficNote}
                      </p>
                    )}

                    <p className="mt-3 text-sm leading-relaxed text-[#C7CFC5]">
                      {route.stepsSummary}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end border-t border-[#161A16] pt-3">
                    <a
                      href={route.directionsUrl || directCarMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-4 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E]"
                    >
                      <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Uruchom nawigację w Google Maps</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1A1E1A] bg-[#0A0C0A] p-5 text-sm text-[#9BA399]">
              <span>Wyznacz bezpośrednią trasę samochodową w Google Maps.</span>
              <a
                href={directCarMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#84CC16] px-4 text-xs font-semibold text-[#050505]"
              >
                <Route className="h-3.5 w-3.5" />
                <span>Otwórz trasę w Google Maps</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Fuel Stations Results + Recharts Comparison Chart */}
      {!isLoading && !error && data && data.mode === 'fuel' && (
        <div className="space-y-4">
          {data.fuelStations.length > 0 ? (
            <>
              <FuelPriceChart stations={data.fuelStations} />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {data.fuelStations.map((station) => {
                  const key = station.id || station.stationName;
                  const isCheapest = cheapestStationKey === key;
                  return (
                    <article
                      key={key}
                      className={`flex flex-col justify-between rounded-2xl border bg-[#0A0C0A] p-5 ${
                        isCheapest ? 'border-[#84CC16]/50' : 'border-[#1B211A]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-[#84CC16]">
                              {station.brand}
                              {isCheapest && (
                                <span className="text-[#D9F99D]"> · Najtaniej w okolicy</span>
                              )}
                            </p>
                            <h3 className="mt-0.5 font-display text-lg font-semibold text-[#F3F5F2]">
                              {station.stationName}
                            </h3>
                          </div>
                          <span className="text-xs text-[#8C948A]">
                            {station.distanceInfo}
                          </span>
                        </div>

                        <div className="mt-3 flex items-start gap-2 text-xs text-[#969F94]">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#65A30D]" />
                          <span>{station.address}</span>
                        </div>

                        {/* Tabular Fuel Prices */}
                        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-[#161B15] bg-[#060706] p-3 text-center">
                          <div>
                            <p className="text-[11px] text-[#7D857B]">Diesel</p>
                            <p className="mt-0.5 font-mono-tabular text-sm font-semibold text-[#38BDF8]">
                              {station.dieselEur || '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-[#7D857B]">Super E5</p>
                            <p className="mt-0.5 font-mono-tabular text-sm font-semibold text-[#F59E0B]">
                              {station.e5Eur || '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-[#7D857B]">Super E10</p>
                            <p className="mt-0.5 font-mono-tabular text-sm font-semibold text-[#84CC16]">
                              {station.e10Eur || '—'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#161A16] pt-3 text-xs">
                        <span className="text-[#7D857B]">{station.updatedNote}</span>
                        <a
                          href={station.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#232922] bg-[#111411] px-3 font-medium text-[#E2E7E0] hover:border-[#84CC16]"
                        >
                          <span>Nawiguj</span>
                          <ExternalLink className="h-3 w-3 text-[#84CC16]" />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-[#1A1E1A] bg-[#0A0C0A] p-6 text-sm text-[#9BA399]">
              Brak aktualnych danych ze stacji paliw dla tego zapytania.
            </div>
          )}
        </div>
      )}

      {/* Trains, S-Bahn & Buses Results */}
      {!isLoading &&
        !error &&
        data &&
        (data.mode === 'trains' || data.mode === 'sbahn' || data.mode === 'buses') && (
        <div className="space-y-4">
          {data.connections.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.connections.map((conn) => (
                <article
                  key={conn.id || `${conn.lineOrTrain}-${conn.departure}`}
                  className="flex flex-col justify-between rounded-2xl border border-[#1B211A] bg-[#0A0C0A] p-5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-[#84CC16]">
                          {conn.operator} · {conn.lineOrTrain}
                        </p>
                        <div className="mt-1 flex items-center gap-2 font-mono-tabular text-xl font-semibold text-[#F3F5F2]">
                          <span>{conn.departure}</span>
                          <span aria-hidden="true" className="text-[#4F574D]">
                            →
                          </span>
                          <span>{conn.arrival}</span>
                        </div>
                      </div>
                      {conn.priceInfo && (
                        <span className="font-mono-tabular text-sm font-semibold text-[#A3E635]">
                          {conn.priceInfo}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#969F94]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#65A30D]" />
                        {conn.duration}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{conn.statusNote}</span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-[#C7CFC5]">
                      {conn.details}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end border-t border-[#161A16] pt-3">
                    <a
                      href={conn.bookingOrScheduleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#84CC16] px-4 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E]"
                    >
                      <span>Sprawdź na żywo / Bilet</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#1A1E1A] bg-[#0A0C0A] p-6 text-sm text-[#9BA399]">
              Brak znalezionych połączeń dla podanej trasy.
            </div>
          )}
        </div>
      )}

      {/* Initial Empty State */}
      {!isLoading && !error && !data && (
        <div className="rounded-2xl border border-[#1A1E1A] bg-[#0A0C0A] p-8 text-center">
          <p className="font-display text-base font-semibold text-[#F3F5F2]">
            Sprawdź rozkład jazdy, trasę samochodem lub ceny paliw
          </p>
          <p className="mt-1 text-xs text-[#8C948A]">
            Wybierz tryb powyżej, wpisz punkt początkowy i cel, albo uruchom nawigację Google Maps.
          </p>
        </div>
      )}

      {/* Interactive Google Maps Panel: Driving Route (z -> do) or Nearby Stations */}
      {(mode === 'car' || (mode !== 'fuel' && Boolean(toInput.trim()))) ? (
        <CarRouteMapPanel
          fromText={effectiveMapQuery}
          toText={toInput}
          coordinates={coordinates}
          customFromTyped={customFromTyped}
          hasMapsProvider={hasMapsProvider}
          searchNonce={routeSearchNonce}
        />
      ) : (
        <PlacesMapPanel
          mode={mode}
          coordinates={customFromTyped ? undefined : coordinates}
          locationQuery={effectiveMapQuery}
          hasMapsProvider={hasMapsProvider}
        />
      )}

      {/* Grounding Links */}
      {!isLoading && data?.groundingLinks && data.groundingLinks.length > 0 && (
        <div className="rounded-2xl border border-[#161A16] bg-[#070807] p-4">
          <p className="text-xs font-medium text-[#7D857B]">
            Źródła rozkładów, tras i cen na żywo:
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
