// src/content/cv.ts
// Typed content model for Nick's portfolio — populated faithfully from Resume_Base.md.
// Do not invent or embellish facts; every claim here originates in the source resume.

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface Role {
  id: string;
  company: string;
  title: string;
  /** e.g. 'Promoted from Senior Software Engineer (Jan 2025 – Nov 2025)' */
  promotion?: string;
  start: string; // 'YYYY-MM'
  end: string | null; // null = present
  location: string;
  blurb: string; // 1-sentence company/context line
  highlights: string[]; // plain text — markdown bold stripped
  tech: string[];
  featured: boolean; // true = own 3-D island; false = condensed group
}

export interface SideProject {
  id: string;
  name: string;
  url?: string;
  blurb: string;
  highlights: string[];
  tech: string[];
}

export interface SkillGroup {
  label: string;
  skills: string[];
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const profile = {
  name: 'Nick de Rozarieux',
  headline: 'Lead Software Engineer · Full-Stack',
  shortBio:
    "Lead full-stack engineer with over a decade shipping consumer-facing React and Node.js products. Front-end leaning — React, Next.js, TypeScript, design systems — with the API and product-delivery depth to ship features end-to-end. Currently Lead Software Engineer at Travelex, sitting on the global architecture group and leading a cross-functional product team. Earlier, Tech Lead at Lick, where I owned the D2C platform and shipped B&Q's first in-store digital experience.",
  location: 'Kent, UK',
} as const;

// ---------------------------------------------------------------------------
// Roles (newest first)
// ---------------------------------------------------------------------------

export const roles: Role[] = [
  {
    id: 'travelex-lead',
    company: 'Travelex',
    title: 'Lead Software Engineer',
    promotion: 'Promoted from Senior Software Engineer (Jan 2025 – Nov 2025)',
    start: '2025-11',
    end: null,
    location: 'London / Tonbridge',
    blurb:
      'Global currency and travel money brand — online team on a multi-tenant, worldwide consumer website serving tens of thousands of monthly users.',
    highlights: [
      'Lead a cross-functional team of 5 engineers, 1 product owner and 1 UI/UX designer building a multi-tenant global consumer website on Next.js, React, TypeScript and AWS.',
      'Promoted from Senior to Lead Software Engineer inside ten months on the strength of website re-platform delivery and visible cross-team work.',
      "Drive architectural standards across the wider engineering organisation as a member of Travelex's global architecture group.",
      'Architected and shipped the replacement of legacy in-store media display screens across 850 Travelex stores globally — retired an aging on-prem stack with a modern React-based content solution.',
      'Orchestrating a gradual, monitored rollout of the new website on AWS — sections shipped behind feature flags with observability tied to clear performance baselines.',
      "Led the migration of the team's observability stack from Datadog to a self-hosted Grafana + Prometheus setup, cutting third-party monitoring cost.",
      "Embedded GitHub Copilot and Claude Code into the team's day-to-day delivery workflow and runs regular internal workshops on AI-assisted, spec-driven development.",
    ],
    tech: [
      'Next.js',
      'React',
      'TypeScript',
      'AWS',
      'Sanity',
      'Grafana',
      'Prometheus',
      'Feature flags',
      'GitHub Copilot',
      'Claude Code',
    ],
    featured: true,
  },
  {
    id: 'lick-tech-lead',
    company: 'Lick',
    title: 'Tech Lead',
    promotion: 'Promoted internally to Tech Lead in 2023',
    start: '2021-08',
    end: '2024-11',
    location: 'London',
    blurb:
      'D2C paint and decor brand — owned the e-commerce platform and B&Q in-store experience end-to-end.',
    highlights: [
      "Architected and shipped B&Q's first-ever digital experience kiosk screens to 110 stores — built on Next.js and PWA with React on the front end and Node.js on the back.",
      "Designed and shipped containerised micro-services on Node.js, Docker and AWS ECS for drop-ship ordering between Screwfix and Lick's internal fulfilment/finance systems, instrumented end-to-end with Datadog and CloudWatch.",
      'Owned the D2C and PRO ordering stack — maintained 99%+ uptime throughout the Tech Lead tenure, serving thousands of MAU and hundreds of orders per month.',
      "Created Lick's component library from scratch using an atomic-design approach with Tailwind CSS, React and Storybook.",
      "Delivered Lick's D2C e-commerce site on Shopify's headless CMS, wired into Next.js, React, Node.js and Hygraph.",
      'Led 3 engineers (2 juniors, 1 senior) — 1-2-1s, mentoring, growth conversations and performance reviews.',
    ],
    tech: [
      'Next.js',
      'React',
      'TypeScript',
      'Node.js',
      'Docker',
      'AWS ECS',
      'Tailwind CSS',
      'Storybook',
      'Shopify',
      'Hygraph',
      'CircleCI',
      'Datadog',
      'Snyk',
      'Rudderstack',
    ],
    featured: true,
  },
  {
    id: 'gousto-senior',
    company: 'Gousto',
    title: 'Senior Software Engineer',
    start: '2020-06',
    end: '2021-08',
    location: 'London',
    blurb: 'UK recipe-box business serving millions of meals per week.',
    highlights: [
      'Led the replatforming of recipe ratings as Delivery/Epic Lead — coordinated across squads, authored technical design documents, and shipped an event-driven system on TypeScript and Node.js at scale.',
      'Built an internal experimentation platform for A/B tests and gradual feature rollouts on TypeScript, AWS Lambda and DynamoDB via the Serverless Framework.',
      'Integrated the core menu service with a new recommendations engine — squad-wide test plans, staged rollout, and live performance monitoring.',
      'Migrated legacy services to TypeScript, raising long-term maintainability and reducing classes of runtime errors.',
    ],
    tech: ['TypeScript', 'Node.js', 'AWS Lambda', 'DynamoDB', 'Serverless Framework', 'React'],
    featured: true,
  },
  {
    id: 'lyvly-fullstack',
    company: 'Lyvly',
    title: 'Full Stack Engineer',
    start: '2020-01',
    end: '2020-05',
    location: 'London',
    blurb: 'Co-living startup — customer-portal work and third-party integration glue.',
    highlights: [
      'Introduced integration testing across React front-end projects.',
      'Automated and integrated third-party APIs to replace manual operational processes.',
    ],
    tech: ['React', 'Node.js', 'TypeScript'],
    featured: false,
  },
  {
    id: 'yoti-senior-fe',
    company: 'Yoti',
    title: 'Senior Front End Developer',
    start: '2018-10',
    end: '2019-12',
    location: 'London',
    blurb: 'Digital identity platform — security-sensitive customer-facing SDK work.',
    highlights: [
      "Led the rebuild of Yoti's Web SDK (JavaScript/TypeScript) so customers could embed identity services natively within their own domain — a security-sensitive integration handling identity data.",
      "Co-established Yoti's React design system with designers and engineers, accelerating delivery and improving brand consistency.",
    ],
    tech: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    featured: false,
  },
  {
    id: 'arcadia-senior',
    company: 'Arcadia Group',
    title: 'Senior Software Engineer',
    start: '2017-09',
    end: '2018-10',
    location: 'London',
    blurb:
      'High-street fashion group (Topshop, Topman, Dorothy Perkins and others) — multi-brand e-commerce engineering.',
    highlights: [
      "Led the rebuild of Arcadia's multi-brand CMS (JavaScript, Node.js) for seamless integration with the primary e-commerce platform, materially improving content delivery times across each brand.",
      'Introduced and enforced coding standards to keep a multi-brand codebase maintainable and extensible.',
    ],
    tech: ['JavaScript', 'Node.js', 'React'],
    featured: false,
  },
  {
    id: 'vitamin-london-fe',
    company: 'Vitamin London',
    title: 'Front End Developer',
    start: '2014-09',
    end: '2017-09',
    location: 'London',
    blurb: 'Boutique digital agency — multi-client e-commerce and consumer mobile work.',
    highlights: [
      'Designed and built multiple client-facing e-commerce sites on Shopify, React and Redux.',
      'Designed, built and released a "pay as you gym" cross-platform app for iOS and Android.',
    ],
    tech: ['React', 'Redux', 'JavaScript', 'Shopify'],
    featured: false,
  },
];

// ---------------------------------------------------------------------------
// Side projects
// ---------------------------------------------------------------------------

export const sideProjects: SideProject[] = [
  {
    id: 'podback',
    name: 'Podback',
    url: 'https://podback.org',
    blurb:
      'UK-wide coffee pod recycling service backed by Nespresso, NESCAFE Dolce Gusto and Tassimo — consumers find their nearest drop-off via a postcode lookup.',
    highlights: [
      'Built the entire frontend from a set of designs and wired it up to a headless CMS and API.',
      'Featured in the national news at launch; today serves a highly active consumer user base across the UK.',
    ],
    tech: ['React', 'Next.js', 'Headless CMS'],
  },
  {
    id: 'eversys',
    name: 'Eversys',
    blurb: "Brochure site showcasing Eversys's premium espresso machines.",
    highlights: [
      'Designed and built a brochure-style marketing site showcasing the machines.',
      'Built on React and Next.js with Framer Motion powering the animations.',
    ],
    tech: ['React', 'Next.js', 'Framer Motion'],
  },
];

// ---------------------------------------------------------------------------
// Skill groups (curated for portfolio — most relevant to seniority and stack)
// ---------------------------------------------------------------------------

export const skillGroups: SkillGroup[] = [
  {
    label: 'Languages',
    skills: ['TypeScript', 'JavaScript', 'Node.js'],
  },
  {
    label: 'Frontend',
    skills: [
      'React',
      'Next.js',
      'Tailwind CSS',
      'Storybook',
      'PWA',
      'Atomic design',
      'Design systems',
    ],
  },
  {
    label: 'APIs & Backend',
    skills: ['Node.js services', 'REST APIs', 'Event-driven systems', 'Micro-services'],
  },
  {
    label: 'Cloud / AWS',
    skills: ['Lambda', 'ECS', 'DynamoDB', 'S3', 'CloudWatch', 'Serverless Framework'],
  },
  {
    label: 'CI-CD & Observability',
    skills: [
      'CircleCI',
      'GitHub Actions',
      'Docker',
      'Grafana',
      'Prometheus',
      'Datadog',
      'Feature flags',
    ],
  },
  {
    label: 'AI Workflow',
    skills: ['GitHub Copilot', 'Claude Code', 'AI-assisted workflows', 'Spec-driven development'],
  },
  {
    label: 'Leadership',
    skills: [
      'Tech leadership',
      'Mentoring',
      'Cross-functional collaboration',
      'Technical design docs',
      'Architecture review',
      'Hiring & interviewing',
    ],
  },
];

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

export const education = {
  institution: 'Southampton Solent University',
  degree: 'BSc (Hons) Computer Game Development',
  period: '2010 – 2013',
  grade: '1st Class Honours',
} as const;

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const contact = {
  email: 'nick@iamnick.dev',
  linkedin: 'https://linkedin.com/in/nickderozarieux',
  github: 'https://github.com/derozn',
  cvUrl: '/cv/nick-de-rozarieux-cv.pdf',
} as const;

// ---------------------------------------------------------------------------
// TODO(nick):
// - Drop the CV PDF at public/cv/nick-de-rozarieux-cv.pdf so contact.cvUrl resolves.
// - Supply a personal about-me blurb (more informal than shortBio) for any
//   dedicated About section — shortBio above is lifted from the resume Profile.
// - Confirm the face-particles photo asset path used in the Interactive Portrait
//   module and wire it into whichever component consumes `profile`.
// - Podback and Eversys tech arrays are inferred from resume bullets; expand
//   if you recall additional libraries used on those projects.
// ---------------------------------------------------------------------------
