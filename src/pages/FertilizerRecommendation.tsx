import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical, Search, AlertTriangle, Beaker, Info } from 'lucide-react';
import { supabase, type Fertilizer, type FarmDetail } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { EmptyState, LoadingSpinner } from '../components/ui/Loading';

export default function FertilizerRecommendation() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [farmData, setFarmData] = useState<FarmDetail | null>(null);
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
  const [recommended, setRecommended] = useState<Fertilizer[]>([]);
  const [search, setSearch] = useState('');
  const [soilCondition, setSoilCondition] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      const [farm, ferts] = await Promise.all([
        supabase.from('farm_details').select('*').eq('farmer_id', session.user.id).order('created_at', { ascending: false }).maybeSingle(),
        supabase.from('fertilizers').select('*'),
      ]);
      setFarmData(farm.data as FarmDetail | null);
      setFertilizers(ferts.data || []);
      setLoading(false);
    };
    fetchData();
  }, [session?.user?.id]);

  const analyzeSoil = () => {
    if (!farmData) {
      showToast('Please add farm details first', 'warning');
      return;
    }

    const conditions: string[] = [];
    const { soil_ph, nitrogen, phosphorus, potassium } = farmData;

    if (soil_ph && soil_ph < 5.5) conditions.push('Acidic soil');
    if (soil_ph && soil_ph > 8.5) conditions.push('Alkaline soil');
    if (nitrogen !== null && nitrogen < 50) conditions.push('Nitrogen deficient soil');
    if (phosphorus !== null && phosphorus < 30) conditions.push('Phosphorus deficient soil');
    if (potassium !== null && potassium < 50) conditions.push('Potassium deficient soil');
    conditions.push('All soil types');

    const matched = fertilizers.filter((f) =>
      conditions.some((c) => f.soil_condition?.toLowerCase().includes(c.toLowerCase().split(' ')[0]))
    );

    // If no specific matches, return general fertilizers
    const result = matched.length > 0 ? matched : fertilizers.filter((f) => f.soil_condition?.includes('All'));
    setRecommended(result);
    setSoilCondition(conditions.join(', '));
    showToast(`Found ${result.length} fertilizer recommendations`, 'success');
  };

  const filtered = recommended.filter((f) =>
    f.fertilizer_name.toLowerCase().includes(search.toLowerCase())
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
        title="Fertilizer Suggestion"
        subtitle="Get the right fertilizer for your soil nutrients"
        icon={<FlaskConical className="w-6 h-6" />}
        action={<Button onClick={analyzeSoil} icon={<Search className="w-4 h-4" />}>Find Fertilizer</Button>}
      />

      {!farmData && (
        <Card className="p-6 mb-6">
          <EmptyState
            icon={<FlaskConical className="w-10 h-10" />}
            title="No Farm Details Added Yet"
            message="Please add your farm details with soil nutrient levels to get fertilizer suggestions."
            action={<Button onClick={() => navigate('/farm-details')}>Add Farm Details</Button>}
          />
        </Card>
      )}

      {farmData && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Your Soil Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4">
              <p className="text-xs text-amber-600 font-medium">Soil pH</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{farmData.soil_ph || 'N/A'}</p>
            </div>
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
              <p className="text-xs text-green-600 font-medium">Nitrogen</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{farmData.nitrogen || 'N/A'}</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
              <p className="text-xs text-blue-600 font-medium">Phosphorus</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{farmData.phosphorus || 'N/A'}</p>
            </div>
            <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 p-4">
              <p className="text-xs text-purple-600 font-medium">Potassium</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{farmData.potassium || 'N/A'}</p>
            </div>
          </div>
          {soilCondition && (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-medium">Soil conditions:</span> {soilCondition}
              </p>
            </div>
          )}
        </Card>
      )}

      {recommended.length > 0 && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search fertilizers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-md"
          />
        </div>
      )}

      {recommended.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-6">
          {filtered.map((fert, i) => (
            <motion.div
              key={fert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0">
                    <Beaker className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{fert.fertilizer_name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{fert.soil_condition}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Quantity</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{fert.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FlaskConical className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">How to Apply</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{fert.application_method}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Precautions</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{fert.precautions}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        farmData && recommended.length === 0 && (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 mx-auto mb-4">
              <FlaskConical className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Ready to Find Fertilizer</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Click "Find Fertilizer" to get fertilizer suggestions based on your soil nutrients.
            </p>
          </Card>
        )
      )}
    </div>
  );
}
