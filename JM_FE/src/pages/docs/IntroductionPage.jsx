import DocsPager from '@/shared/components/DocsPager'
import { Link } from 'react-router-dom'

// ── Shared style tokens ────────────────────────────────────────────
const H2 = 'font-heading font-bold text-xl text-foreground mt-12 mb-4 scroll-mt-24'
const P  = 'text-sm sm:text-base text-muted-foreground leading-relaxed mb-4'
const UL = 'list-disc pl-5 space-y-1.5 mb-6'
const LI = 'text-sm sm:text-base text-muted-foreground leading-relaxed'
const IC = 'bg-bg-surface text-brand-accent font-mono text-[13px] px-1.5 py-0.5 rounded border border-border'

export default function IntroductionPage() {
  return (
    <article>
      {/* Page header */}
      <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-3">
        Introduction
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
        Learn what JO-MOCK is, the problem it solves, and how it fits into your development workflow.
      </p>
      <div className="w-12 h-0.5 bg-brand-primary/40 mb-10" />

      {/* What is JO-MOCK */}
      <h2 id="what-is" className={H2}>What is JO-MOCK?</h2>
      <p className={P}>
        JO-MOCK or <strong className="font-semibold text-foreground">Joint Operation-Mock</strong>  is a <strong className="font-semibold text-foreground">contract-first API mocking platform</strong> built
        for development teams. It lets you define your API contracts once, then immediately provides a live mock server
        that your frontend team can consume — before a single line of backend code is written.
      </p>
      <p className={P}>
        Think of it as the shared source of truth between your frontend and backend developers.
        Everyone agrees on what an endpoint looks like, and JO-MOCK enforces that agreement
        throughout the development lifecycle.
      </p>

      {/* The Problem */}
      <h2 id="the-problem" className={H2}>The Problem</h2>
      <p className={P}>
        In most teams, frontend and backend development happen in parallel. This creates a classic bottleneck:
        the frontend team can't build UI that depends on data until the backend exposes the API.
        The typical workarounds — hardcoded dummy data, out-of-sync Postman collections, or ad-hoc
        mock servers — create more problems than they solve.
      </p>
      <ul className={UL}>
        <li className={LI}>Frontend and backend developers work with different assumptions about data shapes</li>
        <li className={LI}>Contract changes are communicated informally via Slack or meetings — things get missed</li>
        <li className={LI}>Hardcoded test data doesn't reflect real response structures</li>
        <li className={LI}>There's no formal process to review and approve API contract changes</li>
      </ul>

      {/* How It Works */}
      <h2 id="how-it-works" className={H2}>How It Works</h2>
      <p className={P}>
        JO-MOCK gives every team a shared workspace where the API contract lives. Here's the typical flow:
      </p>
      <ol className="list-decimal pl-5 space-y-2 mb-6">
        <li className={LI}>
          <strong className="font-semibold text-foreground">Define endpoints</strong> — The project manager or backend
          developer defines endpoints with method, path, and expected request/response shapes.
        </li>
        <li className={LI}>
          <strong className="font-semibold text-foreground">Consume the mock URL</strong> — JO-MOCK instantly provides
          a live URL at <code className={IC}>/mock/{'{'}project-slug{'}'}/your/path</code>. Frontend devs use this
          as their base URL from day one.
        </li>
        <li className={LI}>
          <strong className="font-semibold text-foreground">Propose changes via Change Requests</strong> — When a
          developer needs to modify the contract, they submit a Change Request. The PM reviews and approves or rejects it.
        </li>
        <li className={LI}>
          <strong className="font-semibold text-foreground">Generate code</strong> — Once ready, generate production-ready
          frontend code (React + Axios) in one click — just swap the base URL to production.
        </li>
      </ol>

      {/* Core Concepts */}
      <h2 id="core-concepts" className={H2}>Core Concepts</h2>
      <p className={P}>Here are the key concepts you'll encounter as you use JO-MOCK:</p>

      <div className="space-y-4 mb-6">
        {[
          {
            term: 'Project',
            desc: 'A workspace for one service or application. Each project gets a unique slug that appears in all mock URLs.',
          },
          {
            term: 'Endpoint',
            desc: 'A single API route with a method (GET, POST, etc.), path, optional request schema, and one or more response scenarios.',
          },
          {
            term: 'Mock Server',
            desc: 'The live server that responds to requests made to your mock URLs. It\'s stateless — POST and PUT requests don\'t actually persist data.',
          },
          {
            term: 'Response Scenario',
            desc: 'A saved response (status code + JSON body) for an endpoint. Each endpoint can have multiple scenarios — success, error, empty state, etc.',
          },
          {
            term: 'Change Request (CR)',
            desc: 'A formal proposal to modify an API contract. Frontend or backend developers submit CRs; the Project Manager approves or rejects them.',
          },
          {
            term: 'Roles',
            desc: 'Three team roles: Project Manager (full edit access), Frontend Developer (consume + toggle responses), Backend Developer (propose changes + toggle responses).',
          },
        ].map(({ term, desc }) => (
          <div key={term} className="flex gap-3 p-4 rounded-xl bg-bg-surface border border-border">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">{term}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-xl px-5 py-4 mb-6">
        <p className="text-sm text-foreground leading-relaxed">
          Ready to get hands-on?{' '}
          <Link to="/docs/quick-start" className="text-brand-primary font-medium hover:underline">
            Follow the Quick Start guide →
          </Link>
        </p>
      </div>

      <DocsPager />
    </article>
  )
}
