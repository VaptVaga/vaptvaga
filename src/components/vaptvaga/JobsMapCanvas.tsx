import React from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Zap,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { formatBudget } from '@/lib/types';
import {
  type GeoCoordinates,
  resolveCoordinates,
  calculateDistanceKm,
  formatDistanceKm,
  getGoogleMapsEmbedUrl,
  getGoogleMapsDirectionsUrl,
  getWazeNavigationUrl,
} from '@/lib/geolocation';
import type { JobDrawerData } from './JobDetailsDrawer';

interface JobsMapCanvasProps {
  jobs: JobDrawerData[];
  userCoords: GeoCoordinates;
  selectedJobId?: string | null;
  onSelectJob: (job: JobDrawerData) => void;
  onOpenDetails: (job: JobDrawerData) => void;
  onApply: (job: JobDrawerData) => void;
  alreadyAppliedIds: Set<string>;
}

export const JobsMapCanvas: React.FC<JobsMapCanvasProps> = ({
  jobs,
  userCoords,
  selectedJobId,
  onSelectJob,
  onOpenDetails,
  onApply,
  alreadyAppliedIds,
}) => {
  const jobsWithDistance = jobs
    .map((job) => {
      const coords = resolveCoordinates(job);
      const computedDistance =
        job.distanceKm !== null && job.distanceKm !== undefined
          ? job.distanceKm
          : calculateDistanceKm(userCoords, coords);
      return {
        job,
        coords,
        distanceKm: computedDistance,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const selectedEntry =
    jobsWithDistance.find((item) => item.job.id === selectedJobId) || jobsWithDistance[0];

  if (!selectedEntry) {
    return (
      <div className="rounded-2xl border border-dashed border-outline bg-surface-container-lowest p-12 text-center">
        <MapPin className="mx-auto h-10 w-10 text-on-surface-variant opacity-50 mb-3" />
        <p className="font-headline font-bold text-on-surface">
          Nenhuma vaga encontrada nesta área do mapa
        </p>
        <p className="text-xs text-on-surface-variant mt-1">
          Limpe os filtros ou altere a região para visualizar novas oportunidades no mapa.
        </p>
      </div>
    );
  }

  const activeJob = selectedEntry.job;
  const activeCoords = selectedEntry.coords;
  const activeApplied = alreadyAppliedIds.has(activeJob.id);
  const activeLocationLabel =
    [activeJob.bairro, activeJob.cidade || activeJob.city || activeJob.employer?.cidade]
      .filter(Boolean)
      .join(', ') || 'Região Metropolitana';

  const embedUrl = getGoogleMapsEmbedUrl({
    latitude: activeCoords.latitude,
    longitude: activeCoords.longitude,
    query: activeJob.latitude ? undefined : activeLocationLabel,
    zoom: 15,
  });

  const googleMapsUrl = getGoogleMapsDirectionsUrl({
    destLat: activeCoords.latitude,
    destLng: activeCoords.longitude,
    destQuery: `${activeJob.company_name || ''} ${activeLocationLabel}`.trim(),
    originLat: userCoords.latitude,
    originLng: userCoords.longitude,
  });

  const wazeUrl = getWazeNavigationUrl({
    latitude: activeCoords.latitude,
    longitude: activeCoords.longitude,
    query: activeLocationLabel,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Interactive Embedded Map + Selected Pin Highlight (7 cols) */}
      <div className="lg:col-span-7 rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-outline-variant/50 flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <MapPin size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-headline font-bold uppercase tracking-wider text-primary">
                Pino Selecionado • {formatDistanceKm(selectedEntry.distanceKm)} de você
              </p>
              <h3 className="text-sm sm:text-base font-headline font-extrabold text-on-surface truncate">
                {activeJob.title}
              </h3>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-headline font-extrabold shrink-0">
            {formatBudget(
              activeJob.budget || (activeJob.valor_da_diaria ? `R$ ${activeJob.valor_da_diaria}` : null)
            )}
          </span>
        </div>

        <div className="relative w-full h-[320px] sm:h-[400px] bg-surface-container">
          <iframe
            key={activeJob.id}
            title={`Mapa interativo: ${activeJob.title}`}
            src={embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

          <div className="pointer-events-none absolute top-3 left-3 px-3 py-1.5 rounded-full bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/70 shadow-md flex items-center gap-2 text-xs font-bold text-on-surface">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>{jobsWithDistance.length} vagas mapeadas</span>
          </div>
        </div>

        {/* Selected Job Quick Action Footer */}
        <div className="p-4 sm:p-5 bg-surface-container-lowest border-t border-outline-variant/50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
            <span className="font-semibold text-on-surface flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              {activeJob.company_name || activeJob.employer?.name || 'Empresa Parceira'} •{' '}
              {activeLocationLabel}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock size={13} className="text-primary" />
              {activeJob.horario || 'Turno a combinar'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDetails(activeJob)}
              className="px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs flex items-center gap-1.5 border border-outline-variant/60 transition-colors"
            >
              <Eye size={14} />
              <span>Ver Detalhes</span>
            </button>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs flex items-center gap-1.5 border border-outline-variant/60 transition-colors"
            >
              <Navigation size={14} className="text-primary" />
              <span>Google Maps</span>
              <ExternalLink size={11} />
            </a>

            <a
              href={wazeUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-headline font-bold text-xs flex items-center gap-1.5 border border-outline-variant/60 transition-colors"
            >
              <Compass size={14} className="text-primary" />
              <span>Waze</span>
              <ExternalLink size={11} />
            </a>

            <button
              type="button"
              onClick={() => onApply(activeJob)}
              disabled={activeApplied}
              className={`ml-auto px-5 py-2.5 rounded-xl font-headline font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeApplied
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-primary hover:bg-primary-dark text-on-primary shadow-sm active:scale-95'
              }`}
            >
              {activeApplied ? <CheckCircle2 size={14} /> : <Zap size={14} />}
              <span>{activeApplied ? 'Candidatado' : 'Candidatar 1 Clique'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Pin List Sorted by Proximity (5 cols) */}
      <div className="lg:col-span-5 space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
            Vagas por Proximidade
          </span>
          <span className="text-[11px] font-semibold text-primary">
            Clique para centralizar no mapa
          </span>
        </div>

        {jobsWithDistance.map(({ job, distanceKm }) => {
          const isSelected = job.id === activeJob.id;
          const isApplied = alreadyAppliedIds.has(job.id);
          const loc = [job.bairro, job.cidade || job.city].filter(Boolean).join(', ');

          return (
            <button
              key={job.id}
              type="button"
              onClick={() => onSelectJob(job)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                isSelected
                  ? 'bg-primary-container/40 border-primary shadow-sm ring-1 ring-primary/30'
                  : 'bg-surface-container-lowest border-outline-variant/70 hover:border-primary/40 hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                      <Compass size={10} />
                      {formatDistanceKm(distanceKm)}
                    </span>
                    {job.isUrgent && (
                      <span className="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary text-[10px] font-bold">
                        Urgente
                      </span>
                    )}
                    {isApplied && (
                      <span className="px-2 py-0.5 rounded-full bg-primary-container text-primary text-[10px] font-bold">
                        Candidatado
                      </span>
                    )}
                  </div>
                  <h4 className="font-headline font-bold text-sm text-on-surface mt-1.5 line-clamp-1">
                    {job.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">
                    {job.company_name || job.employer?.name || 'Empresa'} • {loc || 'Região'}
                  </p>
                </div>

                <span className="font-headline font-black text-sm text-primary shrink-0">
                  {formatBudget(
                    job.budget || (job.valor_da_diaria ? `R$ ${job.valor_da_diaria}` : null)
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
