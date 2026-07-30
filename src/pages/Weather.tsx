import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, Sun, CloudRain, Wind, Droplets, Thermometer,
  MapPin, Search, Eye, Gauge, Sunrise, Sunset, Navigation, X, Loader2, AlertTriangle,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/Loading';
import { useToast } from '../context/ToastContext';
import {
  fetchWeather, searchLocation, getCurrentPosition, reverseGeocode, isRainCode, locationLabel,
  type WeatherData, type GeoLocation, type LocationSource,
} from '../lib/weather';

const weatherIcons: Record<string, typeof Sun> = {
  '01d': Sun, '02d': Cloud, '03d': Cloud, '09d': CloudRain, '10d': CloudRain, '11d': CloudRain, '13d': Cloud, '50d': Cloud,
};

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const iconMap: Record<number, typeof Sun> = {
    0: Sun, 1: Sun, 2: Cloud, 3: Cloud, 45: Cloud, 48: Cloud,
    51: CloudRain, 53: CloudRain, 55: CloudRain, 56: CloudRain, 57: CloudRain,
    61: CloudRain, 63: CloudRain, 65: CloudRain, 66: CloudRain, 67: CloudRain,
    71: Cloud, 73: Cloud, 75: Cloud, 77: Cloud,
    80: CloudRain, 81: CloudRain, 82: CloudRain, 85: Cloud, 86: Cloud,
    95: CloudRain, 96: CloudRain, 99: CloudRain,
  };
  const Icon = iconMap[code] || Cloud;
  return <Icon className={className} />;
}

export default function Weather() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchLocation(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadWeatherFor = async (loc: GeoLocation) => {
    setLoading(true);
    setError(null);
    try {
      const { current, forecast } = await fetchWeather(loc.latitude, loc.longitude);
      setWeather({ current, forecast, location: loc });
      showToast(`Weather loaded for ${locationLabel(loc)}`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather. Please try again.');
      showToast('Failed to load weather data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [locationSource, setLocationSource] = useState<LocationSource | null>(null);

  const SAVED_LOCATION_KEY = 'weather_saved_location';

  // Default location: Peravurani, Tamil Nadu, India
  const DEFAULT_LOCATION: GeoLocation = {
    latitude: 10.29,
    longitude: 79.16,
    name: 'Peravurani',
    region: 'Tamil Nadu',
    country: 'India',
  };

  const saveLocation = (loc: GeoLocation) => {
    try {
      localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(loc));
    } catch {
      // ignore storage errors
    }
  };

  const getSavedLocation = (): GeoLocation | null => {
    try {
      const saved = localStorage.getItem(SAVED_LOCATION_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved) as GeoLocation;
      if (typeof parsed.latitude !== 'number' || typeof parsed.longitude !== 'number') return null;
      return parsed;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const saved = getSavedLocation();
    loadWeatherFor(saved || DEFAULT_LOCATION);
  }, []);

  const loadDetectedLocation = async () => {
    setLoading(true);
    setError(null);
    setDetecting(true);
    try {
      // When the user explicitly asks for "my location", use GPS only —
      // don't silently fall back to IP, which gives a wrong city.
      const { lat, lon } = await getCurrentPosition();
      const loc = await reverseGeocode(lat, lon);
      setLocationSource('gps');
      saveLocation(loc);
      showToast(`Live GPS location found: ${locationLabel(loc)}`, 'success');
      await loadWeatherFor(loc);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not detect your location.';
      setError(msg);
      showToast(`${msg} You can search for your city instead.`, 'error');
    } finally {
      setDetecting(false);
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (loc: GeoLocation) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setLocationSource(null);
    saveLocation(loc);
    loadWeatherFor(loc);
  };

  const rainDays = weather?.forecast.filter((d) => isRainCode(d.weather_code)) || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        {detecting ? (
          <>
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Finding your location...</p>
          </>
        ) : (
          <LoadingSpinner size="lg" />
        )}
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div>
        <PageHeader
          title="Weather Dashboard"
          subtitle="Current conditions and 7-day forecast for your farm"
          icon={<Cloud className="w-6 h-6" />}
        />
        <Card className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-medium mb-2">Couldn't load weather</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-md mx-auto">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={loadDetectedLocation} icon={<Navigation className="w-4 h-4" />}>Find My Location</Button>
          </div>
          <div ref={containerRef} className="relative mt-6 max-w-md mx-auto">
            <p className="text-xs text-slate-400 mb-2">Or search for your city</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && suggestions[0]) handleSelectSuggestion(suggestions[0]);
                }}
                className="input-field flex-1"
                placeholder="Enter city name"
              />
              <Button onClick={() => suggestions[0] && handleSelectSuggestion(suggestions[0])} icon={<Search className="w-4 h-4" />}>Search</Button>
            </div>
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute z-20 mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={`${s.name}-${i}`}
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-200">{locationLabel(s)}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div>
      <PageHeader
        title="Weather Dashboard"
        subtitle="Current conditions and 7-day forecast for your farm"
        icon={<Cloud className="w-6 h-6" />}
        action={
          <div ref={containerRef} className="relative flex gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length && setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && suggestions[0]) handleSelectSuggestion(suggestions[0]);
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
                className="input-field max-w-[200px] pl-9"
                placeholder="Search city"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {searching && (
                <Loader2 className="w-4 h-4 absolute right-8 top-1/2 -translate-y-1/2 text-primary-500 animate-spin" />
              )}
            </div>
            <Button onClick={() => suggestions[0] && handleSelectSuggestion(suggestions[0])} icon={<Search className="w-4 h-4" />}>Search</Button>
            <Button variant="outline" onClick={loadDetectedLocation} icon={<Navigation className="w-4 h-4" />} title="Find my location">Find Me</Button>

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={`${s.name}-${i}`}
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-200">{locationLabel(s)}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
      />

      {/* Current Weather Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-8 mb-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-blue-200/30 dark:from-amber-900/10 dark:to-blue-900/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{locationLabel(weather.location)}</span>
                <span className="text-xs text-slate-400">({weather.location.latitude.toFixed(2)}°, {weather.location.longitude.toFixed(2)}°)</span>
                {locationSource && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    locationSource === 'gps'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  }`}>
                    {locationSource === 'gps' ? 'Live GPS' : 'Approximate'}
                  </span>
                )}
                <button
                  onClick={loadDetectedLocation}
                  className="ml-1 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary-500"
                  title="Use my location"
                >
                  <Navigation className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                  <WeatherIcon code={weather.current.weather_code} className="w-12 h-12" />
                </div>
                <div>
                  <p className="text-6xl font-bold text-slate-800 dark:text-white">{weather.current.temp}°C</p>
                  <p className="text-slate-500 dark:text-slate-400 capitalize">{weather.current.description}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Feels like {weather.current.feels_like}°C</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{weather.current.humidity}%</p>
                  <p className="text-xs text-slate-500">Humidity</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{weather.current.wind_speed} km/h</p>
                  <p className="text-xs text-slate-500">Wind Speed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{weather.current.pressure} hPa</p>
                  <p className="text-xs text-slate-500">Air Pressure</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{weather.current.visibility} km</p>
                  <p className="text-xs text-slate-500">Visibility</p>
                  <p className="text-[10px] text-slate-400">How far you can see</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Sunrise className="w-4 h-4 text-amber-500" /> Sunrise: {weather.current.sunrise}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Sunset className="w-4 h-4 text-orange-500" /> Sunset: {weather.current.sunset}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 7-Day Forecast */}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">7-Day Forecast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {weather.forecast.map((day, i) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`p-4 text-center ${day.dayName === 'Today' ? 'ring-2 ring-primary-500/50' : ''}`}>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{day.dayName}</p>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center text-amber-600 mx-auto mb-2">
                <WeatherIcon code={day.weather_code} className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{day.condition}</p>
              <div className="flex justify-center gap-2 text-sm">
                <span className="font-bold text-slate-800 dark:text-white">{day.temp_max}°</span>
                <span className="text-slate-400">{day.temp_min}°</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Rain Alert - dynamically derived from real forecast */}
      {rainDays.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="p-5 mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shrink-0">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Rain expected on {rainDays.map((d) => d.dayName).join(', ')}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Hold off on watering and spraying crops. Make sure water can drain from low areas of your field.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {rainDays.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="p-5 mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">No rain in the 7-day forecast</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Water your crops regularly. Check soil dryness to protect crops during dry periods.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
