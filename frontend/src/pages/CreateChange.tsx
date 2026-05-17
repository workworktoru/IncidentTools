import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeApi, userApi } from '../api/api';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

import type { Change } from '../types';

export const CreateChange = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    change_type: 'Normal',
    impact_analysis: '',
    backout_plan: '',
    scheduled_date: '',
    status: 'Requested'
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const testUserId = "00000000-0000-0000-0000-000000000000";
      
      // Ensure user exists first
      try {
        await userApi.create({
          id: testUserId,
          username: "system_user_change",
          email: "system_change@example.com",
          is_admin: true
        });
      } catch {
        console.log("User might already exist, continuing...");
      }

      const payload: Partial<Change> = {
        title: data.title,
        description: data.description || "",
        change_type: data.change_type,
        impact_analysis: data.impact_analysis || "",
        backout_plan: data.backout_plan || "",
        status: data.status || "Requested",
        requested_by_id: testUserId,
        scheduled_date: (data.scheduled_date && data.scheduled_date.trim() !== "") ? new Date(data.scheduled_date).toISOString() : undefined
      };

      return changeApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changes'] });
      toast.success(t('changes.update_success'));
      navigate('/changes');
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      const msg = axiosError.response?.data?.detail || error.message;
      toast.error(`Failed: ${msg}`);
      console.error("Change creation error:", error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
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
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('changes.create_title')}</h1>
        <p className="text-slate-400 mt-2">{t('changes.create_subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm flex flex-col gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <label htmlFor="change-title" className="text-sm font-semibold text-slate-400 ml-1">{t('changes.form_title')}</label>
          <input 
            required
            id="change-title"
            type="text" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder={t('changes.form_title_placeholder')}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-lg text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="change-type" className="text-sm font-semibold text-slate-400 ml-1">{t('changes.form_type')}</label>
            <select 
              id="change-type"
              value={formData.change_type}
              onChange={e => setFormData({...formData, change_type: e.target.value})}
              className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer text-white"
            >
              <option value="Normal">{t('changes.type.Normal')}</option>
              <option value="Standard">{t('changes.type.Standard')}</option>
              <option value="Emergency">{t('changes.type.Emergency')}</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="change-date" className="text-sm font-semibold text-slate-400 ml-1">{t('changes.form_scheduled_date')}</label>
            <input 
              id="change-date"
              type="datetime-local" 
              value={formData.scheduled_date}
              onChange={e => setFormData({...formData, scheduled_date: e.target.value})}
              className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all text-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="change-impact" className="text-sm font-semibold text-slate-400 ml-1">{t('changes.form_impact_analysis')}</label>
          <textarea 
            rows={3}
            id="change-impact"
            value={formData.impact_analysis}
            onChange={e => setFormData({...formData, impact_analysis: e.target.value})}
            placeholder={t('changes.form_impact_analysis_placeholder')}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="change-backout" className="text-sm font-semibold text-slate-400 ml-1">{t('changes.form_backout_plan')}</label>
          <textarea 
            rows={3}
            id="change-backout"
            value={formData.backout_plan}
            onChange={e => setFormData({...formData, backout_plan: e.target.value})}
            placeholder={t('changes.form_backout_plan_placeholder')}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none text-white"
          />
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {t('changes.form_submit')}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
