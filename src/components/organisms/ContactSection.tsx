'use client';

import { contact } from '@/content/cv';
import { SectionShell } from './SectionShell';
import { MotionCard, MotionItem } from './MotionCard';

const headingId = 'contact-heading';
const currentYear = new Date().getFullYear();

function EmailIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

const links = [
  {
    href: `mailto:${contact.email}`,
    label: 'Email',
    detail: contact.email,
    icon: <EmailIcon />,
    external: false,
    download: false,
  },
  {
    href: contact.linkedin,
    label: 'LinkedIn',
    detail: 'linkedin.com/in/nickderozarieux',
    icon: <LinkedInIcon />,
    external: true,
    download: false,
  },
  {
    href: contact.github,
    label: 'GitHub',
    detail: 'github.com/derozn',
    icon: <GitHubIcon />,
    external: true,
    download: false,
  },
  {
    href: contact.cvUrl,
    label: 'Download CV',
    detail: 'PDF resume',
    icon: <DownloadIcon />,
    external: false,
    download: true,
  },
];

/**
 * ContactSection — contact links with large tappable targets, and a footer line.
 */
export function ContactSection() {
  return (
    <section id="contact" aria-labelledby={headingId} data-attraction="contact" className="w-full">
      <SectionShell>
        <MotionCard>
          <MotionItem className="mb-3 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-6 shrink-0 bg-accent/70" />
            <p className="font-expressive text-[12px] font-semibold uppercase tracking-widest text-accent">
              Let&apos;s talk
            </p>
          </MotionItem>

          <MotionItem>
            <h2
              id={headingId}
              className="font-expressive text-[28px] font-semibold text-text-primary md:text-[36px]"
            >
              Get in touch
            </h2>
          </MotionItem>

          <nav aria-label="Contact links" className="mt-8">
            <ul className="grid gap-3 sm:grid-cols-2">
              {links.map(({ href, label, detail, icon, external, download }) => (
                <MotionItem key={label} as="li">
                  <a
                    href={href}
                    {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                    {...(download && { download: true })}
                    className="hud-button flex min-h-[56px] items-center gap-4 px-5 py-4 transition-colors hover:text-accent"
                  >
                    <span className="text-accent">{icon}</span>
                    <span className="flex flex-col">
                      <span className="font-expressive text-[15px] font-semibold text-text-primary">
                        {label}
                      </span>
                      <span className="font-functional text-[12px] text-text-primary/60">
                        {detail}
                      </span>
                    </span>
                  </a>
                </MotionItem>
              ))}
            </ul>
          </nav>
        </MotionCard>

        {/* Footer */}
        <p className="mt-12 text-center font-functional text-[12px] text-text-primary/30">
          © {currentYear} Nick de Rozarieux. Built with Next.js & TypeScript.
        </p>
      </SectionShell>
    </section>
  );
}
