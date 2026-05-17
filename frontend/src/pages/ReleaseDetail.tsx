import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { releaseApi } from '../api/api';
import { ArrowLeft, LoaderCircle, Save, Clock, Calendar, Ship } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import type { Release } from '../types';

export const ReleaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [status, setStatus] = useState<string | null>(null);

  const { data: release, isLoading } = useQuery({
    queryKey: ['release', id],
    queryFn: () => releaseApi.get(id!),
    enabled: !!id,
  });

  const currentStatus = status ?? release?.status ?? '';

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Release>) => releaseApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      toast.success(t('releases.update_success'));
      setStatus(null);
    },
    onError: () => {
      toast.error('Failed to update release');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderCircle className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!release) return <div className="text-white">Release not found</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/releases')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back_to_list')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                 <Ship className="w-6 h-6 text-emerald-400" />
               </div>
               <div>
                 <div className="text-xs font-mono text-slate-500">ID: #{release.id.slice(0, 8)}</div>
                 <h1 className="text-3xl font-bold text-white">{t('releases.table_version')} {release.version}</h1>
               </div>
            </div>
            
            <div className="space-y-8 mt-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('releases.form_release_note')}</h3>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 whitespace-pre-wrap min-h-[120px]">
                  {release.release_note || "No release notes provided."}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-400" />
              {t('releases.timeline')}
            </h3>
            <div className="space-y-6">
               <div className="flex gap-4">
                <div className="w-px bg-slate-800 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">{t('releases.planned_at')}</div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(release.planned_at).toLocaleString()}</div>
                </div>
              </div>
              
              {release.actual_date && (
                <div className="flex gap-4">
                  <div className="w-px bg-slate-800 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      {t('releases.deployment_date')}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{new Date(release.actual_date).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('releases.status_management')}</h3>
            <div className="flex flex-col gap-4">
              <label htmlFor="release-status-select" className="sr-only">{t('releases.status_management')}</label>
              <select 
                id="release-status-select"
                value={currentStatus}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer text-slate-200"
              >
                {['Planned', 'Building', 'Testing', 'Deployed', 'Closed'].map(s => (
                  <option key={s} value={s}>{t(`releases.status.${s}`)}</option>
                ))}
              </select>
              <button 
                disabled={currentStatus === release.status || updateMutation.isPending}
                onClick={() => updateMutation.mutate({ status: currentStatus })}
                className="flex items-center justify-center gap-2 w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('releases.update_status')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
