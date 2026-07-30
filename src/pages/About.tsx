import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sprout, Target, Users, Leaf, Globe, Award, ArrowRight, Heart,
} from 'lucide-react';

const values = [
  { icon: Target, title: 'Our Mission', desc: 'Help small farmers make better decisions to grow more and earn more.' },
  { icon: Heart, title: 'Our Values', desc: 'We believe in farming that lasts, putting farmers first, and tools everyone can use.' },
  { icon: Globe, title: 'Our Vision', desc: 'A world where every farmer has access to expert farming advice at their fingertips.' },
];

const team = [
  { name: 'Agricultural Experts', role: 'Crop Experts', icon: Leaf },
  { name: 'Data Scientists', role: 'Smart Farming Tools', icon: Award },
  { name: 'Farmer Community', role: '10,000+ Members', icon: Users },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-slate-900 dark:to-slate-800">
      <nav className="sticky top-0 z-50 glass border-b border-white/20 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-800 dark:text-white">CropAdvisory</span>
          </Link>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white mb-6">About CropAdvisory</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            We are a smart farming app made to help small farmers with crop suggestions, live weather, market prices, and farming advice.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                <v.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{v.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="card p-8 mb-16">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">What We Offer</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Crop suggestions based on soil and weather',
              'Fertilizer advice based on your soil nutrients',
              'Live weather with 7-day forecasts',
              'Crop disease information and treatment',
              'Live market prices across local markets',
              'Smart farming assistant for instant answers',
              'Your own farm summary page with useful insights',
              'Tools for managing farm information',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <Leaf className="w-3.5 h-3.5 text-primary-600" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {team.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white mx-auto mb-4">
                <t.icon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white">{t.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.role}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
            Join Us Today <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
