import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sprout, Users, Bug, FlaskConical, TrendingUp,
  Plus, Edit2, Trash2, X, Save, Download,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { supabase, type Crop, type Disease, type Fertilizer, type MarketPrice, type Profile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { LoadingSpinner, EmptyState } from '../components/ui/Loading';

type Tab = 'overview' | 'crops' | 'farmers' | 'diseases' | 'fertilizers' | 'market';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [farmers, setFarmers] = useState<Profile[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [c, f, d, fert, m] = await Promise.all([
      supabase.from('crops').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('diseases').select('*'),
      supabase.from('fertilizers').select('*'),
      supabase.from('market_prices').select('*'),
    ]);
    setCrops(c.data || []);
    setFarmers(f.data || []);
    setDiseases(d.data || []);
    setFertilizers(fert.data || []);
    setMarketPrices(m.data || []);
    setLoading(false);
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { showToast('Delete failed', 'error'); return; }
    showToast('Item deleted', 'success');
    fetchAll();
  };

  const handleSave = async (table: string, data: any) => {
    if (data.id) {
      const { id, ...updates } = data;
      const { error } = await supabase.from(table).update(updates).eq('id', id);
      if (error) { showToast('Update failed', 'error'); return; }
      showToast('Item updated', 'success');
    } else {
      const { error } = await supabase.from(table).insert(data);
      if (error) { showToast('Insert failed', 'error'); return; }
      showToast('Item added', 'success');
    }
    setShowForm(false);
    setEditing(null);
    fetchAll();
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Admin Report - Crop Advisory System', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Crops: ${crops.length}`, 20, 40);
    doc.text(`Total Farmers: ${farmers.length}`, 20, 48);
    doc.text(`Total Diseases: ${diseases.length}`, 20, 56);
    doc.text(`Total Fertilizers: ${fertilizers.length}`, 20, 64);
    doc.text(`Total Market Entries: ${marketPrices.length}`, 20, 72);

    let y = 85;
    doc.setFontSize(14);
    doc.text('Farmers List:', 20, y); y += 8;
    doc.setFontSize(10);
    farmers.forEach((f) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${f.full_name || 'N/A'} - ${f.village || 'N/A'}, ${f.district || 'N/A'} (${f.role})`, 25, y);
      y += 6;
    });

    y += 5;
    doc.setFontSize(14);
    doc.text('Crops List:', 20, y); y += 8;
    doc.setFontSize(10);
    crops.forEach((c) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${c.crop_name} (${c.scientific_name}) - ${c.suitable_season} - ${c.market_value}`, 25, y);
      y += 6;
    });

    doc.save('admin-report.pdf');
    showToast('Report downloaded', 'success');
  };

  const tabs: { key: Tab; label: string; icon: typeof Sprout }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'crops', label: 'Crops', icon: Sprout },
    { key: 'farmers', label: 'Farmers', icon: Users },
    { key: 'diseases', label: 'Diseases', icon: Bug },
    { key: 'fertilizers', label: 'Fertilizers', icon: FlaskConical },
    { key: 'market', label: 'Market Prices', icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div>
        <PageHeader title="Admin Panel" icon={<LayoutDashboard className="w-6 h-6" />} />
        <Card className="p-8">
          <EmptyState
            icon={<Users className="w-10 h-10" />}
            title="Access Denied"
            message="You need administrator privileges to access this panel."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage crops, farmers, diseases, fertilizers, and market prices"
        icon={<LayoutDashboard className="w-6 h-6" />}
        action={<Button variant="outline" onClick={downloadReport} icon={<Download className="w-4 h-4" />}>Download Report</Button>}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Crops', value: crops.length, icon: Sprout, color: 'from-green-500 to-emerald-600' },
            { label: 'Total Farmers', value: farmers.length, icon: Users, color: 'from-blue-500 to-cyan-600' },
            { label: 'Diseases', value: diseases.length, icon: Bug, color: 'from-red-500 to-rose-600' },
            { label: 'Market Entries', value: marketPrices.length, icon: TrendingUp, color: 'from-amber-500 to-orange-600' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Crops Tab */}
      {tab === 'crops' && (
        <ManageTable
          title="Crops"
          data={crops}
          columns={['crop_name', 'scientific_name', 'suitable_season', 'soil_type', 'market_value']}
          headers={['Crop', 'Scientific Name', 'Season', 'Soil', 'Market Value']}
          onEdit={(item) => { setEditing(item); setShowForm(true); }}
          onDelete={(id) => handleDelete('crops', id)}
          onAdd={() => { setEditing(null); setShowForm(true); }}
        />
      )}

      {/* Farmers Tab */}
      {tab === 'farmers' && (
        <ManageTable
          title="Farmers"
          data={farmers}
          columns={['full_name', 'mobile_number', 'village', 'district', 'state', 'role']}
          headers={['Name', 'Mobile', 'Village', 'District', 'State', 'Role']}
          onEdit={() => {}}
          onDelete={(id) => handleDelete('profiles', id)}
          onAdd={undefined}
        />
      )}

      {/* Diseases Tab */}
      {tab === 'diseases' && (
        <ManageTable
          title="Diseases"
          data={diseases}
          columns={['crop_name', 'disease_name', 'symptoms']}
          headers={['Crop', 'Disease', 'Symptoms']}
          onEdit={(item) => { setEditing(item); setShowForm(true); }}
          onDelete={(id) => handleDelete('diseases', id)}
          onAdd={() => { setEditing(null); setShowForm(true); }}
        />
      )}

      {/* Fertilizers Tab */}
      {tab === 'fertilizers' && (
        <ManageTable
          title="Fertilizers"
          data={fertilizers}
          columns={['fertilizer_name', 'soil_condition', 'quantity', 'application_method']}
          headers={['Name', 'Soil Condition', 'Quantity', 'Application']}
          onEdit={(item) => { setEditing(item); setShowForm(true); }}
          onDelete={(id) => handleDelete('fertilizers', id)}
          onAdd={() => { setEditing(null); setShowForm(true); }}
        />
      )}

      {/* Market Tab */}
      {tab === 'market' && (
        <ManageTable
          title="Market Prices"
          data={marketPrices}
          columns={['crop_name', 'market_name', 'current_price', 'previous_price', 'price_trend']}
          headers={['Crop', 'Market', 'Current', 'Previous', 'Trend']}
          onEdit={(item) => { setEditing(item); setShowForm(true); }}
          onDelete={(id) => handleDelete('market_prices', id)}
          onAdd={() => { setEditing(null); setShowForm(true); }}
        />
      )}

      {/* Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <EditFormModal
            item={editing}
            tab={tab}
            onClose={() => { setShowForm(false); setEditing(null); }}
            onSave={(data) => {
              const table = tab === 'crops' ? 'crops' : tab === 'diseases' ? 'diseases' : tab === 'fertilizers' ? 'fertilizers' : 'market_prices';
              handleSave(table, data);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ManageTable({
  title, data, columns, headers, onEdit, onDelete, onAdd,
}: {
  title: string;
  data: any[];
  columns: string[];
  headers: string[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onAdd?: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-800 dark:text-white">{title} ({data.length})</h3>
        {onAdd && (
          <Button size="sm" onClick={onAdd} icon={<Plus className="w-4 h-4" />}>Add</Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              {headers.map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate">
                    {String(item[col] ?? '—')}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(item)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function EditFormModal({ item, tab, onClose, onSave }: {
  item: any;
  tab: Tab;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [form, setForm] = useState<any>(item || {});
  const [saving, setSaving] = useState(false);

  const fields: Record<Tab, { key: string; label: string; type?: string }[]> = {
    overview: [],
    crops: [
      { key: 'crop_name', label: 'Crop Name' },
      { key: 'scientific_name', label: 'Scientific Name' },
      { key: 'soil_type', label: 'Soil Type' },
      { key: 'suitable_season', label: 'Season' },
      { key: 'water_requirement', label: 'Water Requirement' },
      { key: 'temperature_range', label: 'Temperature Range' },
      { key: 'rainfall_range', label: 'Rainfall Range' },
      { key: 'fertilizer', label: 'Fertilizer' },
      { key: 'growth_duration', label: 'Growth Duration' },
      { key: 'expected_yield', label: 'Expected Yield' },
      { key: 'market_value', label: 'Market Value' },
      { key: 'image_url', label: 'Image URL' },
    ],
    farmers: [],
    diseases: [
      { key: 'crop_name', label: 'Crop Name' },
      { key: 'disease_name', label: 'Disease Name' },
      { key: 'symptoms', label: 'Symptoms' },
      { key: 'causes', label: 'Causes' },
      { key: 'prevention', label: 'Prevention' },
      { key: 'treatment', label: 'Treatment' },
      { key: 'organic_solution', label: 'Organic Solution' },
      { key: 'image_url', label: 'Image URL' },
    ],
    fertilizers: [
      { key: 'fertilizer_name', label: 'Fertilizer Name' },
      { key: 'soil_condition', label: 'Soil Condition' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'application_method', label: 'Application Method' },
      { key: 'precautions', label: 'Precautions' },
    ],
    market: [
      { key: 'crop_name', label: 'Crop Name' },
      { key: 'market_name', label: 'Market Name' },
      { key: 'current_price', label: 'Current Price', type: 'number' },
      { key: 'previous_price', label: 'Previous Price', type: 'number' },
      { key: 'price_trend', label: 'Price Trend' },
    ],
  };

  const handleSave = () => {
    setSaving(true);
    const data = { ...form };
    if (item?.id) data.id = item.id;
    if (tab === 'market') {
      data.current_price = Number(data.current_price);
      data.previous_price = Number(data.previous_price);
    }
    onSave(data);
    setSaving(false);
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
        className="glass-card max-w-lg w-full max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            {item ? 'Edit' : 'Add'} {tab === 'crops' ? 'Crop' : tab === 'diseases' ? 'Disease' : tab === 'fertilizers' ? 'Fertilizer' : 'Market Price'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {fields[tab].map((field) => (
            <Input
              key={field.key}
              label={field.label}
              type={field.type || 'text'}
              value={String(form[field.key] ?? '')}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            />
          ))}
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} icon={saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
