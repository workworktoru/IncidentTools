import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { incidentApi } from '../api/api';
import { Search, Sparkles, LoaderCircle, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

export const AISearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ['incident-search', submittedQuery],
    queryFn: () => incidentApi.search(submittedQuery),
    enabled: !!submittedQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSubmittedQuery(query);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-sm font-bold uppercase tracking-widest mb-2">
          <Sparkles className="w-4 h-4" />
          Powered by Gemini
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          {t('search.title')}
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          {t('search.subtitle')}
        </p>
      </div>

      <div className="relative group max-w-3xl mx-auto w-full">
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
        <form onSubmit={handleSearch} className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-2 shadow-2xl">
          <div className="pl-4 text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 py-4 text-lg placeholder:text-slate-600"
          />
          <button 
            type="submit"
            disabled={isLoading || isFetching || !query.trim()}
            className="px-8 py-3 bg-brand-500 hover:bg-brand-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {(isLoading || isFetching) ? (
              <LoaderCircle className="w-5 h-5 animate-spin" />
            ) : (
              t('search.button')
            )}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-6">
        {(isLoading || isFetching) && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500 animate-pulse">
            <LoaderCircle className="w-10 h-10 animate-spin text-brand-500" />
            <p>{t('search.searching')}</p>
          </div>
        )}

        {results && !isLoading && !isFetching && (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-semibold text-slate-300">
                {t('search.results_count', { count: results.length })}
              </h3>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500">{t('search.no_results')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((incident) => (
                  <div 
                    key={incident.id}
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                    className="group bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-brand-500/50 hover:bg-slate-900 transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex justify-between items-start">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        incident.priority === 'Critical' ? "bg-red-500/10 text-red-400" : "bg-brand-500/10 text-brand-400"
                      )}>
                        {incident.priority}
                      </span>
                      <span className="text-xs font-mono text-slate-600">#{incident.id.slice(0, 8)}</span>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                        {incident.title}
                      </h4>
                      <p className="text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {incident.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800/50">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {incident.status}
                        </div>
                      </div>
                      <div className="text-brand-400 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        {t('search.view_detail')}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!results && !isLoading && !isFetching && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 grayscale">
             <div className="h-40 bg-slate-900/30 border border-slate-800 rounded-3xl animate-pulse" />
             <div className="h-40 bg-slate-900/30 border border-slate-800 rounded-3xl animate-pulse" style={{ animationDelay: '0.2s' }} />
             <div className="h-40 bg-slate-900/30 border border-slate-800 rounded-3xl animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </div>
    </div>
  );
};
