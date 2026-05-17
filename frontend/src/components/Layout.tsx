import { Sidebar } from './Sidebar';
import { Bell, User, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="flex w-full min-h-screen bg-[#020617] text-slate-200 selection:bg-brand-500/30">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-20 border-b border-slate-800/50 px-8 flex items-center justify-between bg-slate-950/20 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-400">{t('common.system_overview')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium"
            >
              <Languages className="w-4 h-4" />
              {i18n.language === 'en' ? '日本語' : 'English'}
            </button>
            <button className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-800 mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <div className="text-sm font-semibold">{t('common.admin_user')}</div>
                <div className="text-xs text-slate-500">{t('common.service_manager')}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                <User className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
