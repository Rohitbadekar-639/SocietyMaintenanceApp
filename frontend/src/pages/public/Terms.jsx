import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of use"
      updated="11 July 2026"
    >
      <p>
        SocietyWale provides digital tools for housing society committees and residents to manage maintenance, expenses, notices and related records.
        By creating an account or using the service, you agree to these terms.
      </p>
      <h2>Accounts and roles</h2>
      <p>
        Committee administrators are responsible for accurate member data, society configuration and access control.
        Members may view society information and submit payment claims according to permissions set by their society.
      </p>
      <h2>Acceptable use</h2>
      <p>
        You agree not to misuse the platform, attempt unauthorised access, or upload unlawful or harmful content.
        Societies remain responsible for the accuracy of financial and member records they enter.
      </p>
      <h2>Service availability</h2>
      <p>
        We aim for reliable uptime but do not guarantee uninterrupted access. Features may evolve as we improve the product for Indian housing societies.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms? Visit our <Link className="font-semibold text-orange-600" to="/contact">Contact</Link> page.
      </p>
    </LegalPage>
  )
}

export function LegalPage({ eyebrow, title, updated, children }) {
  return (
    <div>
      <section className="border-b border-slate-200 bg-[#fff9f6]">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-16">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-3 text-sm text-slate-500">Last updated {updated}</p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl space-y-5 px-4 py-12 text-sm leading-7 text-slate-600 sm:px-6 lg:py-16 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-950">
        {children}
      </section>
    </div>
  )
}
