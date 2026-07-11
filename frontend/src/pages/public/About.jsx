import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div>
      <section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#fff9f6]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="eyebrow">About SocietyWale</p>
            <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              A clearer operating system for housing societies.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              We help committees run maintenance, expenses, notices and member records with transparency residents can trust.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary !bg-orange-500 hover:!bg-orange-600">Start free</Link>
              <Link to="/contact" className="btn-secondary">Talk to us</Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 shadow-2xl shadow-slate-900/10">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
              alt="Modern residential buildings representing organised society living"
              className="h-72 w-full object-cover sm:h-96"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-orange-300">Built for India</p>
              <p className="mt-1 text-sm font-semibold">Committees · Residents · Everyday accountability</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-8">
            <p className="eyebrow">Vision</p>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-950">Every society runs with calm clarity.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              We envision neighbourhood communities where collections, expenses and communication are visible, fair and easy to manage — without spreadsheets or endless chat threads.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-8">
            <p className="eyebrow">Mission</p>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-950">Practical tools for real committees.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              SocietyWale delivers role-based workspaces for secretaries, treasurers and residents: maintenance tracking, payment claims, notices, bank details and financial reports in one place.
            </p>
          </article>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <p className="eyebrow">What we believe</p>
          <h2 className="section-title mt-5">Transparent by default. Simple by design.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Transparent records', 'Collections and expenses stay review-ready for audits and AGMs.'],
              ['Role-based access', 'Committee manages; members view, download and notify payments.'],
              ['Local-first product', 'Designed for Indian housing societies and everyday committee work.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <h3 className="font-bold text-slate-950">{t}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
