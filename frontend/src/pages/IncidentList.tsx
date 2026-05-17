import { useQuery } from '@tanstack/react-query';
import { incidentApi } from '../api/api';
import { Search, Filter, MoreHorizontal, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const styles = {
    'New': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Resolved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Closed': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'Assigned': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  return (
    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles[status as keyof typeof styles] || styles['New'])}>
      {t(`incidents.status.${status}`, { defaultValue: status })}
    </span>
  );
};

const PriorityIcon = ({ priority }: { priority: string }) => {
  const colors = {
    'Critical': 'text-red-500',
    'High': 'text-orange-500',
    'Medium': 'text-amber-500',
    'Low': 'text-emerald-500',
  };
  return <AlertCircle className={clsx("w-4 h-4", colors[priority as keyof typeof colors] || 'text-slate-400')} />;
};

export const IncidentList = () => {
  const { data: incidents = [], isLoading } = useQuery({ queryKey: ['incidents'], queryFn: incidentApi.list });
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('incidents.list_title')}</h1>
          <p className="text-slate-400 mt-1">{t('incidents.list_subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder={t('incidents.search_placeholder')} 
              className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
            <Filter className="w-4 h-4" />
            {t('common.filter')}
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/20">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('incidents.table_id_title')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('incidents.table_status')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('incidents.table_priority')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('incidents.table_reported_at')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{t('incidents.table_action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-4 bg-slate-800/10 h-16"></td>
                </tr>
              ))
            ) : incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="text-xs font-mono text-slate-500 mb-1">#{incident.id.slice(0, 8)}</div>
                  <div className="font-medium text-slate-200 group-hover:text-brand-400 transition-colors">{incident.title}</div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={incident.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <PriorityIcon priority={incident.priority} />
                    {t(`incidents.priority.${incident.priority}`, { defaultValue: incident.priority })}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {new Date(incident.reported_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => {
                      console.log("Navigating to incident:", incident.id);
                      navigate(`/incidents/${incident.id}`);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && incidents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                  {t('incidents.no_incidents_found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
