import { profile, roles, sideProjects, skillGroups, contact, type Role } from '@/content/cv';
import { formatYearMonth } from '@/lib/formatDate';
import { FortunePanel } from './FortunePanel';

/** Small letterpress kicker (brass small-caps + hairline rule) shared across panels. */
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span aria-hidden="true" className="h-px w-6 shrink-0 bg-brass/70" />
      <p className="font-fell-sc text-[13px] tracking-[0.22em] text-brass-text">{children}</p>
    </div>
  );
}

function TechChip({ label }: { label: string }) {
  return <li className="paper-chip rounded-[2px] px-2.5 py-0.5 font-fell text-[12px]">{label}</li>;
}

function Intro() {
  return (
    <>
      <Kicker>{profile.location}</Kicker>
      <h2 className="font-rye letterpress text-[34px] leading-tight text-ink md:text-[44px]">
        {profile.name}
      </h2>
      <p className="mt-2 font-fell text-[18px] italic text-oxblood md:text-[20px]">
        {profile.headline}
      </p>
      <p className="mt-5 max-w-prose font-fell text-[15px] leading-relaxed text-ink/90">
        {profile.shortBio}
      </p>
    </>
  );
}

function About() {
  return (
    <>
      <Kicker>The person</Kicker>
      <h2 className="font-rye letterpress text-[30px] leading-tight text-ink md:text-[38px]">
        About
      </h2>
      <p className="mt-5 max-w-prose font-fell text-[15px] leading-relaxed text-ink/90">
        {profile.shortBio}
      </p>
      <div className="mt-8 space-y-6">
        {skillGroups.map((g) => (
          <div key={g.label}>
            <h3 className="mb-3 font-fell-sc text-[13px] tracking-[0.2em] text-brass-text">
              {g.label}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {g.skills.map((s) => (
                <li
                  key={s}
                  className="paper-chip rounded-[2px] px-2.5 py-0.5 font-fell text-[13px]"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

function RolePanel({ role }: { role: Role }) {
  const dateRange = `${formatYearMonth(role.start)} – ${formatYearMonth(role.end)}`;
  return (
    <>
      <Kicker>
        {role.location} · {dateRange}
      </Kicker>
      <h2 className="font-rye letterpress text-[30px] leading-tight text-ink md:text-[38px]">
        {role.company}
      </h2>
      <p className="mt-1 font-fell text-[16px] italic text-oxblood md:text-[18px]">{role.title}</p>
      <p className="mt-5 font-fell text-[14px] leading-relaxed text-ink/85">{role.blurb}</p>
      <ul className="mt-5 space-y-3">
        {role.highlights.map((h, i) => (
          <li key={i} className="flex gap-3 font-fell text-[14px] leading-relaxed text-ink/90">
            <span aria-hidden className="mt-[2px] shrink-0 text-brass-text">
              ❦
            </span>
            <span>{h}</span>
          </li>
        ))}
      </ul>
      <ul aria-label="Technologies" className="mt-6 flex flex-wrap gap-2">
        {role.tech.map((t) => (
          <TechChip key={t} label={t} />
        ))}
      </ul>
    </>
  );
}

function Projects() {
  return (
    <>
      <Kicker>Side work</Kicker>
      <h2 className="font-rye letterpress text-[30px] leading-tight text-ink md:text-[38px]">
        Projects
      </h2>
      <div className="mt-6 space-y-8">
        {sideProjects.map((p) => (
          <article key={p.id} aria-label={p.name}>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-rye text-[22px] text-ink">{p.name}</h3>
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-fell-sc text-[12px] tracking-[0.12em] text-brass-text hover:text-oxblood"
                >
                  Visit ↗
                </a>
              )}
            </div>
            <p className="mt-2 font-fell text-[14px] leading-relaxed text-ink/85">{p.blurb}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {p.tech.map((t) => (
                <TechChip key={t} label={t} />
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}

function Contact() {
  const links = [
    { href: `mailto:${contact.email}`, label: 'Email', detail: contact.email },
    {
      href: contact.linkedin,
      label: 'LinkedIn',
      detail: 'linkedin.com/in/nickderozarieux',
      ext: true,
    },
    { href: contact.github, label: 'GitHub', detail: 'github.com/derozn', ext: true },
    { href: contact.cvUrl, label: 'Download CV', detail: 'PDF résumé', dl: true },
  ];
  return (
    <>
      <Kicker>Let&apos;s talk</Kicker>
      <h2 className="font-rye letterpress text-[30px] leading-tight text-ink md:text-[38px]">
        Get in touch
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              {...(l.ext && { target: '_blank', rel: 'noopener noreferrer' })}
              {...(l.dl && { download: true })}
              className="paper-button flex min-h-[56px] flex-col justify-center rounded-[3px] px-5 py-3"
            >
              <span className="font-fell-sc text-[15px] tracking-[0.08em] text-ink">{l.label}</span>
              <span className="font-fell text-[12px] text-ink-soft">{l.detail}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Renders a CV section by its attraction `section` key. */
export function SectionContent({ section }: { section: string }) {
  if (section === 'intro') return <Intro />;
  if (section === 'about') return <About />;
  // `work` (Career) is handled by <CareerTickets> in ContentOverlay, not here.
  if (section === 'projects') return <Projects />;
  if (section === 'contact') return <Contact />;
  // `chat:` sections raise a content panel like any other — the fortune teller
  // is Madame Zara's chat, not a playable.
  if (section === 'chat:fortune') return <FortunePanel />;
  // `game:` sections (e.g. ball-toss) step into the in-canvas game instead of
  // raising a content panel, so they never reach SectionContent.
  if (section.startsWith('role:')) {
    const role = roles.find((r) => r.id === section.slice(5));
    if (role) return <RolePanel role={role} />;
  }
  return null;
}
