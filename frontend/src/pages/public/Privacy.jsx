import { Link } from 'react-router-dom'
import { LegalPage } from './Terms'

export default function Privacy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy"
      updated="11 July 2026"
    >
      <p>
        SocietyWale respects the privacy of committee users and residents. This policy explains what information we handle and how it is used to operate society workspaces.
      </p>
      <h2>Information we process</h2>
      <p>
        Account details such as name, email, mobile, flat number and society association; operational records like maintenance charges, expenses, notices and payment claims entered by your society.
      </p>
      <h2>How we use information</h2>
      <p>
        To authenticate users, power dashboards and reports, and keep committee and member views in sync. We do not sell personal data.
      </p>
      <h2>Access control</h2>
      <p>
        Role-based access separates admin and member permissions. Societies control which members are active in their workspace.
      </p>
      <h2>Retention and security</h2>
      <p>
        Data is retained to support society operations and audit history. Sessions expire after inactivity. Use strong passwords and the forgot-password flow when needed.
      </p>
      <h2>Contact</h2>
      <p>
        Privacy questions? Reach us via the <Link className="font-semibold text-orange-600" to="/contact">Contact</Link> page.
      </p>
    </LegalPage>
  )
}
