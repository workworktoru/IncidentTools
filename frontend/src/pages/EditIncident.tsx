import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentApi } from '../api/api';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

import type { Incident } from '../types';

export const EditIncident = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  const [localFormData, setLocalFormData] = useState<Partial<Incident> | null>(null);

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentApi.get(id!),
    enabled: !!id,
  });

  const formData = {
    title: localFormData?.title ?? incident?.title ?? '',
    description: localFormData?.description ?? incident?.description ?? '',
    impact: localFormData?.impact ?? incident?.impact ?? 'Medium',
    urgency: localFormData?.urgency ?? incident?.urgency ?? 'Medium',
    priority: localFormData?.priority ?? incident?.priority ?? 'Medium',
    category: localFormData?.category ?? incident?.category ?? 'Software',
    status: localFormData?.status ?? incident?.status ?? 'New'
  };

  const mutation = useMutation({
    mutationFn: (data: Partial<Incident>) => incidentApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      toast.success(t('incidents.update_success'));
      navigate(`/incidents/${id}`);
    },
    onError: (error: Error) => {
      console.error(error);
      toast.error('Failed to update incident');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderCircle className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!incident) return <div className="text-white">Incident not found</div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(`/incidents/${id}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.cancel')}
        </button>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('incidents.edit_title')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm flex flex-col gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <label htmlFor="edit-incident-title" className="text-sm font-semibold text-slate-400 ml-1">{t('incidents.form_title')}</label>
          <input 
            required
            id="edit-incident-title"
            type="text" 
            value={formData.title}
            onChange={e => setLocalFormData({...formData, title: e.target.value})}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-lg text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="edit-incident-description" className="text-sm font-semibold text-slate-400 ml-1">{t('incidents.form_description')}</label>
          <textarea 
            rows={6}
            id="edit-incident-description"
            value={formData.description}
            onChange={e => setLocalFormData({...formData, description: e.target.value})}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="edit-incident-impact" className="text-sm font-semibold text-slate-400 ml-1">{t('incidents.form_impact')}</label>
            <select 
              id="edit-incident-impact"
              value={formData.impact}
              onChange={e => setLocalFormData({...formData, impact: e.target.value})}
              className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer text-white"
            >
              <option value="Low">{t('incidents.impact.Low')}</option>
              <option value="Medium">{t('incidents.impact.Medium')}</option>
              <option value="High">{t('incidents.impact.High')}</option>
              <option value="Critical">{t('incidents.impact.Critical')}</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="edit-incident-urgency" className="text-sm font-semibold text-slate-400 ml-1">{t('incidents.form_urgency')}</label>
            <select 
              id="edit-incident-urgency"
              value={formData.urgency}
              onChange={e => setLocalFormData({...formData, urgency: e.target.value})}
              className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer text-white"
            >
              <option value="Low">{t('incidents.urgency.Low')}</option>
              <option value="Medium">{t('incidents.urgency.Medium')}</option>
              <option value="High">{t('incidents.urgency.High')}</option>
            </select>
          </div>
        </div>

        <button 
          disabled={mutation.isPending}
          type="submit"
          className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {mutation.isPending ? (
            <LoaderCircle className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              {t('incidents.form_save')}
            </>
          )}
        </button>
      </form>
    </div>
  );
};
