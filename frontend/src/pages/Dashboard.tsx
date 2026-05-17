import { TrendingUp, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { incidentApi } from '../api/api';
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, icon: Icon, color, trend }: { title: string, value: string | number, icon: any, color: string, trend?: string }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 group hover:border-brand-500/50 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">{trend}</span>}
    </div>
    <div>
      <div className="text-slate-500 text-sm font-medium">{title}</div>
      <div className="text-3xl font-bold text-slate-100 mt-1">{value}</div>
    </div>
  </div>
);

export const Dashboard = () => {
  const { data: incidents = [] } = useQuery({ queryKey: ['incidents'], queryFn: incidentApi.list });
  const { t } = useTranslation();

  const activeIncidents = incidents.filter(i => i.status !== 'Closed' && i.status !== 'Resolved').length;
  const criticalIncidents = incidents.filter(i => i.priority === 'Critical').length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-slate-400 mt-2 text-lg">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('dashboard.total_incidents')} value={incidents.length} icon={TrendingUp} color="brand" trend="+12%" />
        <StatCard title={t('dashboard.active_issues')} value={activeIncidents} icon={Clock} color="orange" />
        <StatCard title={t('dashboard.critical_priority')} value={criticalIncidents} icon={AlertTriangle} color="red" />
        <StatCard title={t('dashboard.resolution_rate')} value="94.2%" icon={CheckCircle2} color="emerald" trend="+2.4%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-6">{t('dashboard.recent_activity')}</h3>
          <div className="space-y-4">
            {incidents.slice(0, 5).map((incident) => (
              <div key={incident.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-800/30 transition-colors border border-transparent hover:border-slate-700/50">
                <div className={`w-2 h-10 rounded-full ${incident.priority === 'Critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-brand-500'}`} />
                <div className="flex-1">
                  <div className="font-medium text-slate-200">{incident.title}</div>
                  <div className="text-sm text-slate-500">{new Date(incident.reported_at).toLocaleString()}</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-700">
                  {incident.status}
                </div>
              </div>
            ))}
            {incidents.length === 0 && <div className="text-center py-10 text-slate-500 italic">{t('dashboard.no_recent_incidents')}</div>}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">{t('dashboard.ai_status_title')}</h3>
            <p className="text-brand-100 opacity-90 leading-relaxed">{t('dashboard.ai_status_desc')}</p>
          </div>
          <div className="mt-8 relative z-10">
            <div className="flex justify-between text-sm mb-2">
              <span>{t('dashboard.model_health')}</span>
              <span>100%</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="w-full h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-brand-400/20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};
