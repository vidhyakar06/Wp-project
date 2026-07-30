import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sprout, Search, Download, Calendar, Droplets, Thermometer,
  FlaskConical, TrendingUp, FileText, Loader2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { supabase, type Crop, type FarmDetail } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { EmptyState, LoadingSpinner } from '../components/ui/Loading';
import CropImage from '../components/ui/CropImage';

type RecommendationResult = Crop & { confidence: number };

export default function CropRecommendation() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [farmData, setFarmData] = useState<FarmDetail | null>(null);
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [search, setSearch] = useState('');
  const [allCrops, setAllCrops] = useState<Crop[]>([]);

  useEffect(() => {
    const fetchFarmAndCrops = async () => {
      if (!session?.user?.id) return;
      const [farm, crops] = await Promise.all([
        supabase.from('farm_details').select('*').eq('farmer_id', session.user.id).order('created_at', { ascending: false }).maybeSingle(),
        supabase.from('crops').select('*'),
      ]);
      setFarmData(farm.data as FarmDetail | null);
      setAllCrops(crops.data || []);
      setLoading(false);
    };
    fetchFarmAndCrops();
  }, [session?.user?.id]);

  const calculateConfidence = (crop: Crop, farm: FarmDetail): number => {
    let score = 0;
    let total = 0;

    // Soil type match (30%)
    total += 30;
    if (crop.soil_type === farm.soil_type) score += 30;
    else if (crop.soil_type === 'Loamy' && farm.soil_type === 'Alluvial') score += 20;

    // Season match (25%)
    total += 25;
    if (crop.suitable_season === farm.current_season) score += 25;
    else if (crop.suitable_season === 'All') score += 15;

    // Temperature match (20%)
    total += 20;
    const tempRange = crop.temperature_range?.match(/(\d+)-(\d+)/);
    if (tempRange) {
      const min = Number(tempRange[1]);
      const max = Number(tempRange[2]);
      if (farm.temperature >= min && farm.temperature <= max) score += 20;
      else if (Math.abs(farm.temperature - (min + max) / 2) < 10) score += 10;
    }

    // Rainfall match (15%)
    total += 15;
    const rainRange = crop.rainfall_range?.match(/(\d+)-(\d+)/);
    if (rainRange) {
      const min = Number(rainRange[1]);
      const max = Number(rainRange[2]);
      if (farm.rainfall >= min && farm.rainfall <= max) score += 15;
      else if (Math.abs(farm.rainfall - (min + max) / 2) < 50) score += 8;
    }

    // Water availability (10%)
    total += 10;
    const waterReq = crop.water_requirement?.toLowerCase() || '';
    const waterAvail = farm.water_availability?.toLowerCase() || '';
    if ((waterReq.includes('high') && (waterAvail.includes('high') || waterAvail.includes('very'))) ||
        (waterReq.includes('low') && (waterAvail.includes('low') || waterAvail.includes('medium'))) ||
        (waterReq.includes('medium') && waterAvail.includes('medium'))) {
      score += 10;
    }

    return Math.round((score / total) * 100);
  };

  const handleRecommend = async () => {
    if (!farmData) {
      showToast('Please add your farm details first', 'warning');
      return;
    }
    setAnalyzing(true);
    setTimeout(async () => {
      const scored = allCrops
        .map((crop) => ({ ...crop, confidence: calculateConfidence(crop, farmData) }))
        .filter((c) => c.confidence > 0)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 12);

      setResults(scored);

      // Save top 5 recommendations
      if (session?.user?.id) {
        const top5 = scored.slice(0, 5);
        for (const rec of top5) {
          await supabase.from('recommendations').insert({
            farmer_id: session.user.id,
            crop_id: rec.id,
            confidence: rec.confidence,
          });
        }
      }
      setAnalyzing(false);
      showToast(`Found ${scored.length} recommended crops!`, 'success');
    }, 1500);
  };

  const handleDownloadPDF = () => {
    if (results.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('My Crop Suggestions', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Farmer: ${session?.user?.email || 'N/A'}`, 20, 38);

    let y = 50;
    results.forEach((rec, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text(`${i + 1}. ${rec.crop_name} (${rec.confidence}% match)`, 20, y);
      doc.setFontSize(10);
      y += 7;
      doc.text(`Botanical Name: ${rec.scientific_name || 'N/A'}`, 25, y); y += 6;
      doc.text(`Soil Type: ${rec.soil_type} | Season: ${rec.suitable_season}`, 25, y); y += 6;
      doc.text(`Water: ${rec.water_requirement} | Duration: ${rec.growth_duration}`, 25, y); y += 6;
      doc.text(`Yield: ${rec.expected_yield} | Market: ${rec.market_value}`, 25, y); y += 6;
      doc.text(`Fertilizer: ${rec.fertilizer}`, 25, y); y += 10;
    });

    doc.save('crop-recommendations.pdf');
    showToast('PDF downloaded successfully', 'success');
  };

  const filteredResults = results.filter((r) =>
    r.crop_name.toLowerCase().includes(search.toLowerCase())
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
        title="Crop Suggestion"
        subtitle="Get smart crop suggestions based on your farm conditions"
        icon={<Sprout className="w-6 h-6" />}
        action={
          <div className="flex gap-2">
            {results.length > 0 && (
              <Button variant="outline" onClick={handleDownloadPDF} icon={<Download className="w-4 h-4" />}>PDF</Button>
            )}
            <Button onClick={handleRecommend} disabled={analyzing} icon={analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}>
              {analyzing ? 'Finding best crops...' : 'Get Crop Suggestions'}
            </Button>
          </div>
        }
      />

      {!farmData && (
        <Card className="p-6 mb-6">
          <EmptyState
            icon={<Sprout className="w-10 h-10" />}
            title="No Farm Details Added Yet"
            message="Please add your farm details first to get personalized crop suggestions."
            action={<Button onClick={() => navigate('/farm-details')}>Add Farm Details</Button>}
          />
        </Card>
      )}

      {farmData && results.length === 0 && !analyzing && (
        <Card className="p-8 mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 mx-auto mb-4">
            <Sprout className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Ready to Find Your Best Crops</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Click "Get Crop Suggestions" to find the best crops for your farm from over 42 crops.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm text-slate-600 dark:text-slate-300">
              Soil: {farmData.soil_type}
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm text-slate-600 dark:text-slate-300">
              Season: {farmData.current_season}
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm text-slate-600 dark:text-slate-300">
              Temp: {farmData.temperature}°C
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm text-slate-600 dark:text-slate-300">
              Rainfall: {farmData.rainfall}mm
            </div>
          </div>
        </Card>
      )}

      {analyzing && (
        <Card className="p-12 mb-6 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 dark:text-slate-400 mt-4">Finding the best crops for your farm...</p>
        </Card>
      )}

      {results.length > 0 && (
        <>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search crops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field max-w-md"
            />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <div className="relative h-40">
                    <CropImage src={rec.image_url} alt={rec.crop_name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur text-xs font-bold text-primary-600">
                      {rec.confidence}% match
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{rec.crop_name}</h3>
                    <p className="text-xs text-slate-400 italic">{rec.scientific_name}</p>
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {rec.growth_duration}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Droplets className="w-3.5 h-3.5 text-slate-400" /> {rec.water_requirement}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Thermometer className="w-3.5 h-3.5 text-slate-400" /> {rec.temperature_range}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-400" /> {rec.market_value}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <FlaskConical className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span>{rec.fertilizer}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span>Yield: {rec.expected_yield}</span>
                      </div>
                    </div>
                    {/* Confidence bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Match Score</span>
                        <span className="font-semibold text-primary-600">{rec.confidence}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${rec.confidence}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className={`h-full rounded-full ${rec.confidence > 75 ? 'bg-green-500' : rec.confidence > 50 ? 'bg-amber-500' : 'bg-slate-400'}`}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
