import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, Search, AlertCircle, Shield, FlaskRound, Leaf, Eye, Calendar } from 'lucide-react';
import { supabase, type Disease } from '../lib/supabase';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { EmptyState, LoadingSpinner } from '../components/ui/Loading';
import CropImage from '../components/ui/CropImage';

export default function Diseases() {
  const [loading, setLoading] = useState(true);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Disease | null>(null);

  useEffect(() => {
    const fetchDiseases = async () => {
      const { data } = await supabase.from('diseases').select('*').order('crop_name');
      setDiseases(data || []);
      setLoading(false);
    };
    fetchDiseases();
  }, []);

  const filtered = diseases.filter((d) =>
    d.crop_name.toLowerCase().includes(search.toLowerCase()) ||
    d.disease_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Crop Diseases"
        subtitle="Find and learn about diseases affecting your crops"
        icon={<Bug className="w-6 h-6" />}
      />

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by crop or disease name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Bug className="w-10 h-10" />} title="No Diseases Matched Your Search" message="Try searching with a different crop or disease name." />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((disease, i) => (
            <motion.div
              key={disease.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(disease)}
            >
              <Card className="overflow-hidden cursor-pointer">
                <div className="relative h-40">
                  <CropImage src={disease.image_url} alt={disease.disease_name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 text-xs font-medium text-primary-600">
                        {disease.crop_name}
                      </span>
                      {disease.season && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-xs font-medium text-white">
                          <Calendar className="w-3 h-3" /> {disease.season}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-bold text-lg">{disease.disease_name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{disease.symptoms}</p>
                  <div className="flex items-center gap-1 text-xs text-primary-600 font-medium mt-3">
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card max-w-2xl w-full max-h-[85vh] overflow-y-auto"
          >
            <div className="relative h-48">
              <CropImage src={selected.image_url} alt={selected.disease_name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-800/90 flex items-center justify-center text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 text-xs font-medium text-primary-600">
                    {selected.crop_name}
                  </span>
                  {selected.season && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/90 text-xs font-medium text-white">
                      <Calendar className="w-3 h-3" /> {selected.season}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white">{selected.disease_name}</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white">Symptoms</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{selected.symptoms}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white">Causes</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{selected.causes}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white">Prevention</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{selected.prevention}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 shrink-0">
                  <FlaskRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white">Treatment</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{selected.treatment}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white">Organic Solution</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{selected.organic_solution}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
