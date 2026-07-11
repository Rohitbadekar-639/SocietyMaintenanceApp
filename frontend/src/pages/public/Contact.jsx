import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../../components/ui/Feedback'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', society: '', message: '' })

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div>
      <section className="border-b border-slate-200 bg-[#fff9f6]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            We’re here to help your society get started.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Questions about onboarding, committee roles or member access? Send a message and we’ll respond as soon as we can.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:py-20">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-orange-600">Support</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Committee onboarding</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create a workspace, add members, publish bank details and start tracking maintenance in one afternoon.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-orange-600">Email</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">hello@societywale.app</p>
            <p className="mt-1 text-sm text-slate-500">Typical reply within 1–2 business days.</p>
          </div>
          <p className="text-sm text-slate-500">
            Looking for legal details? Read our{' '}
            <Link className="font-semibold text-orange-600 hover:text-orange-700" to="/terms">Terms</Link>
            {' '}and{' '}
            <Link className="font-semibold text-orange-600 hover:text-orange-700" to="/privacy">Privacy Policy</Link>.
          </p>
        </div>

        <div className="card">
          {sent && <Alert type="success">Thanks! Your message has been received. We’ll get back to you soon.</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input name="name" className="input" required value={form.name} onChange={update} placeholder="Your name" />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" required value={form.email} onChange={update} placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Society name (optional)</label>
              <input name="society" className="input" value={form.society} onChange={update} placeholder="Gokuldham Society" />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea name="message" className="input" rows="4" required value={form.message} onChange={update} placeholder="How can we help?" />
            </div>
            <button className="btn-primary w-full !bg-orange-500 hover:!bg-orange-600">Send message</button>
          </form>
        </div>
      </section>
    </div>
  )
}
