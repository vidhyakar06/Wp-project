import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileBarChart, Download, FileText, TrendingUp, Sprout, Users,
  Calendar, MapPin,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/Loading';

export default function Reports() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [farmDetails, setFarmDetails] = useState<any>(null);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      const [recs, farm, market] = await Promise.all([
        supabase.from('recommendations').select('*, crops(*)').eq('farmer_id', session.user.id).order('recommendation_date', { ascending: false }),
        supabase.from('farm_details').select('*').eq('farmer_id', session.user.id).order('created_at', { ascending: false }).maybeSingle(),
        supabase.from('market_prices').select('*').limit(10),
      ]);
      setRecommendations(recs.data || []);
      setFarmDetails(farm.data);
      setMarketPrices(market.data || []);
      setLoading(false);
    };
    fetchData();
  }, [session?.user?.id]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Farm Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Farmer: ${session?.user?.email}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 38);

    let y = 50;
    if (farmDetails) {
      doc.setFontSize(14);
      doc.text('Farm Details:', 20, y); y += 8;
      doc.setFontSize(10);
      doc.text(`Soil Type: ${farmDetails.soil_type}`, 25, y); y += 6;
      doc.text(`Soil pH: ${farmDetails.soil_ph}`, 25, y); y += 6;
      doc.text(`Soil Nutrients: Nitrogen ${farmDetails.nitrogen}, Phosphorus ${farmDetails.phosphorus}, Potassium ${farmDetails.potassium}`, 25, y); y += 6;
      doc.text(`Season: ${farmDetails.current_season}`, 25, y); y += 10;
    }

    doc.setFontSize(14);
    doc.text('Recommendations:', 20, y); y += 8;
    doc.setFontSize(10);
    recommendations.forEach((rec, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${i + 1}. ${rec.crops?.crop_name} - ${rec.confidence}% match (${new Date(rec.recommendation_date).toLocaleDateString()})`, 25, y);
      y += 6;
    });

    y += 5;
    doc.setFontSize(14);
    doc.text('Market Prices:', 20, y); y += 8;
    doc.setFontSize(10);
    marketPrices.forEach((m) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${m.crop_name} @ ${m.market_name}: ₹${m.current_price}/quintal (${m.price_trend})`, 25, y);
      y += 6;
    });

    doc.save('farm-report.pdf');
    showToast('Report downloaded', 'success');
  };

  const downloadCSV = () => {
    const rows = [['Crop Name', 'Match', 'Date', 'Market', 'Current Price']];
    recommendations.forEach((r) => {
      rows.push([r.crops?.crop_name || '', String(r.confidence), new Date(r.recommendation_date).toLocaleDateString(), '', '']);
    });
    marketPrices.forEach((m) => {
      rows.push([m.crop_name, '', '', m.market_name, String(m.current_price)]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farm-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Excel file downloaded', 'success');
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
        title="Reports"
        subtitle="View and download your farm reports"
        icon={<FileBarChart className="w-6 h-6" />}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadCSV} icon={<Download className="w-4 h-4" />}>Excel</Button>
            <Button onClick={downloadPDF} icon={<FileText className="w-4 h-4" />}>PDF</Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Crop Suggestions', value: recommendations.length, icon: Sprout, color: 'from-green-500 to-emerald-600' },
          { label: 'Farm Details', value: farmDetails ? 'Complete' : 'Not Added', icon: FileText, color: 'from-blue-500 to-cyan-600' },
          { label: 'Market Prices Listed', value: marketPrices.length, icon: TrendingUp, color: 'from-amber-500 to-orange-600' },
          { label: 'Report Date', value: new Date().toLocaleDateString('en-GB'), icon: Calendar, color: 'from-purple-500 to-violet-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Farm Details Summary */}
      {farmDetails && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Farm Details Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <p className="text-xs text-slate-500">Soil Type</p>
              <p className="font-semibold text-slate-800 dark:text-white">{farmDetails.soil_type}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <p className="text-xs text-slate-500">Soil pH</p>
              <p className="font-semibold text-slate-800 dark:text-white">{farmDetails.soil_ph}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <p className="text-xs text-slate-500">Nitrogen</p>
              <p className="font-semibold text-slate-800 dark:text-white">{farmDetails.nitrogen} kg/ha</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <p className="text-xs text-slate-500">Phosphorus</p>
              <p className="font-semibold text-slate-800 dark:text-white">{farmDetails.phosphorus} kg/ha</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <p className="text-xs text-slate-500">Potassium</p>
              <p className="font-semibold text-slate-800 dark:text-white">{farmDetails.potassium} kg/ha</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <p className="text-xs text-slate-500">Rainfall</p>
              <p className="font-semibold text-slate-800 dark:text-white">{farmDetails.rainfall} mm</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <p className="text-xs text-slate-500">Temperature</p>
              <p className="font-semibold text-slate-800 dark:text-white">{farmDetails.temperature}°C</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <p className="text-xs text-slate-500">Season</p>
              <p className="font-semibold text-slate-800 dark:text-white">{farmDetails.current_season}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations Table */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Crop Suggestion History</h3>
        {recommendations.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No crop suggestions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Crop</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Match</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec) => (
                  <tr key={rec.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{rec.crops?.crop_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium">
                        {rec.confidence}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(rec.recommendation_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Market Prices Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Market Price Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Crop</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Market</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Price (₹/quintal)</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody>
              {marketPrices.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{m.crop_name}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {m.market_name}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white text-right">₹{m.current_price}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium ${m.price_trend === 'Up' ? 'text-green-600' : 'text-red-600'}`}>
                      {m.price_trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
