import { useQuery } from '@tanstack/react-query';
import { ciApi } from '../api/api';
import { Database, PlusCircle, MoreHorizontal, Server, Globe, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const CIInventory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: items, isLoading } = useQuery({
    queryKey: ['configuration-items'],
    queryFn: () => ciApi.list(),
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/20 text-emerald-400';
      case 'Maintenance': return 'bg-amber-500/20 text-amber-400';
      case 'Retired': return 'bg-slate-500/20 text-slate-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Server': return <Server className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Application': return <Globe className="w-4 h-4" />;
      case 'Network': return <ShieldCheck className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('inventory.title')}</h1>
          <p className="text-slate-400">{t('inventory.subtitle')}</p>
        </div>
        <button 
          onClick={() => navigate('/inventory/new')}
          className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-500/20"
        >
          <PlusCircle className="w-5 h-5" />
          {t('inventory.new_ci')}
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('inventory.table_name')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('inventory.table_type')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('inventory.table_environment')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('inventory.table_status')}</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-4 h-16 bg-slate-900/20"></td>
                </tr>
              ))
            ) : items?.length ? (
              items.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => navigate(`/inventory/${item.id}`)}
                  className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-brand-400 transition-colors">
                        {getIcon(item.type)}
                      </div>
                      <span className="font-semibold text-slate-200">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-slate-400">{t(`inventory.type.${item.type}`)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-slate-400">{item.environment || '-'}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", getStatusStyle(item.status))}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                  {t('inventory.no_items_found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
