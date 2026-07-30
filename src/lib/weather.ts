export type GeoLocation = {
  latitude: number;
  longitude: number;
  name: string;
  region: string;
  country: string;
};

export type CurrentWeather = {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  description: string;
  pressure: number;
  visibility: number;
  weather_code: number;
  sunrise: string;
  sunset: string;
};

export type ForecastDay = {
  date: string;
  dayName: string;
  temp_max: number;
  temp_min: number;
  condition: string;
  weather_code: number;
  icon: string;
};

export type WeatherData = {
  current: CurrentWeather;
  forecast: ForecastDay[];
  location: GeoLocation;
};

const weatherCodeMap: Record<number, { condition: string; description: string; icon: string }> = {
  0: { condition: 'Clear Sky', description: 'clear sky', icon: '01d' },
  1: { condition: 'Mainly Clear', description: 'mainly clear', icon: '02d' },
  2: { condition: 'Partly Cloudy', description: 'partly cloudy', icon: '02d' },
  3: { condition: 'Overcast', description: 'overcast', icon: '03d' },
  45: { condition: 'Fog', description: 'foggy', icon: '50d' },
  48: { condition: 'Rime Fog', description: 'depositing rime fog', icon: '50d' },
  51: { condition: 'Light Drizzle', description: 'light drizzle', icon: '09d' },
  53: { condition: 'Drizzle', description: 'moderate drizzle', icon: '09d' },
  55: { condition: 'Heavy Drizzle', description: 'dense drizzle', icon: '09d' },
  56: { condition: 'Freezing Drizzle', description: 'light freezing drizzle', icon: '09d' },
  57: { condition: 'Freezing Drizzle', description: 'dense freezing drizzle', icon: '09d' },
  61: { condition: 'Light Rain', description: 'slight rain', icon: '10d' },
  63: { condition: 'Rain', description: 'moderate rain', icon: '10d' },
  65: { condition: 'Heavy Rain', description: 'heavy rain', icon: '10d' },
  66: { condition: 'Freezing Rain', description: 'light freezing rain', icon: '10d' },
  67: { condition: 'Freezing Rain', description: 'heavy freezing rain', icon: '10d' },
  71: { condition: 'Light Snow', description: 'slight snow fall', icon: '13d' },
  73: { condition: 'Snow', description: 'moderate snow fall', icon: '13d' },
  75: { condition: 'Heavy Snow', description: 'heavy snow fall', icon: '13d' },
  77: { condition: 'Snow Grains', description: 'snow grains', icon: '13d' },
  80: { condition: 'Light Showers', description: 'slight rain showers', icon: '10d' },
  81: { condition: 'Showers', description: 'moderate rain showers', icon: '10d' },
  82: { condition: 'Heavy Showers', description: 'violent rain showers', icon: '10d' },
  85: { condition: 'Snow Showers', description: 'slight snow showers', icon: '13d' },
  86: { condition: 'Snow Showers', description: 'heavy snow showers', icon: '13d' },
  95: { condition: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
  96: { condition: 'Thunderstorm', description: 'thunderstorm with slight hail', icon: '11d' },
  99: { condition: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: '11d' },
};

const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];

export function isRainCode(code: number): boolean {
  return rainCodes.includes(code);
}

export async function searchLocation(query: string): Promise<GeoLocation[]> {
  if (!query.trim()) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to search location');
  const data = await res.json();
  if (!data.results) return [];
  return data.results.map((r: { latitude: number; longitude: number; name: string; admin1?: string; country?: string }) => ({
    latitude: r.latitude,
    longitude: r.longitude,
    name: r.name,
    region: r.admin1 || '',
    country: r.country || '',
  }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return {
      latitude: lat,
      longitude: lon,
      name: data.city || data.locality || data.principalSubdivision || 'Current Location',
      region: data.principalSubdivision || '',
      country: data.countryName || '',
    };
  } catch {
    return { latitude: lat, longitude: lon, name: 'Current Location', region: '', country: '' };
  }
}

export function getCurrentPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location access denied. Please enable location permissions in your browser settings and try again.',
          2: 'Location unavailable. Please check your device GPS or search by city name.',
          3: 'Location request timed out. Please try again.',
        };
        reject(new Error(messages[err.code] || 'Failed to get your location'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

export async function getAutoLocation(): Promise<GeoLocation> {
  // Try GPS (live location) first — this gives the most accurate result
  try {
    const { lat, lon } = await getCurrentPosition();
    return await reverseGeocode(lat, lon);
  } catch {
    // GPS failed — fall back to IP-based location
    return await getIPLocation();
  }
}

export type LocationSource = 'gps' | 'ip' | 'timezone';

function getTimezoneCity(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const lastSlash = tz.lastIndexOf('/');
    if (lastSlash === -1) return null;
    return tz.slice(lastSlash + 1).replace(/_/g, ' ');
  } catch {
    return null;
  }
}

async function getTimezoneGeoLocation(): Promise<GeoLocation | null> {
  const cityName = getTimezoneCity();
  if (!cityName) return null;
  try {
    const results = await searchLocation(cityName);
    if (results.length > 0) return results[0];
  } catch {
    // ignore — fall through to IP
  }
  return null;
}

export async function getIPLocation(): Promise<GeoLocation> {
  // IP services see the browser's public IP — try them first for the user's actual city
  const services: (() => Promise<GeoLocation>)[] = [
    async () => {
      const res = await fetch('https://ipwho.is/');
      if (!res.ok) throw new Error('ipwho.is failed');
      const d = await res.json();
      if (!d.success || !d.latitude) throw new Error(d.message || 'ipwho.is unavailable');
      return {
        latitude: d.latitude,
        longitude: d.longitude,
        name: d.city || d.region || 'Unknown',
        region: d.region || '',
        country: d.country || '',
      };
    },
    async () => {
      const res = await fetch('https://geolocation-db.com/json/');
      if (!res.ok) throw new Error('geolocation-db failed');
      const d = await res.json();
      if (!d.latitude) throw new Error('geolocation-db unavailable');
      return {
        latitude: d.latitude,
        longitude: d.longitude,
        name: d.city || d.state || 'Unknown',
        region: d.state || '',
        country: d.country_name || '',
      };
    },
    async () => {
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) throw new Error('ipapi.co failed');
      const d = await res.json();
      if (d.error || !d.latitude) throw new Error('ipapi.co unavailable');
      return {
        latitude: d.latitude,
        longitude: d.longitude,
        name: d.city || d.region || 'Unknown',
        region: d.region || '',
        country: d.country_name || '',
      };
    },
  ];

  let lastError: Error | null = null;
  for (const svc of services) {
    try {
      return await svc();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  // Last resort: derive a city from the browser timezone and geocode it
  const tzLoc = await getTimezoneGeoLocation();
  if (tzLoc) return tzLoc;

  throw lastError || new Error('All location detection methods failed');
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDayName(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString([], { weekday: 'short' });
}

export async function fetchWeather(lat: number, lon: number): Promise<{ current: CurrentWeather; forecast: ForecastDay[] }> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,visibility',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '7',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  const data = await res.json();

  const wc = data.current.weather_code as number;
  const mapped = weatherCodeMap[wc] || { condition: 'Unknown', description: 'unknown', icon: '03d' };

  const current: CurrentWeather = {
    temp: Math.round(data.current.temperature_2m),
    feels_like: Math.round(data.current.apparent_temperature),
    humidity: Math.round(data.current.relative_humidity_2m),
    wind_speed: Math.round(data.current.wind_speed_10m),
    condition: mapped.condition,
    description: mapped.description,
    pressure: Math.round(data.current.pressure_msl),
    visibility: Math.round((data.current.visibility || 10000) / 1000),
    weather_code: wc,
    sunrise: formatTime(data.daily.sunrise[0]),
    sunset: formatTime(data.daily.sunset[0]),
  };

  const forecast: ForecastDay[] = (data.daily.time as string[]).map((date, i) => {
    const fwc = data.daily.weather_code[i] as number;
    const fmapped = weatherCodeMap[fwc] || { condition: 'Unknown', description: 'unknown', icon: '03d' };
    return {
      date,
      dayName: formatDayName(date),
      temp_max: Math.round(data.daily.temperature_2m_max[i]),
      temp_min: Math.round(data.daily.temperature_2m_min[i]),
      condition: fmapped.condition,
      weather_code: fwc,
      icon: fmapped.icon,
    };
  });

  return { current, forecast };
}

export function locationLabel(loc: GeoLocation): string {
  return [loc.name, loc.region, loc.country].filter(Boolean).join(', ');
}
