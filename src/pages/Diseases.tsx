import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Search, AlertCircle, Shield, FlaskRound, Leaf, Eye, Calendar, Plus, X, Save, Layers, Filter } from 'lucide-react';
import { supabase, type Disease, type Crop, type FarmDetail } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { EmptyState, LoadingSpinner } from '../components/ui/Loading';
import CropImage from '../components/ui/CropImage';

const soilTypes = ['All Soil Types', 'Loamy', 'Sandy', 'Clay', 'Black', 'Red', 'Alluvial', 'Laterite'];

export default function Diseases() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [userSoilType, setUserSoilType] = useState<string | null>(null);
  const [selectedSoil, setSelectedSoil] = useState<string>('All Soil Types');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Disease | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [diseaseRes, cropRes, farmRes] = await Promise.all([
        supabase.from('diseases').select('*').order('crop_name'),
        supabase.from('crops').select('crop_name, soil_type'),
        session?.user?.id
          ? supabase.from('farm_details').select('soil_type').eq('farmer_id', session.user.id).order('created_at', { ascending: false }).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      setDiseases(diseaseRes.data || []);
      setCrops((cropRes.data as Crop[]) || []);
      if (farmRes.data?.soil_type) {
        setUserSoilType(farmRes.data.soil_type);
      }
      setLoading(false);
    };
    fetchData();
  }, [session?.user?.id]);

  // Build map of crop_name -> soil_type
  const cropSoilMap: Record<string, string> = {};
  crops.forEach((c) => {
    if (c.crop_name && c.soil_type) {
      cropSoilMap[c.crop_name.toLowerCase()] = c.soil_type;
    }
  });

  const filtered = diseases.filter((d) => {
    const matchesSearch =
      d.crop_name.toLowerCase().includes(search.toLowerCase()) ||
      d.disease_name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedSoil !== 'All Soil Types') {
      const cropSoil = cropSoilMap[d.crop_name.toLowerCase()] || '';
      if (!cropSoil.toLowerCase().includes(selectedSoil.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const handleDiseaseAdded = (newDisease: Disease) => {
    setDiseases((prev) => [newDisease, ...prev]);
  };

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
        subtitle="Find, manage, and learn about diseases affecting your crops"
        icon={<Bug className="w-6 h-6" />}
        action={
          <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
            Add Disease
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search crop or disease name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSoil}
              onChange={(e) => setSelectedSoil(e.target.value)}
              className="input-field py-2 text-sm max-w-[180px]"
            >
              {soilTypes.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {userSoilType && (
            <button
              onClick={() => setSelectedSoil(selectedSoil === userSoilType ? 'All Soil Types' : userSoilType)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                selectedSoil === userSoilType
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              My Farm Soil: {userSoilType}
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Bug className="w-10 h-10" />}
            title="No Diseases Matched Your Search"
            message={`No disease found matching "${search || selectedSoil}". Try selecting a different soil type or clearing filters.`}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((disease, i) => {
            const cropSoil = cropSoilMap[disease.crop_name.toLowerCase()];
            const isUserSoilMatch = userSoilType && cropSoil && cropSoil.toLowerCase().includes(userSoilType.toLowerCase());

            return (
              <motion.div
                key={disease.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(disease)}
              >
                <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="relative h-40">
                    <CropImage src={disease.image_url} alt={`${disease.crop_name} ${disease.disease_name}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-800/90 text-xs font-medium text-primary-600">
                          {disease.crop_name}
                        </span>
                        {cropSoil && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isUserSoilMatch
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-800/80 text-amber-300'
                          }`}>
                            Soil: {cropSoil}
                          </span>
                        )}
                        {disease.season && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/90 text-xs font-medium text-white">
                            <Calendar className="w-3 h-3" /> {disease.season}
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-bold text-lg">{disease.disease_name}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{disease.symptoms}</p>
                    <div className="flex items-center justify-between text-xs font-medium mt-3">
                      <span className="flex items-center gap-1 text-primary-600">
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </span>
                      {isUserSoilMatch && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          ✓ Fits Your Soil
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
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
              <CropImage src={selected.image_url} alt={`${selected.crop_name} ${selected.disease_name}`} className="w-full h-full object-cover" />

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

      {/* Add Disease Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddDiseaseModal
            onClose={() => setShowAddModal(false)}
            onSave={(newDisease) => {
              handleDiseaseAdded(newDisease);
              setShowAddModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddDiseaseModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (disease: Disease) => void;
}) {
  const [form, setForm] = useState({
    crop_name: '',
    disease_name: '',
    season: 'Monsoon Season',
    symptoms: '',
    causes: '',
    prevention: '',
    treatment: '',
    organic_solution: '',
    image_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.crop_name || !form.disease_name) {
      setError('Please fill in Crop Name and Disease Name.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      image_url: form.image_url || `/crops/${form.crop_name.toLowerCase().replace(/\s+/g, '-')}.png`,
    };

    const { data, error: dbErr } = await supabase.from('diseases').insert([payload]).select().single();

    if (dbErr) {
      setError(dbErr.message);
      setSaving(false);
    } else if (data) {
      onSave(data);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card max-w-xl w-full max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Add New Disease</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Crop Name *"
              placeholder="e.g. Tomato, Paddy, Wheat"
              value={form.crop_name}
              onChange={(e) => setForm({ ...form, crop_name: e.target.value })}
            />
            <Input
              label="Disease Name *"
              placeholder="e.g. Early Blight, Leaf Spot"
              value={form.disease_name}
              onChange={(e) => setForm({ ...form, disease_name: e.target.value })}
            />
          </div>

          <Select
            label="Suitable / Prevalent Season"
            value={form.season}
            onChange={(e) => setForm({ ...form, season: e.target.value })}
            options={[
              { value: 'Monsoon Season', label: 'Monsoon Season' },
              { value: 'Winter Season', label: 'Winter Season' },
              { value: 'Summer Season', label: 'Summer Season' },
              { value: 'All Seasons', label: 'All Seasons' },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Symptoms</label>
            <textarea
              rows={2}
              className="input-field"
              placeholder="Describe visible symptoms on leaves, stem or fruit..."
              value={form.symptoms}
              onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Causes</label>
            <input
              type="text"
              className="input-field"
              placeholder="Fungal, bacterial, virus, moisture level..."
              value={form.causes}
              onChange={(e) => setForm({ ...form, causes: e.target.value })}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Prevention</label>
              <input
                type="text"
                className="input-field"
                placeholder="Crop rotation, sanitation..."
                value={form.prevention}
                onChange={(e) => setForm({ ...form, prevention: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Treatment</label>
              <input
                type="text"
                className="input-field"
                placeholder="Fungicide spray, copper soap..."
                value={form.treatment}
                onChange={(e) => setForm({ ...form, treatment: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Organic Solution</label>
            <input
              type="text"
              className="input-field"
              placeholder="Neem oil spray, bio-pesticides..."
              value={form.organic_solution}
              onChange={(e) => setForm({ ...form, organic_solution: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Disease Image URL"
              placeholder="https://... or /crops/... (leave empty for auto preview)"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            <div className="mt-2">
              <p className="text-xs font-medium text-slate-500 mb-1">Live Image Module Preview:</p>
              <div className="h-36 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-slate-100 dark:bg-slate-800">
                <CropImage
                  src={form.image_url || null}
                  alt={`${form.crop_name} ${form.disease_name}`.trim() || 'Disease Module Image'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} icon={saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}>
              {saving ? 'Saving...' : 'Save Disease'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
