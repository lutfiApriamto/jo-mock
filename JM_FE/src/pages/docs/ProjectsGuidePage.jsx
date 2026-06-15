import DocsPager from '@/shared/components/DocsPager'

const H2 = 'font-heading font-bold text-xl text-foreground mt-12 mb-4 scroll-mt-24'
const H3 = 'font-heading font-semibold text-base text-foreground mt-6 mb-2 scroll-mt-24'
const P  = 'text-sm sm:text-base text-muted-foreground leading-relaxed mb-4'
const LI = 'text-sm sm:text-base text-muted-foreground leading-relaxed'
const IC = 'bg-bg-surface text-brand-accent font-mono text-[13px] px-1.5 py-0.5 rounded border border-border'

const RoleBadge = ({ role, color }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${color}`}>
    {role}
  </span>
)

export default function ProjectsGuidePage() {
  return (
    <article>
      <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-3">
        Managing Projects
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
        Projects are the top-level workspaces in JO-MOCK. Everything — endpoints, folders,
        team members — lives inside a project.
      </p>
      <div className="w-12 h-0.5 bg-brand-primary/40 mb-10" />

      {/* Overview */}
      <h2 id="overview" className={H2}>Overview</h2>
      <p className={P}>
        Each project maps to one service or application in your system. A project holds all the endpoint
        definitions for that service and has a unique <strong className="font-semibold text-foreground">slug</strong> that
        becomes part of every mock URL.
      </p>
      <p className={P}>
        You can create as many projects as you need. Each one is isolated — team members from one project
        don't automatically get access to another.
      </p>

      {/* Creating a Project */}
      <h2 id="create-project" className={H2}>Creating a Project</h2>
      <p className={P}>
        From your dashboard, click <strong className="font-semibold text-foreground">New Project</strong>.
        You'll be asked for a project name.
      </p>
      <p className={P}>
        The platform automatically generates a URL-friendly slug from the name. For example:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}><code className={IC}>My Ecommerce App</code> → <code className={IC}>my-ecommerce-app</code></li>
        <li className={LI}><code className={IC}>Auth Service v2</code> → <code className={IC}>auth-service-v2</code></li>
      </ul>
      <p className={P}>
        Slugs are unique platform-wide. If a slug is already taken, a suffix is appended automatically.
        Once a project is created, its slug is permanent and cannot be changed (as it's part of live mock URLs).
      </p>
      <div className="bg-status-warning/5 border border-status-warning/20 rounded-xl px-4 py-3 mb-6">
        <p className="text-sm text-foreground leading-relaxed">
          <strong className="font-semibold">Note:</strong> Deleting a project is permanent and cascades — all folders,
          endpoints, responses, and history are deleted. This action cannot be undone.
        </p>
      </div>

      {/* Inviting Team Members */}
      <h2 id="invite-team" className={H2}>Inviting Team Members</h2>
      <p className={P}>
        Go to your project's <strong className="font-semibold text-foreground">Members</strong> tab and
        enter the email address of the person you want to invite. They'll receive an email with an
        invitation link valid for 7 days.
      </p>
      <p className={P}>
        If the invitee doesn't have a JO-MOCK account, they'll be prompted to create one after accepting.
        You can resend or cancel an invitation from the Members tab while it's still pending.
      </p>
      <p className={P}>
        You can also transfer ownership of a project to another member if you're the current owner.
      </p>

      {/* Roles */}
      <h2 id="roles" className={H2}>Roles & Permissions</h2>
      <p className={P}>Every member of a project has one of three roles:</p>

      <div className="space-y-3 mb-6">
        <div className="p-4 rounded-xl bg-bg-surface border border-border">
          <div className="flex items-center gap-2 mb-2">
            <RoleBadge role="Project Manager" color="bg-brand-primary/10 text-brand-primary border-brand-primary/20" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Full access. Can create/edit/delete endpoints, manage folders, invite members, approve or reject
            Change Requests, and directly edit contracts without going through a CR.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface border border-border">
          <div className="flex items-center gap-2 mb-2">
            <RoleBadge role="Frontend Developer" color="bg-status-success/10 text-status-success border-status-success/20" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Read-only access to contracts. Can consume mock URLs, toggle their active response scenario
            independently, and submit Change Requests.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface border border-border">
          <div className="flex items-center gap-2 mb-2">
            <RoleBadge role="Backend Developer" color="bg-status-warning/10 text-status-warning border-status-warning/20" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Same as Frontend Developer — can consume mock URLs, toggle responses, and submit Change Requests.
            Semantically differentiated to reflect their role in the team.
          </p>
        </div>
      </div>

      {/* Folders */}
      <h2 id="folders" className={H2}>Folders</h2>
      <p className={P}>
        Folders help you organize endpoints within a project. You can nest folders inside other folders
        to reflect your API's path hierarchy.
      </p>
      <p className={P}>
        For example, a project for an ecommerce API might have folders:
        <code className={IC}>Auth</code>, <code className={IC}>Products</code>, <code className={IC}>Orders</code>,
        and <code className={IC}>Users</code>.
      </p>
      <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-xl px-4 py-3 mb-6">
        <p className="text-sm text-foreground leading-relaxed">
          <strong className="font-semibold">Heads up:</strong> Deleting a folder deletes all endpoints inside it.
          Move endpoints to another folder first if you want to keep them.
        </p>
      </div>

      <DocsPager />
    </article>
  )
}
