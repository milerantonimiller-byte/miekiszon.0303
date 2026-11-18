import React, { useEffect, useState } from 'react';
import {
  Globe,
  MapPin,
  Route,
  ExternalLink,
  PhoneCall,
  X,
  AlertCircle,
  Loader2,
  Search,
  BookOpen,
  ArrowLeft,
  Volume2,
  Newspaper,
} from 'lucide-react';
import {
  AssistantLanguage,
  BrowserArticleData,
  DialTarget,
  WebSearchResponse,
  WebSearchResultItem,
} from '../types';
import { buildGoogleMapsDirectionsUrl, sanitizePhoneForTel } from '../utils/location';

interface WebSearchResultsPanelProps {
  language?: AssistantLanguage;
  isBrowserOpen?: boolean;
  data: WebSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  activeArticle?: BrowserArticleData | null;
  isArticleLoading?: boolean;
  articleError?: string | null;
  onSearchQuery?: (query: string) => void;
  onOpenArticle?: (item: WebSearchResultItem, readAloud?: boolean) => void;
  onCloseArticle?: () => void;
  onReadArticleAloud?: (article: BrowserArticleData) => void;
  onOpenExternalChrome?: (query?: string) => void;
  onClose: () => void;
  onOpenDialer: (target: DialTarget) => void;
}

export const WebSearchResultsPanel: React.FC<WebSearchResultsPanelProps> = ({
  language = 'pl',
  isBrowserOpen = false,
  data,
  isLoading,
  error,
  activeArticle = null,
  isArticleLoading = false,
  articleError = null,
  onSearchQuery,
  onOpenArticle,
  onCloseArticle,
  onReadArticleAloud,
  onOpenExternalChrome,
  onClose,
  onOpenDialer,
}) => {
  const isDe = language === 'de';
  const [addressQuery, setAddressQuery] = useState(data?.query || '');

  useEffect(() => {
    if (data?.query) {
      setAddressQuery(data.query);
    }
  }, [data?.query]);

  if (!isBrowserOpen && !isLoading && !error && !data && !activeArticle && !isArticleLoading) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = addressQuery.trim();
    if (!q || !onSearchQuery) return;
    onSearchQuery(q);
  };

  return (
    <section
      aria-label={isDe ? 'Sprachgesteuerter Browser und Artikel' : 'Przeglądarka głosowa i artykuły'}
      className="rounded-2xl border border-[#283525] bg-[#090C09] p-4 sm:p-5 space-y-4"
    >
      {/* Browser Top Chrome */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#182017] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#2D3B27] bg-[#121910]">
            <Globe className="h-4 w-4 text-[#84CC16]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-[#F3F5F2] sm:text-lg">
              {isDe ? 'Browser & Artikelsuche' : 'Przeglądarka i Wyszukiwarka Artykułów'}
            </h2>
            <p className="text-[11px] text-[#8E968C]">
              {isDe
                ? 'Steuerung per Stimme: „Suche Artikel über…“, „Öffne ersten Artikel“, „Schließe Browser“'
                : 'Sterowanie głosowe: „Wyszukaj artykuły o…”, „Otwórz pierwszy artykuł”, „Wyłącz przeglądarkę”'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenExternalChrome && (
            <button
              type="button"
              onClick={() => onOpenExternalChrome(data?.query || addressQuery.trim() || undefined)}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[#242C23] bg-[#101410] px-3 text-xs font-medium text-[#D6DDD3] hover:border-[#84CC16] cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
              <span>{isDe ? 'In Chrome öffnen' : 'Otwórz w Chrome'}</span>
            </button>
          )}

          {data?.primaryRedirectUrl && !isLoading && (
            <a
              href={data.primaryRedirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-[#84CC16] px-3 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E] whitespace-nowrap"
            >
              <span>{isDe ? 'Zur Quelle' : 'Przejdź na stronę'}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label={isDe ? 'Browser schließen' : 'Wyłącz przeglądarkę'}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[#3B1D1D] bg-[#160B0B] px-3 text-xs font-semibold text-[#FCA5A5] hover:bg-[#231010] cursor-pointer whitespace-nowrap"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isDe ? 'Browser aus' : 'Wyłącz przeglądarkę'}</span>
          </button>
        </div>
      </div>

      {/* Browser Address / Article Search Bar */}
      {onSearchQuery && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D857B]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              placeholder={
                isDe
                  ? 'Artikel, Nachrichten oder Thema eingeben oder per Stimme nennen...'
                  : 'Wpisz temat artykułu, hasło lub powiedz głosowo „Wyszukaj artykuły o...”'
              }
              className="min-h-[40px] w-full rounded-xl border border-[#232C22] bg-[#050705] pl-9 pr-3 text-xs text-[#F3F5F2] placeholder-[#6B7369] focus:border-[#84CC16] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !addressQuery.trim()}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl bg-[#84CC16] px-4 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E] disabled:opacity-50 cursor-pointer"
          >
            <span>{isDe ? 'Suchen' : 'Szukaj'}</span>
          </button>
        </form>
      )}

      {/* Browser Home Empty State when opened cleanly by voice before first query */}
      {isBrowserOpen && !isLoading && !error && !data && !activeArticle && !isArticleLoading && (
        <div className="rounded-xl border border-[#1B231A] bg-[#060806] p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D9F99D]">
            <Newspaper className="h-4 w-4 text-[#84CC16]" aria-hidden="true" />
            <span>
              {isDe
                ? 'Browser ist bereit. Sag einfach, wonach ich suchen soll:'
                : 'Przeglądarka jest włączona i gotowa. Powiedz czego szukać, np.:'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(isDe
              ? [
                  'Aktuelle Nachrichten Deutschland',
                  'Neue Technologie & KI Artikel',
                  'Wettervorhersage Berlin',
                ]
              : [
                  'Najnowsze wiadomości ze świata technologii',
                  'Artykuły o sztucznej inteligencji',
                  'Aktualne wydarzenia w Polsce i Niemczech',
                ]
            ).map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setAddressQuery(sample);
                  onSearchQuery?.(sample);
                }}
                className="rounded-lg border border-[#242E22] bg-[#0D110D] px-3 py-1.5 text-xs text-[#C7D0C5] hover:border-[#84CC16] hover:text-white cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Article Reader View */}
      {(isArticleLoading || activeArticle || articleError) && (
        <div className="rounded-xl border border-[#263423] bg-[#060806] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#182017] pb-2.5">
            <button
              type="button"
              onClick={onCloseArticle}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#242C23] bg-[#101410] px-2.5 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16] cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#84CC16]" />
              <span>{isDe ? 'Zurück zu den Ergebnissen' : 'Wróć do listy artykułów'}</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {activeArticle && onReadArticleAloud && (
                <button
                  type="button"
                  onClick={() => onReadArticleAloud(activeArticle)}
                  className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-[#84CC16] px-3 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E] cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{isDe ? 'Artikel vorlesen' : 'Przeczytaj na głos'}</span>
                </button>
              )}
              {activeArticle?.url && (
                <a
                  href={activeArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#242C23] bg-[#101410] px-3 text-xs font-medium text-[#D6DDD3] hover:border-[#84CC16]"
                >
                  <span>{isDe ? 'Original öffnen' : 'Otwórz oryginał'}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#84CC16]" />
                </a>
              )}
            </div>
          </div>

          {isArticleLoading && (
            <div className="flex items-center gap-2.5 py-4 text-xs text-[#B8C0B6]">
              <Loader2 className="h-4 w-4 animate-spin text-[#84CC16]" />
              <span>{isDe ? 'Lade Artikelinhalt...' : 'Pobieram treść artykułu...'}</span>
            </div>
          )}

          {!isArticleLoading && articleError && (
            <div className="flex items-start gap-2 rounded-lg border border-[#3B1D1D] bg-[#130A0A] p-3 text-xs text-[#FCA5A5]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" />
              <span>{articleError}</span>
            </div>
          )}

          {!isArticleLoading && activeArticle && (
            <article className="space-y-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#84CC16]">
                {activeArticle.domain}
              </div>
              <h3 className="font-display text-base font-bold text-[#F3F5F2] sm:text-lg">
                {activeArticle.title}
              </h3>
              <div className="max-h-72 overflow-y-auto pr-1 space-y-2.5 text-xs leading-relaxed text-[#D0D7CE]">
                {activeArticle.content.split(/\n{2,}/).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </article>
          )}
        </div>
      )}

      {/* Search Loading */}
      {isLoading && (
        <div className="flex items-center gap-3 py-4 text-sm text-[#B8C0B6]">
          <Loader2 className="h-4 w-4 animate-spin text-[#84CC16]" aria-hidden="true" />
          <span>
            {isDe
              ? 'Durchsuche Google nach Artikeln und Webseiten...'
              : 'Przeszukuję Google w poszukiwaniu artykułów i stron internetowych...'}
          </span>
        </div>
      )}

      {/* Search Summary */}
      {data?.answerSummary && !isLoading && !activeArticle && (
        <div className="rounded-xl border border-[#1E2A1C] bg-[#0C110B] px-3.5 py-2.5 text-xs leading-relaxed text-[#D2DBD0]">
          {data.answerSummary}
        </div>
      )}

      {!isLoading && error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[#3B1D1D] bg-[#130A0A] p-4 text-xs text-[#FCA5A5]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" />
          <span>{error}</span>
        </div>
      )}

      {/* Article / Web Search Results List */}
      {!isLoading && !error && !activeArticle && data && data.results.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {data.results.map((item, idx) => {
            const telHref = sanitizePhoneForTel(item.phone);
            const directionsHref =
              item.directionsUrl ||
              (item.address
                ? buildGoogleMapsDirectionsUrl(`${item.title}, ${item.address}`)
                : null);

            return (
              <article
                key={item.id || `${item.title}_${idx}`}
                className="flex flex-col justify-between rounded-xl border border-[#1B231A] bg-[#060806] p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#84CC16]">
                      #{idx + 1} · {item.categoryLabel}
                    </span>
                  </div>
                  <h3 className="mt-0.5 font-display text-base font-bold text-[#F3F5F2]">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="mt-1.5 text-xs leading-relaxed text-[#C4CCC2]">
                      {item.summary}
                    </p>
                  )}

                  {item.address && (
                    <div className="mt-2.5 flex items-start gap-2 text-xs text-[#9BA399]">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#84CC16]" />
                      <span>{item.address}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3.5 flex flex-wrap gap-2 border-t border-[#151A15] pt-3">
                  {onOpenArticle && item.websiteUrl && (
                    <button
                      type="button"
                      onClick={() => onOpenArticle(item, false)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#84CC16] px-3 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E] whitespace-nowrap cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{isDe ? 'Artikel lesen' : 'Czytaj artykuł'}</span>
                    </button>
                  )}

                  {item.websiteUrl && (
                    <a
                      href={item.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#242C23] bg-[#101410] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16] whitespace-nowrap"
                    >
                      <span>{isDe ? 'Webseite öffnen' : 'Otwórz stronę'}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-[#84CC16]" />
                    </a>
                  )}

                  {item.mapsUrl && (
                    <a
                      href={item.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#242C23] bg-[#101410] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16] whitespace-nowrap"
                    >
                      <MapPin className="h-3.5 w-3.5 text-[#84CC16]" />
                      <span>Mapa</span>
                    </a>
                  )}

                  {directionsHref && (
                    <a
                      href={directionsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#2C3A27] bg-[#131C10] px-3 text-xs font-medium text-[#D9F99D] hover:border-[#84CC16] whitespace-nowrap"
                    >
                      <Route className="h-3.5 w-3.5 text-[#84CC16]" />
                      <span>Dojazd</span>
                    </a>
                  )}

                  {telHref && (
                    <a
                      href={`tel:${telHref}`}
                      onClick={() =>
                        onOpenDialer({
                          name: item.title,
                          phone: telHref,
                          address: item.address || undefined,
                        })
                      }
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#242C23] bg-[#101410] px-3 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16] whitespace-nowrap"
                    >
                      <PhoneCall className="h-3.5 w-3.5 text-[#84CC16]" />
                      <span>Zadzwoń</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!isLoading && data?.groundingLinks && data.groundingLinks.length > 0 && (
        <div className="border-t border-[#161B15] pt-3">
          <p className="text-[11px] font-medium text-[#7D857B]">
            {isDe ? 'Quellen im Internet:' : 'Źródła z internetu:'}
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {data.groundingLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#9DC85B] underline decoration-[#3A4D22] underline-offset-4 hover:text-[#B8EA6B]"
                >
                  <span>{link.title}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
