import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Images, Bug, Sprout, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/ui/PageHeader';
import CropImage from '../components/ui/CropImage';
import { LoadingSpinner } from '../components/ui/Loading';

type Crop = {
  id: string;
  crop_name: string;
  scientific_name: string | null;
  image_url: string | null;
  suitable_season: string | null;
};

type Disease = {
  id: string;
  disease_name: string;
  crop_name: string | null;
  image_url: string | null;
  symptoms: string | null;
};

type Tab = 'crops' | 'diseases';

export default function Gallery() {
  const [tab, setTab] = useState<Tab>('crops');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Crop | Disease | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [cropRes, diseaseRes] = await Promise.all([
        supabase.from('crops').select('id, crop_name, scientific_name, image_url, suitable_season').order('crop_name'),
        supabase.from('diseases').select('id, disease_name, crop_name, image_url, symptoms').order('crop_name'),
      ]);
      setCrops(cropRes.data || []);
      setDiseases(diseaseRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredCrops = crops.filter((c) =>
    c.crop_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.scientific_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredDiseases = diseases.filter((d) =>
    d.disease_name.toLowerCase().includes(search.toLowerCase()) ||
    (d.crop_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const isCrop = (item: Crop | Disease): item is Crop => 'crop_name' in item && !('disease_name' in item);

  return (
    <div>
      <PageHeader
        title="Image Gallery"
        subtitle="Browse all crop and disease images"
        icon={<Images className="w-6 h-6" />}
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('crops')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            tab === 'crops'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Sprout className="w-4 h-4" />
          Crops ({crops.length})
        </button>
        <button
          onClick={() => setTab('diseases')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            tab === 'diseases'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Bug className="w-4 h-4" />
          Diseases ({diseases.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === 'crops' ? 'Search crops...' : 'Search diseases or crops...'}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : tab === 'crops' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredCrops.map((crop, i) => (
            <motion.button
              key={crop.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              onClick={() => setSelected(crop)}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            >
              <CropImage src={crop.image_url} alt={crop.crop_name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-semibold text-sm truncate">{crop.crop_name}</p>
                {crop.suitable_season && (
                  <p className="text-white/70 text-xs truncate">{crop.suitable_season}</p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredDiseases.map((disease, i) => (
            <motion.button
              key={disease.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              onClick={() => setSelected(disease)}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            >
              <CropImage src={disease.image_url} alt={disease.disease_name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-semibold text-sm truncate">{disease.disease_name}</p>
                {disease.crop_name && (
                  <p className="text-white/70 text-xs truncate">{disease.crop_name}</p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelected(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-2xl w-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full overflow-hidden">
              <CropImage
                src={selected.image_url}
                alt={isCrop(selected) ? selected.crop_name : selected.disease_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              {isCrop(selected) ? (
                <>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selected.crop_name}</h3>
                  {selected.scientific_name && (
                    <p className="text-sm italic text-slate-500 dark:text-slate-400 mt-1">{selected.scientific_name}</p>
                  )}
                  {selected.suitable_season && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
                      <span className="font-medium">Best Season:</span> {selected.suitable_season}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selected.disease_name}</h3>
                  {selected.crop_name && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      <span className="font-medium">Affects:</span> {selected.crop_name}
                    </p>
                  )}
                  {selected.symptoms && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
                      <span className="font-medium">Symptoms:</span> {selected.symptoms}
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
