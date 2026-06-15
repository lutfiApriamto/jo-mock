import DocsPager from '@/shared/components/DocsPager'

const H2 = 'font-heading font-bold text-xl text-foreground mt-12 mb-4 scroll-mt-24'
const P  = 'text-sm sm:text-base text-muted-foreground leading-relaxed mb-4'
const LI = 'text-sm sm:text-base text-muted-foreground leading-relaxed'
const IC = 'bg-bg-surface text-brand-accent font-mono text-[13px] px-1.5 py-0.5 rounded border border-border'

const StatusBadge = ({ label, color }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${color}`}>
    {label}
  </span>
)

export default function ChangeRequestsPage() {
  return (
    <article>
      <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-3">
        Change Requests
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
        Change Requests (CR) are the formal mechanism for proposing and reviewing modifications
        to an API contract — without breaking anyone who's already consuming the mock.
      </p>
      <div className="w-12 h-0.5 bg-brand-primary/40 mb-10" />

      <h2 id="overview" className={H2}>Overview</h2>
      <p className={P}>
        In a shared team workspace, anyone can propose that an endpoint needs to change — but not everyone
        should be able to change it unilaterally. Change Requests enforce a structured review process:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}>Frontend or Backend developers submit a CR describing the proposed change</li>
        <li className={LI}>The Project Manager reviews it and decides to approve or reject</li>
        <li className={LI}>If approved, the endpoint contract is updated and the change is versioned</li>
        <li className={LI}>Everyone gets an email notification when the CR status changes</li>
      </ul>
      <p className={P}>
        Project Managers can also edit endpoints directly without going through a CR — they bypass
        the approval step since they already have full authority.
      </p>

      <h2 id="proposing" className={H2}>Proposing a Change</h2>
      <p className={P}>
        Any team member (Frontend Dev or Backend Dev) can submit a Change Request from the endpoint detail page.
        Click <strong className="font-semibold text-foreground">Propose Change</strong> and fill in:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}><strong className="font-semibold text-foreground">What you're changing</strong> — method, path, request schema, or response</li>
        <li className={LI}><strong className="font-semibold text-foreground">Reason</strong> — a brief description of why this change is needed</li>
        <li className={LI}><strong className="font-semibold text-foreground">Proposed value</strong> — the new value for the field you're changing</li>
      </ul>
      <p className={P}>
        The Project Manager receives an email notification immediately after submission.
        While the CR is pending, the existing endpoint contract remains unchanged and the mock
        server continues to serve the current response.
      </p>

      <h2 id="review" className={H2}>Review Process</h2>
      <p className={P}>
        Open CRs appear on the project's <strong className="font-semibold text-foreground">Change Requests</strong> tab.
        Each CR shows:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}>Who submitted it and when</li>
        <li className={LI}>Which endpoint is affected</li>
        <li className={LI}>The proposed change (current vs. proposed values, side by side)</li>
        <li className={LI}>The reason for the change</li>
      </ul>

      <div className="flex flex-wrap gap-2 mb-4">
        <StatusBadge label="Pending" color="bg-status-warning/10 text-status-warning border-status-warning/20" />
        <StatusBadge label="Approved" color="bg-status-success/10 text-status-success border-status-success/20" />
        <StatusBadge label="Rejected" color="bg-status-danger/10 text-status-danger border-status-danger/20" />
      </div>
      <p className={P}>
        Each CR moves through these states. Once a decision is made, the submitter is notified by email.
      </p>

      <h2 id="approve-reject" className={H2}>Approve or Reject</h2>
      <p className={P}>
        Only a <strong className="font-semibold text-foreground">Project Manager</strong> can approve or reject a CR.
      </p>
      <p className={P}>
        <strong className="font-semibold text-foreground">Approving:</strong> The endpoint contract is updated
        immediately with the proposed change. A new version is recorded in the contract's history with
        a timestamp and a reference to the CR.
      </p>
      <p className={P}>
        <strong className="font-semibold text-foreground">Rejecting:</strong> The endpoint remains unchanged.
        The submitter is notified with the rejection reason (if provided).
      </p>

      <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-xl px-4 py-3 mb-6">
        <p className="text-sm text-foreground leading-relaxed">
          <strong className="font-semibold">Direct edits by PM:</strong> Project Managers can also edit
          an endpoint's contract directly from the endpoint detail page, bypassing the CR flow. These
          direct edits are still versioned and appear in the contract history.
        </p>
      </div>

      <h2 id="history" className={H2}>Version History</h2>
      <p className={P}>
        Every change to a contract — whether from an approved CR or a direct PM edit — is recorded
        in the endpoint's <strong className="font-semibold text-foreground">Version History</strong>.
      </p>
      <p className={P}>
        The history shows:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}>What changed (field name + old vs. new value)</li>
        <li className={LI}>Who made the change</li>
        <li className={LI}>When it was applied (timestamp)</li>
        <li className={LI}>The CR reference, if applicable</li>
      </ul>
      <p className={P}>
        Version history is read-only and cannot be deleted. It serves as a permanent audit trail
        of how your API contract evolved over time.
      </p>

      <DocsPager />
    </article>
  )
}
