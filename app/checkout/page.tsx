'use client';
import './styles.css';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, Suspense, useMemo, useState } from 'react';
import Logo from '@/components/Logo';
import { product, money } from '@/lib/product';
import { useLanguage } from '@/components/LanguageProvider';

function CheckoutForm() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const router = useRouter();
  const initialQuantity = Math.max(1, Number(params.get('quantity') || 1) || 1);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const total = useMemo(() => product.offerPrice * quantity, [quantity]);

  function updateQuantity(value: string | number) {
    const next = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(next) && next >= 1) setQuantity(Math.floor(next));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!Number.isInteger(quantity) || quantity < 1) { setError(t('errorQuantity')); return; }
    setLoading(true); setSuccess(false); setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, quantity, productName: product.name, pricePerPiece: product.offerPrice, totalPrice: total }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t('errorRequired'));
      setSuccess(true);
      router.push(`/thank-you?orderId=${encodeURIComponent(json.orderId)}&quantity=${quantity}&total=${total}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setLoading(false);
    }
  }

  return <main className="min-h-screen bg-[#E0F2FE]"><div className="container py-6"><Logo/><div className="mx-auto mt-10 max-w-2xl"><div className="mb-8"><p className="text-sm font-black uppercase tracking-[.2em] text-electric">{t('secureCheckout')}</p><h1 className="mt-2 text-4xl font-black tracking-tight">{t('almost')}</h1><p className="mt-2 text-ink/60">{t('checkoutIntro')}</p></div><form onSubmit={submit} className="rounded-[2rem] bg-white p-6 shadow-glow md:p-9"><div className="grid gap-5 md:grid-cols-2"><label className="md:col-span-2"><span className="label">{t('fullName')}</span><input name="name" required placeholder={t('fullName')} className="field"/></label><label><span className="label">{t('phone')}</span><input name="phone" required placeholder="98XXXXXXXX" className="field"/></label><label><span className="label">{t('email')}</span><input name="email" type="email" required placeholder="you@example.com" className="field"/></label><label className="md:col-span-2"><span className="label">{t('location')}</span><textarea name="location" required placeholder={t('locationPlaceholder')} className="field min-h-24"/></label></div><div className="my-7 rounded-2xl bg-[#E0F2FE] p-5"><div className="flex items-center justify-between gap-4 text-sm"><span>{t('product')}</span><b className="text-right">{product.name}</b></div><div className="mt-5 flex items-center justify-between"><span className="text-sm font-bold">{t('quantity')}</span><div className="quantity-control" aria-label={t('quantity')}><button type="button" onClick={() => updateQuantity(quantity - 1)} disabled={quantity <= 1} aria-label={t('decrease')}>−</button><input aria-label={t('quantity')} type="number" min="1" step="1" value={quantity} onChange={e => updateQuantity(e.target.value)} onBlur={() => updateQuantity(quantity)} /><button type="button" onClick={() => updateQuantity(quantity + 1)} aria-label={t('increase')}>+</button></div></div><div className="mt-4 flex justify-between text-sm"><span>{t('pricePerPiece')}</span><b>{money(product.offerPrice)}</b></div><div className="mt-4 flex justify-between border-t border-ink/10 pt-4 text-lg font-black"><span>{t('totalPrice')}</span><span className="text-electric">{money(total)}</span></div><p className="mt-3 text-xs font-bold text-ink/50">{t('payment')} | {t('delivery')}</p></div>{error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p>}<button disabled={loading || success} className={`w-full rounded-full px-6 py-4 font-black text-white transition duration-200 hover:-translate-y-0.5 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-70 ${success ? 'bg-green-500' : 'bg-red-500 hover:bg-red-600'}`}>{success ? t('confirmed') : loading ? t('submitting') : t('submit')}</button><p className="mt-4 text-center text-xs text-ink/45">{t('privacy')}</p></form></div></div></main>;
}

export default function Checkout() { return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#E0F2FE] font-bold">Loading checkout...</main>}><CheckoutForm /></Suspense>; }
