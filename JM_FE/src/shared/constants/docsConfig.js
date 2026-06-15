export const DOCS_NAV = [
  {
    group: 'Overview',
    items: [
      { label: 'Introduction',  to: '/docs/introduction' },
      { label: 'Quick Start',   to: '/docs/quick-start' },
    ],
  },
  {
    group: 'Guides',
    items: [
      { label: 'Managing Projects',  to: '/docs/projects' },
      { label: 'Defining Endpoints', to: '/docs/endpoints' },
      { label: 'Mock Server',        to: '/docs/mock-server' },
      { label: 'Change Requests',    to: '/docs/change-requests' },
      { label: 'Code Generator',     to: '/docs/code-generator' },
    ],
  },
  {
    group: 'Legal',
    items: [
      { label: 'Privacy Policy',   to: '/docs/privacy-policy' },
      { label: 'Terms & Conditions', to: '/docs/terms' },
    ],
  },
]

// Flat ordered list — used for prev/next navigation
export const DOCS_FLAT = DOCS_NAV.flatMap(g => g.items)

// TOC configs — referenced by route handles (available before lazy load)
export const DOCS_TOC = {
  introduction: [
    { id: 'what-is',       label: 'What is JO-MOCK?' },
    { id: 'the-problem',   label: 'The Problem' },
    { id: 'how-it-works',  label: 'How It Works' },
    { id: 'core-concepts', label: 'Core Concepts' },
  ],
  quickStart: [
    { id: 'prerequisites',  label: 'Prerequisites' },
    { id: 'create-account', label: '1. Create an Account' },
    { id: 'create-project', label: '2. Create a Project' },
    { id: 'add-endpoint',   label: '3. Add an Endpoint' },
    { id: 'consume-url',    label: '4. Consume the Mock URL' },
    { id: 'next-steps',     label: 'Next Steps' },
  ],
  projects: [
    { id: 'overview',         label: 'Overview' },
    { id: 'create-project',   label: 'Creating a Project' },
    { id: 'invite-team',      label: 'Inviting Team Members' },
    { id: 'roles',            label: 'Roles & Permissions' },
    { id: 'folders',          label: 'Folders' },
  ],
  endpoints: [
    { id: 'overview',          label: 'Overview' },
    { id: 'define-endpoint',   label: 'Defining an Endpoint' },
    { id: 'request-schema',    label: 'Request Schema' },
    { id: 'response-scenarios',label: 'Response Scenarios' },
    { id: 'default-response',  label: 'Default Response' },
  ],
  mockServer: [
    { id: 'overview',      label: 'Overview' },
    { id: 'url-format',    label: 'URL Format' },
    { id: 'authentication',label: 'Authentication' },
    { id: 'dynamic-params',label: 'Dynamic Path Params' },
    { id: 'validation',    label: 'Request Validation' },
    { id: 'toggle',        label: 'Per-user Toggle' },
  ],
  changeRequests: [
    { id: 'overview',       label: 'Overview' },
    { id: 'proposing',      label: 'Proposing a Change' },
    { id: 'review',         label: 'Review Process' },
    { id: 'approve-reject', label: 'Approve or Reject' },
    { id: 'history',        label: 'Version History' },
  ],
  codeGenerator: [
    { id: 'overview',      label: 'Overview' },
    { id: 'combinations',  label: 'Available Combinations' },
    { id: 'how-to-use',    label: 'How to Use' },
    { id: 'example',       label: 'Example Output' },
  ],
  privacyPolicy: [
    { id: 'intro',        label: 'Introduction' },
    { id: 'we-collect',   label: 'Information We Collect' },
    { id: 'how-we-use',   label: 'How We Use Your Data' },
    { id: 'retention',    label: 'Data Retention' },
    { id: 'your-rights',  label: 'Your Rights' },
    { id: 'contact',      label: 'Contact' },
  ],
  terms: [
    { id: 'acceptance',  label: 'Acceptance of Terms' },
    { id: 'beta',        label: 'Beta Service' },
    { id: 'account',     label: 'Account Responsibilities' },
    { id: 'prohibited',  label: 'Prohibited Uses' },
    { id: 'liability',   label: 'Limitation of Liability' },
    { id: 'contact',     label: 'Contact' },
  ],
}
