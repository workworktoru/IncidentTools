import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { incidentApi, userApi, ciApi } from '../api/api';
import { ArrowRight, LoaderCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Incident } from '../types';

export const CreateIncident = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    impact: 'Medium',
    urgency: 'Medium',
    priority: 'Medium',
    category: 'Software',
    ci_id: ''
  });

  const { data: cis = [] } = useQuery({
    queryKey: ['configuration-items'],
    queryFn: ciApi.list
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const testUserId = "00000000-0000-0000-0000-000000000000"; 
      const payload: Partial<Incident> = {
        ...data,
        requester_id: testUserId,
        ci_id: data.ci_id || undefined
      };
      return incidentApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      navigate('/incidents');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.create({
        id: "00000000-0000-0000-0000-000000000000",
        username: "system_user",
        email: "system@example.com",
        is_admin: true
      }).catch(() => {}); 
      
      await mutation.mutateAsync(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('incidents.create_title')}</h1>
        <p className="text-slate-400 mt-2">{t('incidents.create_subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm flex flex-col gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <label htmlFor="incident-title" className="text-sm font-semibold text-slate-400 ml-1">{t('incidents.form_title')}</label>
          <input 
            required
            id="incident-title"
            type="text" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder={t('incidents.form_title_placeholder')}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-lg"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="incident-description" className="text-sm font-semibold text-slate-400 ml-1">{t('incidents.form_description')}</label>
          <textarea 
            rows={4}
            id="incident-description"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder={t('incidents.form_description_placeholder')}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="incident-ci" className="text-sm font-semibold text-slate-400 ml-1">Affected Configuration Item (Optional)</label>
          <select 
            id="incident-ci"
            value={formData.ci_id}
            onChange={e => setFormData({...formData, ci_id: e.target.value})}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">None / Not Applicable</option>
            {cis.map(ci => (
              <option key={ci.id} value={ci.id}>{ci.name} ({ci.type})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="incident-impact" className="text-sm font-semibold text-slate-400 ml-1">{t('incidents.form_impact')}</label>
            <select 
              id="incident-impact"
              value={formData.impact}
              onChange={e => setFormData({...formData, impact: e.target.value})}
              className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer"
            >
              <option value="Low">{t('incidents.impact.Low')}</option>
              <option value="Medium">{t('incidents.impact.Medium')}</option>
              <option value="High">{t('incidents.impact.High')}</option>
              <option value="Critical">{t('incidents.impact.Critical')}</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="incident-urgency" className="text-sm font-semibold text-slate-400 ml-1">{t('incidents.form_urgency')}</label>
            <select 
              id="incident-urgency"
              value={formData.urgency}
              onChange={e => setFormData({...formData, urgency: e.target.value})}
              className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer"
            >
              <option value="Low">{t('incidents.urgency.Low')}</option>
              <option value="Medium">{t('incidents.urgency.Medium')}</option>
              <option value="High">{t('incidents.urgency.High')}</option>
            </select>
          </div>
        </div>

        <div className="mt-4 p-4 bg-brand-500/5 border border-brand-500/20 rounded-2xl flex items-start gap-4">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('incidents.ai_note')}
          </p>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <LoaderCircle className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {t('incidents.form_submit')}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
