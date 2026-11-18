import React, { useState } from 'react';
import {
  PhoneCall,
  MapPin,
  Clock,
  ExternalLink,
  Mail,
  AlertCircle,
  Navigation,
  Route,
  Star,
  Map as MapIcon,
  ArrowLeft,
} from 'lucide-react';
import {
  DialTarget,
  FoodCategory,
  FoodSearchResponse,
} from '../types';
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsSearchUrl,
  sanitizePhoneForTel,
} from '../utils/location';
import { PlacesMapPanel } from './PlacesMapPanel';
import foodBannerImg from '../assets/images/food_pizza_kebab_banner_1795024200178.jpg';

interface FoodTabProps {
  category: FoodCategory;
  onSelectCategory: (cat: FoodCategory) => void;
  locationInput: string;
  onLocationInputChange: (val: string) => void;
  onSearchByLocation: () => void;
  onUseMyLocation: () => void;
  hasGpsLock: boolean;
  isLocating: boolean;
  coordinates?: { lat: number; lng: number };
  hasMapsProvider: boolean;
  data: FoodSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  onOpenDialer: (target: DialTarget) => void;
  onRetrySearch: () => void;
  onCloseTab?: () => void;
}

const FOOD_CATEGORIES: { id: FoodCategory; label: string }[] = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'doner', label: 'Döner / Kebab' },
  { id: 'pizza', label: 'Pizza' },
  { id: 'chinese', label: 'Chińskie jedzenie' },
  { id: 'near_post', label: 'W pobliżu poczty' },
];

export const FoodTab: React.FC<FoodTabProps> = ({
  category,
  onSelectCategory,
  locationInput,
  onLocationInputChange,
  onSearchByLocation,
  onUseMyLocation,
  hasGpsLock,
  isLocating,
  coordinates,
  hasMapsProvider,
  data,
  isLoading,
  error,
  onOpenDialer,
  onRetrySearch,
  onCloseTab,
}) => {
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  return (
    <div className="space-y-5">
      {/* Compact Mixed Pizza & Döner Kebab Banner */}
      <section
        aria-label="Baner Pizza i Döner Kebab"
        className="relative h-28 sm:h-36 w-full overflow-hidden rounded-2xl border border-[#1B211A] bg-[#090B09]"
      >
        {!bannerError ? (
          <img
            src={foodBannerImg}
            alt="Pizza i döner kebab — wyszukiwarka restauracji po kodzie pocztowym"
            referrerPolicy="no-referrer"
            onError={() => setBannerError(true)}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full bg-[radial-gradient(circle_at_75%_50%,rgba(132,204,22,0.18),transparent_60%),#090B09]"
          />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/70 to-[#050505]/20"
        />
        <div className="relative z-10 flex h-full flex-col justify-center px-5 sm:px-7 max-w-xl">
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#F3F5F2] text-balance">
            Pizza, Döner i restauracje w pobliżu
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#C7D0C5]">
            Wyszukiwanie lokali w dowolnym kraju po kodzie pocztowym lub GPS (Niemcy bez myślników).
          </p>
        </div>
      </section>

      {/* Pure Food Search Bar */}
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
            placeholder="Kod pocztowy lub miasto w dowolnym kraju (np. 10115 DE, 00-001 PL)"
            aria-label="Lokalizacja do wyszukania restauracji"
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
            type="button"
            onClick={() => setShowInteractiveMap((v) => !v)}
            className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border px-3.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
              showInteractiveMap
                ? 'border-[#84CC16] bg-[#141E11] text-[#D9F99D]'
                : 'border-[#232922] bg-[#101310] text-[#D1D7D0] hover:border-[#84CC16]'
            }`}
          >
            <MapIcon className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
            <span>{showInteractiveMap ? 'Ukryj mapę' : 'Mapa Google'}</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || (!locationInput.trim() && !hasGpsLock)}
            className="inline-flex min-h-[42px] items-center justify-center rounded-xl bg-[#84CC16] px-4 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E] disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            Szukaj jedzenia
          </button>
        </div>
      </form>

      {/* Interactive Google Maps Restaurant Overlay (when toggled) */}
      {showInteractiveMap && (
        <PlacesMapPanel
          mode="food"
          coordinates={coordinates}
          locationQuery={locationInput}
          hasMapsProvider={hasMapsProvider}
        />
      )}

      {/* Category Segmented Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Kategorie jedzenia"
          className="flex flex-wrap gap-1.5 rounded-xl border border-[#1A1E1A] bg-[#090B09] p-1.5"
        >
          {FOOD_CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`min-h-[40px] rounded-lg px-3.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#84CC16] text-[#050505]'
                    : 'text-[#9BA399] hover:bg-[#141814] hover:text-[#F3F5F2]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {data?.resolvedLocation && data.validGermany && (
            <p className="text-xs text-[#8C948A]">
              Restauracje dla:{' '}
              <span className="font-medium text-[#F3F5F2]">{data.resolvedLocation}</span>
            </p>
          )}
          {onCloseTab && (
            <button
              type="button"
              onClick={onCloseTab}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#252D24] bg-[#101410] px-3 text-xs font-semibold text-[#D9F99D] transition-colors hover:border-[#84CC16] hover:bg-[#172115] whitespace-nowrap cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
              <span>Wróć / Zamknij</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="h-52 animate-pulse rounded-2xl border border-[#181C18] bg-[#0A0C0A] p-5"
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
            <div className="flex-1">
              <p className="font-medium text-white">Nie udało się pobrać restauracji</p>
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

      {/* Nearest Post Office Card (when near_post is active) */}
      {!isLoading && !error && data?.validGermany && data.postOffice && (
        <div className="rounded-2xl border border-[#2A3526] bg-[#0B0F0A] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-[#84CC16]">
                Najbliższa placówka pocztowa
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold text-[#F3F5F2]">
                {data.postOffice.name}
              </h3>
              <p className="mt-0.5 text-xs text-[#9FA89D]">
                {data.postOffice.address} ·{' '}
                <span className="font-mono-tabular">{data.postOffice.postalCode}</span>{' '}
                {data.postOffice.city}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#C7D0C5]">
              <Mail className="h-4 w-4 text-[#84CC16]" aria-hidden="true" />
              <span>{data.postOffice.distanceNote}</span>
            </div>
          </div>
        </div>
      )}

      {/* Results Grid — Pure Restaurant Cards with Google Maps + Phone Ordering */}
      {!isLoading && !error && data?.validGermany && data.results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.results.map((item) => {
            const telHref = sanitizePhoneForTel(item.phone);
            const fullAddress = `${item.address}${item.postalCode ? `, ${item.postalCode}` : ''} ${
              item.city || ''
            }`.trim();
            const mapHref =
              item.mapsUrl || buildGoogleMapsSearchUrl(`${item.name} ${fullAddress}`.trim());
            const directionsHref = buildGoogleMapsDirectionsUrl(
              `${item.name}, ${fullAddress}`.trim()
            );

            return (
              <article
                key={item.id || item.name}
                className="flex flex-col justify-between rounded-2xl border border-[#1E251D] bg-[#0A0C0A] p-5 transition-colors hover:border-[#344230]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-[#84CC16]">
                        {item.categoryLabel || item.category}
                      </span>
                      <h3 className="mt-1 font-display text-xl font-bold leading-snug text-[#F3F5F2]">
                        {item.name}
                      </h3>
                    </div>

                    {item.rating ? (
                      <div className="flex shrink-0 flex-col items-end rounded-xl border border-[#242D22] bg-[#101510] px-2.5 py-1.5 text-right">
                        <span className="inline-flex items-center gap-1 font-mono-tabular text-sm font-bold text-[#F3F5F2]">
                          <Star className="h-3.5 w-3.5 fill-[#84CC16] text-[#84CC16]" aria-hidden="true" />
                          {item.rating.toFixed(1)}
                        </span>
                        {item.reviewCount ? (
                          <span className="font-mono-tabular text-[10px] text-[#8C948A]">
                            {item.reviewCount.toLocaleString('pl-PL')} opinii
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {item.highlight && (
                    <p className="mt-2.5 text-sm leading-relaxed text-[#D0D7CE]">
                      {item.highlight}
                    </p>
                  )}

                  <div className="mt-4 space-y-2 rounded-xl border border-[#171C16] bg-[#060706] p-3.5 text-xs">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#84CC16]" aria-hidden="true" />
                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#7D857B]">
                          Adres lokalu
                        </span>
                        <span className="text-sm font-medium text-[#F3F5F2]">
                          {fullAddress}
                        </span>
                      </div>
                    </div>

                    {item.openingHours && (
                      <div className="flex items-start gap-2.5 border-t border-[#121611] pt-2">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#84CC16]" aria-hidden="true" />
                        <div>
                          <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#7D857B]">
                            Godziny otwarcia
                          </span>
                          <span className="text-xs text-[#E2E7E0]">{item.openingHours}</span>
                        </div>
                      </div>
                    )}

                    {(telHref || item.priceLevel) && (
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#121611] pt-2">
                        {telHref && (
                          <div className="flex items-center gap-2">
                            <PhoneCall className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
                            <span className="font-mono-tabular font-semibold text-[#E5EAE4]">
                              {telHref}
                            </span>
                          </div>
                        )}
                        {item.priceLevel && (
                          <span className="text-xs font-medium text-[#969F94]">
                            Ceny: {item.priceLevel}
                          </span>
                        )}
                      </div>
                    )}

                    {item.nearPostNote && (
                      <div className="flex items-start gap-2 border-t border-[#121611] pt-2 text-[#A3E635]">
                        <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{item.nearPostNote}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pure Restaurant Actions: Phone Order + Google Maps + Directions */}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#161A16] pt-4">
                  {telHref ? (
                    <a
                      href={`tel:${telHref}`}
                      onClick={() =>
                        onOpenDialer({
                          name: item.name,
                          phone: telHref,
                          address: fullAddress,
                        })
                      }
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-4 text-xs font-semibold text-[#050505] transition-colors hover:bg-[#9BE12E] whitespace-nowrap"
                    >
                      <PhoneCall className="h-4 w-4" aria-hidden="true" />
                      <span>Zamów telefonicznie</span>
                    </a>
                  ) : (
                    <span className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[#1B201A] bg-[#0E110E] px-3 text-xs text-[#6B7369] whitespace-nowrap">
                      Brak numeru telefonu
                    </span>
                  )}

                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#252D24] bg-[#111511] px-3.5 text-xs font-semibold text-[#F3F5F2] transition-colors hover:border-[#84CC16] hover:text-[#84CC16] whitespace-nowrap"
                  >
                    <MapPin className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
                    <span>Google Maps</span>
                  </a>

                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#2C3A27] bg-[#131C10] px-3.5 text-xs font-semibold text-[#D9F99D] transition-colors hover:border-[#84CC16] hover:bg-[#1A2616] whitespace-nowrap"
                  >
                    <Route className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
                    <span>Dojazd</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!data || (data.validGermany && data.results.length === 0)) && (
        <div className="rounded-2xl border border-[#1A1E1A] bg-[#0A0C0A] p-8 text-center">
          <p className="font-display text-base font-semibold text-[#F3F5F2]">
            Włącz GPS lub wpisz kod pocztowy albo miasto w dowolnym kraju
          </p>
          <p className="mt-1 text-xs text-[#8C948A]">
            Wyszukaj restauracje Döner, Pizza, Chińskie jedzenie lub lokale w pobliżu poczty (niemieckie kody bez myślników).
          </p>
          <button
            type="button"
            onClick={onUseMyLocation}
            className="mt-4 inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#84CC16] px-4 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E] cursor-pointer"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            <span>Wyszukaj w mojej lokalizacji</span>
          </button>
        </div>
      )}

      {/* Grounding Links */}
      {!isLoading && data?.groundingLinks && data.groundingLinks.length > 0 && (
        <div className="rounded-2xl border border-[#161A16] bg-[#070807] p-4">
          <p className="text-xs font-medium text-[#7D857B]">
            Zweryfikowane źródła Google Maps i wyszukiwarki:
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
