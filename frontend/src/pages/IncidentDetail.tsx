import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentApi, ciApi } from '../api/api';
import { ArrowLeft, LoaderCircle, Trash2, Save, Clock, Edit3, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

import type { Incident } from '../types';

export const IncidentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [status, setStatus] = useState<string | null>(null);

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentApi.get(id!),
    enabled: !!id,
  });

  const { data: ci } = useQuery({
    queryKey: ['configuration-item', incident?.ci_id],
    queryFn: () => ciApi.get(incident!.ci_id!),
    enabled: !!incident?.ci_id,
  });

  const currentStatus = status ?? incident?.status ?? '';

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Incident>) => incidentApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      toast.success(t('incidents.update_success'));
      setStatus(null);
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => incidentApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident deleted');
      navigate('/incidents');
    },
    onError: () => {
      toast.error('Failed to delete incident');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderCircle className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!incident) return <div className="text-white">Incident not found</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/incidents')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back_to_list')}
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate(`/incidents/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl hover:bg-slate-700 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            {t('incidents.edit')}
          </button>
          <button 
            disabled={deleteMutation.isPending}
            onClick={() => {
                if(window.confirm(t('incidents.confirm_delete'))) {
                    deleteMutation.mutate();
                }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            {deleteMutation.isPending ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {t('incidents.delete')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl flex flex-col gap-6">
            <div>
              <div className="text-xs font-mono text-slate-500 mb-2">#{incident.id}</div>
              <h1 className="text-3xl font-bold text-white mb-4">{incident.title}</h1>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t('incidents.form_description')}</h3>
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 whitespace-pre-wrap leading-relaxed">
                {incident.description || "No description provided."}
              </div>

              {ci && (
                <div 
                  onClick={() => navigate(`/inventory/${ci.id}`)}
                  className="p-4 bg-brand-500/5 border border-brand-500/20 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-brand-500/10 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400 group-hover:scale-110 transition-transform">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-brand-500 uppercase tracking-widest">Affected Asset</div>
                    <div className="text-slate-200 font-semibold">{ci.name} ({ci.type})</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-400" />
              {t('incidents.activity_log')}
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-px bg-slate-800 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">{t('incidents.log_reported')}</div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(incident.reported_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('incidents.status_management')}</h3>
            <div className="flex flex-col gap-4">
              <label htmlFor="status-select" className="sr-only">{t('incidents.status_management')}</label>
              <select 
                id="status-select"
                value={currentStatus}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer text-slate-200"
              >
                {['New', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map(s => (
                  <option key={s} value={s}>{t(`incidents.status.${s}`)}</option>
                ))}
              </select>
              <button 
                disabled={currentStatus === incident.status || updateMutation.isPending}
                onClick={() => updateMutation.mutate({ status: currentStatus })}
                className="flex items-center justify-center gap-2 w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('incidents.update_status')}
              </button>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('incidents.metadata')}</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">{t('incidents.table_priority')}</div>
                <div className="flex items-center gap-2 text-slate-200">
                  <div className={clsx("w-2 h-2 rounded-full", incident.priority === 'Critical' ? 'bg-red-500' : 'bg-brand-500')} />
                  {t(`incidents.priority.${incident.priority}`)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">{t('incidents.form_category')}</div>
                <div className="text-slate-200">{incident.category || t('incidents.category.Other')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
