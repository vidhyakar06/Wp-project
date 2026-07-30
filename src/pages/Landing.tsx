import { Link } from 'react-router-dom';
import { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Sprout, Cloud, TrendingUp, Bug, FlaskConical, Bot,
  ArrowRight, Leaf, BarChart3, Users, Shield, Sun, Droplets,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { fetchWeather, searchLocation, type CurrentWeather } from '../lib/weather';
import heroImage from '../assets/heroImage';

const features = [
  { icon: Sprout, title: 'Crop Suggestions', desc: 'Smart suggestions based on your soil and weather conditions', color: 'from-green-500 to-emerald-600' },
  { icon: FlaskConical, title: 'Fertilizer Advice', desc: 'Get the right fertilizer for your soil nutrients', color: 'from-amber-500 to-orange-600' },
  { icon: Cloud, title: 'Live Weather', desc: 'Live weather updates and 7-day forecasts for your farm', color: 'from-blue-500 to-cyan-600' },
  { icon: Bug, title: 'Disease Information', desc: 'Find and treat crop diseases with easy guides', color: 'from-red-500 to-rose-600' },
  { icon: TrendingUp, title: 'Market Prices', desc: 'Track live market prices across local markets', color: 'from-purple-500 to-violet-600' },
  { icon: Bot, title: 'Smart Assistant', desc: 'Get instant answers to all your farming questions', color: 'from-teal-500 to-cyan-600' },
];

const stats = [
  { icon: Users, value: '10,000+', label: 'Farmers' },
  { icon: Leaf, value: '42', label: 'Crops' },
  { icon: BarChart3, value: '50+', label: 'Markets' },
  { icon: Shield, value: '99%', label: 'Accuracy' },
];

function useDefaultWeather() {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await searchLocation('Indore, India');
        const loc = results[0];
        if (!loc) return;
        const { current } = await fetchWeather(loc.latitude, loc.longitude);
        if (!cancelled) setWeather(current);
      } catch {
        // silently fail — widgets just show fallback values
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return weather;
}

const LiveWeatherWidget = memo(function LiveWeatherWidget() {
  const weather = useDefaultWeather();
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
        <Sun className="w-6 h-6 text-primary-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{weather?.temp ?? '—'}°C</p>
        <p className="text-xs text-slate-500">{weather ? weather.condition : 'Live Weather'}</p>
      </div>
    </div>
  );
});

const LiveHumidityWidget = memo(function LiveHumidityWidget() {
  const weather = useDefaultWeather();
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
        <Droplets className="w-6 h-6 text-secondary-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{weather?.humidity ?? '—'}%</p>
        <p className="text-xs text-slate-500">Humidity</p>
      </div>
    </div>
  );
});

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-white/20 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-800 dark:text-white">CropAdvisory</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">Sign In</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 via-transparent to-secondary-100/50 dark:from-primary-900/20 dark:to-secondary-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" /> Smart Farming for Every Farmer
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-slate-800 dark:text-white leading-tight">
              Smart Crop Advisory for{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Small-Scale Farmers
              </span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mt-6 max-w-2xl mx-auto">
              Get crop suggestions, fertilizer advice, weather updates, disease information, and market prices — all in one easy-to-use app.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link to="/register" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
                Start Free Today <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/about" className="btn-outline text-base px-8 py-3.5">Learn More</Link>
            </div>
          </motion.div>

          {/* Hero image / illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl glass-card">
              <img
                src={heroImage}
                alt="Farm field"
                className="w-full h-[300px] sm:h-[400px] object-cover"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null;
                  img.src = 'https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg?auto=compress&cs=tinysrgb&w=1200';
                }}
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden sm:block glass-card p-4 rounded-2xl">
              <LiveWeatherWidget />
            </div>
            <div className="absolute -top-6 -right-6 hidden sm:block glass-card p-4 rounded-2xl">
              <LiveHumidityWidget />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-3">
                  <stat.icon className="w-7 h-7" />
                </div>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">Everything You Need</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
              A complete set of tools designed to help farmers make better decisions
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-center text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Your Farm?</h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">
              Join thousands of farmers who are already using CropAdvisory to grow more and earn more.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-slate-800 dark:text-white">CropAdvisory</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">© 2026 CropAdvisory. Helping farmers grow more.</p>
        </div>
      </footer>
    </div>
  );
}
