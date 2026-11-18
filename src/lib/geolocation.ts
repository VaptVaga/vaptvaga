export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface DetectedLocation extends GeoCoordinates {
  cidade?: string;
  bairro?: string;
  estado?: string;
  formattedAddress?: string;
}

interface KnownLocationEntry extends GeoCoordinates {
  cidade: string;
  bairro?: string;
  estado: string;
}

export const DEFAULT_COORDS: GeoCoordinates = {
  latitude: -19.9322,
  longitude: -43.9386,
};

const KNOWN_LOCATIONS: Record<string, KnownLocationEntry> = {
  // Belo Horizonte & Região
  'lourdes': { latitude: -19.9325, longitude: -43.9452, cidade: 'Belo Horizonte', bairro: 'Lourdes', estado: 'MG' },
  'savassi': { latitude: -19.9388, longitude: -43.9348, cidade: 'Belo Horizonte', bairro: 'Savassi', estado: 'MG' },
  'vila da serra': { latitude: -19.9794, longitude: -43.9408, cidade: 'Nova Lima', bairro: 'Vila da Serra', estado: 'MG' },
  'estoril': { latitude: -19.9698, longitude: -43.9632, cidade: 'Belo Horizonte', bairro: 'Estoril', estado: 'MG' },
  'centro|belo horizonte': { latitude: -19.9191, longitude: -43.9386, cidade: 'Belo Horizonte', bairro: 'Centro', estado: 'MG' },
  'funcionarios': { latitude: -19.9317, longitude: -43.9301, cidade: 'Belo Horizonte', bairro: 'Funcionários', estado: 'MG' },
  'pampulha': { latitude: -19.8582, longitude: -43.9721, cidade: 'Belo Horizonte', bairro: 'Pampulha', estado: 'MG' },
  'santa efigenia': { latitude: -19.9248, longitude: -43.9225, cidade: 'Belo Horizonte', bairro: 'Santa Efigênia', estado: 'MG' },
  'buritis': { latitude: -19.9722, longitude: -43.9698, cidade: 'Belo Horizonte', bairro: 'Buritis', estado: 'MG' },
  'santo agostinho': { latitude: -19.9289, longitude: -43.9511, cidade: 'Belo Horizonte', bairro: 'Santo Agostinho', estado: 'MG' },
  'belo horizonte': { latitude: -19.9191, longitude: -43.9386, cidade: 'Belo Horizonte', estado: 'MG' },

  // Contagem & Betim
  'eldorado': { latitude: -19.9394, longitude: -44.0358, cidade: 'Contagem', bairro: 'Eldorado', estado: 'MG' },
  'industrial': { latitude: -19.9547, longitude: -44.0225, cidade: 'Contagem', bairro: 'Industrial', estado: 'MG' },
  'cidade industrial': { latitude: -19.9547, longitude: -44.0225, cidade: 'Contagem', bairro: 'Cidade Industrial', estado: 'MG' },
  'cinco': { latitude: -19.9242, longitude: -44.0411, cidade: 'Contagem', bairro: 'Cinco', estado: 'MG' },
  'centro|contagem': { latitude: -19.9167, longitude: -44.0833, cidade: 'Contagem', bairro: 'Centro', estado: 'MG' },
  'riacho': { latitude: -19.9467, longitude: -44.0619, cidade: 'Contagem', bairro: 'Riacho das Pedras', estado: 'MG' },
  'nova contagem': { latitude: -19.8569, longitude: -44.1292, cidade: 'Contagem', bairro: 'Nova Contagem', estado: 'MG' },
  'retiro': { latitude: -19.8736, longitude: -44.1156, cidade: 'Contagem', bairro: 'Retiro', estado: 'MG' },
  'cabral': { latitude: -19.8825, longitude: -44.0342, cidade: 'Contagem', bairro: 'Cabral', estado: 'MG' },
  'amazonas': { latitude: -19.9508, longitude: -44.0189, cidade: 'Contagem', bairro: 'Amazonas', estado: 'MG' },
  'ceasa': { latitude: -19.8867, longitude: -44.0419, cidade: 'Contagem', bairro: 'Ceasa', estado: 'MG' },
  'contagem / ceasa': { latitude: -19.8867, longitude: -44.0419, cidade: 'Contagem', bairro: 'Ceasa', estado: 'MG' },
  'agua branca': { latitude: -19.9325, longitude: -44.0258, cidade: 'Contagem', bairro: 'Água Branca', estado: 'MG' },
  'inconfidentes': { latitude: -19.9422, longitude: -44.0456, cidade: 'Contagem', bairro: 'Inconfidentes', estado: 'MG' },
  'nacional': { latitude: -19.8658, longitude: -44.0267, cidade: 'Contagem', bairro: 'Nacional', estado: 'MG' },
  'ressaca': { latitude: -19.8983, longitude: -44.0339, cidade: 'Contagem', bairro: 'Ressaca', estado: 'MG' },
  'petrolandia': { latitude: -19.9114, longitude: -44.1233, cidade: 'Contagem', bairro: 'Petrolândia', estado: 'MG' },
  'jardim riacho': { latitude: -19.9589, longitude: -44.0658, cidade: 'Contagem', bairro: 'Jardim Riacho', estado: 'MG' },
  'parque sao joao': { latitude: -19.9494, longitude: -44.0542, cidade: 'Contagem', bairro: 'Parque São João', estado: 'MG' },
  'contagem': { latitude: -19.9321, longitude: -44.0539, cidade: 'Contagem', estado: 'MG' },
  'betim': { latitude: -19.9678, longitude: -44.1983, cidade: 'Betim', estado: 'MG' },
  'nova lima': { latitude: -19.9858, longitude: -43.8469, cidade: 'Nova Lima', estado: 'MG' },

  // São Paulo
  'pinheiros': { latitude: -23.5673, longitude: -46.6927, cidade: 'São Paulo', bairro: 'Pinheiros', estado: 'SP' },
  'jardins': { latitude: -23.5649, longitude: -46.6689, cidade: 'São Paulo', bairro: 'Jardins', estado: 'SP' },
  'itaim bibi': { latitude: -23.5847, longitude: -46.6789, cidade: 'São Paulo', bairro: 'Itaim Bibi', estado: 'SP' },
  'vila madalena': { latitude: -23.5567, longitude: -46.6914, cidade: 'São Paulo', bairro: 'Vila Madalena', estado: 'SP' },
  'moema': { latitude: -23.6006, longitude: -46.6656, cidade: 'São Paulo', bairro: 'Moema', estado: 'SP' },
  'centro|sao paulo': { latitude: -23.5505, longitude: -46.6333, cidade: 'São Paulo', bairro: 'Centro', estado: 'SP' },
  'sao paulo': { latitude: -23.5505, longitude: -46.6333, cidade: 'São Paulo', estado: 'SP' },

  // Rio de Janeiro & Niterói
  'botafogo': { latitude: -22.9519, longitude: -43.1858, cidade: 'Rio de Janeiro', bairro: 'Botafogo', estado: 'RJ' },
  'copacabana': { latitude: -22.9719, longitude: -43.1825, cidade: 'Rio de Janeiro', bairro: 'Copacabana', estado: 'RJ' },
  'barra da tijuca': { latitude: -23.0004, longitude: -43.3659, cidade: 'Rio de Janeiro', bairro: 'Barra da Tijuca', estado: 'RJ' },
  'lapa': { latitude: -22.9133, longitude: -43.1806, cidade: 'Rio de Janeiro', bairro: 'Lapa', estado: 'RJ' },
  'centro|rio de janeiro': { latitude: -22.9068, longitude: -43.1729, cidade: 'Rio de Janeiro', bairro: 'Centro', estado: 'RJ' },
  'rio de janeiro': { latitude: -22.9068, longitude: -43.1729, cidade: 'Rio de Janeiro', estado: 'RJ' },
  'niteroi': { latitude: -22.8832, longitude: -43.1034, cidade: 'Niterói', estado: 'RJ' },
};

const STATE_NAME_TO_UF: Record<string, string> = {
  'acre': 'AC',
  'alagoas': 'AL',
  'amapa': 'AP',
  'amazonas': 'AM',
  'bahia': 'BA',
  'ceara': 'CE',
  'distrito federal': 'DF',
  'espirito santo': 'ES',
  'goias': 'GO',
  'maranhao': 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  'para': 'PA',
  'paraiba': 'PB',
  'parana': 'PR',
  'pernambuco': 'PE',
  'piaui': 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  'rondonia': 'RO',
  'roraima': 'RR',
  'santa catarina': 'SC',
  'sao paulo': 'SP',
  'sergipe': 'SE',
  'tocantins': 'TO',
};

const normalizeText = (value?: string | null): string =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export const isValidCoordinate = (val: unknown): val is number =>
  typeof val === 'number' && Number.isFinite(val) && Math.abs(val) <= 180 && val !== 0;

/**
 * Resolves valid latitude/longitude from explicit values or falls back to
 * neighborhood/city coordinates so every job and profile renders cleanly on maps.
 */
export const resolveCoordinates = (input?: {
  latitude?: number | null;
  longitude?: number | null;
  bairro?: string | null;
  cidade?: string | null;
  city?: string | null;
}): GeoCoordinates => {
  if (input && isValidCoordinate(input.latitude) && isValidCoordinate(input.longitude)) {
    return { latitude: input.latitude, longitude: input.longitude };
  }

  const rawCidade = normalizeText(input?.cidade || input?.city);
  const rawBairro = normalizeText(input?.bairro);

  if (rawBairro && rawCidade) {
    const composite = KNOWN_LOCATIONS[`${rawBairro}|${rawCidade}`];
    if (composite) return { latitude: composite.latitude, longitude: composite.longitude };
  }

  if (rawBairro) {
    const directBairro = KNOWN_LOCATIONS[rawBairro];
    if (directBairro) return { latitude: directBairro.latitude, longitude: directBairro.longitude };

    for (const [key, entry] of Object.entries(KNOWN_LOCATIONS)) {
      const cleanKey = key.split('|')[0];
      if (rawBairro.includes(cleanKey) || cleanKey.includes(rawBairro)) {
        return { latitude: entry.latitude, longitude: entry.longitude };
      }
    }
  }

  if (rawCidade) {
    const directCity = KNOWN_LOCATIONS[rawCidade];
    if (directCity) return { latitude: directCity.latitude, longitude: directCity.longitude };

    for (const [key, entry] of Object.entries(KNOWN_LOCATIONS)) {
      const cleanKey = key.split('|')[0];
      if (rawCidade.includes(cleanKey) || cleanKey.includes(rawCidade)) {
        return { latitude: entry.latitude, longitude: entry.longitude };
      }
    }
  }

  return DEFAULT_COORDS;
};

/**
 * Haversine distance formula in kilometers.
 */
export const calculateDistanceKm = (from: GeoCoordinates, to: GeoCoordinates): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

export const formatDistanceKm = (km: number | null | undefined): string => {
  if (km === null || km === undefined || Number.isNaN(km)) return '';
  if (km < 1) {
    const meters = Math.max(50, Math.round(km * 1000));
    return `${meters} m`;
  }
  return `${km.toFixed(1).replace('.', ',')} km`;
};

export const getGoogleMapsEmbedUrl = (params: {
  latitude?: number | null;
  longitude?: number | null;
  query?: string;
  zoom?: number;
}): string => {
  const zoom = params.zoom ?? 15;
  const hasCoords = isValidCoordinate(params.latitude) && isValidCoordinate(params.longitude);
  const q = params.query?.trim()
    ? params.query.trim()
    : hasCoords
      ? `${params.latitude},${params.longitude}`
      : 'Belo Horizonte, MG, Brasil';

  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=m&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
};

export const getGoogleMapsDirectionsUrl = (params: {
  destLat?: number | null;
  destLng?: number | null;
  destQuery?: string;
  originLat?: number | null;
  originLng?: number | null;
}): string => {
  const hasDestCoords = isValidCoordinate(params.destLat) && isValidCoordinate(params.destLng);
  const destination = hasDestCoords
    ? `${params.destLat},${params.destLng}`
    : params.destQuery?.trim() || 'Belo Horizonte, MG';

  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('destination', destination);
  if (isValidCoordinate(params.originLat) && isValidCoordinate(params.originLng)) {
    url.searchParams.set('origin', `${params.originLat},${params.originLng}`);
  }
  return url.toString();
};

export const getWazeNavigationUrl = (params: {
  latitude?: number | null;
  longitude?: number | null;
  query?: string;
}): string => {
  if (isValidCoordinate(params.latitude) && isValidCoordinate(params.longitude)) {
    return `https://waze.com/ul?ll=${params.latitude},${params.longitude}&navigate=yes`;
  }
  const q = params.query?.trim() || 'Belo Horizonte';
  return `https://waze.com/ul?q=${encodeURIComponent(q)}&navigate=yes`;
};

const findNearestKnownLocation = (coords: GeoCoordinates): KnownLocationEntry => {
  let best: KnownLocationEntry = {
    latitude: DEFAULT_COORDS.latitude,
    longitude: DEFAULT_COORDS.longitude,
    cidade: 'Belo Horizonte',
    bairro: 'Savassi',
    estado: 'MG',
  };
  let minDistance = Number.POSITIVE_INFINITY;

  for (const entry of Object.values(KNOWN_LOCATIONS)) {
    const dist = calculateDistanceKm(coords, entry);
    if (dist < minDistance) {
      minDistance = dist;
      best = entry;
    }
  }
  return best;
};

const resolveStateUf = (rawState?: string, isoCode?: string): string | undefined => {
  if (isoCode && isoCode.startsWith('BR-')) {
    return isoCode.slice(3).toUpperCase();
  }
  if (!rawState) return undefined;
  const trimmed = rawState.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return STATE_NAME_TO_UF[normalizeText(trimmed)];
};

/**
 * Captures the user's current position via Browser Geolocation API and reverse-geocodes
 * city/neighborhood/state using OpenStreetMap Nominatim with offline fallback.
 */
export const detectUserLocation = (): Promise<DetectedLocation> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Geolocalização não suportada neste navegador.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: GeoCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        try {
          const controller = new AbortController();
          const timeoutId = window.setTimeout(() => controller.abort(), 4500);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=16&addressdetails=1`,
            {
              signal: controller.signal,
              headers: { Accept: 'application/json' },
            }
          );
          window.clearTimeout(timeoutId);

          if (response.ok) {
            const data = (await response.json()) as {
              display_name?: string;
              address?: {
                city?: string;
                town?: string;
                village?: string;
                municipality?: string;
                suburb?: string;
                neighbourhood?: string;
                quarter?: string;
                state?: string;
                'ISO3166-2-lvl4'?: string;
              };
            };

            const addr = data.address || {};
            const cidade = addr.city || addr.town || addr.municipality || addr.village;
            const bairro = addr.suburb || addr.neighbourhood || addr.quarter;
            const estado = resolveStateUf(addr.state, addr['ISO3166-2-lvl4']);

            if (cidade || bairro || estado) {
              resolve({
                ...coords,
                cidade,
                bairro,
                estado,
                formattedAddress: data.display_name,
              });
              return;
            }
          }
        } catch {
          // Ignore network error / timeout and fall back to nearest known location
        }

        const fallback = findNearestKnownLocation(coords);
        resolve({
          ...coords,
          cidade: fallback.cidade,
          bairro: fallback.bairro,
          estado: fallback.estado,
        });
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          reject(new Error('Permissão de localização negada. Libere o GPS nas configurações do navegador.'));
          return;
        }
        if (geoError.code === geoError.TIMEOUT) {
          reject(new Error('Tempo esgotado ao obter sua localização GPS.'));
          return;
        }
        reject(new Error('Não foi possível obter sua localização atual.'));
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
};
