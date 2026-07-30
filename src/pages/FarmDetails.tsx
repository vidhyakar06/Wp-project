import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Save, FlaskConical, Cloud, Droplets, Thermometer, RotateCcw, CheckCircle2, Info } from 'lucide-react';
import { supabase, type FarmDetail } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/Loading';

const soilTypes = ['Loamy', 'Sandy', 'Clay', 'Black', 'Red', 'Alluvial', 'Laterite'];
const seasons = ['Monsoon Season', 'Winter Season', 'Summer Season', 'All Seasons'];
const waterAvailability = ['Low', 'Medium', 'High', 'Very High'];

const emptyForm = {
  soil_type: '', soil_ph: '', nitrogen: '', phosphorus: '', potassium: '',
  rainfall: '', temperature: '', humidity: '', water_availability: '', current_season: '',
};

const requiredFields: (keyof typeof emptyForm)[] = [
  'soil_type', 'soil_ph', 'nitrogen', 'phosphorus', 'potassium',
  'rainfall', 'temperature', 'humidity', 'water_availability', 'current_season',
];

function getPHCategory(ph: number): { label: string; color: string } {
  if (ph === 0) return { label: '', color: '' };
  if (ph < 5.5) return { label: 'Too Sour', color: 'text-red-500' };
  if (ph < 6.5) return { label: 'Slightly Sour', color: 'text-amber-500' };
  if (ph <= 7.5) return { label: 'Balanced (Ideal)', color: 'text-green-500' };
  if (ph <= 8.5) return { label: 'Slightly Bitter', color: 'text-amber-500' };
  return { label: 'Too Bitter', color: 'text-red-500' };
}

function getNPKLevel(value: number, type: 'n' | 'p' | 'k'): { label: string; className: string } {
  if (value === 0) return { label: '', className: '' };
  const thresholds = {
    n: { low: 50, high: 150 },
    p: { low: 30, high: 60 },
    k: { low: 50, high: 150 },
  };
  const t = thresholds[type];
  if (value < t.low) return { label: 'Low', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (value <= t.high) return { label: 'Medium', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  return { label: 'High', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{children}</p>;
}

export default function FarmDetails() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<FarmDetail | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchFarm = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from('farm_details')
        .select('*')
        .eq('farmer_id', session.user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      if (data) {
        setExisting(data as FarmDetail);
        setForm({
          soil_type: data.soil_type || '',
          soil_ph: String(data.soil_ph || ''),
          nitrogen: String(data.nitrogen || ''),
          phosphorus: String(data.phosphorus || ''),
          potassium: String(data.potassium || ''),
          rainfall: String(data.rainfall || ''),
          temperature: String(data.temperature || ''),
          humidity: String(data.humidity || ''),
          water_availability: data.water_availability || '',
          current_season: data.current_season || '',
        });
      }
      setLoading(false);
    };
    fetchFarm();
  }, [session?.user?.id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.soil_type) e.soil_type = 'Required';
    if (!form.soil_ph) e.soil_ph = 'Required';
    else if (Number(form.soil_ph) < 0 || Number(form.soil_ph) > 14) e.soil_ph = 'pH must be 0-14';
    if (!form.nitrogen) e.nitrogen = 'Required';
    if (!form.phosphorus) e.phosphorus = 'Required';
    if (!form.potassium) e.potassium = 'Required';
    if (!form.rainfall) e.rainfall = 'Required';
    if (!form.temperature) e.temperature = 'Required';
    if (!form.humidity) e.humidity = 'Required';
    if (!form.water_availability) e.water_availability = 'Required';
    if (!form.current_season) e.current_season = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !session?.user?.id) return;
    setSaving(true);
    try {
      const payload = {
        farmer_id: session.user.id,
        soil_type: form.soil_type,
        soil_ph: Number(form.soil_ph),
        nitrogen: Number(form.nitrogen),
        phosphorus: Number(form.phosphorus),
        potassium: Number(form.potassium),
        rainfall: Number(form.rainfall),
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
        water_availability: form.water_availability,
        current_season: form.current_season,
      };
      if (existing) {
        const { error } = await supabase.from('farm_details').update(payload).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('farm_details').insert(payload);
        if (error) throw error;
      }
      showToast('Farm details saved successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save farm details', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setErrors({});
    showToast('Form cleared', 'info');
  };

  const filledCount = requiredFields.filter((f) => form[f] !== '').length;
  const completion = Math.round((filledCount / requiredFields.length) * 100);
  const phNum = Number(form.soil_ph) || 0;
  const phCategory = getPHCategory(phNum);
  const nLevel = getNPKLevel(Number(form.nitrogen) || 0, 'n');
  const pLevel = getNPKLevel(Number(form.phosphorus) || 0, 'p');
  const kLevel = getNPKLevel(Number(form.potassium) || 0, 'k');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHeader
        title="Farm Details"
        subtitle="Enter your soil and weather details so we can suggest the best crops for your farm"
        icon={<Sprout className="w-6 h-6" />}
        action={
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{completion}%</span>
            </div>
            <Button onClick={handleSave} disabled={saving} icon={saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}>
              {saving ? 'Saving...' : 'Save Details'}
            </Button>
          </div>
        }
      />

      {existing && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Your farm details are saved. Update any field and save again to keep your suggestions accurate.
        </div>
      )}

      <div className="mb-6 rounded-2xl overflow-hidden shadow-lg relative h-48 sm:h-64">
        <img
          src="https://images.pexels.com/photos/4407999/pexels-photo-4407999.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Farm field"
          className="w-full h-full object-cover"
          onError={(e) => {
            const img = e.currentTarget;
            img.onerror = null;
            img.src = 'https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg?auto=compress&cs=tinysrgb&w=1200';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
          <Sprout className="w-5 h-5" />
          <span className="font-semibold text-sm sm:text-base">Your Farm at a Glance</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Soil Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Soil Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Select
                  label="Soil Type"
                  value={form.soil_type}
                  onChange={(e) => setForm({ ...form, soil_type: e.target.value })}
                  error={errors.soil_type}
                  options={[{ value: '', label: 'Select soil type' }, ...soilTypes.map((s) => ({ value: s, label: s }))]}
                />
                <Hint>If unsure, loamy and alluvial soils are most common for farming.</Hint>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Soil pH Level (0-14)</label>
                  {phCategory.label && (
                    <span className={`text-xs font-semibold ${phCategory.color}`}>{phCategory.label}</span>
                  )}
                </div>
                <Input
                  type="number"
                  step="0.1"
                  value={form.soil_ph}
                  onChange={(e) => setForm({ ...form, soil_ph: e.target.value })}
                  error={errors.soil_ph}
                  placeholder="e.g., 6.5"
                />
                <Hint>Most crops grow best at pH 6.0-7.5. Test kits are available at local agriculture centers.</Hint>
                {phNum > 0 && (
                  <div className="mt-2">
                    <div className="relative h-2 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-red-500">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-700 dark:border-white shadow transition-all duration-300"
                        style={{ left: `calc(${(phNum / 14) * 100}% - 6px)` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0 Sour</span><span>7 Balanced</span><span>14 Bitter</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'nitrogen' as const, label: 'Nitrogen', level: nLevel, type: 'n' as const },
                  { key: 'phosphorus' as const, label: 'Phosphorus', level: pLevel, type: 'p' as const },
                  { key: 'potassium' as const, label: 'Potassium', level: kLevel, type: 'k' as const },
                ].map((field) => (
                  <div key={field.key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">{field.label}</label>
                      {field.level.label && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${field.level.className}`}>
                          {field.level.label}
                        </span>
                      )}
                    </div>
                    <Input
                      type="number"
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      error={errors[field.key]}
                      placeholder="kg/acre"
                    />
                  </div>
                ))}
              </div>
              <Hint>Soil nutrient levels from a soil test (in kg per acre). Low levels: Nitrogen below 50, Phosphorus below 30, Potassium below 50.</Hint>
            </div>
          </Card>
        </motion.div>

        {/* Environmental Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Weather & Water Conditions</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    label="Rainfall (mm)"
                    type="number"
                    value={form.rainfall}
                    onChange={(e) => setForm({ ...form, rainfall: e.target.value })}
                    error={errors.rainfall}
                    icon={<Droplets className="w-4 h-4" />}
                    placeholder="e.g., 850"
                  />
                  <Hint>Annual rainfall in your area (mm).</Hint>
                </div>
                <div>
                  <Input
                    label="Temperature (°C)"
                    type="number"
                    value={form.temperature}
                    onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                    error={errors.temperature}
                    icon={<Thermometer className="w-4 h-4" />}
                    placeholder="e.g., 28"
                  />
                  <Hint>Current average temp in °C.</Hint>
                </div>
              </div>
              <div>
                <Input
                  label="Humidity (%)"
                  type="number"
                  value={form.humidity}
                  onChange={(e) => setForm({ ...form, humidity: e.target.value })}
                  error={errors.humidity}
                  placeholder="e.g., 72"
                />
                <Hint>Check your local weather app for current humidity.</Hint>
              </div>
              <Select
                label="Water Availability"
                value={form.water_availability}
                onChange={(e) => setForm({ ...form, water_availability: e.target.value })}
                error={errors.water_availability}
                options={[{ value: '', label: 'Select' }, ...waterAvailability.map((w) => ({ value: w, label: w }))]}
              />
              <Select
                label="Current Season"
                value={form.current_season}
                onChange={(e) => setForm({ ...form, current_season: e.target.value })}
                error={errors.current_season}
                options={[{ value: '', label: 'Select season' }, ...seasons.map((s) => ({ value: s, label: s }))]}
              />
              <Hint>Monsoon Season: Jun-Oct. Winter Season: Nov-Apr. Summer Season: Mar-Jun.</Hint>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Info Banner */}
      <Card className="p-5 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Why do we need this information?</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your soil and weather details help us suggest the best crops, fertilizers, and farming methods for your farm. Update this regularly for the most accurate results.
            </p>
          </div>
        </div>
      </Card>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:ml-64 border-t border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline">{filledCount} of {requiredFields.length} fields filled</span>
          <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden sm:hidden">
            <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${completion}%` }} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>Clear</Button>
          <Button onClick={handleSave} disabled={saving} icon={saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}>
            {saving ? 'Saving...' : 'Save Details'}
          </Button>
        </div>
      </div>
    </div>
  );
}
