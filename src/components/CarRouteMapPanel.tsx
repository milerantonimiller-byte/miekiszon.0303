import React, { useEffect, useRef, useState } from 'react';
import {
  Map as GoogleMap,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Car,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
  Route as RouteIcon,
} from 'lucide-react';
import { buildGoogleMapsDrivingRouteUrl } from '../utils/location';

interface CarRouteMapPanelProps {
  fromText: string;
  toText: string;
  coordinates?: { lat: number; lng: number };
  customFromTyped: boolean;
  hasMapsProvider: boolean;
  searchNonce: number;
}

interface ComputedRouteSummary {
  distanceText: string;
  durationText: string;
  description: string;
  startAddress: string;
  endAddress: string;
}

const DEFAULT_GERMANY_CENTER: google.maps.LatLngLiteral = {
  lat: 51.1657,
  lng: 10.4515,
};

function isQuotaError(err: unknown): boolean {
  const msg = String(
    (err as { message?: string; status?: string; code?: number })?.message ||
      (err as { status?: string })?.status ||
      err ||
      ''
  );
  const code = (err as { code?: number })?.code;
  return (
    code === 429 ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('OverQuota') ||
    msg.includes('QuotaExceeded')
  );
}

function formatDistance(meters?: number, localized?: string | null): string {
  if (localized) return localized;
  if (typeof meters !== 'number' || Number.isNaN(meters)) return '—';
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

function formatDuration(millis?: number | null, localized?: string | null): string {
  if (localized) return localized;
  if (typeof millis !== 'number' || Number.isNaN(millis)) return '—';
  const totalMinutes = Math.max(1, Math.round(millis / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0) {
    return `${hours} godz. ${mins} min`;
  }
  return `${mins} min`;
}

interface DrivingRouteControllerProps {
  originInput: string | google.maps.LatLngLiteral | null;
  originLabel: string;
  destinationText: string;
  refreshNonce: number;
  onSummaryChange: (summary: ComputedRouteSummary | null) => void;
  onLoadingChange: (loading: boolean) => void;
  onErrorChange: (error: string | null) => void;
}

const DrivingRouteController: React.FC<DrivingRouteControllerProps> = ({
  originInput,
  originLabel,
  destinationText,
  refreshNonce,
  onSummaryChange,
  onLoadingChange,
  onErrorChange,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    const clearOverlays = () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
      markersRef.current.forEach((m) => {
        m.map = null;
      });
      markersRef.current = [];
    };

    if (!map || !routesLib || !originInput || !destinationText.trim()) {
      clearOverlays();
      onSummaryChange(null);
      onErrorChange(null);
      onLoadingChange(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      clearOverlays();
      onLoadingChange(true);
      onErrorChange(null);

      try {
        const request: google.maps.routes.ComputeRoutesRequest = {
          origin: originInput,
          destination: destinationText.trim(),
          travelMode: 'DRIVING',
          routingPreference: 'TRAFFIC_AWARE',
          fields: [
            'path',
            'distanceMeters',
            'durationMillis',
            'viewport',
            'legs',
            'localizedValues',
            'description',
          ],
          internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
        };

        const { routes } = await routesLib.Route.computeRoutes(request);
        if (cancelled) return;

        if (!routes || routes.length === 0) {
          onSummaryChange(null);
          onErrorChange('Nie znaleziono trasy samochodowej między podanymi punktami.');
          return;
        }

        const primaryRoute = routes[0];

        const polylines = primaryRoute.createPolylines({
          polylineOptions: {
            strokeColor: '#84CC16',
            strokeOpacity: 0.92,
            strokeWeight: 6,
          },
        });
        polylines.forEach((p) => p.setMap(map));
        polylinesRef.current = polylines;

        const markers = await primaryRoute.createWaypointAdvancedMarkers(
          (defaults, details) => ({
            ...defaults,
            title:
              details.index === 0
                ? `Start (z): ${originLabel}`
                : `Cel (do): ${destinationText.trim()}`,
          })
        );

        if (cancelled) {
          polylines.forEach((p) => p.setMap(null));
          markers.forEach((m) => {
            m.map = null;
          });
          return;
        }

        markers.forEach((m) => {
          m.map = map;
        });
        markersRef.current = markers;

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, 48);
        }

        onSummaryChange({
          distanceText: formatDistance(
            primaryRoute.distanceMeters,
            primaryRoute.localizedValues?.distance
          ),
          durationText: formatDuration(
            primaryRoute.durationMillis,
            primaryRoute.localizedValues?.duration
          ),
          description: primaryRoute.description || '',
          startAddress: originLabel,
          endAddress: destinationText.trim(),
        });
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('Google Maps computeRoutes error:', err);
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        onSummaryChange(null);
        const message =
          (err as { message?: string })?.message ||
          'Nie udało się wyznaczyć trasy w Google Maps.';
        onErrorChange(message);
      } finally {
        if (!cancelled) {
          onLoadingChange(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      clearOverlays();
    };
  }, [
    map,
    routesLib,
    originInput,
    originLabel,
    destinationText,
    refreshNonce,
    onSummaryChange,
    onLoadingChange,
    onErrorChange,
  ]);

  return null;
};

export const CarRouteMapPanel: React.FC<CarRouteMapPanelProps> = ({
  fromText,
  toText,
  coordinates,
  customFromTyped,
  hasMapsProvider,
  searchNonce,
}) => {
  const [manualRefresh, setManualRefresh] = useState(0);
  const [summary, setSummary] = useState<ComputedRouteSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const trimmedFrom = fromText.trim();
  const trimmedTo = toText.trim();

  const originInput: string | google.maps.LatLngLiteral | null =
    !customFromTyped && coordinates
      ? coordinates
      : trimmedFrom
        ? trimmedFrom
        : coordinates || null;

  const originLabel =
    trimmedFrom || (coordinates ? 'Twoja lokalizacja GPS' : '');

  const hasBothEndpoints = Boolean(originInput && trimmedTo);
  const externalDirectionsUrl = buildGoogleMapsDrivingRouteUrl(
    trimmedFrom ||
      (coordinates ? `${coordinates.lat},${coordinates.lng}` : 'Berlin'),
    trimmedTo || 'München'
  );

  if (!hasMapsProvider) {
    return (
      <section className="rounded-2xl border border-[#1B211A] bg-[#090B09] p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#84CC16]">
            <RouteIcon className="h-4 w-4" aria-hidden="true" />
            <span>Interaktywna mapa trasy samochodowej (Google Maps)</span>
          </div>
          <a
            href={externalDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#222921] bg-[#101310] px-3 text-xs font-medium text-[#D5DCD3] hover:border-[#84CC16]"
          >
            <span>Otwórz w Google Maps</span>
            <ExternalLink className="h-3 w-3 text-[#84CC16]" />
          </a>
        </div>
        <p className="text-xs text-[#8C948A]">
          Klucz Google Maps JavaScript API nie jest jeszcze skonfigurowany — skorzystaj z linku powyżej, aby otworzyć trasę bezpośrednio w Google Maps.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Interaktywna mapa trasy samochodowej Google Maps"
      className="rounded-2xl border border-[#1B211A] bg-[#090B09] p-4 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-[#84CC16]" aria-hidden="true" />
          <h3 className="font-display text-sm font-semibold text-[#F3F5F2]">
            Interaktywna mapa trasy (z → do)
          </h3>
          {isLoading && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#A3E635]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Wyznaczam trasę...
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasBothEndpoints && (
            <button
              type="button"
              onClick={() => setManualRefresh((n) => n + 1)}
              disabled={isLoading}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#222921] bg-[#101310] px-3 text-xs font-medium text-[#D5DCD3] hover:border-[#84CC16] disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw
                className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span>Odśwież trasę</span>
            </button>
          )}

          <a
            href={externalDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-[#84CC16] px-3 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E]"
          >
            <Navigation className="h-3 w-3" aria-hidden="true" />
            <span>Nawiguj</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Live Route Telemetry Bar from Routes API */}
      {summary && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#22301E] bg-[#0E130D] px-3.5 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5 font-mono-tabular font-bold text-[#A3E635]">
              <RouteIcon className="h-3.5 w-3.5 text-[#84CC16]" />
              {summary.distanceText}
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#F3F5F2]">
              <Clock className="h-3.5 w-3.5 text-[#84CC16]" />
              {summary.durationText}
            </span>
            {summary.description && (
              <span className="text-[#B8C0B6]">
                przez <strong className="text-[#E5EAE4]">{summary.description}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#9BA399]">
            <MapPin className="h-3 w-3 text-[#84CC16]" />
            <span>
              {summary.startAddress} → {summary.endAddress}
            </span>
          </div>
        </div>
      )}

      {!hasBothEndpoints && (
        <p className="text-xs text-[#8C948A]">
          Wpisz punkt początkowy <strong className="text-[#D5DCD3]">„z”</strong> (lub włącz GPS) oraz punkt docelowy <strong className="text-[#D5DCD3]">„do”</strong> powyżej, aby narysować trasę przejazdu samochodem na mapie.
        </p>
      )}

      {routeError && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#3B1D1D] bg-[#130A0A] px-3 py-2 text-xs text-[#FCA5A5]">
          <span>{routeError}</span>
          <a
            href={externalDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#D9F99D] underline"
          >
            <span>Otwórz w Google Maps</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      <div className="h-[360px] w-full overflow-hidden rounded-xl border border-[#1B211A] bg-[#060706] sm:h-[420px]">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          colorScheme="DARK"
          defaultCenter={coordinates || DEFAULT_GERMANY_CENTER}
          defaultZoom={coordinates ? 10 : 6}
          gestureHandling="greedy"
          streetViewControl={false}
          mapTypeControl={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          <DrivingRouteController
            originInput={originInput}
            originLabel={originLabel}
            destinationText={trimmedTo}
            refreshNonce={searchNonce + manualRefresh}
            onSummaryChange={setSummary}
            onLoadingChange={setIsLoading}
            onErrorChange={setRouteError}
          />
        </GoogleMap>
      </div>
    </section>
  );
};
