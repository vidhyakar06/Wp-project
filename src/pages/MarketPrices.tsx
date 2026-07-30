import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Search, ArrowUpDown, MapPin } from 'lucide-react';
import { supabase, type MarketPrice } from '../lib/supabase';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { Select } from '../components/ui/Input';
import { EmptyState, LoadingSpinner } from '../components/ui/Loading';

type SortKey = 'crop_name' | 'current_price' | 'market_name';
type SortOrder = 'asc' | 'desc';

export default function MarketPrices() {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [search, setSearch] = useState('');
  const [marketFilter, setMarketFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('crop_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchPrices = async () => {
      const { data } = await supabase.from('market_prices').select('*').order('crop_name');
      setPrices(data || []);
      setLoading(false);
    };
    fetchPrices();
  }, []);

  const markets = useMemo(() => [...new Set(prices.map((p) => p.market_name))], [prices]);

  const filtered = useMemo(() => {
    let result = prices.filter((p) =>
      p.crop_name.toLowerCase().includes(search.toLowerCase()) &&
      (marketFilter === '' || p.market_name === marketFilter)
    );
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'crop_name') cmp = a.crop_name.localeCompare(b.crop_name);
      else if (sortKey === 'current_price') cmp = a.current_price - b.current_price;
      else cmp = a.market_name.localeCompare(b.market_name);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [prices, search, marketFilter, sortKey, sortOrder]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

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
        title="Market Prices"
        subtitle="Track live market prices across local markets"
        icon={<TrendingUp className="w-6 h-6" />}
      />

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search crop..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10"
            />
          </div>
          <Select
            value={marketFilter}
            onChange={(e) => { setMarketFilter(e.target.value); setPage(1); }}
            options={[{ value: '', label: 'All Markets' }, ...markets.map((m) => ({ value: m, label: m }))]}
          />
          <div className="flex gap-2">
            <Select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              options={[
                { value: 'crop_name', label: 'Sort: Crop Name' },
                { value: 'current_price', label: 'Sort: Price' },
                { value: 'market_name', label: 'Sort: Market' },
              ]}
            />
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<TrendingUp className="w-10 h-10" />} title="No Prices Available" message="Try adjusting your search or filters." />
        </Card>
      ) : (
        <>
          {/* Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Crop</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Market</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Price</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Previous Price</th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item, i) => {
                    const change = item.current_price - (item.previous_price || 0);
                    const isUp = change > 0;
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-800 dark:text-slate-100">{item.crop_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.market_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-slate-800 dark:text-white">₹{item.current_price.toLocaleString()}</span>
                          <span className="text-xs text-slate-400">/quintal</span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-500 dark:text-slate-400">
                          ₹{item.previous_price?.toLocaleString() || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            {isUp ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 text-xs font-medium">
                                <TrendingUp className="w-3.5 h-3.5" /> {change > 0 ? '+' : ''}{change}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-medium">
                                <TrendingDown className="w-3.5 h-3.5" /> {change}
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
