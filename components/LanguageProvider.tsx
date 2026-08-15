'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMessages, Language, MessageKey } from '@/lib/i18n';

type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: MessageKey) => any };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  useEffect(() => { const saved = window.localStorage.getItem('kids-toy-language'); if (saved === 'en' || saved === 'ne') setLanguageState(saved); }, []);
  function setLanguage(next: Language) { setLanguageState(next); window.localStorage.setItem('kids-toy-language', next); }
  const value = useMemo(() => ({ language, setLanguage, t: (key: MessageKey) => getMessages(language)[key] }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error('useLanguage must be used inside LanguageProvider'); return value; }
