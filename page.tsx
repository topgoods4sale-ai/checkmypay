'use client';
import { useMemo, useState } from 'react';

type Filing = 'single' | 'married' | 'head';
type PayType = 'hourly' | 'salary';
type Frequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

const periods: Record<Frequency, number> = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };
const federalStd: Record<Filing, number> = { single: 16100, married: 32200, head: 24150 };
const vaStd: Record<Filing, number> = { single: 8750, married: 17500, head: 8750 };
const fedBrackets: Record<Filing, [number, number][]> = {
  single: [[11925,.10],[48475,.12],[103350,.22],[197300,.24],[250525,.32],[626350,.35],[Infinity,.37]],
  married: [[23850,.10],[96950,.12],[206700,.22],[394600,.24],[501050,.32],[751600,.35],[Infinity,.37]],
  head: [[17000,.10],[64850,.12],[103350,.22],[197300,.24],[250500,.32],[626350,.35],[Infinity,.37]]
};
const vaBrackets: [number, number][] = [[3000,.02],[5000,.03],[17000,.05],[Infinity,.0575]];

function progressiveTax(taxable: number, brackets: [number, number][]) {
  let tax = 0, last = 0;
  for (const [limit, rate] of brackets) {
    const amount = Math.max(0, Math.min(taxable, limit) - last);
    tax += amount * rate;
    if (taxable <= limit) break;
    last = limit;
  }
  return Math.max(0, tax);
}
function money(n: number) { return n.toLocaleString('en-US', { style:'currency', currency:'USD', maximumFractionDigits: 2 }); }

export default function Page(){
  const [payType,setPayType]=useState<PayType>('hourly');
  const [hourly,setHourly]=useState(25);
  const [hours,setHours]=useState(40);
  const [salary,setSalary]=useState(60000);
  const [freq,setFreq]=useState<Frequency>('biweekly');
  const [filing,setFiling]=useState<Filing>('single');
  const [dependents,setDependents]=useState(0);
  const [pretax,setPretax]=useState(0);
  const [posttax,setPosttax]=useState(0);

  const r = useMemo(()=>{
    const annualGross = payType==='salary' ? salary : hourly * Math.min(hours,40) * 52 + hourly * 1.5 * Math.max(0,hours-40) * 52;
    const p = periods[freq];
    const annualPretax = pretax * p;
    const fedTaxable = Math.max(0, annualGross - annualPretax - federalStd[filing] - dependents * 2000);
    const vaTaxable = Math.max(0, annualGross - annualPretax - vaStd[filing] - 930);
    const federal = progressiveTax(fedTaxable, fedBrackets[filing]);
    const virginia = progressiveTax(vaTaxable, vaBrackets);
    const socialSecurity = Math.min(annualGross,184500) * .062;
    const medicare = annualGross * .0145 + Math.max(0, annualGross - (filing==='married'?250000:200000)) * .009;
    const annualPost = posttax * p;
    const annualNet = Math.max(0, annualGross - annualPretax - federal - virginia - socialSecurity - medicare - annualPost);
    return {annualGross,p,perGross:annualGross/p,federal,virginia,socialSecurity,medicare,annualPretax,annualPost,annualNet,perNet:annualNet/p};
  },[payType,hourly,hours,salary,freq,filing,dependents,pretax,posttax]);

  return <main>
    <header className="bg-slate-950 text-white"><div className="mx-auto max-w-6xl px-4 py-8"><p className="font-bold text-2xl">CheckMyPay</p><h1 className="mt-6 text-4xl md:text-6xl font-black tracking-tight">Virginia Paycheck Calculator</h1><p className="mt-4 max-w-2xl text-slate-300">Estimate your Virginia take-home pay for hourly or salary income, including federal tax, Virginia state tax, Social Security, Medicare, overtime, and deductions.</p></div></header>
    <div className="mx-auto max-w-6xl px-4 py-6"><div className="adbox">Google AdSense leaderboard placeholder — replace with your AdSense code after approval</div></div>
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-bold">Enter your pay details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="font-medium">Pay type</span><select className="mt-1 w-full rounded-xl border p-3" value={payType} onChange={e=>setPayType(e.target.value as PayType)}><option value="hourly">Hourly</option><option value="salary">Salary</option></select></label>
          <label className="block"><span className="font-medium">Pay frequency</span><select className="mt-1 w-full rounded-xl border p-3" value={freq} onChange={e=>setFreq(e.target.value as Frequency)}><option value="weekly">Weekly</option><option value="biweekly">Biweekly</option><option value="semimonthly">Semi-monthly</option><option value="monthly">Monthly</option></select></label>
          {payType==='hourly' ? <><label><span className="font-medium">Hourly rate</span><input className="mt-1 w-full rounded-xl border p-3" type="number" value={hourly} onChange={e=>setHourly(+e.target.value)} /></label><label><span className="font-medium">Hours per week</span><input className="mt-1 w-full rounded-xl border p-3" type="number" value={hours} onChange={e=>setHours(+e.target.value)} /></label></> : <label className="sm:col-span-2"><span className="font-medium">Annual salary</span><input className="mt-1 w-full rounded-xl border p-3" type="number" value={salary} onChange={e=>setSalary(+e.target.value)} /></label>}
          <label><span className="font-medium">Filing status</span><select className="mt-1 w-full rounded-xl border p-3" value={filing} onChange={e=>setFiling(e.target.value as Filing)}><option value="single">Single</option><option value="married">Married filing jointly</option><option value="head">Head of household</option></select></label>
          <label><span className="font-medium">Dependents</span><input className="mt-1 w-full rounded-xl border p-3" type="number" value={dependents} onChange={e=>setDependents(+e.target.value)} /></label>
          <label><span className="font-medium">Pre-tax deductions per check</span><input className="mt-1 w-full rounded-xl border p-3" type="number" value={pretax} onChange={e=>setPretax(+e.target.value)} /></label>
          <label><span className="font-medium">Post-tax deductions per check</span><input className="mt-1 w-full rounded-xl border p-3" type="number" value={posttax} onChange={e=>setPosttax(+e.target.value)} /></label>
        </div>
        <p className="mt-4 text-sm text-slate-500">Estimate only. Payroll withholding can vary by W-4 selections, benefits, locality, bonuses, and employer setup.</p>
      </div>
      <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
        <h2 className="text-2xl font-bold">Estimated take-home pay</h2>
        <p className="mt-4 text-5xl font-black">{money(r.perNet)}</p><p className="text-slate-300">per {freq} paycheck</p>
        <div className="mt-6 grid gap-3 text-sm">
          {[['Gross pay/check',r.perGross],['Federal income tax/year',r.federal],['Virginia income tax/year',r.virginia],['Social Security/year',r.socialSecurity],['Medicare/year',r.medicare],['Pre-tax deductions/year',r.annualPretax],['Post-tax deductions/year',r.annualPost],['Annual take-home pay',r.annualNet]].map(([k,v])=><div key={String(k)} className="flex justify-between rounded-xl bg-white/10 p-3"><span>{k}</span><b>{money(Number(v))}</b></div>)}
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-4 py-6"><div className="adbox">Google AdSense in-content placeholder</div></section>
    <section className="mx-auto max-w-6xl px-4 py-10 grid gap-6 md:grid-cols-3">
      <article className="rounded-2xl bg-white p-6 ring-1 ring-slate-200"><h2 className="font-bold text-xl">Hourly & overtime</h2><p className="mt-2 text-slate-600">Enter hourly pay and weekly hours. Overtime over 40 hours is estimated at 1.5x regular pay.</p></article>
      <article className="rounded-2xl bg-white p-6 ring-1 ring-slate-200"><h2 className="font-bold text-xl">Virginia tax estimate</h2><p className="mt-2 text-slate-600">Uses Virginia’s graduated income tax structure and standard deduction to estimate state tax.</p></article>
      <article className="rounded-2xl bg-white p-6 ring-1 ring-slate-200"><h2 className="font-bold text-xl">Fast mobile design</h2><p className="mt-2 text-slate-600">Built with lightweight Next.js and Tailwind for quick loading on phones.</p></article>
    </section>
    <section className="mx-auto max-w-4xl px-4 py-10"><h2 className="text-3xl font-black">Virginia paycheck calculator FAQ</h2><div className="mt-5 space-y-4"><h3 className="font-bold">How much tax comes out of my paycheck in Virginia?</h3><p>Most Virginia workers see federal income tax, Virginia income tax, Social Security, and Medicare withheld from each paycheck.</p><h3 className="font-bold">Is this calculator exact?</h3><p>No. It is an estimate for planning. Your employer’s payroll system and W-4 details may produce a different result.</p><h3 className="font-bold">Does Virginia have local income tax?</h3><p>This starter version does not include city or county-specific taxes or special payroll deductions.</p></div></section>
    <footer className="bg-slate-950 text-slate-300"><div className="mx-auto max-w-6xl px-4 py-8"><p className="font-bold text-white">CheckMyPay</p><p className="mt-2 text-sm">Free paycheck calculators for workers. Not tax or legal advice.</p><nav className="mt-4 flex gap-4 text-sm"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/contact">Contact</a></nav></div></footer>
  </main>
}
