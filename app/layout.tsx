import './globals.css';
import type { Metadata } from 'next';
import Bubbles from '@/components/Bubbles';
import LanguageProvider from '@/components/LanguageProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NepaliDate from '@/components/NepaliDate';

export const metadata: Metadata = { title: 'kids Toy | Interactive RC Dancing Robot', description: 'A smart, musical, interactive dancing robot for kids.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body><LanguageProvider><Bubbles/><div className="site-content"><div className="global-tools"><div className="container global-tools-inner"><NepaliDate/><LanguageSwitcher/></div></div>{children}</div></LanguageProvider></body></html>; }
