import React from 'react';
import { MapPin, Navigation, ExternalLink, Compass } from 'lucide-react';
import {
  type GeoCoordinates,
  resolveCoordinates,
  calculateDistanceKm,
  formatDistanceKm,
  getGoogleMapsEmbedUrl,
  getGoogleMapsDirectionsUrl,
  getWazeNavigationUrl,
  isValidCoordinate,
} from '@/lib/geolocation';

interface LocationMapProps {
  title?: string;
  addressLabel: string;
  latitude?: number | null;
  longitude?: number | null;
  bairro?: string | null;
  cidade?: string | null;
  userCoords?: GeoCoordinates | null;
  heightClassName?: string;
  showRouteButtons?: boolean;
  compact?: boolean;
  zoom?: number;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  title,
  addressLabel,
  latitude,
  longitude,
  bairro,
  cidade,
  userCoords,
  heightClassName = 'h-48',
  showRouteButtons = true,
  compact = false,
  zoom = 15,
}) => {
  const resolved = resolveCoordinates({ latitude, longitude, bairro, cidade });
  const hasExplicitCoords = isValidCoordinate(latitude) && isValidCoordinate(longitude);

  const queryForMaps = hasExplicitCoords
    ? undefined
    : [title, bairro, cidade, addressLabel].filter(Boolean).join(', ');

  const embedUrl = getGoogleMapsEmbedUrl({
    latitude: resolved.latitude,
    longitude: resolved.longitude,
    query: queryForMaps,
    zoom,
  });

  const googleMapsUrl = getGoogleMapsDirectionsUrl({
    destLat: resolved.latitude,
    destLng: resolved.longitude,
    destQuery: [title, addressLabel, bairro, cidade].filter(Boolean).join(', '),
    originLat: userCoords?.latitude,
    originLng: userCoords?.longitude,
  });

  const wazeUrl = getWazeNavigationUrl({
    latitude: resolved.latitude,
    longitude: resolved.longitude,
    query: [addressLabel, bairro, cidade].filter(Boolean).join(', '),
  });

  const distanceKm = userCoords ? calculateDistanceKm(userCoords, resolved) : null;
  const distanceLabel = distanceKm !== null ? formatDistanceKm(distanceKm) : '';

  return (
    <div className="rounded-2xl bg-surface-container-low border border-outline-variant/60 overflow-hidden shadow-sm">
      {!compact && (
        <div className="px-4 py-3 flex items-center justify-between gap-3 bg-surface-container-lowest border-b border-outline-variant/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center shrink-0">
              <MapPin size={15} />
            </div>
            <div className="min-w-0">
              {title && (
                <p className="text-[11px] font-headline font-bold uppercase tracking-wider text-on-surface-variant truncate">
                  {title}
                </p>
              )}
              <p className="text-xs sm:text-sm font-bold text-on-surface truncate">
                {addressLabel}
              </p>
            </div>
          </div>

          {distanceLabel && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold shrink-0">
              <Compass size={12} />
              <span>{distanceLabel}</span>
            </span>
          )}
        </div>
      )}

      <div className={`relative w-full ${heightClassName} bg-surface-container`}>
        <iframe
          title={`Mapa de ${addressLabel}`}
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="pointer-events-none absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/60 text-[10px] font-mono text-on-surface-variant shadow-sm">
          {resolved.latitude.toFixed(4)}, {resolved.longitude.toFixed(4)}
        </div>
      </div>

      {showRouteButtons && (
        <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/50 flex flex-wrap items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-dark text-on-primary font-headline font-bold text-xs transition-colors shadow-sm"
          >
            <Navigation size={14} />
            <span>Rota Google Maps</span>
            <ExternalLink size={12} className="opacity-80" />
          </a>

          <a
            href={wazeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline font-bold text-xs transition-colors border border-outline-variant/50"
          >
            <Compass size={14} className="text-primary" />
            <span>Ir com Waze</span>
            <ExternalLink size={12} className="opacity-70" />
          </a>
        </div>
      )}
    </div>
  );
};
